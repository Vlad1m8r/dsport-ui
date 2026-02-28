## D2 — Theme/Tokens infra (iOS minimal, accent purple)
Сделано:
- Добавлена базовая система semantic-токенов в `src/shared/ui/theme/tokens.css` с дефолтами для `light/dark`, fallback accent = purple и системными переменными для радиусов, отступов, motion, shadows.
- Добавлен менеджер режима темы `src/shared/lib/theme/mode.ts`:
  - `ThemeMode = telegram | light | dark | auto`
  - синхронизация `html[data-theme]` и `html[data-mode]`
  - выбор режима из `Telegram.WebApp.colorScheme` или `prefers-color-scheme`.
- Добавлен bridge Telegram-темы `src/shared/lib/theme/telegram.ts`:
  - чтение `themeParams`
  - маппинг в semantic vars (`--bg`, `--surface`, `--surface-2`, `--text`, `--text-muted`, `--accent`, `--accent-contrast`)
  - подписка на `themeChanged` с cleanup.
- Добавлены safe area helpers `src/shared/lib/theme/safeArea.ts`:
  - применение `safeAreaInset/contentSafeAreaInset` в `--safe-top/--safe-bottom/--content-top/--content-bottom`
  - подписки на `resize`, `visualViewport.resize` и `viewportChanged` с debounce.
- Обновлён entry и корневая инициализация:
  - `src/main.tsx` импортирует `tokens.css`
  - `src/App.tsx` инициализирует theme mode/safe area/telegram bridge и cleanup событий.
- Обновлены базовые стили (`src/index.css`, `src/App.css`):
  - переход на semantic vars
  - `100vh` заменён на `100dvh`
  - добавлены padding с учётом content safe area и safe-bottom.

DEV notes:
- Вне Telegram используются fallback токены и `ThemeMode=auto`.
- Если Telegram WebApp недоступен, safe area vars выставляются в `0px`.
- Fallback accent (purple) сохраняется, если `themeParams.button_color` отсутствует.

Проверка:
- `npm run build` — ok
## F14 — WorkoutPage: чистый read-only для завершённой тренировки
Сделано:
- На `/workouts/:id` рендер read-only теперь явно завязан на `workout.finishedAt`.
- Для завершённой тренировки скрыты элементы редактирования: CTA «Добавить упражнение», кнопки add/remove set/exercise и блоки `last-max`.
- Сохранено поведение disabled-инпутов; autosave не отправляет `PATCH`, когда экран в read-only.
- В верхней части экрана показывается статус «Завершена» (и время завершения, если оно есть).
- Обновлён `docs/SCREENS.md`: зафиксированы режимы `editable` vs `read-only` для WorkoutPage.

Проверка:
- `npm run build` — ok

## F13 — История: только завершённые + явная навигация
Сделано:
- На `/workouts` список истории переведён на запрос только завершённых тренировок: `GET /api/workouts?status=FINISHED`.
- Подтверждено использование общего `AppHeader` на экране истории с явными кнопками «Назад» (`navigate(-1)`) и «Главная» (`navigate("/")`).
- Обновлены `docs/SCREENS.md` и `docs/PROMPTS_LOG.md` под новое правило истории.

Проверка:
- `npm run build` — ok

## F12 — Templates CTA + мгновенное создание шаблона
Сделано:
- На `/templates` CTA «К запуску тренировки» заменён на динамический: «Продолжить начатую» (если есть `IN_PROGRESS`) или «Начать тренировку» (если активной тренировки нет).
- Кнопка «Создать шаблон» на `/templates` теперь сразу создаёт шаблон через `POST /api/templates` (имя по умолчанию: `Новый шаблон`) и редиректит на `/templates/:id/edit`.
- Экран `/templates/new` оставлен как fallback-маршрут, но переведён в тот же поток: при открытии сразу создаёт шаблон и перенаправляет в редактор без промежуточной формы.
- Обновлена документация экранов (`docs/SCREENS.md`).

Проверка:
- `npm run lint` — ok
- `npm run build` — ok

# PROMPTS LOG (Frontend)

## F11.1 — Home: профиль из Telegram
Сделано:
- На Home заменена заглушка профиля: имя и аватар берутся из Telegram WebApp user (`initDataUnsafe.user`).
- Логика Telegram изолирована в `src/shared/lib/telegram.ts` через `getTelegramUser`.
- Добавлен fallback: если нет username и/или фото, показывается пустой аватар и имя `пользователь`.

Проверка:
- `npm run lint` — ok
- `npm run build` — ok

## F11 — Home + AppHeader + active workout hook
Сделано:
- Добавлен новый главный экран `/` с профилем-заглушкой, CTA и плейсхолдером календаря.
- Добавлен общий `AppHeader` (кнопки «Назад»/«Главная») и `AppLayout`, подключённый для всех экранов через роутер.
- Добавлен хук `useActiveWorkout`: запрос `GET /api/workouts?status=IN_PROGRESS&limit=1` и возврат `workoutId | null`.
- Обновлён API слоя истории тренировок: поддержка query-параметра `status`.
- CTA на Home учитывает активную тренировку: «Продолжить тренировку» ведёт на `/workouts/:id`, иначе «Начать тренировку» ведёт на `/start`.

Проверка:
- `npm run lint` — ok
- `npm run build` — ok

## 2026-02-10 — MVP functional scope frozen
Сделано:
- Зафиксирован функциональный scope MVP в docs как источник правды для AI-агентов.
- Кратко закреплены реализованные блоки: templates, workouts, exercise picker, autosave, finish, history.

## F10 — WorkoutPage uses exerciseName/type + picker
Сделано:
- На `/workouts/:id` заголовок упражнения теперь берётся из `exerciseName` (с fallback на `Exercise #id`).
- Поля подхода зависят от `exerciseType`: для `REPS_WEIGHT` показываются только `reps` и `weight`, для `TIME` — только `durationSeconds`.
- Autosave (`PATCH /api/workouts/{workoutId}/sets/{setEntryId}`) отправляет только релевантные для типа поля подхода.
- Добавление упражнения переведено на общий ExercisePicker: кнопка «Добавить упражнение» ведёт на `/pickers/exercises?returnTo=/workouts/:id&mode=workout`.
- При возврате с `pickedExerciseId` WorkoutPage автоматически вызывает `addExercise` и очищает query params через replace-навигацию.

Проверка:
- `npm run lint` — ok
- `npm run build` — ok

## F9.1 — Template editor draft persisted (no auto-save)
Сделано:
- Для `/templates/:id/edit` добавлен client-only черновик шаблона с хранением в `sessionStorage`.
- Черновик переживает переходы между `/templates/:id/edit` и `/pickers/exercises`, включая возврат с `pickedExerciseId`.
- Автосохранение отключено: `PUT /api/templates/{id}` вызывается только по кнопке «Сохранить».
- После успешного сохранения или по кнопке «Сбросить» черновик очищается.

Проверка:
- `npm run lint` — ok
- `npm run build` — ok

## F10 — Кнопка «Изменить» в списке шаблонов
Сделано:
- На `/templates` в каждой карточке шаблона добавлена кнопка «Изменить».
- Кнопка выполняет переход в редактор конкретного шаблона по маршруту `/templates/:id/edit`.
- Кнопка «Удалить» сохранена без изменений в поведении.

Проверка:
- `npm run build` — ok

## F9 — Template editor (exercises + planned sets)
Сделано:
- На `/templates/:id/edit` реализовано полноценное редактирование шаблона: локальный draft, добавление упражнения через ExercisePicker, удаление упражнения, добавление/удаление плановых подходов.
- Добавлено сохранение шаблона через `PUT /api/templates/{id}` (API + TanStack Query mutation с invalidate списка и детального запроса).
- Поля подхода зависят от `exercise.type`: для `REPS_WEIGHT` показываются `plannedReps`, для `TIME` — `plannedDurationSeconds`.
- Добавлена клиентская валидация: непустое `name`, значения подходов строго больше 0 перед сохранением.

Проверка:
- `npm run lint` — ok
- `npm run build` — ok

## F8 — ExercisePicker (shared)
Сделано:
- Добавлен переиспользуемый ExercisePicker с загрузкой `GET /api/exercises` и `GET /api/muscle-groups` через TanStack Query.
- Реализован локальный быстрый поиск по имени с debounce 200ms, фильтры `scope` (ALL/SYSTEM/MY) и `muscle group` на фронте.
- Добавлена страница `/pickers/exercises` с query params `returnTo` и `mode`, по выбору упражнения выполняется переход на `returnTo` с `pickedExerciseId`.

Проверка:
- `npm run lint` — ok
- `npm run build` — ok

## F7 — Template create flow (no auto POST)
Сделано:
- Убрано автосоздание шаблона с `POST /api/templates` по клику в `/templates`.
- Добавлена страница `/templates/new` с контролируемым полем `name` и кнопкой «Создать».
- После успешного `POST /api/templates` реализован переход на `/templates/:id/edit`.
- Добавлена страница `/templates/:id/edit` с загрузкой `GET /api/templates/{id}` через TanStack Query и базовым отображением имени.

Проверка:
- `npm run build` — ok

## F6.1 — Finish workout: валидация заполнения подходов
Сделано:
- Добавлена проверка заполнения: подход считается валидным, если заполнены (reps + weight) или duration.
- После попытки завершить тренировку пустые поля подсвечиваются красным.

Проверка:
- `npm run build` — ok

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
