import { BrowserRouter, Routes, Route, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import React from "react";
import { AppProvider } from "./context/AppContext";
import Navbar from "./components/Navbar";
import AuthPage from "./pages/AuthPage";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import ReportIssue from "./pages/ReportIssue";
import MapView from "./pages/MapView";
import Kanban from "./pages/Kanban";
import Rewards from "./pages/Rewards";
import Profile from "./pages/Profile";
import AdminPortal from "./pages/AdminPortal";
import EmployeePortal from "./pages/EmployeePortal";

// ─── Error Boundary ────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", padding: "2rem",
          background: "#0A0F1E", color: "#fff", fontFamily: "monospace",
        }}>
          <div style={{
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 14, padding: "24px 32px", maxWidth: 700, width: "100%",
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#ff6b6b", marginBottom: 12 }}>
              ⚠ Runtime Error
            </div>
            <div style={{ fontSize: 13, color: "#fca5a5", marginBottom: 16, lineHeight: 1.6 }}>
              {this.state.error?.message}
            </div>
            <pre style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", overflow: "auto", maxHeight: 300 }}>
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = "/"; }}
              style={{
                marginTop: 16, padding: "8px 20px", borderRadius: 8, cursor: "pointer",
                background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)",
                color: "#60a5fa", fontSize: 13, fontWeight: 600,
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

function AppRoutes() {
  const location = useLocation();
  const noNavRoutes = ["/", "/landing"];
  const showNav = !noNavRoutes.includes(location.pathname);

  return (
    <>
      {showNav && <Navbar />}
      <Routes location={location}>
        <Route path="/" element={<AuthPage />} />
        <Route path="/landing" element={<PageWrapper><Landing /></PageWrapper>} />
        <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/report" element={<PageWrapper><ReportIssue /></PageWrapper>} />
        <Route path="/map" element={<PageWrapper><MapView /></PageWrapper>} />
        <Route path="/kanban" element={<PageWrapper><Kanban /></PageWrapper>} />
        <Route path="/admin" element={<PageWrapper><AdminPortal /></PageWrapper>} />
        <Route path="/employee" element={<PageWrapper><EmployeePortal /></PageWrapper>} />
        <Route path="/rewards" element={<PageWrapper><Rewards /></PageWrapper>} />
        <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div className="min-h-screen bg-[#050816]">
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}