# Design System (iOS minimal)

Цель: единый визуальный язык и набор токенов/правил для MVP Telegram Mini App.
Стиль: iOS minimal (плоские поверхности, мягкие карточки, большие радиусы, чистая типографика, аккуратные состояния).

## Principles
- Content-first: минимум визуального шума, максимум читаемости.
- Large touch targets: минимум 44px по высоте для кликабельных контролов.
- One primary action per screen (особенно на мобильном).
- Консистентные состояния: loading/empty/error всегда предусмотрены.
- Telegram constraints:
  - Layout учитывает `contentSafeAreaInset`.
  - Sticky bottom элементы учитывают `safeAreaInset`.
  - Не используем `100vh` (только `100dvh` + обработка viewport). См. `docs/telegram.md`.

---

## Token layers
Мы используем 3 слоя токенов:
1) Base palette (сырой цвет/нейтральные шкалы)
2) Semantic tokens (bg/text/border/accent/success/error)
3) Component tokens (button/card/input/sheet)

Слои запрещено смешивать: компоненты не тянут base напрямую.

---

## Typography
Ориентир: iOS/SF-like.
- Font family: system-ui (или default browser stack)
- Scale:
  - Display: 28–34 / semibold (заголовок экрана)
  - H1: 22–24 / semibold
  - H2: 18–20 / semibold
  - Body: 16 / regular
  - Caption: 13–14 / regular
- Line height:
  - Titles: 1.15–1.2
  - Body: 1.35–1.45
- Truncation:
  - Заголовки в cards — 2 строки max (line-clamp)
  - Подписи — 1 строка + ellipsis

---

## Spacing
Базовая сетка 4pt.
Рекомендуемые отступы:
- Screen padding: 16
- Section gap: 16–24
- Card padding: 16
- Row gap: 12
- Inline gap: 8

---

## Radii
iOS minimal любит “мягкие” формы:
- radius-xs: 10 (малые чипы/inputs)
- radius-sm: 14
- radius-md: 18
- radius-lg: 22
- radius-xl: 28 (крупные контейнеры/карты)
- radius-pill: 9999 (пилюли/CTA)

---

## Elevation / Shadows
Тень очень мягкая (почти незаметная).
- Card: слабая тень + лёгкий border (в зависимости от темы)
- Sheet: затемнение backdrop + контейнер с большим radius

---

## Components (визуальные правила)
### Card
- Большой radius (lg/xl)
- Внутри: заголовок + мета + контент
- Скелетон повторяет структуру card (без скачков высоты)

### Button
- Primary: pill, высота 48–56, текст semibold
- Secondary: тихая (тонкий контраст, без лишней рамки)
- Destructive: отдельный акцент (красный), подтверждение в sheet/alert

### Input
- Высота 44–48
- Radius sm/md
- Clear (крестик) при вводе (как iOS Search)
- Ошибка: подсветка border + helper text

### Tabs / BottomBar
- Высота: 56 + safeAreaInsetBottom
- Иконки монохромные, активная — контрастнее
- Не перекрывать контент: всегда reserve space

### Home (спец-правила экрана)
- User header:
  - имя пользователя — display-типографика (крупный, плотный заголовок);
  - справа — компактный блок controls (theme toggle + avatar), без тяжёлого фонового контейнера.
- Action tiles:
  - карточки с лёгкой тенью и тонкой границей;
  - иконка размещается в отдельном акцентном круге;
  - tap-state через мягкий scale-down.
- Slider:
  - обязательно поддерживать drag-follow UX (слайд двигается за пальцем во время свайпа);
  - во время перетаскивания transition отключается;
  - сдвиг реализуется через CSS custom property (`--drag-x`), а не через тяжёлые JS-анимации;
  - на первом/последнем слайде используется edge resistance.
- Floating dock footer:
  - нижняя навигация оформляется как «плавающая капсула»;
  - разрешён blur/backdrop-filter при сохранении читаемости и контраста;
  - активный пункт выделяется акцентной пилюлей.

### Modal sheet
- Top drag indicator
- Search сверху
- Список — виртуализируем при необходимости (500+ items)
- Close/Cancel справа (iOS стиль)

---

## States (mandatory)
Каждый экран обязан иметь:
- Loading: skeleton (не spinner в центре, кроме мелких операций)
- Empty: иконка + заголовок + текст + CTA (если уместно)
- Error: простой текст + “Повторить” (если возможно)

---

## Micro-UX rules
- Tap feedback: лёгкое изменение opacity/scale (см. motion.md)
- Autosave: статус без текста (иконка):
  - saving -> “спиннер/точка”
  - saved -> зелёная
  - error -> красная
- Completion set: активная подсветка строки (и/или чек справа)
- Collapse exercises: по умолчанию раскрыт только первый блок упражнения
- Добавление упражнения: modal sheet, search сверху (без отдельного экрана)

---

## Accessibility
- Контраст: минимум WCAG AA для текста
- Touch targets >= 44px
- aria-label для иконок (delete, add, close)
- Focus styles не отключать