# UI CONTRACT (MVP)

## Общие правила
- Template editor работает через **client-side draft**.
- Любые изменения шаблона отправляются на backend только по кнопке **«Сохранить»**.
- ExercisePicker используется в двух потоках:
  - TemplateEditor (`/templates/:id/edit`)
  - WorkoutPage (`/workouts/:id`)
- `pickedExerciseId` передаётся через query param при возврате из picker в `returnTo`, затем **обязательно очищается** через replace-навигацию после обработки.

---

## TemplatesPage (`/templates`)
**Purpose**
- Показать список шаблонов и дать быстрые переходы в создание/редактирование/запуск.

**Inputs**
- Прямого текстового ввода нет.

**Actions**
- «Создать шаблон».
- «Изменить» в карточке шаблона.
- «Удалить» в карточке шаблона.
- «К запуску тренировки».
- «История тренировок».

**States**
- `loading`: список ещё загружается, действия списка заблокированы.
- `empty`: шаблонов нет, CTA на создание и старт без шаблона.
- `error`: сообщение об ошибке + retry.
- `read-only`: не применяется.

**Navigation**
- `/templates/new`
- `/templates/:id/edit`
- `/start`
- `/workouts`

---

## TemplateCreatePage (`/templates/new`)
**Purpose**
- Создать новый шаблон и перейти в его редактор.

**Inputs**
- Название шаблона.

**Actions**
- «Создать».
- «Отмена/Назад».

**States**
- `loading`: во время создания кнопка блокируется.
- `empty`: не применяется.
- `error`: текст ошибки создания.
- `read-only`: не применяется.

**Navigation**
- Успех: `/templates/:id/edit`.
- Отмена: `/templates`.

---

## TemplateEditPage (`/templates/:id/edit`)
**Purpose**
- Редактировать шаблон в локальном черновике до явного сохранения.

**Inputs**
- Название шаблона.
- Плановые значения подходов (по типу упражнения).
- Локальные изменения состава упражнений/подходов.

**Actions**
- «Добавить упражнение» (через picker).
- «Удалить упражнение».
- «Добавить подход» / «Удалить подход».
- «Сохранить».
- «Сбросить» (вернуть draft к последнему состоянию backend).

**States**
- `loading`: загрузка исходного шаблона/каталога для валидации.
- `empty`: шаблон без упражнений.
- `error`: ошибка загрузки/сохранения.
- `read-only`: не применяется.

**Navigation**
- В picker: `/pickers/exercises?returnTo=/templates/:id/edit&mode=template`.
- Возврат из picker: `returnTo` + `pickedExerciseId`, затем очистка query param.
- После сохранения: остаёмся на `/templates/:id/edit` (с очищенным draft).

---

## ExercisePickerPage (`/pickers/exercises`)
**Purpose**
- Выбрать упражнение из общего каталога для template/workout потока.

**Inputs**
- Поиск по названию.
- Фильтры (`scope`, muscle group).

**Actions**
- Выбрать упражнение.
- Назад без выбора.

**States**
- `loading`: загрузка каталога и справочников.
- `empty`: нет упражнений под текущие фильтры.
- `error`: ошибка загрузки + retry.
- `read-only`: не применяется.

**Navigation**
- По выбору: переход на `returnTo` с `pickedExerciseId` и `mode`.
- Без выбора: возврат на `returnTo` без `pickedExerciseId`.

---

## StartWorkoutPage (`/start`)
**Purpose**
- Запустить тренировку по шаблону или пустую.

**Inputs**
- Выбор шаблона (если старт по шаблону).

**Actions**
- «Начать по шаблону».
- «Начать без шаблона».
- Переход в историю.

**States**
- `loading`: загрузка списка шаблонов.
- `empty`: нет шаблонов (остаётся старт без шаблона).
- `error`: ошибка загрузки/старта.
- `read-only`: не применяется.

**Navigation**
- Успех: `/workouts/:id`.
- Альтернатива: `/workouts`.

---

## WorkoutPage (`/workouts/:id`)
**Purpose**
- Вести активную тренировку, автосохранять подходы и завершать сессию.

**Inputs**
- Значения подходов (`reps/weight` или `durationSeconds` по типу упражнения).

**Actions**
- «Добавить упражнение» (через picker).
- «Удалить упражнение».
- «Добавить подход» / «Удалить подход».
- Ручной retry при ошибке autosave.
- «Закончить тренировку».

**States**
- `loading`: загрузка тренировки/частей данных.
- `empty`: тренировке пока не добавлены упражнения.
- `error`: ошибка загрузки/мутаций/завершения.
- `read-only`: после finish или при `finishedAt` редактирование заблокировано.

**Navigation**
- В picker: `/pickers/exercises?returnTo=/workouts/:id&mode=workout`.
- Возврат из picker: `returnTo` + `pickedExerciseId`, затем очистка query param.
- После finish: остаёмся на `/workouts/:id` в read-only, доступен переход в историю.

---

## WorkoutsHistoryPage (`/workouts`)
**Purpose**
- Показать список завершённых/начатых тренировок и открыть детали.

**Inputs**
- Прямого ввода нет.

**Actions**
- Открыть тренировку из списка.
- «Начать тренировку» (через стартовый экран).

**States**
- `loading`: загрузка списка.
- `empty`: история пуста.
- `error`: ошибка загрузки + retry.
- `read-only`: не применяется (режим зависит от конкретной `/workouts/:id`).

**Navigation**
- `/workouts/:id`
- `/start`
