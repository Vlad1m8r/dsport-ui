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

Если Telegram API недоступно (локальная разработка в обычном браузере), все переменные остаются `0px`.

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

Все страницы должны рендериться внутри общего контейнера `SafeAreaContainer`, который задаёт паддинги от `contentSafeAreaInset`:

```css
.safeAreaContainer {
  padding: var(--tg-content-top) var(--tg-content-right) var(--tg-content-bottom) var(--tg-content-left);
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
