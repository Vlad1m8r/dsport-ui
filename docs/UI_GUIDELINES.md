# UI Guidelines & TMA Performance Standards

Этот документ фиксирует стандарты верстки для Telegram Mini App.

---

## 1. Glassmorphism

- Использовать класс `.glass`
- blur ≤ 16px
- Запрещены вложенные стеклянные блоки
- Обязателен fallback через @supports

---

## 2. Производительность

- Запрещено `background-attachment: fixed`
- Фон реализуется через фиксированный слой (::before)
- will-change только на реально анимируемых элементах

---

## 3. Цветовая система

- Accent всегда фиолетовой гаммы
- Используются только токены (var(--...))
- Светлая и темная темы должны сохранять бренд

---

## 4. Telegram Safe Area

Используются переменные:
- --tg-content-safe-area-inset-top
- --tg-content-safe-area-inset-bottom
- --tg-safe-area-inset-bottom
