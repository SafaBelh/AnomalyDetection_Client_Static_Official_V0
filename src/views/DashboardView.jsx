import { useAuth } from "@/store/db";
import { AdminDashboardView } from "@/views/dashboards/AdminDashboardView";
import { TenantDashboardView } from "@/views/dashboards/TenantDashboardView";

export function DashboardView({ onNavigate }) {
  const { tenant, isEngineAdmin } = useAuth();
  if (isEngineAdmin && !tenant) return <AdminDashboardView onNavigate={onNavigate} />;
  return <TenantDashboardView onNavigate={onNavigate} />;
}
