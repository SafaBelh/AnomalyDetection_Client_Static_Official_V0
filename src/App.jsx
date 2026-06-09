import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, useLocation } from "react-router-dom";
import { ToastProvider } from "@/contexts/ToastContext";
import { CmdPaletteProvider } from "@/contexts/CmdPaletteContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { STYLE } from "@/constants/styles";
import { db, storeLogout, useAuth as useDbAuth } from "@/store/db";
import { loadStorage } from "@/utils/storage";
import { wsAPI, wsStore } from "@/store/wsAPI";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { LoginScreen } from "@/views/LoginScreen";
import { DashboardView } from "@/views/DashboardView";
import { PipelinesView } from "@/views/PipelinesView";
import { ExplorerView } from "@/views/ExplorerView";
import { AnomaliesView } from "@/views/AnomaliesView";
import { AlertsView } from "@/views/AlertsView";
import { IntegrationsView } from "@/views/IntegrationsView";
import { TenantsView } from "@/views/TenantsView";
import { SettingsView } from "@/views/SettingsView";
import { SeriesView } from "@/views/SeriesView";
import { PipelineWorkspaceView } from "@/views/PipelinesView/PipelineWorkspaceView";
import { BudgetView } from "@/views/BudgetView";

const PAGES = ["dashboard","pipelines","explorer","anomalies","alerts","series","integrations","tenants","settings","budget"];

function AppShell() {
  const { user, isEngineAdmin, logout } = useAuth();
  const dbAuth = useDbAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const seg = location.pathname.split("/")[1] || "dashboard";
  const activePage = PAGES.includes(seg) ? seg : "dashboard";
  const goto = (page) => navigate("/" + page);
  const handleLogout = () => { logout(); storeLogout(); navigate("/login"); };

  useEffect(() => { if (!user) navigate("/login"); }, [user, navigate]);
  if (!user) return null;

  return (
    <CmdPaletteProvider onNavigate={goto}>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <Sidebar activePage={activePage} onNavigate={goto} onLogout={handleLogout} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Topbar activePage={activePage} onNavigate={goto} />
          <main style={{ flex: 1, overflowY: "auto" }}>
            <Routes>
              <Route path="/dashboard" element={<DashboardView onNavigate={goto} />} />
              <Route path="/pipelines" element={<PipelinesView
                onNavigateToPipeline={(id, step = "mapping", options = {}) => navigate(`/pipelines/${id}/${step}${options.mode ? `?mode=${options.mode}` : ""}`)}
                onOpenSeriesConfig={(id) => navigate(`/pipelines/${id}/seriesConfig`)} />} />
              <Route path="/explorer" element={<ExplorerView />} />
              <Route path="/anomalies" element={<AnomaliesView />} />
              <Route path="/alerts" element={<AlertsView />} />
              <Route path="/series" element={<SeriesView />} />
              <Route path="/integrations" element={<IntegrationsView />} />
              <Route path="/tenants" element={isEngineAdmin ? <TenantsView onNavigateToPipeline={(id) => navigate(`/pipelines/${id}/mapping`)} /> : <Navigate to="/dashboard" replace />} />
              <Route path="/budget" element={<BudgetView />} />
              <Route path="/settings" element={<SettingsView />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </CmdPaletteProvider>
  );
}

function WorkspaceRoute() {
  const { id, step } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const workspaceMode = new URLSearchParams(location.search).get("mode") || "setup";
  const workspaceCacheKey = `anomalyiq.workspace.${id}`;
  const cachedWorkspace = (() => {
    try { return JSON.parse(localStorage.getItem(workspaceCacheKey) || "null"); } catch { return null; }
  })();
  const [wsUploadData, setWsUploadData] = useState(null);
  const [wsMappingResult, setWsMappingResult] = useState(cachedWorkspace?.mappingResult ?? null);
  const [wsSeriesResult, setWsSeriesResult] = useState(cachedWorkspace?.seriesResult ?? null);
  const [wsFinalResult, setWsFinalResult] = useState(cachedWorkspace?.finalResult ?? null);
  const wsPage = step || "mapping";
  const setWsPage = (p) => navigate(`/pipelines/${id}/${p}`);
  useEffect(() => {
    try {
      localStorage.setItem(workspaceCacheKey, JSON.stringify({
        mappingResult: wsMappingResult,
        seriesResult: wsSeriesResult,
        finalResult: wsFinalResult,
        updatedAt: new Date().toISOString(),
      }));
    } catch {}
  }, [workspaceCacheKey, wsMappingResult, wsSeriesResult, wsFinalResult]);
  const resetWsState = async () => {
    wsStore.activePipelineId = id;
    await wsAPI.resetDatabase();
    try { localStorage.removeItem(workspaceCacheKey); } catch {}
    setWsUploadData(null); setWsMappingResult(null);
    setWsSeriesResult(null); setWsFinalResult(null);
    navigate(`/pipelines/${id}/mapping`);
  };
  return (
    <CmdPaletteProvider onNavigate={(p) => navigate("/" + p)}>
      <div style={{ minHeight: "100vh" }}>
        <PipelineWorkspaceView
          pipelineId={id}
          workspaceMode={workspaceMode}
          wsPage={wsPage} setWsPage={setWsPage}
          wsUploadData={wsUploadData} setWsUploadData={setWsUploadData}
          wsMappingResult={wsMappingResult} setWsMappingResult={setWsMappingResult}
          wsSeriesResult={wsSeriesResult} setWsSeriesResult={setWsSeriesResult}
          wsFinalResult={wsFinalResult} setWsFinalResult={setWsFinalResult}
          resetWsState={resetWsState}
          onBack={() => navigate("/pipelines")}
          inModal={false}
        />
      </div>
    </CmdPaletteProvider>
  );
}

function LoginRoute() {
  const navigate = useNavigate();
  return <LoginScreen onLogin={() => navigate("/dashboard")} />;
}

function EmbedRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginSSO } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const connector = params.get("connector") || "Ask&Go";
    if (!token) {
      setError("Token manquant.");
      return;
    }
    loginSSO(token, connector)
      .then(() => navigate("/dashboard", { replace: true }))
      .catch((err) => setError(err.body?.message || err.message || "Erreur SSO"));
  }, [location, navigate, loginSSO]);

  if (error) {
    return <div style={{ padding: 40, color: "red" }}>Erreur SSO: {error}</div>;
  }
  return <div style={{ padding: 40 }}>Authentification SSO en cours...</div>;
}

export default function App() {
  useEffect(() => {
    const p = loadStorage();
    if (p) {
      db.activeTenantId = p.activeTenantId ?? null;
      db.activePartnerId = p.activePartnerId ?? null;
      db.isSSO = p.isSSO ?? false;
    }
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <style>{STYLE}</style>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/embed" element={<EmbedRoute />} />
            <Route path="/pipelines/:id/:step" element={<WorkspaceRoute />} />
            <Route path="/pipelines/:id" element={<Navigate to="mapping" replace />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<AppShell />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
