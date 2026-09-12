import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  GitBranch,
  BrainCircuit,
  ShieldCheck,
  Code,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Key,
  Copy,
  Check,
  Terminal,
  Layers,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import {
  McpToolDefinition,
  ArchitecturePreset,
  UserCredentials,
  RepoFile,
  DeploymentLogStep,
} from "../types";

interface ConversationalAgentStudioProps {
  tools: McpToolDefinition[];
  onSelectPreset: (preset: ArchitecturePreset) => void;
  activePreset: ArchitecturePreset;
  credentials: UserCredentials;
  onOpenCredentials: () => void;
  onOpenPagesGuide?: () => void;
  onNavigateToTab: (tab: string) => void;
  files: RepoFile[];
  lang: "fa" | "en";
}

interface ChatEntry {
  id: string;
  sender: "agent" | "user";
  text: string;
  timestamp: string;
  quickActions?: {
    label: string;
    action: () => void;
    icon?: React.ReactNode;
    primary?: boolean;
  }[];
}

export const ConversationalAgentStudio: React.FC<ConversationalAgentStudioProps> = ({
  tools,
  onSelectPreset,
  activePreset,
  credentials,
  onOpenCredentials,
  onOpenPagesGuide,
  onNavigateToTab,
  files,
  lang,
}) => {
  const [messages, setMessages] = useState<ChatEntry[]>([
    {
      id: "welcome-1",
      sender: "agent",
      text:
        lang === "fa"
          ? `سلام! من **ایجنت معمار سرورلس SHΞN™ MCP** هستم.
محور اصلی کار ما این است که بدون درگیر شدن با تنظیمات پیچیده، گام‌به‌گام سرویس مورد نظرتان را به یک **سرور استاندارد Model Context Protocol (MCP)** روی Cloudflare Workers تبدیل کنیم.

**برای شروع، هدف اصلی شما کدام است؟**
یکی از گزینه‌های آماده زیر را لمس کنید یا نیازتان را به زبان ساده در کادر پیام بنویسید:`
          : `Hello! I am your **SHΞN™ MCP Serverless Architect Agent**.
Our primary mission is to seamlessly transform any API or service into a production-ready **Model Context Protocol (MCP) Server** running on Cloudflare Workers edge.

**To get started, what would you like to bridge?**
Select one of the presets below or describe your custom request in the chat:`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      quickActions: [
        {
          label: lang === "fa" ? "🐙 اتصال به گیت‌هاب (GitHub Bridge)" : "🐙 GitHub Bridge",
          action: () => handlePresetClick("github"),
          primary: true,
        },
        {
          label: lang === "fa" ? "🤖 اتصال هوش مصنوعی با API Token" : "🤖 AI Model Relay",
          action: () => handlePresetClick("ai_relay"),
          primary: true,
        },
        {
          label: lang === "fa" ? "🏢 اتصال سرویس محلی با تانل" : "🏢 Local Zero-Trust Tunnel",
          action: () => handlePresetClick("internal_tunnel"),
        },
        {
          label: lang === "fa" ? "☁️ راهنمای اتصال به Cloudflare Pages" : "☁️ Cloudflare Pages Guide",
          action: () => onOpenPagesGuide && onOpenPagesGuide(),
        },
      ],
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Deployment execution state inside agent flow
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySteps, setDeploySteps] = useState<DeploymentLogStep[]>([]);
  const [finalDeployedUrl, setFinalDeployedUrl] = useState<string | null>(null);
  const [finalRepoUrl, setFinalRepoUrl] = useState<string | null>(null);
  const [copiedConfig, setCopiedConfig] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, deploySteps]);

  // Determine current pipeline stage (1 to 4)
  const currentStep = finalDeployedUrl
    ? 4
    : credentials.githubToken || credentials.cloudflareToken
    ? 3
    : activePreset
    ? 2
    : 1;

  const handlePresetClick = (preset: ArchitecturePreset) => {
    onSelectPreset(preset);

    let desc = "";
    if (preset === "github") {
      desc =
        lang === "fa"
          ? `عالیه! سناریوی **پل اختصاصی گیت‌هاب (GitHub MCP Server)** فعال شد.
در این ساختار، نرم‌افزار شما آدرس سرور MCP را دریافت می‌کند و ورکر با کلید \`GITHUB_TOKEN\` به گیت‌هاب وصل می‌شود.
۵ ابزار آماده (مشاهده ریپازیتوری، خواندن فایل‌ها، ساخت Issue، لیست ایشوها و جستجو) به صورت خودکار لود شدند.

**مرحله بعد:**
برای اینکه ایجنت بتواند ریپازیتوری را در گیت‌هاب شما بسازد و ورکر را مستقر کند، توکن‌های گیت‌هاب و کلودفلر خود را ثبت کنید.`
          : `Selected **GitHub MCP Server Bridge**.
5 native tools loaded (get_repository, get_file_contents, create_issue, list_issues, search_repositories).
Next step: Configure your GitHub & Cloudflare tokens.`;
    } else if (preset === "ai_relay") {
      desc =
        lang === "fa"
          ? `سناریوی **تبدیل هوش مصنوعی با API Token به سرور MCP** فعال شد.
ورکر اندپوینت‌های مدل هوش مصنوعی شما را با تزریق امن \`AI_API_KEY\` به عنوان ابزارهای استاندارد چت و دستیار کدنویسی ارائه می‌دهد.

**مرحله بعد:**
کلید مدل هوش مصنوعی یا جمینای و توکن‌های استقرار را ثبت کنید.`
          : `Selected **AI Model to MCP Relay**.
Wraps your AI endpoints with secret token injection into standard MCP tools.`;
    } else {
      desc =
        lang === "fa"
          ? `سناریوی **سرویس داخلی با تانل بدون هزینه کلودفلر** فعال شد.
بدون نیاز به باز کردن پورت یا آی‌پی استاتیک، API محلی شما امن می‌شود.`
          : `Selected **Internal API via Cloudflare Tunnel**.`;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: "preset-" + Date.now(),
        sender: "agent",
        text: desc,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        quickActions: [
          {
            label: lang === "fa" ? "🔑 تنظیم توکن‌ها و کلیدها" : "🔑 Enter Credentials",
            action: onOpenCredentials,
            primary: true,
          },
          {
            label: lang === "fa" ? "📁 مشاهده کدهای آماده ورکر" : "📁 View Worker Code",
            action: () => onNavigateToTab("repo"),
          },
          {
            label: lang === "fa" ? "🚀 اجرای دیپلوی خودکار" : "🚀 Start Auto-Deploy",
            action: handleRunDeploy,
          },
        ],
      },
    ]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage;
    setInputMessage("");

    setMessages((prev) => [
      ...prev,
      {
        id: "user-" + Date.now(),
        sender: "user",
        text: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    setLoading(true);

    try {
      const res = await fetch("/api/architect/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.sender === "agent" ? "assistant" : "user", content: m.text })),
            { role: "user", content: userText },
          ],
          currentTools: tools,
          activePreset,
          geminiToken: credentials.geminiToken || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || `سرور با کد وضعیت ${res.status} پاسخ داد.`);
      }

      const agentReply = data.text || "پاسخی دریافت نشد.";

      setMessages((prev) => [
        ...prev,
        {
          id: "agent-" + Date.now(),
          sender: "agent",
          text: agentReply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          quickActions: [
            {
              label: lang === "fa" ? "🔑 مدیریت توکن‌ها" : "🔑 Credentials",
              action: onOpenCredentials,
            },
            {
              label: lang === "fa" ? "🚀 اجرای دیپلوی خودکار" : "🚀 Deploy Worker",
              action: handleRunDeploy,
              primary: true,
            },
          ],
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          sender: "agent",
          text: `خطا در ارتباط با سرور: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRunDeploy = async () => {
    if (!credentials.githubToken && !credentials.cloudflareToken) {
      setMessages((prev) => [
        ...prev,
        {
          id: "missing-creds-" + Date.now(),
          sender: "agent",
          text:
            lang === "fa"
              ? `برای اینکه بتوانم پروژه را در گیت‌هاب پوش کنم و مستقیماً روی کلودفلر دیپلوی کنم، نیاز به توکن‌های شما دارم. لطفاً روی دکمه زیر کلیک کرده و توکن‌ها را ثبت کنید:`
              : `To push code and deploy directly to Cloudflare, please configure your tokens first:`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          quickActions: [
            {
              label: lang === "fa" ? "🔑 باز کردن پنجره ورود توکن‌ها" : "🔑 Open Credentials Window",
              action: onOpenCredentials,
              primary: true,
            },
          ],
        },
      ]);
      onOpenCredentials();
      return;
    }

    setIsDeploying(true);
    setDeploySteps([]);
    setFinalDeployedUrl(null);

    const log = (title: string, status: DeploymentLogStep["status"], details?: string, url?: string) => {
      const step: DeploymentLogStep = {
        id: "step-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5),
        title,
        status,
        details,
        url,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setDeploySteps((prev) => [...prev, step]);
      return step.id;
    };

    let repoUrl = "";
    let workerUrl = "";

    try {
      // Step 1: Push to GitHub
      if (credentials.githubToken) {
        log(
          lang === "fa" ? "۱. ایجاد خودکار مخزن و پوش فایل‌ها در گیت‌هاب" : "1. Creating GitHub repo & pushing files",
          "running"
        );

        const ghRes = await fetch("/api/github/deploy-repo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            githubToken: credentials.githubToken,
            repoName: credentials.repoName || "personal-mcp-bridge",
            description: "SHΞN™ Serverless Model Context Protocol (MCP) Bridge Worker",
            isPrivate: false,
            files,
          }),
        });

        const ghData = await ghRes.json();
        if (ghRes.ok && ghData.success) {
          repoUrl = ghData.repoUrl;
          setFinalRepoUrl(repoUrl);
          log(
            lang === "fa"
              ? `ریپازیتوری ${ghData.repoName} با ${ghData.committedCount} فایل در گیت‌هاب با موفقیت ساخته و پوش شد!`
              : `Repository created with ${ghData.committedCount} files!`,
            "success",
            ghData.repoUrl,
            ghData.repoUrl
          );
        } else {
          log(lang === "fa" ? "خطا در پوش به گیت‌هاب" : "GitHub push failed", "error", ghData.error);
        }
      }

      // Step 2: Deploy Worker directly to Cloudflare
      if (credentials.cloudflareToken && credentials.cloudflareAccountId) {
        log(
          lang === "fa" ? "۲. کامپایل و استقرار ورکر روی شبکه ابری Cloudflare Workers" : "2. Deploying Worker to Cloudflare",
          "running"
        );

        const indexFile = files.find((f) => f.path === "src/index.ts");
        const workerScript = indexFile ? indexFile.content : "// MCP Worker";

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
        if (cfRes.ok && cfData.success) {
          workerUrl = cfData.workerUrl;
          setFinalDeployedUrl(workerUrl);
          log(
            lang === "fa"
              ? `ورکر با موفقیت مستقر شد! اندپوینت فعال سرور: ${cfData.workerUrl}`
              : `Worker deployed! Live endpoint: ${cfData.workerUrl}`,
            "success",
            cfData.workerUrl,
            cfData.workerUrl
          );
        } else {
          log(lang === "fa" ? "خطا در دیپلوی کلودفلر" : "Cloudflare deploy failed", "error", cfData.error);
        }
      }

      // Final celebration agent message
      if (workerUrl || repoUrl) {
        setMessages((prev) => [
          ...prev,
          {
            id: "done-" + Date.now(),
            sender: "agent",
            text:
              lang === "fa"
                ? `🎉 **تبریک! پروژه با موفقیت مستقر شد.**

🔗 **آدرس زنده سرور MCP برای وارد کردن در نرم‌افزار شما:**
\`${workerUrl || "https://mcp-bridge.your-subdomain.workers.dev/sse"}\`

${repoUrl ? `🐙 **مخزن گیت‌هاب ایجاد شده:** [${repoUrl}](${repoUrl})` : ""}

کانفیگ آماده برای کلاینت‌های MCP (مانند Claude Desktop، Cursor یا نرم‌افزار خودتان) در کادر زیر تولید شده است:`
                : `🎉 **Deployment Succeeded!** Live MCP Server URL: \`${workerUrl}\``,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (err: any) {
      log("Deployment Error", "error", err.message);
    } finally {
      setIsDeploying(false);
    }
  };

  const claudeConfigSnippet = finalDeployedUrl
    ? JSON.stringify(
        {
          mcpServers: {
            "shen-mcp-server": {
              command: "npx",
              args: ["-y", "mcp-remote-client", finalDeployedUrl],
            },
          },
        },
        null,
        2
      )
    : "";

  return (
    <div className="space-y-6" dir={lang === "fa" ? "rtl" : "ltr"}>
      {/* 4-Step Interactive Pipeline Progress Bar */}
      <div className="neu-convex rounded-2xl p-4 sm:p-5 border border-orange-500/20">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="text-orange-400 font-bold flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            <span>{lang === "fa" ? "مراحل گام‌به‌گام راه‌اندازی سرور MCP" : "Interactive Deployment Pipeline"}</span>
          </span>
          <span className="font-mono text-stone-400 text-[11px]">
            {lang === "fa" ? `مرحله ${currentStep} از ۴` : `Step ${currentStep} of 4`}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
          {/* Step 1 */}
          <div
            className={`p-3 rounded-xl transition ${
              currentStep >= 1 ? "neu-inset border-orange-500/40 text-orange-300" : "neu-flat text-stone-500"
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <span className="w-5 h-5 rounded-full bg-orange-600/30 text-orange-400 text-[11px] flex items-center justify-center border border-orange-500/40">
                1
              </span>
              <span>{lang === "fa" ? "انتخاب سناریو" : "Choose Scenario"}</span>
            </div>
            <p className="text-[10px] text-stone-400">
              {activePreset === "github"
                ? "پل گیت‌هاب (GitHub)"
                : activePreset === "ai_relay"
                ? "هوش مصنوعی (AI Relay)"
                : "سرویس تانل (Tunnel)"}
            </p>
          </div>

          {/* Step 2 */}
          <div
            onClick={onOpenCredentials}
            className={`p-3 rounded-xl cursor-pointer transition ${
              currentStep >= 2 ? "neu-inset border-orange-500/40 text-orange-300" : "neu-flat text-stone-500"
            }`}
          >
            <div className="flex items-center justify-between font-bold mb-1">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-orange-600/30 text-orange-400 text-[11px] flex items-center justify-center border border-orange-500/40">
                  2
                </span>
                <span>{lang === "fa" ? "ورود کلیدها و توکن‌ها" : "Credentials"}</span>
              </div>
              {credentials.githubToken && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </div>
            <p className="text-[10px] text-stone-400">
              {credentials.githubToken ? "گیت‌هاب متصل شد" : "کلیک برای ورود توکن‌ها"}
            </p>
          </div>

          {/* Step 3 */}
          <div
            onClick={() => onNavigateToTab("repo")}
            className={`p-3 rounded-xl cursor-pointer transition ${
              currentStep >= 3 ? "neu-inset border-orange-500/40 text-orange-300" : "neu-flat text-stone-500"
            }`}
          >
            <div className="flex items-center justify-between font-bold mb-1">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-orange-600/30 text-orange-400 text-[11px] flex items-center justify-center border border-orange-500/40">
                  3
                </span>
                <span>{lang === "fa" ? "فایل‌ها و ساختار" : "Generated Code"}</span>
              </div>
              <Code className="w-3.5 h-3.5 text-stone-400" />
            </div>
            <p className="text-[10px] text-stone-400">{files.length} فایل آماده استقرار</p>
          </div>

          {/* Step 4 */}
          <div
            className={`p-3 rounded-xl transition ${
              currentStep >= 4 ? "neu-inset border-emerald-500/40 text-emerald-300" : "neu-flat text-stone-500"
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-400 text-[11px] flex items-center justify-center border border-emerald-500/40">
                4
              </span>
              <span>{lang === "fa" ? "استقرار و تحویل آدرس" : "Live Server"}</span>
            </div>
            <p className="text-[10px] text-stone-400">
              {finalDeployedUrl ? "سرور آنلاین است" : "اجرای ۱-کلیک"}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Start Presets (نیازهای پیش‌فرض کاربر) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>{lang === "fa" ? "پروژه‌ها و نیازهای آماده (Quick Starts):" : "Pre-configured Scenarios:"}</span>
          </span>
          <span className="text-[11px] text-stone-500">
            {lang === "fa" ? "انتخاب سناریو ساختار را بلافاصله هماهنگ می‌کند" : "Click to auto-configure"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Preset 1: GitHub */}
          <div
            onClick={() => handlePresetClick("github")}
            className={`p-4 rounded-xl cursor-pointer transition relative flex flex-col justify-between ${
              activePreset === "github"
                ? "neu-inset border-orange-500/50 shadow-orange-500/10"
                : "neu-convex hover:border-orange-500/30"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-bold text-white text-xs">
                  <span className="w-6 h-6 rounded-lg bg-orange-600/30 text-orange-400 flex items-center justify-center border border-orange-500/30">
                    <GitBranch className="w-3.5 h-3.5" />
                  </span>
                  <span>{lang === "fa" ? "پل اختصاصی گیت‌هاب" : "GitHub MCP Bridge"}</span>
                </div>
                {activePreset === "github" && (
                  <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                    {lang === "fa" ? "انتخاب شده" : "Selected"}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                {lang === "fa"
                  ? "نرم‌افزار شما آدرس سرور MCP می‌خواهد تا به گیت‌هاب وصل شود؛ این ورکر با توکن گیت‌هاب کار می‌کند."
                  : "Connects software needing an MCP server to GitHub using your personal GITHUB_TOKEN."}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10px] font-mono text-orange-400">
              <span>۵ ابزار گیت‌هاب</span>
              <span>GITHUB_TOKEN</span>
            </div>
          </div>

          {/* Preset 2: AI Relay */}
          <div
            onClick={() => handlePresetClick("ai_relay")}
            className={`p-4 rounded-xl cursor-pointer transition relative flex flex-col justify-between ${
              activePreset === "ai_relay"
                ? "neu-inset border-orange-500/50 shadow-orange-500/10"
                : "neu-convex hover:border-orange-500/30"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-bold text-white text-xs">
                  <span className="w-6 h-6 rounded-lg bg-purple-600/30 text-purple-400 flex items-center justify-center border border-purple-500/30">
                    <BrainCircuit className="w-3.5 h-3.5" />
                  </span>
                  <span>{lang === "fa" ? "تبدیل مدل هوش مصنوعی" : "AI to MCP Relay"}</span>
                </div>
                {activePreset === "ai_relay" && (
                  <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                    {lang === "fa" ? "انتخاب شده" : "Selected"}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                {lang === "fa"
                  ? "مدل هوش مصنوعی فقط با API Token دارید؟ ورکر آن را در قالب سرور MCP ترجمه و تحویل می‌دهد."
                  : "Wraps any AI model/LLM with an API token into standard MCP tool endpoints."}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10px] font-mono text-purple-400">
              <span>۳ ابزار چت و ترجمه</span>
              <span>AI_API_KEY</span>
            </div>
          </div>

          {/* Preset 3: Tunnel */}
          <div
            onClick={() => handlePresetClick("internal_tunnel")}
            className={`p-4 rounded-xl cursor-pointer transition relative flex flex-col justify-between ${
              activePreset === "internal_tunnel"
                ? "neu-inset border-orange-500/50 shadow-orange-500/10"
                : "neu-convex hover:border-orange-500/30"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-bold text-white text-xs">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </span>
                  <span>{lang === "fa" ? "سرویس داخلی با تانل" : "Private Tunnel"}</span>
                </div>
                {activePreset === "internal_tunnel" && (
                  <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                    {lang === "fa" ? "انتخاب شده" : "Selected"}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                {lang === "fa"
                  ? "API محلی روی سرور یا لوکال هاست بدون پورت باز با تانل رایگان کلودفلر متصل می‌شود."
                  : "Bridges local APIs securely via Cloudflare Zero Trust tunnel with $0 cost."}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10px] font-mono text-emerald-400">
              <span>REST & GraphQL</span>
              <span>cloudflared ($0)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Conversational Agent Console (نقطه اتکای اصلی کاربر) */}
      <div className="neu-convex rounded-2xl border border-stone-800/90 shadow-2xl flex flex-col h-[650px] overflow-hidden">
        {/* Chat Console Top Bar */}
        <div className="p-4 border-b border-stone-800/80 bg-stone-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl neu-btn flex items-center justify-center text-orange-400 border border-orange-500/30 neu-orange-glow">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{lang === "fa" ? "گفتگوی زنده با ایجنت معمار SHΞN™" : "SHΞN™ Architect Agent"}</span>
                <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-mono border border-orange-500/30">
                  Online
                </span>
              </h3>
              <p className="text-[11px] text-stone-400">
                {lang === "fa"
                  ? "دریافت نیازمندی، ساخت ساختار و دیپلوی خودکار مرحله‌به‌مرحله"
                  : "Requirement synthesis, file generation & auto-deployment"}
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCredentials}
              className="px-3 py-1.5 rounded-xl neu-btn text-xs font-semibold text-stone-300 hover:text-white flex items-center gap-1.5 transition"
            >
              <Key className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden sm:inline">{lang === "fa" ? "تنظیم توکن‌ها" : "Tokens"}</span>
            </button>
            <button
              onClick={handleRunDeploy}
              disabled={isDeploying}
              className="px-3.5 py-1.5 rounded-xl neu-btn-primary text-xs font-bold text-white flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              {isDeploying ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>{lang === "fa" ? "در حال دیپلوی..." : "Deploying..."}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>{lang === "fa" ? "دیپلوی خودکار" : "Auto Deploy"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Chat Messages Stream */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 text-xs leading-relaxed">
          {messages.map((msg) => {
            const isAgent = msg.sender === "agent";
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isAgent ? "items-start" : "items-end"}`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[80%] p-4 rounded-2xl whitespace-pre-wrap ${
                    isAgent
                      ? "neu-inset text-stone-200 rounded-bl-xs border border-stone-800/80"
                      : "neu-btn-primary text-white rounded-br-xs font-medium shadow-md"
                  }`}
                >
                  {msg.text}

                  {/* Inline Quick Actions suggested by Agent */}
                  {msg.quickActions && msg.quickActions.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-stone-800/70 flex flex-wrap gap-2">
                      {msg.quickActions.map((qa, i) => (
                        <button
                          key={i}
                          onClick={qa.action}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                            qa.primary
                              ? "neu-btn-primary text-white shadow-sm"
                              : "neu-btn text-stone-300 hover:text-white"
                          }`}
                        >
                          {qa.icon}
                          <span>{qa.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-stone-500 mt-1 px-1">{msg.timestamp}</span>
              </div>
            );
          })}

          {/* Realtime deployment steps logs */}
          {deploySteps.length > 0 && (
            <div className="p-4 neu-inset rounded-2xl border border-orange-500/30 space-y-2.5">
              <div className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                <RotateCcw className={`w-3.5 h-3.5 ${isDeploying ? "animate-spin" : ""}`} />
                <span>{lang === "fa" ? "گزارش اجرای عملیات استقرار خودکار:" : "Deployment Progress:"}</span>
              </div>

              <div className="space-y-2 text-xs">
                {deploySteps.map((step) => (
                  <div
                    key={step.id}
                    className={`p-2.5 rounded-xl flex items-center justify-between gap-2 ${
                      step.status === "success"
                        ? "bg-emerald-950/40 border border-emerald-500/30 text-emerald-300"
                        : step.status === "error"
                        ? "bg-red-950/40 border border-red-500/30 text-red-300"
                        : "bg-orange-950/40 border border-orange-500/30 text-orange-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {step.status === "success" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : step.status === "error" ? (
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      ) : (
                        <RotateCcw className="w-4 h-4 animate-spin text-orange-400 shrink-0" />
                      )}
                      <div>
                        <span className="font-semibold">{step.title}</span>
                        {step.details && <p className="text-[10px] opacity-80">{step.details}</p>}
                      </div>
                    </div>

                    {step.url && (
                      <a
                        href={step.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-orange-400 hover:underline inline-flex items-center gap-1 font-mono text-[10px]"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deployed Result Live Card */}
          {finalDeployedUrl && (
            <div className="p-4 neu-convex rounded-2xl border border-emerald-500/40 text-stone-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{lang === "fa" ? "کانفیگ آماده Claude Desktop و کلاینت‌ها:" : "Client MCP Config:"}</span>
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(claudeConfigSnippet);
                    setCopiedConfig(true);
                    setTimeout(() => setCopiedConfig(false), 2000);
                  }}
                  className="neu-btn px-2.5 py-1 rounded-lg text-[11px] text-stone-300 hover:text-white flex items-center gap-1"
                >
                  {copiedConfig ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedConfig ? (lang === "fa" ? "کپی شد" : "Copied") : (lang === "fa" ? "کپی کانفیگ" : "Copy")}</span>
                </button>
              </div>

              <pre className="p-3 bg-stone-950/90 rounded-xl text-emerald-300 font-mono text-[11px] overflow-x-auto border border-stone-800">
                {claudeConfigSnippet}
              </pre>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-orange-400 text-xs py-2">
              <RotateCcw className="w-4 h-4 animate-spin" />
              <span>{lang === "fa" ? "معمار در حال تحلیل و پاسخ..." : "Agent thinking..."}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 border-t border-stone-800/80 bg-stone-950/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                lang === "fa"
                  ? "با ایجنت صحبت کنید (مثلاً: می‌خواهم یک ورکر برای اتصال گیت‌هاب با توکن بسازی)..."
                  : "Talk with the agent (e.g. create worker to connect my GitHub with token)..."
              }
              className="flex-1 px-4 py-2.5 rounded-xl neu-inset text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="p-2.5 rounded-xl neu-btn-primary text-white shadow-md disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
