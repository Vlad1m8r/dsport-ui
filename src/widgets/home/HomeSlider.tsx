import {
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from "react";

type CalendarDay = {
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
};

const LAST_SLIDE_INDEX = 2;
const WEEK_DAYS: string[] = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MONTHS_RU: string[] = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const toMondayFirstIndex = (day: number): number => {
  if (day === 0) {
    return 6;
  }

  return day - 1;
};

const buildCalendarGrid = (currentDate: Date): CalendarDay[] => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const todayDate = currentDate.getDate();

  const firstDayOfMonth = new Date(year, month, 1);
  const firstWeekdayIndex = toMondayFirstIndex(firstDayOfMonth.getDay());
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPreviousMonth = new Date(year, month, 0).getDate();

  const totalCells = 42;
  const days: CalendarDay[] = [];

  for (let index = 0; index < totalCells; index += 1) {
    if (index < firstWeekdayIndex) {
      const dayNumber = daysInPreviousMonth - firstWeekdayIndex + index + 1;
      days.push({ dayNumber, isCurrentMonth: false, isToday: false });
      continue;
    }

    const monthDay = index - firstWeekdayIndex + 1;

    if (monthDay > daysInMonth) {
      days.push({ dayNumber: monthDay - daysInMonth, isCurrentMonth: false, isToday: false });
      continue;
    }

    days.push({
      dayNumber: monthDay,
      isCurrentMonth: true,
      isToday: monthDay === todayDate,
    });
  }

  return days;
};

export const HomeSlider = (): ReactElement => {
  const [index, setIndex] = useState<number>(0);
  const [dragX, setDragX] = useState<number>(0);
  const startXRef = useRef<number | null>(null);

  const now = useMemo<Date>(() => new Date(), []);
  const monthLabel = `${MONTHS_RU[now.getMonth()]} ${now.getFullYear()}`;
  const calendarDays = useMemo<CalendarDay[]>(() => buildCalendarGrid(now), [now]);

  const isDragging = startXRef.current !== null;

  const handlePointerDown = (clientX: number): void => {
    startXRef.current = clientX;
  };

  const handlePointerMove = (clientX: number): void => {
    if (startXRef.current === null) {
      return;
    }

    const deltaX = clientX - startXRef.current;

    if ((index === 0 && deltaX > 0) || (index === LAST_SLIDE_INDEX && deltaX < 0)) {
      setDragX(deltaX * 0.3);
      return;
    }

    setDragX(deltaX);
  };

  const handlePointerUp = (): void => {
    if (startXRef.current === null) {
      return;
    }

    if (Math.abs(dragX) > 50) {
      if (dragX < 0) {
        setIndex((prev) => Math.min(prev + 1, LAST_SLIDE_INDEX));
      } else {
        setIndex((prev) => Math.max(prev - 1, 0));
      }
    }

    startXRef.current = null;
    setDragX(0);
  };

  const trackStyle = {
    "--index": index,
    "--drag-x": `${dragX}px`,
  } as CSSProperties;

  return (
    <section className="home-slider" aria-label="Слайдер главной страницы">
      <div
        className="home-slider__viewport"
        onPointerDown={(event) => handlePointerDown(event.clientX)}
        onPointerMove={(event) => handlePointerMove(event.clientX)}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onTouchStart={(event) => handlePointerDown(event.touches[0].clientX)}
        onTouchMove={(event) => handlePointerMove(event.touches[0].clientX)}
        onTouchEnd={handlePointerUp}
        style={{ touchAction: "pan-y" }}
      >
        <div className={`home-slider__track ${isDragging ? "home-slider__track--dragging" : ""}`} style={trackStyle}>
          <article className="home-slider__slide glass home-slider__slide--calendar">
            <header className="home-calendar__header">
              <h2 className="home-calendar__title">{monthLabel}</h2>
            </header>
            <div className="home-calendar__weekdays" aria-hidden>
              {WEEK_DAYS.map((weekDay) => (
                <span key={weekDay} className="home-calendar__weekday">
                  {weekDay}
                </span>
              ))}
            </div>
            <div className="home-calendar__grid" role="grid" aria-label={`Календарь: ${monthLabel}`}>
              {calendarDays.map((day, dayIndex) => (
                <span
                  key={`${day.dayNumber}-${dayIndex}`}
                  className={`home-calendar__cell ${
                    day.isCurrentMonth ? "" : "home-calendar__cell--outside"
                  } ${day.isToday ? "home-calendar__cell--today" : ""}`}
                  role="gridcell"
                  aria-current={day.isToday ? "date" : undefined}
                >
                  {day.dayNumber}
                </span>
              ))}
            </div>
          </article>
          <article className="home-slider__slide glass home-slider__slide--stub">В разработке</article>
          <article className="home-slider__slide glass home-slider__slide--stub">В разработке</article>
        </div>
      </div>
      <div className="home-slider__dots" aria-hidden>
        {[0, 1, 2].map((dotIndex) => (
          <span
            key={dotIndex}
            className={`home-slider__dot ${dotIndex === index ? "home-slider__dot--active" : ""}`}
          />
        ))}
      </div>
    </section>
  );
};
