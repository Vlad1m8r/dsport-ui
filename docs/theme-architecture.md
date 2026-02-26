# Theme Architecture (Telegram themeParams + user palette)

## Goals
- Поддержка Telegram themeParams + динамическое обновление на `themeChanged`.
- Готовность к light/dark.
- Подготовка к пользовательской палитре (override limited set).
- Никаких хардкодов “ключевых” цветов в компонентах.

## Sources of truth
1) Telegram themeParams / colorScheme (runtime)
2) App base tokens (fallback)
3) User overrides (future)

Важно: Telegram — верхний приоритет для интеграции, но мы сохраняем читабельность.

## Token layers
### 1) Base palette
Нейтральные шкалы (gray) + accent шкала.
Храним как CSS vars:
- --c-gray-0 ... --c-gray-1000
- --c-accent-...

### 2) Semantic tokens
Компоненты используют только семантику:
- --bg
- --bg-elevated
- --surface
- --surface-muted
- --text-primary
- --text-secondary
- --border
- --accent
- --accent-contrast
- --success / --danger / --warning

### 3) Component tokens
Например:
- --button-primary-bg: var(--accent)
- --card-bg: var(--surface)
- --input-bg: var(--surface-muted)

## Telegram mapping
На старте приложения:
- читаем `Telegram.WebApp.themeParams` и `Telegram.WebApp.colorScheme`
- мапим их в semantic tokens
- подписываемся на `themeChanged` и обновляем tokens

Правило: подписки на Telegram events только в shared/provider слое.

## Safe area / layout (must)
- Layout padding = content safe area
- Sticky bottom = safe area

## User palette (future)
Поддерживаем ограниченный override:
- accent (primary)
- maybe: success/danger (если надо)
Нельзя давать пользователю ломать:
- text colors
- background contrast
План: whitelist overrides + contrast guard.

## DEV-only notes
- Любые временные решения (например fallback initData) документируем в docs и помечаем DEV ONLY.