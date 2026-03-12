# UI Utilities

Набор глобальных utility классов для ускорения разработки интерфейса.

Utilities используются для:

- layout
- typography
- spacing
- surfaces
- interaction helpers

Они **не являются компонентами**, а служат базовыми строительными блоками.

---

# Layout

### ui-container

Стандартный горизонтальный padding страницы.

```html
<div class="ui-container">
```

---

### ui-stack

Вертикальный layout.

```html
<div class="ui-stack">
```

Модификаторы:

- ui-stack-sm
- ui-stack-md
- ui-stack-lg

---

### ui-row

Горизонтальный layout.

```html
<div class="ui-row">
```

Варианты:

- ui-row-between
- ui-row-center

---

# Typography

### ui-page-title

Основной заголовок страницы.

### ui-section-title

Заголовок блока.

### ui-text-muted

Вторичный текст.

### ui-text-caption

Мелкий подписи.

---

# Surfaces

### ui-glass

Glassmorphism поверхность.

### ui-surface

Базовая поверхность.

---

# Interaction

### ui-pressable

Добавляет press анимацию.

### ui-disabled

Отключает элемент.

---

# Text helpers

### ui-truncate

Обрезка текста одной строкой.

### ui-line-clamp-2

Обрезка текста в 2 строки.

---

# Scroll helpers

### ui-hidden-scrollbar

Скрывает scrollbar.
