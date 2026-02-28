import {
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactElement,
  type TouchEvent,
} from "react";

const LAST_SLIDE_INDEX = 2;

export const HomeSlider = (): ReactElement => {
  const [index, setIndex] = useState<number>(0);
  const startXRef = useRef<number | null>(null);

  const handleSwipe = (deltaX: number): void => {
    if (Math.abs(deltaX) <= 40) {
      return;
    }

    if (deltaX < 0) {
      setIndex((prev) => Math.min(prev + 1, LAST_SLIDE_INDEX));
      return;
    }

    setIndex((prev) => Math.max(prev - 1, 0));
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>): void => {
    startXRef.current = event.clientX;
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>): void => {
    if (startXRef.current === null) {
      return;
    }

    handleSwipe(event.clientX - startXRef.current);
    startXRef.current = null;
  };

  const onTouchStart = (event: TouchEvent<HTMLDivElement>): void => {
    const point = event.changedTouches[0];

    if (!point) {
      return;
    }

    startXRef.current = point.clientX;
  };

  const onTouchEnd = (event: TouchEvent<HTMLDivElement>): void => {
    const point = event.changedTouches[0];

    if (!point || startXRef.current === null) {
      return;
    }

    handleSwipe(point.clientX - startXRef.current);
    startXRef.current = null;
  };

  const trackStyle = { "--index": index } as CSSProperties;

  return (
    <section className="home-slider" aria-label="Слайдер главной страницы">
      <div
        className="home-slider__viewport"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="home-slider__track" style={trackStyle}>
          <article className="home-slider__slide">Календарь (заглушка)</article>
          <article className="home-slider__slide">В разработке</article>
          <article className="home-slider__slide">В разработке</article>
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
