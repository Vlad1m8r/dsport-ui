import { createBrowserRouter } from "react-router-dom";

import App from "../App";
import { AppLayout } from "./layout/AppLayout";
import { HomePage } from "../pages/HomePage";
import { TemplateCreatePage } from "../pages/TemplateCreatePage";
import { TemplateEditPage } from "../pages/TemplateEditPage";
import { StartWorkoutPage } from "../pages/StartWorkoutPage";
import { ExercisePickerPage } from "../pages/ExercisePickerPage";
import { TemplatesPage } from "../pages/TemplatesPage";
import { WorkoutsHistoryPage } from "../pages/WorkoutsHistoryPage";
import { WorkoutPage } from "../pages/WorkoutPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: "templates",
            element: <TemplatesPage />,
          },
          {
            path: "templates/new",
            element: <TemplateCreatePage />,
          },
          {
            path: "templates/:id/edit",
            element: <TemplateEditPage />,
          },
          {
            path: "start",
            element: <StartWorkoutPage />,
          },
          {
            path: "workouts/:workoutId",
            element: <WorkoutPage />,
          },
          {
            path: "pickers/exercises",
            element: <ExercisePickerPage />,
          },
          {
            path: "workouts",
            element: <WorkoutsHistoryPage />,
          },
        ],
      },
    ],
  },
]);
