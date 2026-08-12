import { motion, AnimatePresence } from "motion/react";
import { X, AlertTriangle, Clock, Users, FileText, TrendingUp, Shield, Zap } from "lucide-react";
import type { AIComplaintDossier } from "../lib/aiAnalyzerService";

interface AIDossierModalProps {
  dossier: AIComplaintDossier | null;
  onClose: () => void;
}

const PRIORITY_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  critical: { bg: "rgba(239,68,68,0.12)", text: "#ff6b6b", border: "rgba(239,68,68,0.3)", glow: "0 0 20px rgba(239,68,68,0.15)" },
  high: { bg: "rgba(249,115,22,0.12)", text: "#fb923c", border: "rgba(249,115,22,0.3)", glow: "0 0 20px rgba(249,115,22,0.15)" },
  medium: { bg: "rgba(234,179,8,0.12)", text: "#facc15", border: "rgba(234,179,8,0.3)", glow: "0 0 20px rgba(234,179,8,0.15)" },
  low: { bg: "rgba(100,116,139,0.12)", text: "#94a3b8", border: "rgba(100,116,139,0.3)", glow: "0 0 20px rgba(100,116,139,0.1)" },
};

export default function AIDossierModal({ dossier, onClose }: AIDossierModalProps) {
  if (!dossier) return null;

  const colors = PRIORITY_COLORS[dossier.priorityLevel] || PRIORITY_COLORS.medium;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "1rem",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto",
            background: "linear-gradient(135deg, #0b1228 0%, #0d1530 50%, #091020 100%)",
            border: `1px solid ${colors.border}`,
            borderRadius: 16, boxShadow: `0 24px 80px rgba(0,0,0,0.6), ${colors.glow}`,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {/* Header */}
          <div style={{
            padding: "1.5rem 1.5rem 1rem",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "4px 10px", borderRadius: 20,
                  background: colors.bg, border: `1px solid ${colors.border}`,
                  fontSize: 11, fontWeight: 600, color: colors.text,
                  textTransform: "uppercase", letterSpacing: "0.5px",
                }}>
                  <Zap size={11} />
                  {dossier.priorityLevel} Priority
                </div>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                  AI Score: {dossier.aiScore}/100
                </span>
              </div>
              <h2 style={{
                fontSize: 18, fontWeight: 700, color: "#fff",
                fontFamily: "'Space Grotesk', sans-serif",
                lineHeight: 1.3, margin: 0,
              }}>
                <FileText size={16} style={{ display: "inline", marginRight: 8, opacity: 0.6 }} />
                AI Complaint Dossier
              </h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "6px 0 0", lineHeight: 1.5 }}>
                {dossier.title}
              </p>
            </div>
            <button onClick={onClose} style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(255,255,255,0.4)", cursor: "pointer",
            }}>
              <X size={14} />
            </button>
          </div>

          {/* Info Grid */}
          <div style={{ padding: "1rem 1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[
              { icon: <TrendingUp size={14} />, label: "AI Score", value: `${dossier.aiScore}/100`, color: colors.text },
              { icon: <Clock size={14} />, label: "SLA Window", value: `${dossier.suggestedSlaHours}h`, color: "#60a5fa" },
              { icon: <Users size={14} />, label: "Citizen Reports", value: `${dossier.duplicateCount}`, color: "#a78bfa" },
            ].map((item, idx) => (
              <div key={idx} style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10, padding: "12px", textAlign: "center",
              }}>
                <div style={{ color: item.color, marginBottom: 4, display: "flex", justifyContent: "center" }}>{item.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>{item.value}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* Details */}
          <div style={{ padding: "0 1.5rem 1.5rem" }}>
            {/* Location & Category */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16,
            }}>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 14px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>City & Location</div>
                <div style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>{dossier.city} — {dossier.location}</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 14px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Category</div>
                <div style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>{dossier.category}</div>
              </div>
            </div>

            {/* AI Summary */}
            <div style={{
              background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)",
              borderRadius: 12, padding: "14px 16px", marginBottom: 12,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Zap size={13} style={{ color: "#60a5fa" }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.5px" }}>AI Intelligence Summary</span>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.65, margin: 0 }}>
                {dossier.summary}
              </p>
            </div>

            {/* Risk Assessment */}
            <div style={{
              background: colors.bg, border: `1px solid ${colors.border}`,
              borderRadius: 12, padding: "14px 16px", marginBottom: 12,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <AlertTriangle size={13} style={{ color: colors.text }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: colors.text, textTransform: "uppercase", letterSpacing: "0.5px" }}>Risk Assessment</span>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.65, margin: 0 }}>
                {dossier.riskAssessment}
              </p>
            </div>

            {/* Recommended Action */}
            <div style={{
              background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)",
              borderRadius: 12, padding: "14px 16px", marginBottom: 12,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Shield size={13} style={{ color: "#34d399" }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.5px" }}>Recommended Action</span>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.65, margin: 0 }}>
                {dossier.recommendedAction}
              </p>
            </div>

            {/* Citizen Impact */}
            <div style={{
              background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "14px 16px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Citizen Impact Score</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>{dossier.citizenImpactScore}/100</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 3,
                  width: `${dossier.citizenImpactScore}%`,
                  background: `linear-gradient(90deg, ${colors.text}, #60a5fa)`,
                  transition: "width 0.5s ease",
                }} />
              </div>
            </div>

            {/* Footer timestamp */}
            <div style={{ marginTop: 16, textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
              Dossier generated at {new Date(dossier.generatedAt).toLocaleString()} · Urban Eye AI Engine v2.0
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
