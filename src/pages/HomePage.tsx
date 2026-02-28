import type { CSSProperties, ReactElement } from "react";
import { useNavigate } from "react-router-dom";

import { useActiveWorkout } from "../features/workouts/history/queries";
import historyIcon from "../shared/assets/icons/history.svg";
import startIcon from "../shared/assets/icons/start.svg";
import templatesIcon from "../shared/assets/icons/templates.svg";
import { getTgUserView } from "../shared/lib/telegram/user";
import { getDisplayName, getInitials } from "../shared/lib/telegram/userLabel";
import { ActionTile } from "../widgets/home/ActionTile";
import { HomeSlider } from "../widgets/home/HomeSlider";
import { UserHeader } from "../widgets/home/UserHeader";
import "../widgets/home/home.css";

const createMaskStyle = (iconUrl: string): CSSProperties => ({
  WebkitMaskImage: `url(${iconUrl})`,
  maskImage: `url(${iconUrl})`,
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  maskPosition: "center",
  WebkitMaskSize: "contain",
  maskSize: "contain",
  backgroundColor: "currentcolor",
});

export const HomePage = (): ReactElement => {
  const navigate = useNavigate();
  const user = getTgUserView();
  const { data: activeWorkoutId } = useActiveWorkout();

  const hasActiveWorkout = typeof activeWorkoutId === "number";
  const startLabel = hasActiveWorkout ? "Продолжить" : "Начать тренировку";

  const handleStart = (): void => {
    if (hasActiveWorkout) {
      navigate(`/workouts/${activeWorkoutId}`);
      return;
    }

    navigate("/start");
  };

  return (
    <section className="home-page">
      <UserHeader
        displayName={getDisplayName(user)}
        initials={getInitials(user)}
        photoUrl={user.photoUrl}
      />

      <section className="home-actions" aria-label="Основные действия">
        <ActionTile
          icon={<span className="home-action-tile__icon" style={createMaskStyle(templatesIcon)} />}
          label="Шаблоны"
          onClick={() => navigate("/templates")}
        />
        <ActionTile
          icon={<span className="home-action-tile__icon" style={createMaskStyle(startIcon)} />}
          label={startLabel}
          onClick={handleStart}
        />
        <ActionTile
          icon={<span className="home-action-tile__icon" style={createMaskStyle(historyIcon)} />}
          label="История"
          onClick={() => navigate("/workouts")}
        />
      </section>

      <HomeSlider />
    </section>
  );
};
