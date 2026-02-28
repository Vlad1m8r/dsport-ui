# Theme Architecture (local light/dark only)

## Goals
- Используем только собственные темы `light` и `dark`.
- Полностью отключаем Telegram `themeParams` и `colorScheme` как источник цветов.
- Сохраняем safe-area интеграцию Telegram (только геометрия).
- Все компоненты продолжают работать через CSS tokens из `tokens.css`.

## Sources of truth
1) `src/shared/ui/theme/tokens.css` — базовые и режимные CSS переменные.
2) `html[data-mode="light" | "dark"]` — активный режим темы.
3) `localStorage["theme_mode"]` — сохранённый пользовательский выбор.

## Runtime flow
1) На старте вызывается `initThemeMode()`.
2) Если в `localStorage` есть `theme_mode`, применяется сохранённое значение.
3) Если значения нет, дефолт определяется через `prefers-color-scheme`.
4) `setThemeMode(mode)` обновляет `document.documentElement.dataset.mode` и сохраняет режим в `localStorage`.

## Theme toggle UI
- Переключатель расположен на Home рядом с именем пользователя.
- Кнопка меняет режим между `light` и `dark`.
- Accent остаётся фиолетовым (`--accent`) в обоих режимах.

## Telegram integration boundaries
- Цвета Telegram не используются.
- `applyTelegramTheme` / подписка на `themeChanged` для цветов отключены (no-op).
- Из Telegram используются только safe-area insets:
  - `--tg-content-safe-area-inset-top`
  - `--tg-content-safe-area-inset-bottom`
  - `--tg-safe-area-inset-bottom`
- Layout продолжает учитывать эти переменные через `--content-top`, `--content-bottom`, `--safe-bottom`.

## DEV note
- Если Mini App запущен вне Telegram, safe-area значения остаются `0px`, тема при этом работает из локальных токенов.
