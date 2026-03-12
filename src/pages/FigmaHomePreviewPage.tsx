import type { CSSProperties, ReactElement } from "react";

import { HistoryIcon, StartIcon, TemplatesIcon } from "../shared/ui/icons/HomeActionIcons";
import { ActionTile } from "../widgets/home/ActionTile";
import { FooterNav } from "../widgets/nav/FooterNav";
import "../widgets/home/home.css";
import "./FigmaHomePreviewPage.css";

type DeviceSpec = {
  id: "compact" | "balanced" | "max";
  title: string;
  sizeLabel: string;
  width: number;
  height: number;
  subtitle: string;
  accent: string;
};

type WorkoutDay = {
  day: string;
  state: "done" | "planned" | "rest";
};

const DEVICE_SPECS: DeviceSpec[] = [
  {
    id: "compact",
    title: "Compact",
    sizeLabel: "360 x 780",
    width: 360,
    height: 780,
    subtitle: "Android small",
    accent: "var(--accent)",
  },
  {
    id: "balanced",
    title: "Balanced",
    sizeLabel: "390 x 844",
    width: 390,
    height: 844,
    subtitle: "iPhone standard",
    accent: "#22c55e",
  },
  {
    id: "max",
    title: "Max",
    sizeLabel: "430 x 932",
    width: 430,
    height: 932,
    subtitle: "Large display",
    accent: "#f97316",
  },
];

const WORKOUT_DAYS: WorkoutDay[] = [
  { day: "Пн", state: "done" },
  { day: "Вт", state: "planned" },
  { day: "Ср", state: "rest" },
  { day: "Чт", state: "done" },
  { day: "Пт", state: "planned" },
  { day: "Сб", state: "rest" },
  { day: "Вс", state: "done" },
];

const METRICS: Array<{ label: string; value: string }> = [
  { label: "Серия", value: "8 нед." },
  { label: "Объём", value: "12.4 т" },
  { label: "Цель", value: "Сила" },
];

const STATS: Array<{ label: string; value: string; delta: string }> = [
  { label: "Тренировок", value: "18", delta: "+4 к фев." },
  { label: "Средний tonnage", value: "6 240 кг", delta: "+11%" },
  { label: "Личный рекорд", value: "140 кг", delta: "Жим лёжа" },
];

const PROGRESS_BY_DEVICE: Record<DeviceSpec["id"], string> = {
  compact: "62%",
  balanced: "74%",
  max: "86%",
};

const noop = (): void => undefined;

const PreviewHomeScreen = ({ device }: { device: DeviceSpec }): ReactElement => {
  return (
    <article className="figma-home-preview__device-card glass">
      <header className="figma-home-preview__device-meta">
        <div>
          <p className="figma-home-preview__device-name">{device.title}</p>
          <p className="figma-home-preview__device-subtitle">{device.subtitle}</p>
        </div>
        <span className="figma-home-preview__device-size">{device.sizeLabel}</span>
      </header>

      <div
        className="figma-home-preview__phone-shell"
        style={
          {
            "--device-width": `${device.width}px`,
            "--device-height": `${device.height}px`,
            "--device-accent": device.accent,
          } as CSSProperties
        }
      >
        <div className="figma-home-preview__phone-screen">
          <div className="figma-home-preview__statusbar">
            <span>9:41</span>
            <span>Telegram Mini App</span>
            <span>100%</span>
          </div>

          <section className="figma-home-preview__hero glass">
            <div className="figma-home-preview__hero-copy">
              <span className="figma-home-preview__eyebrow">FitApp</span>
              <h1 className="figma-home-preview__hero-title">Привет, Владимир</h1>
              <p className="figma-home-preview__hero-text">Сегодня силовой день. Следующая цель: 4 подхода тяги.</p>
            </div>

            <div className="figma-home-preview__hero-avatar" aria-hidden>
              VG
            </div>
          </section>

          <section className="figma-home-preview__metrics" aria-label="Ключевые метрики">
            {METRICS.map((metric) => (
              <div key={metric.label} className="figma-home-preview__metric glass">
                <span className="figma-home-preview__metric-label">{metric.label}</span>
                <strong className="figma-home-preview__metric-value">{metric.value}</strong>
              </div>
            ))}
          </section>

          <section className="home-actions figma-home-preview__actions" aria-label="Главные действия">
            <ActionTile icon={<TemplatesIcon className="home-action-tile__icon" />} label="Шаблоны" onClick={noop} />
            <ActionTile icon={<StartIcon className="home-action-tile__icon" />} label="Начать" onClick={noop} />
            <ActionTile icon={<HistoryIcon className="home-action-tile__icon" />} label="История" onClick={noop} />
          </section>

          <section className="figma-home-preview__focus-card glass" aria-label="Текущий фокус">
            <div className="figma-home-preview__focus-copy">
              <span className="figma-home-preview__focus-kicker">Фокус недели</span>
              <h2 className="figma-home-preview__focus-title">Спина + тяга</h2>
              <p className="figma-home-preview__focus-text">3 из 4 тренировок завершены. Ещё один подход до недельной цели.</p>
            </div>

            <div className="figma-home-preview__progress">
              <div className="figma-home-preview__progress-track">
                <div
                  className="figma-home-preview__progress-fill"
                  style={{ width: PROGRESS_BY_DEVICE[device.id] }}
                />
              </div>
              <span className="figma-home-preview__progress-label">{PROGRESS_BY_DEVICE[device.id]}</span>
            </div>
          </section>

          <section className="figma-home-preview__week glass" aria-label="Недельный план">
            <div className="figma-home-preview__section-header">
              <h2 className="figma-home-preview__section-title">Ритм недели</h2>
              <span className="figma-home-preview__section-link">Март</span>
            </div>
            <div className="figma-home-preview__week-grid">
              {WORKOUT_DAYS.map((item) => (
                <div
                  key={item.day}
                  className={`figma-home-preview__week-day figma-home-preview__week-day--${item.state}`}
                >
                  <span className="figma-home-preview__week-day-name">{item.day}</span>
                  <span className="figma-home-preview__week-day-dot" aria-hidden />
                </div>
              ))}
            </div>
          </section>

          <section className="figma-home-preview__stats" aria-label="Статистика">
            {STATS.map((stat) => (
              <article key={stat.label} className="figma-home-preview__stat-card glass">
                <span className="figma-home-preview__stat-label">{stat.label}</span>
                <strong className="figma-home-preview__stat-value">{stat.value}</strong>
                <span className="figma-home-preview__stat-delta">{stat.delta}</span>
              </article>
            ))}
          </section>

          <FooterNav />
        </div>
      </div>
    </article>
  );
};

export const FigmaHomePreviewPage = (): ReactElement => {
  return (
    <section className="figma-home-preview">
      <header className="figma-home-preview__header">
        <div>
          <p className="figma-home-preview__kicker">FitApp / Home</p>
          <h1 className="figma-home-preview__title">Макет главной страницы для разных телефонов</h1>
        </div>
        <p className="figma-home-preview__description">
          Один визуальный сценарий в трёх форматах экрана: компактный Android, стандартный iPhone и большой Max.
        </p>
      </header>

      <div className="figma-home-preview__grid">
        {DEVICE_SPECS.map((device) => (
          <PreviewHomeScreen key={device.id} device={device} />
        ))}
      </div>
    </section>
  );
};
