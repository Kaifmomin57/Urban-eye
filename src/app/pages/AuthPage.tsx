import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { useApp } from "../context/AppContext";
import DemoOne from "@/components/ui/demo";

type Tab = "login" | "signup";
type Role = "citizen" | "ward" | "official";

// ── Theme Toggle for Auth page ────────────────────────────────────────────────
function AuthThemeToggle() {
  const { theme, toggleTheme } = useApp();
  const isBlueSteel = theme === "blue-steel";
  return (
    <button
      onClick={toggleTheme}
      title={isBlueSteel ? "Switch to Default Theme" : "Switch to Blue Steel Theme"}
      style={{
        position: "fixed", top: 14, right: 16, zIndex: 100,
        display: "flex", alignItems: "center", gap: 7,
        padding: "7px 13px", borderRadius: 99,
        background: isBlueSteel ? "rgba(255,255,255,0.80)" : "rgba(5,8,22,0.85)",
        border: `1px solid ${isBlueSteel ? "rgba(56,73,89,0.20)" : "rgba(255,255,255,0.1)"}`,
        color: isBlueSteel ? "#384959" : "#94a3b8",
        fontSize: 12, fontWeight: 500, fontFamily: "'Inter',sans-serif",
        cursor: "pointer", backdropFilter: "blur(10px)",
        transition: "all 0.25s ease",
        boxShadow: isBlueSteel ? "0 2px 12px rgba(56,73,89,0.15)" : "none",
      }}
    >
      <span style={{ fontSize: 15 }}>{isBlueSteel ? "☀️" : "🌊"}</span>
      <span style={{ letterSpacing: "0.3px" }}>
        {isBlueSteel ? "Default" : "Blue Steel"}
      </span>
    </button>
  );
}

// ── City Grid SVG ─────────────────────────────────────────────────────────────
function CityGridSVG() {
  return (
    <svg viewBox="0 0 300 600" xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%" }}>
      <defs>
        <pattern id="cg" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3B82F6" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="300" height="600" fill="url(#cg)" />
      <rect x="20"  y="80"  width="50" height="140" rx="2" fill="#1E6BE6" opacity="0.3" />
      <rect x="80"  y="120" width="35" height="100" rx="2" fill="#1E6BE6" opacity="0.2" />
      <rect x="125" y="60"  width="60" height="160" rx="2" fill="#1E6BE6" opacity="0.35" />
      <rect x="195" y="100" width="40" height="120" rx="2" fill="#1E6BE6" opacity="0.2" />
      <rect x="245" y="140" width="45" height="80"  rx="2" fill="#1E6BE6" opacity="0.15" />
      <circle cx="45"  cy="75" r="4" fill="#60A5FA" opacity="0.8" />
      <circle cx="155" cy="55" r="4" fill="#60A5FA" opacity="0.8" />
      <circle cx="215" cy="95" r="3" fill="#34D399" opacity="0.7" />
      <line x1="45"  y1="75" x2="155" y2="55"  stroke="#3B82F6" strokeWidth="0.5" opacity="0.4" />
      <line x1="155" y1="55" x2="215" y2="95"  stroke="#3B82F6" strokeWidth="0.5" opacity="0.4" />
      <line x1="45"  y1="75" x2="215" y2="95"  stroke="#3B82F6" strokeWidth="0.5" opacity="0.2" />
      <rect x="0"  y="340" width="300" height="30" fill="#1E3A6E" opacity="0.4" />
      <rect x="0"  y="380" width="300" height="20" fill="#1E3A6E" opacity="0.3" />
      <rect x="30"  y="350" width="20" height="50" rx="1" fill="#2563EB" opacity="0.3" />
      <rect x="70"  y="360" width="25" height="40" rx="1" fill="#2563EB" opacity="0.25" />
      <rect x="110" y="345" width="30" height="55" rx="1" fill="#2563EB" opacity="0.3" />
      <rect x="155" y="355" width="20" height="45" rx="1" fill="#2563EB" opacity="0.25" />
      <rect x="185" y="350" width="35" height="50" rx="1" fill="#2563EB" opacity="0.3" />
      <rect x="230" y="360" width="25" height="40" rx="1" fill="#2563EB" opacity="0.2" />
    </svg>
  );
}

function PasswordStrengthBar({ password }: { password: string }) {
  let score = 0;
  if (password.length >= 8) score += 33;
  if (/[A-Z]/.test(password)) score += 33;
  if (/[0-9!@#$]/.test(password)) score += 34;
  const color = score < 40 ? "#E24B4A" : score < 80 ? "#EF9F27" : "#1D9E75";
  return (
    <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", marginTop: 6, overflow: "hidden" }}>
      <div style={{ height: "100%", borderRadius: 2, background: color, width: `${score}%`, transition: "width 0.3s, background 0.3s" }} />
    </div>
  );
}

function FieldInput({ icon, type = "text", placeholder, value, onChange }: {
  icon: string; type?: string; placeholder: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <span style={{ position: "absolute", left: 12, fontSize: 16, color: "rgba(255,255,255,0.3)", pointerEvents: "none", zIndex: 1, display: "flex", alignItems: "center" }}>
        <i className={`ti ${icon}`} aria-hidden="true" />
      </span>
      <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#fff", fontSize: 14, fontFamily: "'Inter',sans-serif", padding: "11px 12px 11px 38px", outline: "none" }}
        onFocus={e => { e.target.style.borderColor = "rgba(30,107,230,0.6)"; e.target.style.background = "rgba(30,107,230,0.05)"; }}
        onBlur={e  => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.05)"; }}
      />
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.5)", letterSpacing: "0.5px", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

// GitHub SVG icon
function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

// ── Social buttons ────────────────────────────────────────────────────────────
function SocialButtons({ onGoogle, onGithub, disabled, padding = 9 }: {
  onGoogle: () => void; onGithub: () => void; disabled: boolean; padding?: number;
}) {
  const base: React.CSSProperties = {
    flex: 1, padding, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 9, color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "'Inter',sans-serif",
    cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center",
    justifyContent: "center", gap: 7, transition: "all 0.15s",
  };
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={onGoogle} disabled={disabled} style={base}
        onMouseEnter={e => { if (!disabled) { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.09)"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; } }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)"; }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google
      </button>
      <button onClick={onGithub} disabled={disabled} style={base}
        onMouseEnter={e => { if (!disabled) { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.09)"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; } }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)"; }}>
        <GitHubIcon /> GitHub
      </button>
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "1.25rem 0" }}>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div style={{ background: "rgba(226,75,74,0.12)", border: "1px solid rgba(226,75,74,0.4)", borderRadius: 8, padding: "10px 12px", marginBottom: "1rem", fontSize: 12.5, color: "#FF8A89", display: "flex", alignItems: "center", gap: 8 }}>
      <i className="ti ti-alert-circle" aria-hidden="true" style={{ fontSize: 15, flexShrink: 0 }} />
      {msg}
    </div>
  );
}

// ── Marquee Button with 3D animation background ──────────────────────────────
function MarqueeButton({
  onClick, disabled, submitting, icon, label, bg = "#1E6BE6"
}: {
  onClick: () => void;
  disabled?: boolean;
  submitting?: boolean;
  icon: string;
  label: string;
  bg?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || submitting}
      style={{
        width: "100%",
        marginTop: "1.25rem",
        padding: 13,
        position: "relative",
        overflow: "hidden",
        background: bg.includes("gradient")
          ? bg.replace(/rgba?\([^)]+\)/g, (m) => m.replace(/,[\s]*[\d.]+\)/, ", 0.25)"))
          : "rgba(30, 107, 230, 0.18)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: 10,
        color: "#fff",
        fontSize: 14,
        fontWeight: 600,
        fontFamily: "'Inter',sans-serif",
        cursor: disabled || submitting ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        opacity: disabled || submitting ? 0.6 : 1,
        boxShadow: "0 4px 24px rgba(30,107,230,0.25), inset 0 1px 0 rgba(255,255,255,0.12)",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={e => { if (!disabled && !submitting) { (e.currentTarget as HTMLButtonElement).style.background = bg.includes("gradient") ? "rgba(30,107,230,0.32)" : "rgba(30,107,230,0.28)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 30px rgba(30,107,230,0.4), inset 0 1px 0 rgba(255,255,255,0.2)"; } }}
      onMouseLeave={e => { if (!disabled && !submitting) { (e.currentTarget as HTMLButtonElement).style.background = bg.includes("gradient") ? "rgba(30,107,230,0.18)" : "rgba(30,107,230,0.18)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 24px rgba(30,107,230,0.25), inset 0 1px 0 rgba(255,255,255,0.12)"; } }}
    >
      <div style={{ position: "absolute", inset: 0, opacity: 0.3, pointerEvents: "none", zIndex: 0 }}>
        <DemoOne />
      </div>
      {/* Glass sheen highlight */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)", borderRadius: "10px 10px 0 0", zIndex: 1, pointerEvents: "none" }} />
      <span style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 8, textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>
        <i className={`ti ${submitting ? "ti-loader-2" : icon}`} aria-hidden="true" style={submitting ? { animation: "spin 1s linear infinite" } : {}} />
        {submitting ? "Processing…" : label}
      </span>
    </button>
  );
}

// ── LOGIN FORM ────────────────────────────────────────────────────────────────
function LoginForm({ onSwitch, onLogin, onGoogle, onGithub, email, setEmail, password, setPassword, error, submitting }: {
  onSwitch: () => void; onLogin: () => void; onGoogle: () => void; onGithub: () => void;
  email: string; setEmail: (v: string) => void; password: string; setPassword: (v: string) => void;
  error: string; submitting: boolean;
}) {
  const [remember, setRemember] = useState(false);
  return (
    <>
      <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>Welcome back</h2>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 1.75rem", lineHeight: 1.5 }}>Sign in to your Urban Eye account</p>
      <div style={{ background: "rgba(30,107,230,0.12)", border: "1px solid rgba(30,107,230,0.3)", borderRadius: 8, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, marginBottom: "1.25rem", fontSize: 12.5, color: "#6AABFF", lineHeight: 1.5 }}>
        <i className="ti ti-info-circle" aria-hidden="true" style={{ fontSize: 16, flexShrink: 0 }} />
        Use your registered email or a social account to sign in.
      </div>
      {error && <ErrorBox msg={error} />}
      <FieldGroup label="Email"><FieldInput icon="ti-at" placeholder="you@city.gov" value={email} onChange={setEmail} /></FieldGroup>
      <FieldGroup label="Password"><FieldInput icon="ti-lock" type="password" placeholder="••••••••" value={password} onChange={setPassword} /></FieldGroup>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0.25rem 0 0.5rem" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}>
          <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ accentColor: "#1E6BE6", width: 14, height: 14 }} />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Keep me signed in</span>
        </label>
        <a href="#" style={{ fontSize: 12, color: "#6AABFF", textDecoration: "none" }}>Forgot password?</a>
      </div>
      <MarqueeButton
        onClick={onLogin}
        disabled={submitting}
        submitting={submitting}
        icon="ti-login"
        label="Sign in to dashboard"
      />
      <Divider label="or continue with" />
      <SocialButtons onGoogle={onGoogle} onGithub={onGithub} disabled={submitting} />
      <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
        New to Urban Eye?{" "}
        <button onClick={onSwitch} style={{ background: "none", border: "none", color: "#6AABFF", fontSize: 13, fontWeight: 500, cursor: "pointer", padding: 0, fontFamily: "'Inter',sans-serif" }}>Create account</button>
      </p>
    </>
  );
}

// ── SIGNUP FORM ───────────────────────────────────────────────────────────────
function SignupForm({ onSwitch, onSignup, email, setEmail, password, setPassword, error, submitting }: {
  onSwitch: () => void; onSignup: (name: string) => void;
  email: string; setEmail: (v: string) => void; password: string; setPassword: (v: string) => void;
  error: string; submitting: boolean;
}) {
  const [name, setName] = useState("");

  return (
    <>
      <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>Join Urban Eye</h2>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 1.75rem", lineHeight: 1.5 }}>Become a civic changemaker in your ward</p>
      {error && <ErrorBox msg={error} />}
      <FieldGroup label="Full Name"><FieldInput icon="ti-user" placeholder="Arun Sharma" value={name} onChange={setName} /></FieldGroup>
      <FieldGroup label="Email"><FieldInput icon="ti-mail" type="email" placeholder="you@example.com" value={email} onChange={setEmail} /></FieldGroup>
      <FieldGroup label="Password">
        <FieldInput icon="ti-lock" type="password" placeholder="Min. 8 characters" value={password} onChange={setPassword} />
        <PasswordStrengthBar password={password} />
      </FieldGroup>
      
      <MarqueeButton
        onClick={() => onSignup(name)}
        disabled={submitting}
        submitting={submitting}
        icon="ti-user-plus"
        label="Create account"
      />
      
      <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
        Already a member?{" "}
        <button onClick={onSwitch} style={{ background: "none", border: "none", color: "#6AABFF", fontSize: 13, fontWeight: 500, cursor: "pointer", padding: 0, fontFamily: "'Inter',sans-serif" }}>Sign in</button>
      </p>
    </>
  );
}

// ── CITY ADMIN & EMPLOYEE LOGIN FORM ───────────────────────────────────────
function AdminLoginForm({ onAdminLogin, onEmployeeLogin, submitting, error }: {
  onAdminLogin: (adminId: string, pass: string) => void;
  onEmployeeLogin: (employeeId: string, empName: string, pass: string) => void;
  submitting: boolean;
  error: string;
}) {
  const [mode, setMode] = useState<"admin" | "employee">("admin");
  const [adminId, setAdminId] = useState("aryan8291");
  const [adminPassword, setAdminPassword] = useState("aryan@8291");

  const [employeeId, setEmployeeId] = useState("emp101");
  const [employeeName, setEmployeeName] = useState("Inspector Rajesh Shinde");
  const [employeePassword, setEmployeePassword] = useState("emp@123");

  return (
    <>
      <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.05)", padding: 3, borderRadius: 10, marginBottom: "1.25rem" }}>
        <button
          type="button"
          onClick={() => setMode("admin")}
          style={{
            flex: 1, padding: "7px 0", fontSize: 11.5, fontWeight: 600, border: "none",
            borderRadius: 7, cursor: "pointer", transition: "all 0.2s",
            background: mode === "admin" ? "linear-gradient(135deg, #1E6BE6, #8B5CF6)" : "transparent",
            color: mode === "admin" ? "#fff" : "rgba(255,255,255,0.4)"
          }}
        >
          🛡️ City Admin
        </button>
        <button
          type="button"
          onClick={() => setMode("employee")}
          style={{
            flex: 1, padding: "7px 0", fontSize: 11.5, fontWeight: 600, border: "none",
            borderRadius: 7, cursor: "pointer", transition: "all 0.2s",
            background: mode === "employee" ? "linear-gradient(135deg, #10B981, #3B82F6)" : "transparent",
            color: mode === "employee" ? "#fff" : "rgba(255,255,255,0.4)"
          }}
        >
          👷 Field Employee
        </button>
      </div>

      {mode === "admin" ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#8B5CF6" }} />
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 19, fontWeight: 700, color: "#fff", margin: 0 }}>City Admin Portal</h2>
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "0 0 1.25rem", lineHeight: 1.5 }}>
            Restricted portal for City Command & Municipal Dispatchers
          </p>

          {error && <ErrorBox msg={error} />}

          <FieldGroup label="Admin ID">
            <FieldInput icon="ti-id-badge" placeholder="aryan8291" value={adminId} onChange={setAdminId} />
          </FieldGroup>

          <FieldGroup label="Password">
            <FieldInput icon="ti-lock" type="password" placeholder="aryan@8291" value={adminPassword} onChange={setAdminPassword} />
          </FieldGroup>

          <MarqueeButton
            onClick={() => onAdminLogin(adminId, adminPassword)}
            disabled={submitting}
            submitting={submitting}
            icon="ti-shield-check"
            label="Sign In to Admin Portal"
            bg="linear-gradient(135deg, #1E6BE6, #8B5CF6)"
          />
        </>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 19, fontWeight: 700, color: "#fff", margin: 0 }}>Field Employee Portal</h2>
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "0 0 1.25rem", lineHeight: 1.5 }}>
            For assigned response squad officers & field inspectors
          </p>

          {error && <ErrorBox msg={error} />}

          <FieldGroup label="Employee ID">
            <FieldInput icon="ti-id" placeholder="emp101" value={employeeId} onChange={setEmployeeId} />
          </FieldGroup>

          <FieldGroup label="Officer / Staff Name">
            <FieldInput icon="ti-user" placeholder="Inspector Rajesh Shinde" value={employeeName} onChange={setEmployeeName} />
          </FieldGroup>

          <FieldGroup label="Password">
            <FieldInput icon="ti-lock" type="password" placeholder="emp@123" value={employeePassword} onChange={setEmployeePassword} />
          </FieldGroup>

          <MarqueeButton
            onClick={() => onEmployeeLogin(employeeId, employeeName, employeePassword)}
            disabled={submitting}
            submitting={submitting}
            icon="ti-user-check"
            label="Sign In to Staff Portal"
            bg="linear-gradient(135deg, #059669, #2563EB)"
          />
        </>
      )}

      <div style={{ marginTop: "1.25rem", padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.5, textAlign: "center" }}>
        🔒 Authorized Access · Live broadcasts & GPS resolution proofs enabled for field employees.
      </div>
    </>
  );
}

export default function AuthPage() {
  const [tab, setTab]             = useState<Tab>("login");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [error, setError]         = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { loginWithGoogle, loginWithGithub, user, loading, theme, updateProfile, setSelectedCity, loginAsAdmin, loginAsEmployee } = useApp();

  useEffect(() => {
    if (!loading && user) {
      if ((user as any).role === "official" || (user as any).role === "ward") {
        navigate("/admin");
      } else if ((user as any).role === "field_employee") {
        navigate("/employee");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, loading, navigate]);
  useEffect(() => { setError(""); }, [tab, email, password]);

  const handleAdminLogin = async (adminIdInput: string, passInput: string) => {
    if (!adminIdInput || !passInput) {
      setError("Please enter your Admin ID and password.");
      return;
    }

    if (adminIdInput.trim() !== "aryan8291" || passInput !== "aryan@8291") {
      setError("Invalid Admin credentials. (Admin ID: aryan8291, Password: aryan@8291)");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await loginAsAdmin(adminIdInput.trim());
      navigate("/admin");
    } catch {
      setError("Admin login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmployeeLogin = async (empIdInput: string, nameInput: string, passInput: string) => {
    if (!empIdInput || !passInput) {
      setError("Please enter your Employee ID and password.");
      return;
    }

    if (passInput !== "emp@123") {
      setError("Invalid Employee password. (Default Password: emp@123)");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await loginAsEmployee(empIdInput.trim(), nameInput.trim() || "Field Officer");
      navigate("/employee");
    } catch {
      setError("Employee sign in failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setSubmitting(true); setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      if (["auth/user-not-found","auth/wrong-password","auth/invalid-credential"].includes(code)) setError("Incorrect email or password. Please try again.");
      else if (code === "auth/invalid-email")         setError("That doesn't look like a valid email address.");
      else if (code === "auth/too-many-requests")     setError("Too many attempts. Please wait a moment and try again.");
      else if (code === "auth/operation-not-allowed") setError("Email sign-in is not enabled. Please contact support.");
      else                                            setError("Sign-in failed. Please try again.");
      setSubmitting(false);
    }
  };

  const handleSignup = async (name: string) => {
    if (!name || !email || !password) { setError("Please fill in your name, email, and password."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setSubmitting(true); setError("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile({ name: name.trim() });
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      if (code === "auth/email-already-in-use")  setError("An account with this email already exists. Try signing in.");
      else if (code === "auth/invalid-email")    setError("That doesn't look like a valid email address.");
      else if (code === "auth/weak-password")    setError("Password too weak — use at least 8 characters.");
      else if (code === "auth/operation-not-allowed") setError("Email registration is not enabled. Please contact support.");
      else                                       setError("Registration failed. Please try again.");
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setSubmitting(true); setError("");
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      if (code !== "auth/popup-closed-by-user") setError("Google sign-in failed. Please try again.");
      setSubmitting(false);
    }
  };

  const handleGithub = async () => {
    setSubmitting(true); setError("");
    try {
      await loginWithGithub();
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      if (code === "auth/account-exists-with-different-credential")
        setError("An account already exists with this email. Try signing in with Google or email instead.");
      else if (code !== "auth/popup-closed-by-user")
        setError("GitHub sign-in failed. Please try again.");
      setSubmitting(false);
    }
  };

  const isBlueSteel = theme === "blue-steel";

  const pageBg = isBlueSteel ? "#BDDDFC" : "#0A0F1E";
  const leftBg = isBlueSteel
    ? "linear-gradient(160deg, #88BDF2 0%, #BDDDFC 60%, #a8d4f8 100%)"
    : "linear-gradient(160deg, #0D1B3E 0%, #0A0F1E 60%, #061A2E 100%)";

  if (loading || submitting) {
    return (
      <div style={{ minHeight: "100vh", background: pageBg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ width: 36, height: 36, border: "3px solid rgba(30,107,230,0.3)", borderTopColor: "#1E6BE6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "'Inter',sans-serif" }}>{submitting ? "Signing you in…" : "Loading…"}</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: pageBg, display: "flex", fontFamily: "'Inter',sans-serif", position: "relative", overflow: "hidden", transition: "background 0.35s ease" }}>
      <AuthThemeToggle />

      <div style={{ width: "42%", minWidth: 300, position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "2rem", background: leftBg, borderRight: `1px solid ${isBlueSteel ? "rgba(56,73,89,0.18)" : "rgba(255,255,255,0.06)"}`, overflow: "hidden", transition: "background 0.35s ease" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.18 }}><CityGridSVG /></div>

        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "#1E6BE6", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 14, height: 14, background: "#fff", borderRadius: "50%", boxShadow: "0 0 0 3px rgba(255,255,255,0.25)" }} />
            </div>
            <div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 700, color: isBlueSteel ? "#384959" : "#fff", letterSpacing: "-0.3px" }}>Urban Eye</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "1.5px", textTransform: "uppercase" }}>Smart City Platform</div>
            </div>
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 2, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "2rem 0" }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: isBlueSteel ? "#384959" : "#1E6BE6", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "0.75rem" }}>Citizen & City Governance</div>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: 1.25, letterSpacing: "-0.5px", marginBottom: "1rem" }}>
            Your city.<br /><span style={{ color: isBlueSteel ? "#384959" : "#1E6BE6" }}>Your voice.</span><br />Your data.
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 240 }}>
            Report civic issues, track real-time progress, and shape your neighbourhood's future — together.
          </p>
        </div>

        <div style={{ position: "relative", zIndex: 2, display: "flex", gap: "1.5rem" }}>
          {[{ num: "12K+", label: "Issues resolved" }, { num: "98", label: "Wards active" }, { num: "4.8★", label: "Citizen rating" }].map(({ num, label }) => (
            <div key={label}>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 700, color: isBlueSteel ? "#384959" : "#fff" }}>{num}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2, letterSpacing: "0.5px" }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ position: "absolute", bottom: "2rem", right: "-2rem", width: 140, height: 140, borderRadius: "50%", border: `1px solid ${isBlueSteel ? "rgba(56,73,89,0.25)" : "rgba(30,107,230,0.2)"}`, animation: "authPulse 3s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "2.5rem", right: "-1.5rem", width: 90, height: 90, borderRadius: "50%", border: `1px solid ${isBlueSteel ? "rgba(56,73,89,0.35)" : "rgba(30,107,230,0.35)"}`, animation: "authPulse 3s ease-in-out infinite 1s" }} />
        <div style={{ position: "absolute", bottom: "4.5rem", right: "0.5rem", width: 10, height: 10, background: isBlueSteel ? "#384959" : "#1E6BE6", borderRadius: "50%" }} />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "2.5rem 2rem", background: pageBg, overflow: "hidden", position: "relative", transition: "background 0.35s ease" }}>
        {/* 3D Testimonials Marquee — subtle background */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.2, zIndex: 0 }}>
          <DemoOne />
        </div>

        {/* Frosted glass backdrop for form readability */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "linear-gradient(160deg, rgba(5,8,22,0.65) 0%, rgba(10,15,40,0.75) 100%)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
        }} />

        <div style={{ width: "100%", maxWidth: 360, position: "relative", zIndex: 2,
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 18,
          padding: "2rem 1.75rem",
          boxShadow: "0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)"
        }}>
          <div style={{ display: "flex", background: isBlueSteel ? "rgba(56,73,89,0.10)" : "rgba(255,255,255,0.05)", borderRadius: 10, padding: 4, marginBottom: "2rem", border: isBlueSteel ? "1px solid rgba(56,73,89,0.18)" : "1px solid rgba(255,255,255,0.06)" }}>
            <button onClick={() => setTab("login")}
              style={{ flex: 1, padding: "8px 0", fontSize: 12, fontWeight: 500, border: "none", background: tab === "login" ? (isBlueSteel ? "#384959" : "#1E6BE6") : "none", color: tab === "login" ? (isBlueSteel ? "#BDDDFC" : "#fff") : "rgba(255,255,255,0.4)", borderRadius: 7, cursor: "pointer", transition: "all 0.2s", fontFamily: "'Inter',sans-serif" }}>
              Sign in
            </button>
            <button onClick={() => setTab("signup")}
              style={{ flex: 1, padding: "8px 0", fontSize: 12, fontWeight: 500, border: "none", background: tab === "signup" ? (isBlueSteel ? "#384959" : "#1E6BE6") : "none", color: tab === "signup" ? (isBlueSteel ? "#BDDDFC" : "#fff") : "rgba(255,255,255,0.4)", borderRadius: 7, cursor: "pointer", transition: "all 0.2s", fontFamily: "'Inter',sans-serif" }}>
              Register
            </button>
            <button onClick={() => setTab("admin")}
              style={{ flex: 1, padding: "8px 0", fontSize: 12, fontWeight: 600, border: "none", background: tab === "admin" ? "linear-gradient(135deg, #1E6BE6, #8B5CF6)" : "none", color: tab === "admin" ? "#fff" : "#94a3b8", borderRadius: 7, cursor: "pointer", transition: "all 0.2s", fontFamily: "'Inter',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <span>🛡️</span> Admin
            </button>
          </div>

          {tab === "login" ? (
            <LoginForm onSwitch={() => setTab("signup")} onLogin={handleLogin}
              onGoogle={handleGoogle} onGithub={handleGithub}
              email={email} setEmail={setEmail} password={password} setPassword={setPassword}
              error={error} submitting={submitting} />
          ) : tab === "signup" ? (
            <SignupForm onSwitch={() => setTab("login")} onSignup={handleSignup}
              email={email} setEmail={setEmail} password={password} setPassword={setPassword}
              error={error} submitting={submitting} />
          ) : (
            <AdminLoginForm onAdminLogin={handleAdminLogin} onEmployeeLogin={handleEmployeeLogin} submitting={submitting} error={error} />
          )}
        </div>
      </div>

      <style>{`
        @keyframes authPulse { 0%,100% { transform:scale(1); opacity:1; } 50% { transform:scale(1.05); opacity:0.5; } }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        input::placeholder { color:rgba(255,255,255,0.2) !important; }
      `}</style>
    </div>
  );
}
