# TECH DECISIONS (MVP)

## Why OpenAPI is source of truth
- Контракт API фиксируется в одном месте (`docs/openapi.yaml`), чтобы frontend не расходился с backend по DTO и endpoint.
- Типы генерируются автоматически, что снижает риск ручных ошибок и упрощает поддержку AI-агентами.

## Why TanStack Query only for server state
- Данные templates/workouts/exercises/sets являются server state и должны иметь единый lifecycle: fetch, cache, invalidate, refetch.
- Такой подход убирает дубли локальных копий и снижает риск рассинхронизации UI после мутаций.

## Why template editor uses client-side draft (Zustand + sessionStorage)
- Редактор шаблона предполагает серию локальных правок перед одним осознанным сохранением.
- Draft в Zustand + `sessionStorage` позволяет безопасно переходить в picker и возвращаться без потери незавершённых изменений.
- Это также явно отделяет UX-редактирование от backend-состояния (без скрытых авто-`PUT`).

## Why exercise catalog is fetched in bulk and filtered on frontend
- Для MVP объём каталога ограниченный, поэтому выгоднее один bulk-запрос и быстрые локальные фильтры.
- Это упрощает UX (мгновенный поиск/фильтрация) и уменьшает связанность с backend-поиском на раннем этапе.

## Why autosave is blur-first, debounce-second
- `blur` закрывает сценарий «пользователь закончил ввод и ушёл с поля» — данные отправляются сразу.
- debounce покрывает активный набор, снижает число запросов и не перегружает WebView.
- Комбинация даёт баланс между отзывчивостью и стабильностью API-нагрузки.

## Why finish workout locks editing on backend AND frontend
- Backend-lock гарантирует целостность данных (после `finish` сессия неизменяема по контракту).
- Frontend-lock делает состояние прозрачно читаемым для пользователя (видно, что тренировка завершена и поля недоступны).
- Двойная защита снижает риск случайных и конфликтных изменений.

## Telegram Mini App constraints (WebView, keyboard, safe areas)
- UI проектируется под мобильный WebView: ограниченная высота, нестабильная клавиатура, resize.
- Важно учитывать safe areas/отступы и не перекрывать контент системными элементами Telegram.
- Любые UX-решения оцениваются с приоритетом стабильной работы внутри Telegram-контейнера, а не только в desktop-браузере.
