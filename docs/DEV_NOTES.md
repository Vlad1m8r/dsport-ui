# DEV NOTES

## Dev fallback: Telegram initData (DEV ONLY)
Задача: локально тестировать фронт без Telegram WebView и без реального initData.

Реализация:
- Единственная точка доступа к Telegram WebApp: `src/shared/lib/telegram.ts`
- Функция `getInitData()`:
  - Если доступен `window.Telegram?.WebApp?.initData` и не пустой → возвращаем его.
  - Иначе (локально вне Telegram):
    - В DEV режиме (`import.meta.env.DEV === true`) возвращаем initData заглушку:
      `user=%7B%22id%22%3A12345%7D`
    - В PROD режиме возвращаем пустую строку.

Важно:
- В OPTIONS (CORS preflight) невозможно принудительно добавить `X-Tg-Init-Data` с фронта.
- Backend должен разрешать preflight без авторизации.
- Фронт обязан добавлять `X-Tg-Init-Data` во все реальные запросы (GET/POST/PUT/DELETE) через общий fetch-wrapper.

## WorkoutPage: отсутствие GET /api/workouts/{workoutId}
Сейчас в OpenAPI нет эндпоинта получения тренировки по id, поэтому экран `/workouts/:id` получает данные
из route state (ответ `startWorkout`) и локально обновляет список упражнений/подходов после мутаций.
Сохранение значений reps/weight/duration остаётся локальным до появления endpoint update set_entry.

## Add set: backend constraint ck_set_entry_not_empty
При добавлении подхода фронт отправляет `reps=0` по умолчанию, чтобы пройти ограничение
`ck_set_entry_not_empty` (должно быть reps != null или durationSeconds != null).
Позже можно выбирать дефолт в зависимости от типа упражнения (reps vs duration).
