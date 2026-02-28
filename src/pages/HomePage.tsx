import type { ReactElement } from "react";
import { useNavigate } from "react-router-dom";

import { useActiveWorkout } from "../features/workouts/history/queries";
import { getTgUserView } from "../shared/lib/telegram/user";
import { getDisplayName, getInitials } from "../shared/lib/telegram/userLabel";
import { HistoryIcon, StartIcon, TemplatesIcon } from "../shared/ui/icons/HomeActionIcons";
import { ActionTile } from "../widgets/home/ActionTile";
import { HomeSlider } from "../widgets/home/HomeSlider";
import { UserHeader } from "../widgets/home/UserHeader";
import "../widgets/home/home.css";

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

      <div className="home-main">
        <div className="home-main__section">
          <section className="home-actions" aria-label="Основные действия">
            <ActionTile
              icon={<TemplatesIcon className="home-action-tile__icon" />}
              label="Шаблоны"
              onClick={() => navigate("/templates")}
            />
            <ActionTile
              icon={<StartIcon className="home-action-tile__icon" />}
              label={startLabel}
              onClick={handleStart}
            />
            <ActionTile
              icon={<HistoryIcon className="home-action-tile__icon" />}
              label="История"
              onClick={() => navigate("/workouts")}
            />
          </section>
        </div>

        <div className="home-main__section home-main__section--slider">
          <HomeSlider />
        </div>
      </div>
    </section>
  );
};
