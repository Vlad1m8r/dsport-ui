# PROMPTS LOG (Frontend)

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
