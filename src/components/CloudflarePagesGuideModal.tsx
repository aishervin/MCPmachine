import React, { useState } from "react";
import {
  Cloud,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  FileCode,
  GitBranch,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Layers,
} from "lucide-react";

interface CloudflarePagesGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "fa" | "en";
}

export const CloudflarePagesGuideModal: React.FC<CloudflarePagesGuideModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const buildCommand = "npm run build:pages";
  const outputDir = "dist";
  const nodeVersion = "20";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="neu-convex w-full max-w-3xl rounded-3xl border border-stone-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
        dir={lang === "fa" ? "rtl" : "ltr"}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-stone-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl neu-btn flex items-center justify-center text-orange-500 border border-orange-500/30 neu-orange-glow">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>
                  {lang === "fa"
                    ? "تنظیمات اتصال مستقیم این اپلیکیشن به Cloudflare Pages"
                    : "Connect this App to Cloudflare Pages"}
                </span>
                <span className="text-[10px] bg-orange-500/20 text-orange-400 font-mono px-2 py-0.5 rounded-full border border-orange-500/30">
                  Auto-Deploy Ready
                </span>
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                {lang === "fa"
                  ? "با یک بار اتصال به مخزن گیت‌هاب، هر بار تغییر جدید بدهید به طور خودکار بیلد و آپدیت می‌شود."
                  : "Continuous deployment: any push to your repo will auto-build and update your live app."}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="neu-btn p-2 rounded-xl text-stone-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* 3 Step Instructions */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-stone-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-400" />
            <span>
              {lang === "fa"
                ? "دقیقاً این مقادیر را موقع ساخت Project در کلودفلر وارد کنید:"
                : "Fill in these exact build settings in Cloudflare Pages dashboard:"}
            </span>
          </h4>

          {/* Quick Copy Settings Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Setting 1: Framework preset */}
            <div className="neu-inset p-3.5 rounded-2xl border border-stone-800 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-stone-400 block mb-1">
                  1. Framework preset
                </span>
                <div className="font-mono text-sm font-bold text-orange-400">
                  Vite / None
                </div>
              </div>
              <p className="text-[10px] text-stone-500 mt-2">
                {lang === "fa"
                  ? "در منوی کشویی، Vite را انتخاب کنید."
                  : "Select 'Vite' from the preset dropdown."}
              </p>
            </div>

            {/* Setting 2: Build command */}
            <div className="neu-inset p-3.5 rounded-2xl border border-orange-500/40 flex flex-col justify-between bg-orange-950/10">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-300">
                  2. Build command
                </span>
                <button
                  onClick={() => handleCopy("cmd", buildCommand)}
                  className="neu-btn px-2 py-1 rounded-lg text-[10px] font-mono text-orange-400 flex items-center gap-1"
                >
                  {copiedKey === "cmd" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === "cmd" ? "کپی شد" : "کپی"}</span>
                </button>
              </div>
              <div className="font-mono text-xs font-black text-white bg-stone-900/80 p-2 rounded-xl mt-1 border border-stone-800">
                {buildCommand}
              </div>
              <p className="text-[10px] text-stone-400 mt-1">
                {lang === "fa"
                  ? "دستور بیلد فرانت‌اند ری‌اکت + ویت بدون وابستگی به سرور محلی"
                  : "Client-side production bundle command"}
              </p>
            </div>

            {/* Setting 3: Build output directory */}
            <div className="neu-inset p-3.5 rounded-2xl border border-orange-500/40 flex flex-col justify-between bg-orange-950/10">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-300">
                  3. Build output directory
                </span>
                <button
                  onClick={() => handleCopy("dir", outputDir)}
                  className="neu-btn px-2 py-1 rounded-lg text-[10px] font-mono text-orange-400 flex items-center gap-1"
                >
                  {copiedKey === "dir" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === "dir" ? "کپی شد" : "کپی"}</span>
                </button>
              </div>
              <div className="font-mono text-xs font-black text-white bg-stone-900/80 p-2 rounded-xl mt-1 border border-stone-800">
                {outputDir}
              </div>
              <p className="text-[10px] text-stone-400 mt-1">
                {lang === "fa"
                  ? "پوشه خروجی فایل‌های کامپایل شده HTML/CSS/JS"
                  : "Target compiled assets directory"}
              </p>
            </div>

            {/* Setting 4: Node version */}
            <div className="neu-inset p-3.5 rounded-2xl border border-stone-800 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-400">
                  4. Environment Variable (اختیاری)
                </span>
                <button
                  onClick={() => handleCopy("node", "NODE_VERSION=20")}
                  className="neu-btn px-2 py-1 rounded-lg text-[10px] font-mono text-orange-400 flex items-center gap-1"
                >
                  {copiedKey === "node" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === "node" ? "کپی شد" : "کپی"}</span>
                </button>
              </div>
              <div className="font-mono text-xs text-stone-300 bg-stone-900/80 p-2 rounded-xl mt-1 border border-stone-800">
                NODE_VERSION = {nodeVersion}
              </div>
              <p className="text-[10px] text-stone-500 mt-1">
                {lang === "fa"
                  ? "جهت تضمین اجرای بدون نقص Vite 6"
                  : "Recommended Node runtime for modern Vite"}
              </p>
            </div>
          </div>

          {/* Workflow Steps Explanation */}
          <div className="neu-flat p-4 rounded-2xl border border-stone-800 space-y-2.5 text-xs">
            <h5 className="font-bold text-white flex items-center gap-1.5">
              <GitBranch className="w-4 h-4 text-orange-400" />
              <span>
                {lang === "fa" ? "مراحل اتصال در داشبورد Cloudflare:" : "Step-by-Step Dashboard Setup:"}
              </span>
            </h5>
            <ol className="list-decimal list-inside space-y-1.5 text-stone-300 leading-relaxed pr-1">
              <li>
                {lang === "fa"
                  ? "ابتدا کدهای این پروژه را روی مخزن گیت‌هاب خود پوش کنید (از طریق دکمه «دیپلوی خودکار» در بالای صفحه یا دکمه «دانلود ZIP»)."
                  : "Push your project to GitHub (using 1-Click Deploy or Download ZIP)."}
              </li>
              <li>
                {lang === "fa"
                  ? "وارد داشبورد Cloudflare شده و به بخش Workers & Pages > Create application > Pages > Connect to Git بروید."
                  : "Go to Cloudflare Dashboard > Workers & Pages > Create > Pages > Connect to Git."}
              </li>
              <li>
                {lang === "fa"
                  ? "مخزن گیت‌هاب خود را انتخاب کنید."
                  : "Select your GitHub repository."}
              </li>
              <li>
                {lang === "fa"
                  ? "در کادر Build settings، مقادیر بالا را کپی و پیست کنید و دکمه Save and Deploy را بزنید!"
                  : "Paste the build command and output directory from above, and click 'Save and Deploy'."}
              </li>
            </ol>
          </div>

          {/* Cloudflare Pages Routing note */}
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <div>
              <span className="font-bold block mb-0.5">
                {lang === "fa" ? "فایل _redirects آماده شده است:" : "Ready with _redirects:"}
              </span>
              <p className="text-[11px] text-emerald-300/90 leading-relaxed">
                {lang === "fa"
                  ? "فایل `public/_redirects` برای روتینگ صحیح تک‌صفحه‌ای (SPA) ایجاد شده تا در صورت رفرش صفحه، با خطای ۴۰۴ کلودفلر مواجه نشوید."
                  : "SPA routing rule is preconfigured so refreshing any sub-route will not throw a 404 error."}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-800/80">
          <a
            href="https://dash.cloudflare.com"
            target="_blank"
            rel="noreferrer"
            className="neu-btn px-4 py-2 rounded-xl text-xs font-semibold text-stone-300 hover:text-white flex items-center gap-1.5 transition"
          >
            <span>{lang === "fa" ? "ورود به داشبورد کلودفلر" : "Cloudflare Dashboard"}</span>
            <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
          </a>

          <button
            onClick={onClose}
            className="neu-btn-primary px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition"
          >
            {lang === "fa" ? "متوجه شدم" : "Got it"}
          </button>
        </div>
      </div>
    </div>
  );
};
