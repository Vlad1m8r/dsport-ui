import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

function App() {
  const [user, setUser] = useState<WebAppUser | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>(
    WebApp.colorScheme === 'light' ? 'light' : 'dark',
  )
  const [isMinimized, setIsMinimized] = useState(false)
  const [animationStage, setAnimationStage] = useState<'swirl' | 'explosion' | 'final'>(
    'swirl',
  )
  const themeRef = useRef(theme)

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
    if (theme === 'light') {
      applyCssVariables(lightTheme)
    } else {
      applyCssVariables(systemThemeRef.current)
    }
    themeRef.current = theme
  }, [applyCssVariables, lightTheme, theme])

  useEffect(() => {
    const explosionTimer = window.setTimeout(() => {
      setAnimationStage('explosion')
    }, 3400)

    const finalTimer = window.setTimeout(() => {
      setIsMinimized(true)
      setAnimationStage('final')
    }, 5000)

    return () => {
      window.clearTimeout(explosionTimer)
      window.clearTimeout(finalTimer)
    }
  }, [])

  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }

  const particles = useMemo(() => Array.from({ length: 16 }, (_, index) => index), [])
  const appClassName = `app${isMinimized ? ' app--minimized' : ''}${
    animationStage === 'final' ? ' app--finale' : ''
  }`
  const profileCardClassName = `profile-card${
    animationStage === 'swirl' ? ' profile-card--swirl' : ''
  }${animationStage === 'explosion' ? ' profile-card--explosion' : ''}${
    isMinimized ? ' profile-card--minimized' : ''
  }${animationStage === 'final' ? ' profile-card--final' : ''}`
  
  return (
    <main className={appClassName}>
      <button
        type="button"
        className="theme-toggle"
        onClick={toggleTheme}
        aria-pressed={theme === 'light'}
        aria-label="Переключить тему"
      >
        {theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
      </button>
      <section className={profileCardClassName} aria-live="polite">
        <div className="profile-card__particles" aria-hidden="true">
          {particles.map((particle) => (
            <span key={particle} />
          ))}
        </div>
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
      <div
        className={`meteor${animationStage === 'explosion' ? ' meteor--active' : ''}`}
        aria-hidden="true"
      />
      <div
        className={`explosion${animationStage === 'explosion' ? ' explosion--active' : ''}`}
        aria-hidden="true"
      />
      <div
        className={`finale${animationStage === 'final' ? ' finale--active' : ''}`}
      >
        <div className="finale__letter" aria-hidden="true">
          Z
        </div>
        <p className="finale__cta">Вступай в ряды спортсменов</p>
      </div>
    </main>
  )
}

export default App
