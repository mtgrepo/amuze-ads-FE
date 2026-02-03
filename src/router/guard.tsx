import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { ReactNode } from "react";
import type { RootState } from "../redux/store/store";

type Props = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: Props) {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export function PublicRoute({ children }: Props) {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
