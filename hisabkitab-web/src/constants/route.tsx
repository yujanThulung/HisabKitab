import type { ReactNode } from "react";

import Login from "../pages/auth/LoginPage";
// import Register from "../pages/auth/Register";
import Dashboard from "../pages/dashboard/Dashboard";

export const PATHS = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
} as const;

export interface AppRoute {
  path: string;
  element: ReactNode;
}

export const publicRoutes: AppRoute[] = [
  {
    path: PATHS.LOGIN,
    element: <Login />,
  },
  // {
  //   path: PATHS.REGISTER,
  //   element: <Register />,
  // },
];

export const protectedRoutes: AppRoute[] = [
  {
    path: PATHS.DASHBOARD,
    element: <Dashboard />,
  },
];