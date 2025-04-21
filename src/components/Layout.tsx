
import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, loading } = useAuth();

  // If not authenticated and not loading, redirect to auth page
  if (!user && !loading) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex h-screen bg-wedding-cream">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
