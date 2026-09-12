import React, { useState, useMemo, useEffect } from "react";
import { Header } from "./components/Header";
import { ConversationalAgentStudio } from "./components/ConversationalAgentStudio";
import { RepoExplorer } from "./components/RepoExplorer";
import { McpSimulator } from "./components/McpSimulator";
import { AutoDeployCenter } from "./components/AutoDeployCenter";
import { CredentialsModal } from "./components/CredentialsModal";
import { CloudflarePagesGuideModal } from "./components/CloudflarePagesGuideModal";
import {
  initialTools,
  githubTools,
  aiRelayTools,
  internalTunnelTools,
  defaultTunnelConfig,
  generateRepoFiles,
} from "./data/defaultRepo";
import { McpToolDefinition, CloudflareTunnelConfig, ArchitecturePreset, UserCredentials } from "./types";

const CREDENTIALS_KEY = "cloudflare_mcp_user_credentials_v1";

export default function App() {
  const [lang, setLang] = useState<"fa" | "en">("fa");
  const [activeTab, setActiveTab] = useState<string>("agent"); // Primary axis: conversational agent
  const [activePreset, setActivePreset] = useState<ArchitecturePreset>("github");
  const [tools, setTools] = useState<McpToolDefinition[]>(githubTools);
  const [tunnelConfig, setTunnelConfig] = useState<CloudflareTunnelConfig>(defaultTunnelConfig);

  // Credentials State
  const [credentials, setCredentials] = useState<UserCredentials>(() => {
    try {
      const saved = localStorage.getItem(CREDENTIALS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      githubToken: "",
      cloudflareToken: "",
      cloudflareAccountId: "",
      geminiToken: "",
      repoName: "personal-mcp-bridge",
      workerName: "mcp-api-bridge-worker",
      isPrivate: true,
      hardcodeSecrets: true,
    };
  });

  const [isCredentialsOpen, setIsCredentialsOpen] = useState(false);
  const [isPagesGuideOpen, setIsPagesGuideOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
    } catch {}
  }, [credentials]);

  // Switch presets automatically
  const handleSelectPreset = (preset: ArchitecturePreset) => {
    setActivePreset(preset);
    if (preset === "github") {
      setTools(githubTools);
    } else if (preset === "ai_relay") {
      setTools(aiRelayTools);
    } else if (preset === "internal_tunnel") {
      setTools(internalTunnelTools);
    }
  };

  // Generate repository files dynamically whenever tools, tunnel config, preset, or credentials change
  const repoFiles = useMemo(() => {
    return generateRepoFiles(tools, tunnelConfig, activePreset, credentials);
  }, [tools, tunnelConfig, activePreset, credentials]);

  return (
    <div
      className="min-h-screen bg-[#0b0c10] text-stone-100 flex flex-col selection:bg-orange-500 selection:text-white"
      dir={lang === "fa" ? "rtl" : "ltr"}
    >
      {/* Header Bar */}
      <Header
        files={repoFiles}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        credentials={credentials}
        onOpenCredentials={() => setIsCredentialsOpen(true)}
        onOpenPagesGuide={() => setIsPagesGuideOpen(true)}
        lang={lang}
        setLang={setLang}
      />

      {/* Main Responsive Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {/* Tab 1: Central Conversational Agent Studio (The primary focus) */}
        {activeTab === "agent" && (
          <ConversationalAgentStudio
            tools={tools}
            onSelectPreset={handleSelectPreset}
            activePreset={activePreset}
            credentials={credentials}
            onOpenCredentials={() => setIsCredentialsOpen(true)}
            onOpenPagesGuide={() => setIsPagesGuideOpen(true)}
            onNavigateToTab={setActiveTab}
            files={repoFiles}
            lang={lang}
          />
        )}

        {/* Tab 2: Project Files & Structure Inspection / Export */}
        {activeTab === "repo" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-stone-200">
                {lang === "fa" ? "ساختار و کدهای تولید شده مخزن" : "Generated Repository Files"}
              </h2>
              <button
                onClick={() => setActiveTab("agent")}
                className="text-xs text-orange-400 hover:underline font-medium"
              >
                {lang === "fa" ? "← بازگشت به گفتگوی ایجنت" : "← Back to Agent"}
              </button>
            </div>
            <RepoExplorer files={repoFiles} lang={lang} />
          </div>
        )}

        {/* Tab 3: Live MCP Simulator & Inspector */}
        {activeTab === "simulator" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-stone-200">
                {lang === "fa" ? "شبیه‌ساز و مانیتورینگ زنده فریم‌های MCP" : "Live MCP Inspector & Simulation"}
              </h2>
              <button
                onClick={() => setActiveTab("agent")}
                className="text-xs text-orange-400 hover:underline font-medium"
              >
                {lang === "fa" ? "← بازگشت به گفتگوی ایجنت" : "← Back to Agent"}
              </button>
            </div>
            <McpSimulator tools={tools} lang={lang} />
          </div>
        )}

        {/* Tab 4: 1-Click Automated Deployment Center */}
        {activeTab === "autodeploy" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-stone-200">
                {lang === "fa" ? "پنل اتوماسیون و استقرار ۱-کلیک" : "1-Click Auto Deployment Pipeline"}
              </h2>
              <button
                onClick={() => setActiveTab("agent")}
                className="text-xs text-orange-400 hover:underline font-medium"
              >
                {lang === "fa" ? "← بازگشت به گفتگوی ایجنت" : "← Back to Agent"}
              </button>
            </div>
            <AutoDeployCenter
              files={repoFiles}
              tools={tools}
              lang={lang}
              onDeployedSuccess={(workerUrl) => {
                // Deployed callback
              }}
            />
          </div>
        )}
      </main>

      {/* Credentials Neumorphic Modal */}
      <CredentialsModal
        isOpen={isCredentialsOpen}
        onClose={() => setIsCredentialsOpen(false)}
        credentials={credentials}
        onSaveCredentials={setCredentials}
        lang={lang}
      />

      {/* Cloudflare Pages Auto-Deploy Setup Guide Modal */}
      <CloudflarePagesGuideModal
        isOpen={isPagesGuideOpen}
        onClose={() => setIsPagesGuideOpen(false)}
        lang={lang}
      />

      {/* Sleek Neumorphic Footer with SHΞN credit linked to Telegram */}
      <footer className="neu-flat border-t border-stone-800/80 py-5 px-6 text-center text-xs text-stone-400 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-stone-200">SHΞN™ MCP Server</span>
            <span className="text-stone-600 hidden sm:inline">•</span>
            <span className="text-stone-400 text-[11px] hidden sm:inline">
              Serverless Model Context Protocol Edge Middleware
            </span>
          </div>

          <a
            href="https://t.me/shervini"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl neu-btn text-orange-400 hover:text-orange-300 transition font-bold text-xs border border-orange-500/20 shadow-xs"
          >
            <span>Exclusive SHΞN™ made</span>
            <span className="text-[10px] text-stone-500 font-mono">T.me/shervini</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
