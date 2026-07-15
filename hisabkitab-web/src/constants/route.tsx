import type { ReactNode } from "react";

import Login from "../pages/auth/LoginPage";
// import Register from "../pages/auth/Register";
import DashboardEnhanced from "../pages/dashboard/DashboardEnhanced";
import DashboardTest from "../pages/dashboard/DashboardTest";
import ExpensePage from "../pages/daily-items/ExpensePage";

export const PATHS = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  EXPENSES: "/expenses",
  TEST: "/test",
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
    path: PATHS.TEST,
    element: <DashboardTest />,
  },
  {
    path: PATHS.DASHBOARD,
    element: <DashboardEnhanced />,
  },
  {
    path: PATHS.EXPENSES,
    element: <ExpensePage />,
  },
];