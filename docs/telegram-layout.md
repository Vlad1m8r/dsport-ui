# Telegram Layout & Safe Area

## Зачем это нужно

В Telegram Mini App нельзя рассчитывать на фиксированные "магические" отступы (например, `padding-top: 56px`), потому что:

- верхняя и нижняя системные зоны зависят от устройства, версии ОС и состояния WebView;
- при полноэкранном режиме и смене системных панелей размеры безопасных зон меняются динамически;
- одинаковые значения на iOS/Android и разных девайсах дают некорректный UI.

Поэтому отступы строятся только на `safeAreaInset` и `contentSafeAreaInset` из Telegram WebApp API.

## CSS-переменные

При инициализации layout в `:root` обновляются переменные:

- `--tg-safe-top`
- `--tg-safe-right`
- `--tg-safe-bottom`
- `--tg-safe-left`
- `--tg-content-top`
- `--tg-content-right`
- `--tg-content-bottom`
- `--tg-content-left`
- `--tg-layout-top`
- `--tg-layout-right`
- `--tg-layout-bottom`
- `--tg-layout-left`
- `--tg-layout-top-reserve`
- `--tg-layout-effective-top`

Если Telegram API недоступно (локальная разработка в обычном браузере), все переменные остаются `0px`.

`--tg-layout-*` — это безопасный слой для экранного layout: берётся `max(safeAreaInset, contentSafeAreaInset)` по каждой стороне. Это защищает UI от наложения Telegram-контролов в fullscreen.

Для iOS временно добавляется небольшой верхний запас `--tg-layout-top-reserve` (12px), чтобы снизить риск визуального наложения верхних Telegram-контролов. Итоговый верхний отступ: `--tg-layout-effective-top`.

## Где выполняется инициализация

- Хук: `src/shared/telegram/useTelegramLayout.ts`
- Подключение на старте: `src/App.tsx`

Что делает хук:

1. Best-effort запрос fullscreen: `requestFullscreen()`, fallback на `expand()`.
2. Best-effort блокировка ориентации: `lockOrientation()` (если поддерживается).
3. Применение инcетов в CSS-переменные.
4. Подписки на события:
   - `safeAreaChanged`
   - `contentSafeAreaChanged`
   - `fullscreenChanged` (одна мягкая повторная попытка fullscreen без бесконечных ретраев).

## Применение на страницах

Все страницы должны рендериться внутри общего контейнера `SafeAreaContainer`, который задаёт паддинги от безопасного layout-слоя (`max(contentSafeAreaInset, safeAreaInset)`):

```css
.safeAreaContainer {
  padding: var(--tg-layout-effective-top) var(--tg-layout-right) var(--tg-layout-bottom) var(--tg-layout-left);
}
```

## Sticky/Fixed элементы у края экрана

Если элемент закреплён у нижней или верхней границы экрана (bottom bar, floating action button), учитывайте `safeAreaInset`.

Пример для нижней панели:

```css
.bottomBar {
  padding-bottom: var(--tg-safe-bottom);
}
```

Это гарантирует, что элемент не попадёт в жестовую/system зону устройства.


## Временный in-app debug (DEV)

Для диагностики на реальном телефоне без desktop devtools доступен временный overlay.

- Работает только в DEV сборке.
- Включение/выключение: кнопка `Показать debug` в правом нижнем углу.
- Дополнительно можно открыть сразу в активном режиме через `?tgLayoutDebug=1`.
- Компонент: `src/shared/telegram/TelegramLayoutDebug.tsx`

Overlay показывает:

- `safeTop/contentTop/layoutTop` из CSS vars;
- `topReserve/effectiveTop` для контроля итогового верхнего отступа;
- `safeAreaInset` и `contentSafeAreaInset` из Telegram WebApp;
- `viewportHeight`, `viewportStableHeight`, `isExpanded`, `version`.
