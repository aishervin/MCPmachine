import React, { useState } from "react";
import {
  X,
  Key,
  GitBranch,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Shield,
  Sparkles,
} from "lucide-react";
import { UserCredentials } from "../types";

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: UserCredentials;
  onSaveCredentials: (creds: UserCredentials) => void;
  lang: "fa" | "en";
}

export const CredentialsModal: React.FC<CredentialsModalProps> = ({
  isOpen,
  onClose,
  credentials,
  onSaveCredentials,
  lang,
}) => {
  const [formData, setFormData] = useState<UserCredentials>(credentials);
  const [showTokens, setShowTokens] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<any>(null);

  if (!isOpen) return null;

  const handleChange = (field: keyof UserCredentials, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onSaveCredentials(updated);
  };

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyStatus(null);
    try {
      const res = await fetch("/api/verify/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          githubToken: formData.githubToken,
          cloudflareToken: formData.cloudflareToken,
          cloudflareAccountId: formData.cloudflareAccountId,
          geminiToken: formData.geminiToken,
        }),
      });
      const data = await res.json().catch(() => ({}));
      setVerifyStatus(data);
    } catch (err: any) {
      setVerifyStatus({ error: err.message });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xl neu-convex rounded-2xl p-6 border border-orange-500/20 text-stone-200 relative max-h-[90vh] overflow-y-auto"
        dir={lang === "fa" ? "rtl" : "ltr"}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800/80 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                {lang === "fa" ? "تنظیمات توکن‌ها و کلیدهای API" : "API Credentials & Secrets"}
              </h3>
              <p className="text-[11px] text-stone-400">
                {lang === "fa"
                  ? "ذخیره‌سازی امن در حافظه مرورگر جهت استفاده مستقیم ایجنت"
                  : "Saved securely in client storage for autonomous agent operations"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg neu-btn text-stone-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggle Show/Hide Passwords */}
        <div className="flex justify-end mb-3">
          <button
            type="button"
            onClick={() => setShowTokens(!showTokens)}
            className="text-[11px] text-stone-400 hover:text-orange-400 flex items-center gap-1.5 px-2.5 py-1 rounded neu-btn"
          >
            {showTokens ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showTokens ? (lang === "fa" ? "مخفی کردن توکن‌ها" : "Hide Secrets") : (lang === "fa" ? "نمایش توکن‌ها" : "Show Secrets")}</span>
          </button>
        </div>

        {/* Credentials Form */}
        <div className="space-y-4 text-xs">
          {/* GitHub Token */}
          <div className="neu-inset p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-stone-200 flex items-center gap-1.5">
                <GitBranch className="w-4 h-4 text-orange-400" />
                <span>GitHub Personal Access Token</span>
              </label>
              <a
                href="https://github.com/settings/tokens/new?scopes=repo"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-orange-400 hover:underline flex items-center gap-0.5"
              >
                <span>{lang === "fa" ? "ساخت توکن گیت‌هاب" : "Generate Token"}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <input
              type={showTokens ? "text" : "password"}
              value={formData.githubToken}
              onChange={(e) => handleChange("githubToken", e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-3 py-2 bg-stone-950/80 border border-stone-800 rounded-lg text-orange-300 font-mono text-xs focus:border-orange-500 focus:outline-none"
            />
            <p className="text-[10px] text-stone-500">
              {lang === "fa"
                ? "دسترسی لازم: تیک repo (جهت ساخت خودکار ریپازیتوری، کامیت و پوش کدهای ورکر)"
                : "Required scope: repo (to create repo, commit and push worker code)"}
            </p>
            {verifyStatus?.github && (
              <div className="text-[11px] pt-1">
                {verifyStatus.github.valid ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>گیت‌هاب متصل شد: @{verifyStatus.github.username}</span>
                  </span>
                ) : (
                  <span className="text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>خطا: {verifyStatus.github.error}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Cloudflare Token & Account ID */}
          <div className="neu-inset p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-stone-200 flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-orange-400" />
                <span>Cloudflare API Token & Account ID</span>
              </label>
              <a
                href="https://dash.cloudflare.com/profile/api-tokens"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-orange-400 hover:underline flex items-center gap-0.5"
              >
                <span>{lang === "fa" ? "ساخت توکن کلودفلر" : "Get Token"}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <div>
              <span className="text-[11px] text-stone-400 block mb-1">Cloudflare API Token:</span>
              <input
                type={showTokens ? "text" : "password"}
                value={formData.cloudflareToken}
                onChange={(e) => handleChange("cloudflareToken", e.target.value)}
                placeholder="Cloudflare API Token (قالب Edit Cloudflare Workers)"
                className="w-full px-3 py-2 bg-stone-950/80 border border-stone-800 rounded-lg text-orange-300 font-mono text-xs focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <span className="text-[11px] text-stone-400 block mb-1">Cloudflare Account ID:</span>
              <input
                type={showTokens ? "text" : "password"}
                value={formData.cloudflareAccountId}
                onChange={(e) => handleChange("cloudflareAccountId", e.target.value)}
                placeholder="شناسه ۳۲ کاراکتری اکانت در داشبورد کلودفلر"
                className="w-full px-3 py-2 bg-stone-950/80 border border-stone-800 rounded-lg text-orange-300 font-mono text-xs focus:border-orange-500 focus:outline-none"
              />
            </div>

            {verifyStatus?.cloudflare && (
              <div className="text-[11px] pt-1">
                {verifyStatus.cloudflare.valid ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>کلودفلر تایید شد (وضعیت: {verifyStatus.cloudflare.status})</span>
                  </span>
                ) : (
                  <span className="text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>خطا: {verifyStatus.cloudflare.error}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Gemini / AI Custom Key */}
          <div className="neu-inset p-4 rounded-xl space-y-2">
            <label className="font-semibold text-stone-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>{lang === "fa" ? "کلید اختصاصی مدل هوش مصنوعی یا جمینای (اختیاری)" : "AI / Gemini API Key (Optional)"}</span>
            </label>
            <input
              type={showTokens ? "text" : "password"}
              value={formData.geminiToken || ""}
              onChange={(e) => handleChange("geminiToken", e.target.value)}
              placeholder="AQ... یا AIzaSy... یا sk-..."
              className="w-full px-3 py-2 bg-stone-950/80 border border-stone-800 rounded-lg text-orange-300 font-mono text-xs focus:border-orange-500 focus:outline-none"
            />
            <p className="text-[10px] text-stone-500">
              {lang === "fa"
                ? "پشتیبانی کامل از قالب جدید کلیدهای جمینای (AQ...) و هوش مصنوعی. برای مکالمه با ایجنت و تزریق در ورکر کلودفلر استفاده می‌شود."
                : "Supports all Gemini key formats (AQ... / AIzaSy...). Used for architect agent chat and Cloudflare Worker AI relay."}
            </p>

            {verifyStatus?.gemini && (
              <div className="text-[11px] pt-1">
                {verifyStatus.gemini.valid ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{lang === "fa" ? `کلید جمینای تایید شد (${verifyStatus.gemini.model})` : `Gemini Key Verified (${verifyStatus.gemini.model})`}</span>
                  </span>
                ) : (
                  <span className="text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{lang === "fa" ? `خطای کلید جمینای: ${verifyStatus.gemini.error}` : `Gemini Error: ${verifyStatus.gemini.error}`}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-stone-800/80">
          <button
            type="button"
            onClick={handleVerify}
            disabled={verifying || (!formData.githubToken && !formData.cloudflareToken && !formData.geminiToken)}
            className="neu-btn px-4 py-2.5 rounded-xl text-stone-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{verifying ? (lang === "fa" ? "در حال تست..." : "Testing...") : (lang === "fa" ? "تست اعتبار توکن‌ها" : "Verify Tokens")}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="neu-btn-primary px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-lg"
          >
            {lang === "fa" ? "ذخیره و تایید" : "Save & Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
