import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-100">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
