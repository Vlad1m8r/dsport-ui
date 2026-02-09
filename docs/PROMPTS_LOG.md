# PROMPTS LOG (Frontend)

## F6 — Finish workout
Сделано:
- Добавлен API/React Query слой для завершения тренировки (`POST /api/workouts/{workoutId}/finish`).
- На `/workouts/:id` добавлена кнопка «Закончить тренировку», обработка ошибок и переход в read-only.
- В UI добавлен статус «Завершена», блокировка редактирования и подсветка пустых подходов при ошибке.

Проверка:
- `npm run build` — ok

## F4.6 — Fix UI duplicates after addExercise/addSet
Сделано:
- Fix — removed UI duplicates after addExercise/addSet (double-append with same keys).
- Причина: ручной append в query cache дублировал ответ параллельно с refetch, из-за чего появлялись элементы с одинаковыми id и зеркалились инпуты.
- Обновлено: опираемся на refetch как на single source of truth после мутаций addExercise/addSet.
- Updated AGENTS.md: added TanStack Query mutation rules to prevent UI duplicates.

Проверка:
- Открыть `/workouts/:id`, добавить упражнение и подход — в списках появляется по одному элементу, значения инпутов не зеркалятся.
- `npm run build` — ok

## F4.5 — Autosave set entries
Сделано:
- Добавлено сохранение подходов через `PATCH /api/workouts/{workoutId}/sets/{setEntryId}` с debounce 600ms и сохранением по blur.
- Добавлены статусы "сохранение/сохранено/ошибка" с ретраем для подходов на WorkoutPage.
- Добавлен API/React Query слой для обновления подходов через общий fetch-wrapper.

Проверка:
- `npm run lint` — ok
- `npm run build` — ok

## F4 — Workouts history + workout fetch
Сделано:
- Добавлен API слой и TanStack Query хуки для списка тренировок и загрузки тренировки по id.
- Добавлен экран `/workouts` (история) со статусами загрузки/пустым/ошибкой и CTA на старт.
- Экран `/workouts/:id` теперь загружает данные через `GET /api/workouts/{workoutId}`.
- Добавлены переходы к истории тренировок из `/templates` и `/start`, а также ссылка из `/workouts/:id`.

Проверка:
- `npm run lint` — ok
- `npm run build` — ok

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

## F3b — WorkoutPage
Сделано:
- Добавлена страница `/workouts/:workoutId` и маршрут в роутере.
- Добавлены feature API/queries: `workouts/view`, `workouts/edit`, `exercises/stats`.
- Мутации add/delete упражнений и подходов через `request()` + TanStack Query.
- Подсказки last-max через `GET /api/exercises/{exerciseId}/last-max`.
- Редактирование reps/weight/duration реализовано локально без сохранения (endpoint update set отсутствует).
- При переходе со `/start` прокидывается состояние тренировки.
- Hotfix: добавление подхода отправляет `reps=0` по умолчанию для ограничения `ck_set_entry_not_empty`.

Ограничения:
- В OpenAPI отсутствует `GET /api/workouts/{workoutId}`: детали тренировки берём из route state и локально обновляем после мутаций.

Проверка:
- Открыть `/workouts/:id` и нажать «Добавить подход».
- Убедиться, что запрос проходит без ошибки и новый подход появляется в списке.
