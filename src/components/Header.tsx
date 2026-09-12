import React from "react";
import {
  Sparkles,
  Download,
  Languages,
  CheckCircle2,
  Key,
  Play,
  Bot,
  FolderCode,
  Activity,
  Rocket,
  Cloud,
} from "lucide-react";
import { RepoFile, UserCredentials } from "../types";
import { downloadRepoZip } from "../utils/zipExporter";

interface HeaderProps {
  files: RepoFile[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  credentials: UserCredentials;
  onOpenCredentials: () => void;
  onOpenPagesGuide: () => void;
  lang: "fa" | "en";
  setLang: (lang: "fa" | "en") => void;
}

export const Header: React.FC<HeaderProps> = ({
  files,
  activeTab,
  setActiveTab,
  credentials,
  onOpenCredentials,
  onOpenPagesGuide,
  lang,
  setLang,
}) => {
  const [downloading, setDownloading] = React.useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadRepoZip(files, "shen-mcp-server-worker.zip");
    } catch (err: any) {
      alert(`Download error: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  const hasTokens = !!credentials.githubToken || !!credentials.cloudflareToken;

  return (
    <header className="neu-flat border-b border-stone-800/80 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl neu-btn flex items-center justify-center text-orange-500 border border-orange-500/30 neu-orange-glow">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white font-mono">
                  SHΞN<span className="text-orange-500">™</span> MCP Server
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-600/20 text-orange-400 border border-orange-500/30">
                  v2.4
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-medium hidden sm:block">
                {lang === "fa"
                  ? "معمار سرورلس و پل ارتباطی اختصاصی هوش مصنوعی و گیت‌هاب"
                  : "Conversational Serverless MCP Bridge for GitHub & AI Models"}
              </p>
            </div>
          </div>

          {/* Action Hub (Credentials, Deploy, Download, Lang) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* API Credentials Button (Highlight & Status) */}
            <button
              onClick={onOpenCredentials}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                hasTokens
                  ? "neu-btn text-emerald-400 border border-emerald-500/40"
                  : "neu-btn text-orange-400 border border-orange-500/40 neu-orange-glow animate-pulse"
              }`}
              title={lang === "fa" ? "تنظیم توکن‌های گیت‌هاب و کلودفلر" : "Configure Tokens"}
            >
              <Key className="w-3.5 h-3.5" />
              <span className="font-bold hidden md:inline">
                {lang === "fa" ? "کلیدها و توکن‌ها" : "API Tokens"}
              </span>
              {hasTokens ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
              )}
            </button>

            {/* Direct Auto-Deploy Trigger */}
            <button
              onClick={() => setActiveTab("autodeploy")}
              className="neu-btn-primary px-3 sm:px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {lang === "fa" ? "دیپلوی خودکار" : "1-Click Deploy"}
              </span>
            </button>

            {/* Download ZIP button */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="neu-btn px-2.5 sm:px-3 py-2 rounded-xl text-stone-300 hover:text-white text-xs font-medium flex items-center gap-1 transition"
              title={lang === "fa" ? "دانلود سورس‌کدهای آماده مخزن" : "Download ZIP"}
            >
              <Download className="w-3.5 h-3.5 text-stone-400" />
              <span className="hidden lg:inline">{downloading ? "..." : lang === "fa" ? "دانلود ZIP" : "ZIP"}</span>
            </button>

            {/* Cloudflare Pages Deployment Guide Button */}
            <button
              onClick={onOpenPagesGuide}
              className="neu-btn px-3 py-2 rounded-xl text-xs font-semibold text-orange-400 hover:text-orange-300 border border-orange-500/30 flex items-center gap-1.5 transition"
              title={lang === "fa" ? "تنظیمات بیلد و اتصال خودکار به Cloudflare Pages" : "Cloudflare Pages Setup Guide"}
            >
              <Cloud className="w-3.5 h-3.5 text-orange-400" />
              <span className="font-bold hidden md:inline">
                {lang === "fa" ? "اتصال به Cloudflare Pages" : "Cloudflare Pages"}
              </span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === "fa" ? "en" : "fa")}
              className="neu-btn px-2.5 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-orange-400 flex items-center gap-1 transition"
            >
              <Languages className="w-3.5 h-3.5" />
              <span className="uppercase font-mono text-[11px]">{lang}</span>
            </button>
          </div>
        </div>

        {/* Clean, Simple Tabs Navigation (No confusion) */}
        <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto py-2 border-t border-stone-800/80 text-xs">
          {[
            {
              id: "agent",
              labelFa: "💬 گفتگوی اصلی با ایجنت",
              labelEn: "💬 Conversational Agent",
              icon: Bot,
            },
            {
              id: "repo",
              labelFa: "📁 ساختار و فایل‌های مخزن",
              labelEn: "📁 Project Code & Files",
              icon: FolderCode,
            },
            {
              id: "simulator",
              labelFa: "⚡ تست و مانیتور زنده MCP",
              labelEn: "⚡ Live MCP Tester",
              icon: Activity,
            },
            {
              id: "autodeploy",
              labelFa: "🚀 پنل اتوماسیون و استقرار",
              labelEn: "🚀 Automation & Pipeline",
              icon: Rocket,
            },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 sm:px-4 py-2 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  isActive
                    ? "neu-inset text-orange-400 border border-orange-500/40"
                    : "text-stone-400 hover:text-stone-200 hover:bg-stone-900/50"
                }`}
              >
                <span>{lang === "fa" ? tab.labelFa : tab.labelEn}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
