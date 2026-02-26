# Component Map

Цель: список UI-кирпичиков и где они применяются, чтобы агент делал консистентно.

## Screens (MVP сейчас)
- Templates list (/templates)
- Template editor (/templates/:id/edit) (draft state локально до Save)
- Start workout (/start)
- Active workout (/workouts/:id)
- Workouts history (/workouts) + Workout view (/workouts/:id?mode=view) (если разделяем)

## Shared UI components
### Layout
- AppLayout
  - учитывает content safe area
  - содержит TopBar (опционально) + content + BottomBar (опционально)

### Navigation
- BottomTabBar (если используем вкладки)
- TopBar
  - title
  - back (если не root)
  - actions (иконки справа)

### Feedback
- SkeletonCard / SkeletonList
- EmptyState (icon/title/text/cta)
- InlineError (text + retry)

### Lists
- ListItem (avatar/thumb + title + subtitle + right slot)
- CardList / Section

### Cards
- ExerciseCard
  - header: name + meta (muscles) + actions
  - body: sets table
  - collapsed/expanded

### Forms
- TextField
- SearchField (с clear button)
- Chip/SegmentedControl (filters)
- ToggleRow
- PrimaryButton / SecondaryButton / DestructiveButton

### Sheets / Modals
- ModalSheet
- ExercisePickerSheet
  - Search сверху
  - Filters row (chips)
  - Virtualized list (если нужно)

### Workout-specific
- SetRow
  - inputs: reps/weight/duration (пока все поля, позже по type)
  - state: completed (highlight) / invalid (error border)
- AutosaveIndicator (icon-only)

## Micro-UX behaviors
- Collapse exercises default: раскрыт только первый
- Completion set: подсветка строки + чек
- Autosave: иконка статуса без текста