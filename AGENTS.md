# Инструкции для разработки

## Общие принципы
- Проект собирается на Vite + React 18+ + TypeScript. Используйте современные идиоматические подходы React и избегайте устаревших API.
- Для работы с Telegram Mini App используйте SDK `@twa-dev/sdk` и глобальный скрипт `telegram-web-app.js`. При необходимости добавляйте обёртки, но не подключайте сторонние альтернативные SDK.
- Стейт: предпочтительно Zustand для локального состояния и TanStack Query для серверного.
- UI стек: Tailwind CSS и (при необходимости) shadcn/ui. Не смешивайте несвязанные UI-библиотеки.
- Формы оформляйте через `react-hook-form` в связке с `zod`. Для i18n используйте `i18next`, если перевод действительно требуется.
- Для графиков применяйте Recharts и подключайте их лениво.
- Линтинг и форматирование обеспечиваются ESLint + Prettier; не добавляйте другие инструменты без необходимости.
- Тестирование выполняйте через Vitest + Testing Library.

## Стиль кода
- Включён строгий режим TypeScript (`strict: true`).
- Запрещено использовать `any`.
- `unknown` допускается только с последующим явным сужением типов.
- Все функции, хуки и компоненты должны иметь явные типы аргументов и возвращаемых значений.
- Отдавайте предпочтение функциям и хукам без побочных эффектов; внимательно относитесь к `useEffect` и зависимостям.
- Поддерживайте адаптацию к цветовым темам Telegram: считывайте `themeParams`, обновляйте CSS-переменные и не хардкодьте цвета.
- Обновления WebApp (MainButton, BackButton, haptic feedback, resize) реализуйте через Telegram SDK.
- Комментарии в коде и сообщения коммитов пишите на русском языке.

## Структура проекта
- Компоненты и хуки размещайте в соответствующих директориях внутри `src`.
- Общие утилиты и интеграции с внешними SDK храните в `src/shared/lib`.
- Работа с API и HTTP — в `src/shared/api`.
- Настройки окружения и конфигурацию держите в корне репозитория.
- Не складывайте всю логику в один файл — придерживайтесь модульной организации.
- Рекомендуемая структура (feature-sliced):

  - src/app (router, providers)
  - src/pages
  - src/features
  - src/entities
  - src/shared (ui, lib, api, config)

## Routing
- Используйте React Router.
- Страницы размещаются в `src/pages`.
- Конфигурация роутинга — в `src/app/router.tsx`.

## API / Server state
- Запрещено использовать axios или любые другие HTTP-клиенты.
- Все запросы к backend выполняются ТОЛЬКО через общий fetch-wrapper (`src/shared/api/http.ts`).
- Заголовок `X-Tg-Init-Data` прокидывается автоматически в API client (если доступен Telegram initData).
- Базовый URL API берётся из `import.meta.env.VITE_API_BASE_URL`, без хардкода.
- Серверное состояние (загрузка, кэш, мутации) реализуется только через TanStack Query.
- Запрещено хранить серверные данные в Zustand.

## Server state / TanStack Query rules
1) Single source of truth:
   - Данные сущностей (workouts/templates/exercises/sets) считаются "server state" и рендерятся только из TanStack Query (useQuery).
   - Локальный state используется только для UI (draft values, input focus, status saving/error), но НЕ для хранения копий списков сущностей.

2) Mutation update strategy (choose one, consistently):
   - По умолчанию: после успешной мутации делать invalidateQueries(queryKey) и НЕ делать ручной append/merge в массивы.
   - Если требуется optimistic update:
     - обновления делаются через queryClient.setQueryData
     - обязательно делать дедупликацию по id (никогда не допускать дубликатов одинакового id в массиве)
     - запрещено использовать index/orderIndex в качестве key или идентификатора сущности.

3) React keys:
   - При рендере списков всегда использовать стабильные keys:
     - workoutExercise: key = workoutExercise.id
     - setEntry: key = setEntry.id
   - Нельзя использовать index массива, orderIndex или exerciseId как key (кроме временных fallback, явно помеченных DEV ONLY).

4) Invalidate responsibility:
   - invalidateQueries должен быть в одном месте (предпочтительно внутри hooks в features/*/queries.ts).
   - Компоненты страниц НЕ должны одновременно делать ручной append и invalidate на те же данные.

5) Debug checklist for duplicates:
   - если в UI появился дубль: проверить
     a) одинаковые React keys
     b) ручной append + refetch/invalidate
     c) draft state по index вместо id

## OpenAPI и типы
- OpenAPI схема (`docs/openapi.yaml`) является единственным источником правды по DTO и эндпоинтам.
- TypeScript-типы генерируются автоматически из OpenAPI.
- Запрещено вручную дублировать DTO, если они описаны в OpenAPI.
- Сгенерированные типы могут быть закоммичены в репозиторий (допустимо для MVP).

## Telegram SDK
- Прямые обращения к `window.Telegram` запрещены вне `src/shared/lib/telegram.ts`.
- Вся логика работы с Telegram WebApp (initData, themeParams, buttons) должна быть изолирована в shared-слое.
- При локальной разработке вне Telegram приложение должно корректно работать без initData.

## Telegram Mini Apps (official docs rules)
Основание:  
- https://core.telegram.org/bots/webapps  
- https://core.telegram.org/bots/webapps#contentsafeareainset  
- https://core.telegram.org/api/bots/webapps  
- https://core.telegram.org/api/web-events

- **initData и безопасность**:
  - Для backend-аутентификации используйте только `Telegram.WebApp.initData` (raw string).
  - `initDataUnsafe` не считать доверенным источником: допускается только для UI/отладки, без security-решений.
  - Во всех реальных API-запросах отправляйте `initData` в `X-Tg-Init-Data` через общий HTTP-слой.
  - Валидация `initData` выполняется только на backend по официальному алгоритму (HMAC-SHA-256, `data-check-string`, проверка `auth_date`).
  - CORS: фронт не может «добавить» кастомный заголовок в preflight `OPTIONS`; backend обязан принимать `OPTIONS` без авторизации. `X-Tg-Init-Data` добавляется только в реальные запросы.

- **Safe Area / Insets / Layout**:
  - Обязательно учитывайте safe area, чтобы контент не перекрывался системными элементами и Telegram UI.
  - Используйте Telegram CSS-переменные: `--tg-safe-area-inset-top/bottom/left/right` и `--tg-content-safe-area-inset-top/bottom/left/right`.
  - `safeAreaInset` = системные отступы (notch/home bar), `contentSafeAreaInset` = дополнительные отступы под интерфейс Telegram.
  - Базовый layout приложения обязан учитывать content safe area: `padding-top: var(--tg-content-safe-area-inset-top, 0px)` и `padding-bottom: var(--tg-content-safe-area-inset-bottom, 0px)`.
  - Sticky bottom элементы (CTA/TabBar) обязаны учитывать safe area устройства: `padding-bottom: var(--tg-safe-area-inset-bottom, 0px)`.
  - ❌ Запрещено использовать `height: 100vh` для корневых контейнеров (ломается при клавиатуре).
  - ✅ Используйте `min-height: 100dvh` и/или обработку `viewportChanged` через shared-слой.
  - Подписки на `themeChanged`/`viewportChanged` делаются только в shared-слое (`src/shared/lib/telegram.ts` или TelegramProvider). Страницы и компоненты не подписываются напрямую.

- **Theme / Color Scheme**:
  - Не хардкодьте цвета: используйте `themeParams`, `colorScheme` и Telegram CSS vars (в т.ч. `--tg-color-scheme`).
  - На событие `themeChanged` обязательно обновляйте CSS variables/tokens в рантайме.

- **Telegram WebApp API usage**:
  - Управляйте `BackButton` и `MainButton/BottomButton` только в релевантных экранах/флоу.
  - Всегда очищайте подписки на WebApp-события (`themeChanged`, `viewportChanged`, кнопки) при размонтировании/смене контекста.
  - Учитывайте `viewportChanged`: корректно обрабатывайте изменение высоты WebView и появление клавиатуры.
  - Не использовать сторонние SDK «вместо» Telegram WebApp; разрешены только `@twa-dev/sdk` и `telegram-web-app.js`.

- **Telegram buttons ownership**:
  - Управление `BackButton`/`MainButton` централизовано (shared/provider/hook).
  - Нельзя включать/выключать кнопки из произвольных компонентов/страниц без единого контракта.
  - На root-экранах табов `BackButton` скрыт, на detail/edit экранах — показан (как базовый ориентир).

- **Документация временных решений**:
  - Любые временные компромиссы (например, DEV fallback для `initData`) документируйте в `docs/` с пометкой **DEV ONLY** и планом удаления (например, `docs/UI_FLOWS.md` или `docs/theme-architecture.md`).
  - DEV fallback для `initData` допускается только при `import.meta.env.DEV`.
  - В PROD вне Telegram необходимо показывать экран/сообщение «Откройте через Telegram».

### Telegram Mini Apps Documentation

- Официальные правила и архитектурные договорённости по Mini App находятся в `docs/telegram.md`.
- Этот файл является источником правды для:
  - initData / безопасности
  - Safe Area / Layout
  - ThemeParams и палитры
  - viewport events
  - ограничений Bot API / MTProto
- При любом изменении Telegram-поведения (auth, layout, theme, WebApp API, safe area и т.д.)
  необходимо обновить `docs/telegram.md`.

## UI и доступность
- Интерфейс должен корректно работать внутри WebView Telegram.
- Учитывайте мобильные размеры, клавиатуру и изменение высоты WebView.
- Добавляйте верхний отступ, чтобы интерфейс не перекрывался кнопками Telegram.
- Следите за доступностью: aria-атрибуты, контраст, состояния фокуса.

## Графики и визуализация
- Для графиков использовать только Recharts.
- Графики подключать лениво.
- Не выполнять агрегацию данных в UI-компонентах — готовить данные заранее.

## Рабочий процесс
- Перед коммитом проект должен собираться без ошибок TypeScript (`npm run build`).
- ESLint и Prettier должны проходить без игнорирования правил.
- Временные `console.log` допустимы только на этапе разработки и должны быть удалены перед коммитом.
- Обновления описывайте в PR кратко и по делу, подчёркивая влияние на Telegram Mini App.
- При изменении зависимостей агент обязан проверять совместимость версий и корректность peer dependencies (включая `react`/`react-dom` и SDK Telegram), при необходимости сам подбирать совместимые версии и фиксировать проблему.

## Запреты
- ❌ axios
- ❌ any
- ❌ дублирование DTO
- ❌ прямые вызовы Telegram SDK из компонентов
- ❌ хардкод API URL

## Контекст продукта
- Описание MVP и пользовательских флоу: см. `PRODUCT.md` в корне репозитория.
- OpenAPI контракт: `docs/openapi.yaml`
- Описание проекта: см. `docs/`

## Навигация по docs для AI-агента
- `docs/PRODUCT_STATE.md` — актуальный срез MVP: что реализовано и что явно не реализовано.
- `docs/UI_CONTRACT.md` — UX/UI-контракты по экранам: purpose, inputs, actions, states, navigation.
- `docs/TECH_DECISIONS.md` — архитектурные решения и их обоснования (почему сделано именно так).
- `docs/TEMPORARY_SOLUTIONS.md` — временные компромиссы: что временно, почему и план замены.
- `docs/ROADMAP.md` — этапы дальнейшей разработки (short/mid/long-term).
- `docs/UI_FLOWS.md` — сквозные пользовательские потоки и связи между экранами.
- `docs/DEV_NOTES.md` — инженерные заметки по реализации и ограничениям.
- `docs/TODO.md` — список задач и текущий статус выполнения.
- `docs/PROMPTS_LOG.md` — журнал изменений по промптам/итерациям.
- `docs/openapi.yaml` — единственный источник правды по API-контракту (DTO и endpoints).
## Перед PR
- [ ] Safe area и content safe area учтены в базовом layout.
- [ ] нет `100vh` у корневых контейнеров; клавиатура не ломает layout.
- [ ] учтены `contentSafeAreaInset` и `safeAreaInset` (особенно bottom для Sticky CTA/TabBar).
- [ ] `initData` отправляется в backend через `X-Tg-Init-Data`; `initDataUnsafe` не используется как trusted source.
- [ ] Цвета и тема не хардкодятся; `themeChanged` обновляет CSS-переменные.
- [ ] подписки на Telegram events только в shared и корректно очищаются.
- [ ] Подписки Telegram WebApp API корректно очищаются.
- [ ] нет прямых обращений к `window.Telegram` вне shared.
- [ ] Временные DEV-only решения задокументированы в `docs/` с планом удаления.
- [ ] Если изменения касаются Telegram Mini Apps (auth, safe area, theme, layout, WebApp API), обновлён `docs/telegram.md`
