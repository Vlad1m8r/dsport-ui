# PROMPTS LOG (Frontend)

## F3 — Правило актуализации docs
Сделано:
- Введено правило: каждый промпт обновляет docs (PROMPTS_LOG + DEV_NOTES + UI_FLOWS + TODO).

## F1 — OpenAPI types + http client + initData header
Сделано:
- Добавлена генерация типов из `docs/openapi.yaml` → `src/shared/api/schema.d.ts`
- Добавлен базовый fetch-wrapper: `src/shared/api/http.ts`
- Добавлена функция получения initData: `src/shared/lib/telegram.ts`
- Заголовок `X-Tg-Init-Data` автоматически добавляется к запросам через http client

Проверка:
- `npm run gen:api` — ok
- `npm run build` — ok

## F2 — TanStack Query + Templates page
Сделано:
- Подключён TanStack Query (QueryClientProvider)
- Typed hooks для templates (list/create/delete) строго по OpenAPI типам
- Страница `/templates`:
  - список шаблонов
  - создание
  - удаление
- Добавлен DEV fallback initData user id = 12345 (DEV ONLY)

Проверка:
- список отображается
- create/delete работают с backend

## F3a — StartWorkoutPage
Сделано:
- Страница `/start` для выбора шаблона и запуска тренировки.
- Feature `workouts/start`: API-функция старта и mutation-хук на TanStack Query.
- Роут `/start` и CTA из `/templates` к запуску тренировки.
- Состояния loading/empty/error для списка шаблонов и ошибок старта.

Проверка:
- Открыть `/start`, дождаться загрузки списка шаблонов.
- Нажать «Начать по шаблону» (после выбора) или «Начать без шаблона».
- Убедиться, что происходит переход на `/workouts/:id`.
