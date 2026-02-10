# TODO / Roadmap (MVP)

## UI Flow MVP
- [x] F3a: Start workout page (выбрать шаблон / без шаблона)
- [x] F3b: Workout page (текущая тренировка: упражнения/подходы add/remove, ввод reps/weight/duration)
- [x] F3c: Last-max подсказки рядом с упражнением
- [x] F4: История тренировок + загрузка тренировки по id
- [x] F6: Завершение тренировки (read-only + возврат в историю)

## UX & Polish
- [x] Переиспользовать ExercisePicker в добавлении упражнения на WorkoutPage
- [ ] Форма создания шаблона (react-hook-form + zod)
- [x] F9: Редактирование шаблона: добавление/удаление упражнений и подходов, сохранение PUT /api/templates/{id}
- [ ] Нормальные состояния загрузки/ошибок (skeleton/loading, error blocks)
- [ ] Telegram theme params → CSS variables + базовые компоненты (кнопки/инпуты)

## Tech debt / Safety
- [ ] Убедиться что PROD режим не использует dev fallback initData
- [ ] Обновление openapi.yaml: описать процесс/команду (источник — backend /v3/api-docs.yaml)
- [ ] Backend: endpoint update set_entry в тренировке (PUT/PATCH)
- [ ] Frontend: сохранение изменений reps/weight/duration в подходах

- [ ] F9 follow-up: убрать временные дефолты `0` для новых подходов после согласования UX (выбор типа + строгая валидация на вводе).
