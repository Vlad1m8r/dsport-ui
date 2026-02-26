# Motion & Interaction

Цель: микро-анимации не ради “вау”, а ради ясности (feedback + статус).

## Durations
- Instant feedback (press): 80–120ms
- Simple transitions: 160–220ms
- Modal/sheet: 240–320ms

## Easing
- Default: ease-out
- Close/dismiss: ease-in
- Avoid bouncy springs в MVP (оставим на позже)

## Patterns
### Press / Tap
- scale: 0.98
- opacity: 0.9
- duration: 100ms

### Hover (desktop only)
- subtle background change
- never rely on hover for meaning

### List updates
- Insert/remove: 160–220ms fade + небольшая высотная анимация (если не ломает layout)

### Autosave indicator
- saving: небольшая “крутилка” или pulse
- saved/error: смена иконки с fade 120ms

### Skeleton
- Shimmer: очень мягкий, низкий контраст
- Не должен раздражать: не яркий, не быстрый

## Rules
- Анимация не должна двигать layout резко (avoid layout shift).
- Любое движение должно подтверждать действие (добавили сет -> появился ряд).
- На слабых девайсах: возможность отключить тяжёлые эффекты (prefers-reduced-motion).