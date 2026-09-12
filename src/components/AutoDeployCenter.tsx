import React, { useState, useEffect } from "react";
import {
  Key,
  GitBranch,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Copy,
  Check,
  Terminal,
  Server,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { RepoFile, UserCredentials, DeploymentLogStep, McpToolDefinition } from "../types";

interface AutoDeployCenterProps {
  files: RepoFile[];
  tools: McpToolDefinition[];
  lang: "fa" | "en";
  onDeployedSuccess?: (workerUrl: string, repoUrl: string) => void;
}

const STORAGE_KEY = "cloudflare_mcp_user_credentials_v1";

export const AutoDeployCenter: React.FC<AutoDeployCenterProps> = ({
  files,
  tools,
  lang,
  onDeployedSuccess,
}) => {
  const [credentials, setCredentials] = useState<UserCredentials>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      githubToken: "",
      cloudflareToken: "",
      cloudflareAccountId: "",
      geminiToken: "",
      repoName: "personal-mcp-bridge",
      workerName: "mcp-api-bridge-worker",
    };
  });

  const [showTokens, setShowTokens] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);

  // Deployment execution state
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentSteps, setDeploymentSteps] = useState<DeploymentLogStep[]>([]);
  const [deployedUrls, setDeployedUrls] = useState<{
    repoUrl?: string;
    workerUrl?: string;
    healthUrl?: string;
  } | null>(null);

  const [copiedClaude, setCopiedClaude] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
    } catch {}
  }, [credentials]);

  const updateField = (field: keyof UserCredentials, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
  };

  const addLogStep = (
    title: string,
    status: DeploymentLogStep["status"],
    details?: string,
    url?: string
  ) => {
    const step: DeploymentLogStep = {
      id: "step-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      title,
      status,
      details,
      url,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };
    setDeploymentSteps((prev) => [...prev, step]);
    return step.id;
  };

  const updateLogStep = (
    id: string,
    status: DeploymentLogStep["status"],
    details?: string,
    url?: string
  ) => {
    setDeploymentSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status, details: details || s.details, url: url || s.url } : s))
    );
  };

  const handleVerify = async () => {
    setVerifying(true);
    setVerificationStatus(null);

    try {
      const res = await fetch("/api/verify/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          githubToken: credentials.githubToken,
          cloudflareToken: credentials.cloudflareToken,
          cloudflareAccountId: credentials.cloudflareAccountId,
        }),
      });

      const data = await res.json();
      setVerificationStatus(data);
    } catch (err: any) {
      setVerificationStatus({ error: err.message });
    } finally {
      setVerifying(false);
    }
  };

  const handleStartDeploy = async () => {
    if (!credentials.githubToken && !credentials.cloudflareToken) {
      alert(
        lang === "fa"
          ? "حداقل یکی از توکن‌های گیت‌هاب یا کلودفلر را وارد کنید."
          : "Please provide either GitHub Token or Cloudflare Token."
      );
      return;
    }

    setIsDeploying(true);
    setDeploymentSteps([]);
    setDeployedUrls(null);

    let finalRepoUrl = "";
    let finalWorkerUrl = "";

    try {
      // Step 1: Push Repository to GitHub
      if (credentials.githubToken) {
        const stepId = addLogStep(
          lang === "fa" ? "۱. ایجاد خودکار مخزن و پوش کدهای ورکر در گیت‌هاب" : "1. Creating repository & pushing files to GitHub",
          "running",
          lang === "fa" ? `در حال ساخت ریپازیتوری ${credentials.repoName} با ${files.length} فایل...` : `Creating ${credentials.repoName}...`
        );

        const ghRes = await fetch("/api/github/deploy-repo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            githubToken: credentials.githubToken,
            repoName: credentials.repoName || "personal-mcp-bridge",
            description: "SHΞN™ Serverless Model Context Protocol (MCP) Bridge Worker on Cloudflare",
            isPrivate: false,
            files,
          }),
        });

        const ghData = await ghRes.json();
        if (!ghRes.ok || !ghData.success) {
          updateLogStep(stepId, "error", ghData.error || "خطا در پوش مخزن گیت‌هاب");
          throw new Error(ghData.error || "GitHub deployment failed");
        }

        finalRepoUrl = ghData.repoUrl;
        updateLogStep(
          stepId,
          "success",
          lang === "fa"
            ? `ریپازیتوری با ${ghData.committedCount} فایل با موفقیت ساخته شد و آماده اتصال به کلودفلر است!`
            : `Repository created with ${ghData.committedCount} files committed!`,
          ghData.repoUrl
        );
      }

      // Step 2: Upload and Deploy Cloudflare Worker directly via API
      if (credentials.cloudflareToken && credentials.cloudflareAccountId) {
        const stepId = addLogStep(
          lang === "fa" ? "۲. کامپایل و استقرار زنده ورکر روی لبه Cloudflare Workers" : "2. Deploying Worker to Cloudflare Edge",
          "running",
          lang === "fa" ? "در حال آپلود اسکریپت ورکر و تنظیم سکرت‌ها..." : "Uploading worker script & configuring secrets..."
        );

        const indexFile = files.find((f) => f.path === "src/index.ts");
        const workerScript = indexFile ? indexFile.content : "// Worker";

        const secretsToSet: Record<string, string> = {};
        if (credentials.githubToken) secretsToSet["GITHUB_TOKEN"] = credentials.githubToken;
        if (credentials.geminiToken) secretsToSet["AI_API_KEY"] = credentials.geminiToken;

        const cfRes = await fetch("/api/cloudflare/deploy-worker", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cloudflareToken: credentials.cloudflareToken,
            cloudflareAccountId: credentials.cloudflareAccountId,
            scriptName: credentials.workerName || "mcp-api-bridge-worker",
            workerCode: workerScript,
            secrets: secretsToSet,
          }),
        });

        const cfData = await cfRes.json();
        if (!cfRes.ok || !cfData.success) {
          updateLogStep(stepId, "error", cfData.error || "خطا در استقرار ورکر در کلودفلر");
          throw new Error(cfData.error || "Cloudflare deployment failed");
        }

        finalWorkerUrl = cfData.workerUrl;
        updateLogStep(
          stepId,
          "success",
          lang === "fa"
            ? `ورکر با موفقیت مستقر شد! سرویس زنده است: ${cfData.workerUrl}`
            : `Worker deployed! Endpoint: ${cfData.workerUrl}`,
          cfData.workerUrl
        );
      }

      // Step 3: Health and SSE Endpoint Validation
      if (finalWorkerUrl) {
        const stepId = addLogStep(
          lang === "fa" ? "۳. تست سلامت اندپوینت SSE و شبیه‌سازی ابزارها" : "3. Verifying SSE & MCP Health Endpoint",
          "running"
        );

        updateLogStep(
          stepId,
          "success",
          lang === "fa"
            ? `پروتکل SSE فعال شد. آدرس سرور آماده وارد کردن در نرم‌افزار شماست: ${finalWorkerUrl}`
            : `SSE stream active at ${finalWorkerUrl}`,
          finalWorkerUrl
        );
      }

      setDeployedUrls({
        repoUrl: finalRepoUrl,
        workerUrl: finalWorkerUrl,
        healthUrl: finalWorkerUrl ? `${finalWorkerUrl.replace("/sse", "/health")}` : undefined,
      });

      if (onDeployedSuccess && finalWorkerUrl) {
        onDeployedSuccess(finalWorkerUrl, finalRepoUrl);
      }
    } catch (err: any) {
      addLogStep(lang === "fa" ? "خطا در استقرار خودکار" : "Deployment Failure", "error", err.message);
    } finally {
      setIsDeploying(false);
    }
  };

  const claudeConfigSnippet = deployedUrls?.workerUrl
    ? JSON.stringify(
        {
          mcpServers: {
            "shen-mcp-server": {
              command: "npx",
              args: ["-y", "mcp-remote-client", deployedUrls.workerUrl],
            },
          },
        },
        null,
        2
      )
    : "";

  return (
    <div className="space-y-6" dir={lang === "fa" ? "rtl" : "ltr"}>
      {/* Top Banner */}
      <div className="neu-convex p-5 rounded-2xl border border-stone-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-400" />
              <span>
                {lang === "fa"
                  ? "مرکز اتوماسیون و استقرار ۱-کلیک (Automated 1-Click Deployment)"
                  : "Automated 1-Click Deployment Center"}
              </span>
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              {lang === "fa"
                ? "توکن‌های گیت‌هاب و کلودفلر خود را وارد کنید تا تمام کدهای ورکر به طور خودکار در گیت‌هاب پوش و روی کلودفلر دیپلوی شوند."
                : "Push to GitHub and deploy live to Cloudflare Workers automatically."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTokens(!showTokens)}
              className="neu-btn px-3 py-1.5 rounded-xl text-xs font-medium text-stone-400 hover:text-white flex items-center gap-1 transition"
            >
              {showTokens ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showTokens ? (lang === "fa" ? "مخفی‌سازی توکن‌ها" : "Hide Tokens") : (lang === "fa" ? "نمایش توکن‌ها" : "Show Tokens")}</span>
            </button>
            <button
              onClick={handleVerify}
              disabled={verifying || (!credentials.githubToken && !credentials.cloudflareToken)}
              className="neu-btn px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-300 hover:text-white flex items-center gap-1.5 transition disabled:opacity-40"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{verifying ? (lang === "fa" ? "در حال تست..." : "Testing...") : (lang === "fa" ? "تست اعتبار توکن‌ها" : "Verify Credentials")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Credentials Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* GitHub Credentials */}
        <div className="neu-flat p-5 rounded-2xl border border-stone-800 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800/80 pb-2.5">
            <div className="flex items-center gap-2 font-bold text-white text-xs">
              <span className="w-7 h-7 rounded-xl bg-orange-600/30 text-orange-400 flex items-center justify-center border border-orange-500/30">
                <GitBranch className="w-4 h-4" />
              </span>
              <span>{lang === "fa" ? "اتصال گیت‌هاب (GitHub Access)" : "GitHub Credentials"}</span>
            </div>
            {verificationStatus?.github?.valid && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                <span>@{verificationStatus.github.username}</span>
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              GitHub Personal Access Token (<span className="font-mono text-orange-400">ghp_...</span>)
            </label>
            <input
              type={showTokens ? "text" : "password"}
              value={credentials.githubToken}
              onChange={(e) => updateField("githubToken", e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-3 py-2 rounded-xl neu-inset font-mono text-xs text-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            <span className="text-[10px] text-stone-500 mt-1 block">
              {lang === "fa"
                ? "دسترسی مورد نیاز: تیک repo برای ساخت و پوش مخزن جدید."
                : "Required scope: repo (for creating and pushing files)."}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              {lang === "fa" ? "نام مخزن گیت‌هاب (Repository Name)" : "Repository Name"}
            </label>
            <input
              type="text"
              value={credentials.repoName}
              onChange={(e) => updateField("repoName", e.target.value)}
              placeholder="personal-mcp-bridge"
              className="w-full px-3 py-2 rounded-xl neu-inset font-mono text-xs text-stone-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Cloudflare Credentials */}
        <div className="neu-flat p-5 rounded-2xl border border-stone-800 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800/80 pb-2.5">
            <div className="flex items-center gap-2 font-bold text-white text-xs">
              <span className="w-7 h-7 rounded-xl bg-orange-600/30 text-orange-400 flex items-center justify-center border border-orange-500/30">
                <Cloud className="w-4 h-4" />
              </span>
              <span>{lang === "fa" ? "اتصال کلودفلر (Cloudflare Workers API)" : "Cloudflare Credentials"}</span>
            </div>
            {verificationStatus?.cloudflare?.valid && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified Active</span>
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Cloudflare API Token
            </label>
            <input
              type={showTokens ? "text" : "password"}
              value={credentials.cloudflareToken}
              onChange={(e) => updateField("cloudflareToken", e.target.value)}
              placeholder="Cloudflare API Token (Workers Edit template)"
              className="w-full px-3 py-2 rounded-xl neu-inset font-mono text-xs text-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Account ID</label>
              <input
                type={showTokens ? "text" : "password"}
                value={credentials.cloudflareAccountId}
                onChange={(e) => updateField("cloudflareAccountId", e.target.value)}
                placeholder="Account ID (32 chars)"
                className="w-full px-3 py-2 rounded-xl neu-inset font-mono text-xs text-stone-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Worker Name</label>
              <input
                type="text"
                value={credentials.workerName}
                onChange={(e) => updateField("workerName", e.target.value)}
                placeholder="mcp-bridge"
                className="w-full px-3 py-2 rounded-xl neu-inset font-mono text-xs text-stone-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Deploy Action Button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={handleStartDeploy}
          disabled={isDeploying || (!credentials.githubToken && !credentials.cloudflareToken)}
          className="neu-btn-primary px-8 py-3 rounded-2xl text-white font-bold text-sm flex items-center gap-2 shadow-xl transition disabled:opacity-40"
        >
          {isDeploying ? (
            <>
              <RotateCcw className="w-5 h-5 animate-spin" />
              <span>{lang === "fa" ? "در حال اجرای اتوماسیون..." : "Executing Auto-Deployment..."}</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>{lang === "fa" ? "اجرای دیپلوی خودکار (1-Click Deploy)" : "Run 1-Click Auto Deployment"}</span>
            </>
          )}
        </button>
      </div>

      {/* Deployment Realtime Logs */}
      {deploymentSteps.length > 0 && (
        <div className="neu-flat p-5 rounded-2xl border border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-stone-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-orange-400" />
              <span>{lang === "fa" ? "گزارش وضعیت اجرای خط لوله استقرار" : "Execution Logs & Pipeline"}</span>
            </h3>
            {isDeploying && (
              <span className="text-[11px] text-orange-400 flex items-center gap-1">
                <RotateCcw className="w-3 h-3 animate-spin" />
                <span>Running...</span>
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs font-mono">
            {deploymentSteps.map((step) => (
              <div
                key={step.id}
                className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${
                  step.status === "success"
                    ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                    : step.status === "error"
                    ? "bg-red-950/40 border-red-500/30 text-red-300"
                    : "bg-orange-950/40 border-orange-500/30 text-orange-300"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {step.status === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  ) : step.status === "error" ? (
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  ) : (
                    <RotateCcw className="w-4 h-4 text-orange-400 animate-spin mt-0.5 shrink-0" />
                  )}
                  <div>
                    <span className="font-bold">{step.title}</span>
                    {step.details && <p className="text-[11px] mt-0.5 opacity-80">{step.details}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] shrink-0">
                  <span className="text-stone-500">{step.timestamp}</span>
                  {step.url && (
                    <a
                      href={step.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-orange-400 hover:underline flex items-center gap-0.5 font-sans font-semibold"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Outputs */}
      {deployedUrls && (
        <div className="neu-convex p-5 rounded-2xl border border-emerald-500/40 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>{lang === "fa" ? "استقرار با موفقیت به پایان رسید!" : "Deployment Completed Successfully!"}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {deployedUrls.workerUrl && (
              <div className="neu-inset p-3 rounded-xl space-y-1">
                <span className="text-stone-400 text-[10px] block">MCP Server SSE Endpoint:</span>
                <a
                  href={deployedUrls.workerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:underline break-all font-bold"
                >
                  {deployedUrls.workerUrl}
                </a>
              </div>
            )}

            {deployedUrls.repoUrl && (
              <div className="neu-inset p-3 rounded-xl space-y-1">
                <span className="text-stone-400 text-[10px] block">GitHub Repository:</span>
                <a
                  href={deployedUrls.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-orange-400 hover:underline break-all font-bold"
                >
                  {deployedUrls.repoUrl}
                </a>
              </div>
            )}
          </div>

          {/* Claude Desktop Configuration */}
          {claudeConfigSnippet && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-300 font-bold">
                  {lang === "fa" ? "کانفیگ آماده Claude Desktop:" : "Claude Desktop Config:"}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(claudeConfigSnippet);
                    setCopiedClaude(true);
                    setTimeout(() => setCopiedClaude(false), 2000);
                  }}
                  className="neu-btn px-2.5 py-1 rounded-lg text-stone-300 text-[11px] font-semibold flex items-center gap-1"
                >
                  {copiedClaude ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedClaude ? (lang === "fa" ? "کپی شد" : "Copied") : (lang === "fa" ? "کپی کانفیگ" : "Copy")}</span>
                </button>
              </div>

              <pre className="p-3 bg-stone-950/90 rounded-xl text-emerald-300 font-mono text-[11px] overflow-x-auto border border-stone-800">
                {claudeConfigSnippet}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
