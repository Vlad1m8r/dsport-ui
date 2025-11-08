/* eslint-disable no-console */
export type WebAppColorScheme = 'light' | 'dark'

export interface WebAppThemeParams {
  bg_color?: string
  text_color?: string
  hint_color?: string
  link_color?: string
  button_color?: string
  button_text_color?: string
  secondary_bg_color?: string
}

export interface WebAppUser {
  id: number
  is_bot?: boolean
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
  photo_url?: string
}

interface WebAppInitDataUnsafe {
  user?: WebAppUser
}

type ThemeChangedHandler = () => void

type SupportedEvent = 'themeChanged'

interface WebAppEventsMap {
  themeChanged: ThemeChangedHandler
}

export interface WebApp {
  initData: string
  initDataUnsafe: WebAppInitDataUnsafe
  colorScheme: WebAppColorScheme
  themeParams: WebAppThemeParams
  ready(): void
  expand(): void
  onEvent<TEvent extends SupportedEvent>(event: TEvent, handler: WebAppEventsMap[TEvent]): void
  offEvent<TEvent extends SupportedEvent>(event: TEvent, handler: WebAppEventsMap[TEvent]): void
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: WebApp
    }
  }
}

const listeners: Record<SupportedEvent, Set<ThemeChangedHandler>> = {
  themeChanged: new Set(),
}

const noop = () => undefined

const fallbackTheme: WebAppThemeParams = {
  bg_color: '#ffffff',
  secondary_bg_color: '#f1f5f9',
  text_color: '#0f172a',
  hint_color: '#64748b',
  link_color: '#2a9df4',
  button_color: '#2a9df4',
  button_text_color: '#ffffff',
}

const fallbackWebApp: WebApp = {
  initData: '',
  initDataUnsafe: {},
  colorScheme: 'light',
  themeParams: fallbackTheme,
  ready: () => {
    console.warn('Telegram WebApp SDK не найден. Метод ready() выполнен в демо-режиме.')
  },
  expand: noop,
  onEvent: (event, handler) => {
    listeners[event].add(handler as ThemeChangedHandler)
  },
  offEvent: (event, handler) => {
    listeners[event].delete(handler as ThemeChangedHandler)
  },
}

const resolvedWebApp: WebApp = typeof window !== 'undefined' && window.Telegram?.WebApp ? window.Telegram.WebApp : fallbackWebApp

export const isTelegramEnvironment = resolvedWebApp !== fallbackWebApp

export const applyThemeParams = (theme: WebAppThemeParams): void => {
  if (typeof document === 'undefined') {
    return
  }

  const root = document.documentElement.style
  const assignments: Array<[string, string | undefined]> = [
    ['--tg-theme-bg-color', theme.bg_color],
    ['--tg-theme-secondary-bg-color', theme.secondary_bg_color],
    ['--tg-theme-text-color', theme.text_color],
    ['--tg-theme-hint-color', theme.hint_color],
    ['--tg-theme-link-color', theme.link_color],
    ['--tg-theme-button-color', theme.button_color],
    ['--tg-theme-button-text-color', theme.button_text_color],
  ]

  assignments.forEach(([cssVariable, value]) => {
    if (value) {
      root.setProperty(cssVariable, value)
    }
  })

  if (theme.bg_color) {
    document.body.style.backgroundColor = theme.bg_color
  }
  if (theme.text_color) {
    document.body.style.color = theme.text_color
  }
  document.documentElement.dataset.tgColorScheme = resolvedWebApp.colorScheme
  root.colorScheme = resolvedWebApp.colorScheme
}

export const notifyThemeChanged = (): void => {
  listeners.themeChanged.forEach((handler) => handler())
}

export default resolvedWebApp
