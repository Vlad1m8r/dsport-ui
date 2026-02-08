import { createBrowserRouter, Navigate } from "react-router-dom";

import App from "../App";
import { StartWorkoutPage } from "../pages/StartWorkoutPage";
import { TemplatesPage } from "../pages/TemplatesPage";
import { WorkoutPage } from "../pages/WorkoutPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/templates" replace />,
      },
      {
        path: "templates",
        element: <TemplatesPage />,
      },
      {
        path: "start",
        element: <StartWorkoutPage />,
      },
      {
        path: "workouts/:workoutId",
        element: <WorkoutPage />,
      },
    ],
  },
]);
