import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { TouchEventHandler } from 'react'
import WebApp, {
  applyThemeParams,
  isTelegramEnvironment,
  type WebAppUser,
} from '@twa-dev/sdk'

import './App.css'

const FALLBACK_NAME = 'Гость'

const buildDisplayName = (user: WebAppUser | null): string => {
  if (!user) {
    return FALLBACK_NAME
  }

  const parts = [user.first_name, user.last_name].filter(Boolean)
  if (parts.length === 0) {
    return user.username ? user.username.replace(/^@/, '') : FALLBACK_NAME
  }

  return parts.join(' ')
}

const buildInitials = (user: WebAppUser | null): string => {
  if (!user) {
    return 'Г'
  }

  const collect = (value?: string): string => (value ? value.trim()[0] ?? '' : '')
  const candidates = [collect(user.first_name), collect(user.last_name), collect(user.username?.replace(/^@/, ''))]
  const initials = candidates.filter(Boolean).join('').slice(0, 2)

  return initials ? initials.toUpperCase() : 'Г'
}

const buildStatusText = (user: WebAppUser | null, ready: boolean): string => {
  if (!ready) {
    return 'Подключаемся к Telegram...'
  }

  return user
    ? 'Добро пожаловать в мини-приложение Telegram.'
    : 'Мы пока не получили данные от Telegram, отображается демо.'
}

type Workout = {
  title: string
  date: string
  exercises: string[]
}

type CalendarCell = {
  isoDate: string
  date: Date
  inCurrentMonth: boolean
  hasWorkout: boolean
  isToday: boolean
  label: string
}

function App() {
  const [user, setUser] = useState<WebAppUser | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>(
    WebApp.colorScheme === 'light' ? 'light' : 'dark',
  )
  const themeRef = useRef(theme)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [displayedMonth, setDisplayedMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const touchStartXRef = useRef<number | null>(null)

  const systemThemeRef = useRef<Record<string, string>>({
    '--tg-theme-bg-color': '#0b1120',
    '--tg-theme-text-color': '#f8fafc',
    '--tg-theme-hint-color': '#94a3b8',
    '--tg-theme-button-color': '#2a9df4',
    '--tg-theme-button-text-color': '#ffffff',
    '--tg-theme-secondary-bg-color': 'rgba(15, 23, 42, 0.5)',
    '--tg-theme-link-color': '#38bdf8',
  })

  const lightTheme = useMemo(
    () => ({
      '--tg-theme-bg-color': '#f8fafc',
      '--tg-theme-text-color': '#0f172a',
      '--tg-theme-hint-color': '#64748b',
      '--tg-theme-button-color': '#2563eb',
      '--tg-theme-button-text-color': '#ffffff',
      '--tg-theme-secondary-bg-color': '#e2e8f0',
      '--tg-theme-link-color': '#2563eb',
    }),
    [],
  )

  const applyCssVariables = useCallback((variables: Record<string, string>) => {
    const root = document.documentElement
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }, [])

  const extractThemeFromWebApp = useCallback(() => {
    const nextTheme = { ...systemThemeRef.current }

    if (WebApp.themeParams.bg_color) {
      nextTheme['--tg-theme-bg-color'] = WebApp.themeParams.bg_color
    }
    if (WebApp.themeParams.text_color) {
      nextTheme['--tg-theme-text-color'] = WebApp.themeParams.text_color
    }
    if (WebApp.themeParams.hint_color) {
      nextTheme['--tg-theme-hint-color'] = WebApp.themeParams.hint_color
    }
    if (WebApp.themeParams.button_color) {
      nextTheme['--tg-theme-button-color'] = WebApp.themeParams.button_color
    }
    if (WebApp.themeParams.button_text_color) {
      nextTheme['--tg-theme-button-text-color'] = WebApp.themeParams.button_text_color
    }
    if (WebApp.themeParams.secondary_bg_color) {
      nextTheme['--tg-theme-secondary-bg-color'] = WebApp.themeParams.secondary_bg_color
    }
    if (WebApp.themeParams.link_color) {
      nextTheme['--tg-theme-link-color'] = WebApp.themeParams.link_color
    }

    return nextTheme
  }, [])

  useEffect(() => {
    WebApp.ready()
    WebApp.expand()
    applyThemeParams(WebApp.themeParams)
    systemThemeRef.current = extractThemeFromWebApp()
    if (WebApp.colorScheme === 'light') {
      applyCssVariables(lightTheme)
    } else {
      applyCssVariables(systemThemeRef.current)
    }
    setUser(WebApp.initDataUnsafe.user ?? null)
    setIsReady(true)

    const handleThemeChange = () => {
      applyThemeParams(WebApp.themeParams)
      systemThemeRef.current = extractThemeFromWebApp()
      if (themeRef.current === 'dark') {
        applyCssVariables(systemThemeRef.current)
      }
    }

    WebApp.onEvent('themeChanged', handleThemeChange)

    return () => {
      WebApp.offEvent('themeChanged', handleThemeChange)
    }
  }, [applyCssVariables, extractThemeFromWebApp, lightTheme])

  const displayName = useMemo(() => buildDisplayName(user), [user])
  const initials = useMemo(() => buildInitials(user), [user])
  const statusText = useMemo(() => buildStatusText(user, isReady), [user, isReady])
  const altText = `Аватар пользователя ${displayName}`

  useEffect(() => {
    const controller = new AbortController()

    const loadWorkouts = async () => {
      try {
        setIsLoadingWorkouts(true)
        const response = await fetch('http://localhost:8080/data', {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Не удалось загрузить тренировки: ${response.status}`)
        }

        const payload: Workout[] = await response.json()
        setWorkouts(payload)
        setFetchError(null)
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        setFetchError(error instanceof Error ? error.message : 'Неизвестная ошибка загрузки')
      } finally {
        setIsLoadingWorkouts(false)
      }
    }

    void loadWorkouts()

    return () => {
      controller.abort()
    }
  }, [])

  const workoutsByDate = useMemo(() => {
    return workouts.reduce<Record<string, Workout[]>>((acc, workout) => {
      if (!acc[workout.date]) {
        acc[workout.date] = []
      }
      acc[workout.date].push(workout)
      return acc
    }, {})
  }, [workouts])

  const selectedWorkouts = useMemo(() => {
    if (!selectedDate) {
      return []
    }

    return workoutsByDate[selectedDate] ?? []
  }, [selectedDate, workoutsByDate])

  const calendarTitle = useMemo(() => {
    return new Intl.DateTimeFormat('ru-RU', {
      month: 'long',
      year: 'numeric',
    }).format(displayedMonth)
  }, [displayedMonth])

  const dayLabelFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [],
  )

  const calendarCells = useMemo<CalendarCell[]>(() => {
    const startOfMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), 1)
    const startOffset = (startOfMonth.getDay() + 6) % 7
    const gridStart = new Date(startOfMonth)
    gridStart.setDate(startOfMonth.getDate() - startOffset)

    return Array.from({ length: 42 }).map((_, index) => {
      const date = new Date(
        gridStart.getFullYear(),
        gridStart.getMonth(),
        gridStart.getDate() + index,
      )
      const isoDate = date.toISOString().slice(0, 10)
      const today = new Date()
      const isToday =
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()

      return {
        date,
        isoDate,
        inCurrentMonth:
          date.getMonth() === displayedMonth.getMonth() &&
          date.getFullYear() === displayedMonth.getFullYear(),
        hasWorkout: Boolean(workoutsByDate[isoDate]?.length),
        isToday,
        label: dayLabelFormatter.format(date),
      }
    })
  }, [dayLabelFormatter, displayedMonth, workoutsByDate])

  useEffect(() => {
    if (theme === 'light') {
      applyCssVariables(lightTheme)
    } else {
      applyCssVariables(systemThemeRef.current)
    }
    themeRef.current = theme
  }, [applyCssVariables, lightTheme, theme])

  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }

  const closeModal = () => setSelectedDate(null)

  const goToPreviousMonth = () => {
    setDisplayedMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setDisplayedMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))
  }

  const handleTouchStart: TouchEventHandler<HTMLDivElement> = (event) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null
  }

  const handleTouchEnd: TouchEventHandler<HTMLDivElement> = (event) => {
    if (touchStartXRef.current === null) {
      return
    }

    const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStartXRef.current
    const threshold = 40

    if (delta > threshold) {
      goToPreviousMonth()
    } else if (delta < -threshold) {
      goToNextMonth()
    }

    touchStartXRef.current = null
  }

  const handleDaySelect = (isoDate: string, hasWorkout: boolean) => {
    if (!hasWorkout) {
      return
    }

    setSelectedDate(isoDate)
  }

  const formattedModalDate = useMemo(() => {
    if (!selectedDate) {
      return ''
    }

    return dayLabelFormatter.format(new Date(selectedDate))
  }, [dayLabelFormatter, selectedDate])

  return (
    <main className="app">
      <button
        type="button"
        className="theme-toggle"
        onClick={toggleTheme}
        aria-pressed={theme === 'light'}
        aria-label="Переключить тему"
      >
        {theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
      </button>
      <section className="profile-card" aria-live="polite">
        <div
          className="profile-card__avatar"
          role={user?.photo_url ? undefined : 'img'}
          aria-label={user?.photo_url ? undefined : altText}
        >
          {user?.photo_url ? (
            <img src={user.photo_url} alt={altText} loading="lazy" />
          ) : (
            <span aria-hidden="true">{initials}</span>
          )}
        </div>
        <div className="profile-card__content">
          <span className="profile-card__hint">
            {isTelegramEnvironment ? 'Пользователь Telegram' : 'Демо-режим'}
          </span>
          <h1 className="profile-card__name">{displayName}</h1>
          {user?.username ? (
            <p className="profile-card__username">@{user.username.replace(/^@/, '')}</p>
          ) : null}
          <p className="profile-card__caption">{statusText}</p>
        </div>
      </section>
      <section className="calendar-section">
        <header className="calendar-section__header">
          <h2 className="calendar-section__title">Тренировки по месяцам</h2>
          <div className="calendar-section__controls">
            <button
              type="button"
              className="calendar-section__nav"
              onClick={goToPreviousMonth}
              aria-label="Предыдущий месяц"
            >
              ←
            </button>
            <p className="calendar-section__current" aria-live="polite">
              {calendarTitle}
            </p>
            <button
              type="button"
              className="calendar-section__nav"
              onClick={goToNextMonth}
              aria-label="Следующий месяц"
            >
              →
            </button>
          </div>
        </header>
        <div
          className="calendar"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="calendar__weekdays" aria-hidden="true">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((weekday) => (
              <span key={weekday}>{weekday}</span>
            ))}
          </div>
          <div className="calendar__grid">
            {calendarCells.map(({ isoDate, date, hasWorkout, inCurrentMonth, isToday, label }) => {
              const dayNumber = date.getDate()
              const classes = [
                'calendar__cell',
                inCurrentMonth ? 'calendar__cell--current' : 'calendar__cell--outside',
              ]
              if (hasWorkout) {
                classes.push('calendar__cell--workout')
              }
              if (isToday) {
                classes.push('calendar__cell--today')
              }

              return (
                <button
                  type="button"
                  key={isoDate}
                  className={classes.join(' ')}
                  onClick={() => handleDaySelect(isoDate, hasWorkout)}
                  aria-pressed={selectedDate === isoDate}
                  aria-label={`${label}${hasWorkout ? ', есть тренировка' : ''}`}
                  disabled={!hasWorkout}
                >
                  <span>{dayNumber}</span>
                </button>
              )
            })}
          </div>
          <div className="calendar__status" aria-live="polite">
            {isLoadingWorkouts ? 'Загружаем тренировки…' : null}
            {!isLoadingWorkouts && fetchError ? fetchError : null}
            {!isLoadingWorkouts && !fetchError && workouts.length === 0
              ? 'Пока нет загруженных тренировок.'
              : null}
          </div>
        </div>
      </section>
      {selectedDate ? (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal__backdrop" onClick={closeModal} />
          <div className="modal__content">
            <header className="modal__header">
              <div>
                <p className="modal__date">{formattedModalDate}</p>
                <h3 className="modal__title" id="modal-title">
                  {selectedWorkouts.map((workout) => workout.title).join(', ')}
                </h3>
              </div>
              <button
                type="button"
                className="modal__close"
                onClick={closeModal}
                aria-label="Закрыть"
              >
                ×
              </button>
            </header>
            <div className="modal__body">
              {selectedWorkouts.map((workout) => (
                <article key={`${workout.title}-${workout.date}`} className="modal__workout">
                  <h4 className="modal__workout-title">{workout.title}</h4>
                  <ul className="modal__list">
                    {workout.exercises.map((exercise) => (
                      <li key={exercise}>{exercise}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}

export default App
