# Telegram Mini Apps: практическая шпаргалка

## 1) Purpose
Этот документ фиксирует минимальный набор инженерных правил для Telegram Mini App в нашем проекте.
Цель — уменьшить регрессии в авторизации, вёрстке и теме внутри Telegram WebView.
Mini App — это веб-приложение, встроенное в Telegram-клиент, а не отдельный Telegram API-клиент.
Bot API/Telegram API/MTProto решают другие задачи: работа с сообщениями, сущностями Telegram и низкоуровневым протоколом.
Для frontend/backend Mini App нам критичны `initData`, события WebApp, safe area и корректная серверная валидация.
Этот файл описывает не теорию, а правила «что делать в коде» и «чего не делать».

## 2) Key concepts (Mini Apps)
- **`initData` vs `initDataUnsafe`**: `initData` (raw string) отправляется на backend и проверяется там; `initDataUnsafe` можно использовать только для UI/отладки, не для security-решений.
- **`themeParams` / `colorScheme`**: источник цветов Telegram-темы; UI должен подстраиваться без хардкода фиксированной палитры.
- **`safeAreaInset` vs `contentSafeAreaInset`**: первое — системные вырезы/индикаторы устройства, второе — дополнительные отступы под UI Telegram.
- **Viewport events**: изменения высоты WebView и клавиатуры отслеживаются через события Telegram WebApp (`viewportChanged`) и отражаются в layout.

## 3) Security model (MUST)
- `initData` всегда считается недоверенным, пока backend не подтвердил валидность.
- Валидация `initData` на backend: собрать `data-check-string`, вычислить HMAC-SHA-256 по официальному алгоритму и сравнить с `hash`; дополнительно проверять TTL по `auth_date`.
- Нельзя логировать `initData` целиком (ни в frontend, ни в backend логах).
- Рекомендованный контракт ошибок:
  - `401 Unauthorized` — отсутствует `initData` или истёк TTL (`auth_date`).
  - `403 Forbidden` — `hash` не совпал (signature mismatch).
  - `400 Bad Request` — некорректный формат payload.

## 4) Safe area & layout (Frontend MUST)
- **Разница**:
  - `safeAreaInset` — системные inset (notch/home indicator).
  - `contentSafeAreaInset` — inset контентной области с учётом UI Telegram.
- **CSS variables Telegram**:
  - `--tg-safe-area-inset-top`, `--tg-safe-area-inset-bottom`, `--tg-safe-area-inset-left`, `--tg-safe-area-inset-right`
  - `--tg-content-safe-area-inset-top`, `--tg-content-safe-area-inset-bottom`, `--tg-content-safe-area-inset-left`, `--tg-content-safe-area-inset-right`
- **Правило применения**:
  - `AppLayout` использует `padding-top/bottom` от `content safe area`.
  - Sticky bottom элементы (CTA/TabBar) используют `padding-bottom` от `safe area`.
- Запрещено использовать `100vh` в корневых контейнерах: на мобильных с клавиатурой это ломает доступную высоту и вызывает скачки интерфейса.
- Использовать `min-height: 100dvh` и обновление layout на `viewportChanged`.

## 5) Theme & palette (Frontend SHOULD)
- Базовые цвета брать из `themeParams`; не хардкодить палитру компонентов.
- На `themeChanged` обязательно переобновлять CSS-переменные/токены в рантайме.
- Архитектура токенов: **base palette → semantic tokens → component tokens**.
- Для кастомизации пользователем закладывать точку расширения через override ограниченного набора токенов (в первую очередь `primary`/`accent`), не ломая контраст и доступность.

## 6) Telegram APIs and what we do NOT use
- `core.telegram.org/api`, `schema`, `mtproto` описывают Telegram API/MTProto-уровень (клиент-серверный протокол Telegram и типы).
- Для Mini App в нашем проекте MTProto-клиент не нужен.
- В практическом контуре Mini App мы используем Web Apps API + backend-проверку `initData`; bot token нужен только для серверной валидации подписи.
- Прямой запрет: **не писать MTProto-клиент в рамках этого проекта**.

## 7) Practical checklists

### Frontend checklist
- [ ] `initData` отправляется на backend во всех реальных API-запросах.
- [ ] Учтены `safe area` и `content safe area` в базовом layout.
- [ ] `themeParams`/`colorScheme` применяются для темы.
- [ ] Нет `100vh` в корневых контейнерах.

### Backend checklist
- [ ] `OPTIONS` (CORS preflight) разрешён без auth.
- [ ] `initData` валидируется строго по официальной документации.
- [ ] Проверяется TTL по `auth_date`.
- [ ] Сравнение `hash` выполняется constant-time методом.
- [ ] `initData` целиком не логируется.

## 8) Links (official)
- Web Apps: https://core.telegram.org/bots/webapps
- Content safe area inset: https://core.telegram.org/bots/webapps#contentsafeareainset
- Telegram API: https://core.telegram.org/api
- Telegram Schema: https://core.telegram.org/schema
- MTProto: https://core.telegram.org/mtproto
