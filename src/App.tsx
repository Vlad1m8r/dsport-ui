import { useEffect, useMemo, useState } from 'react'
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

  useEffect(() => {
    WebApp.ready()
    WebApp.expand()
    applyThemeParams(WebApp.themeParams)
    setUser(WebApp.initDataUnsafe.user ?? null)
    setIsReady(true)

    const handleThemeChange = () => {
      applyThemeParams(WebApp.themeParams)
    }

    WebApp.onEvent('themeChanged', handleThemeChange)

    return () => {
      WebApp.offEvent('themeChanged', handleThemeChange)
    }
  }, [])

  const displayName = useMemo(() => buildDisplayName(user), [user])
  const initials = useMemo(() => buildInitials(user), [user])
  const statusText = useMemo(() => buildStatusText(user, isReady), [user, isReady])
  const altText = `Аватар пользователя ${displayName}`

  return (
    <main className="app">
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
    </main>
  )
}

export default App
