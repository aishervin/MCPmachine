import React, { useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  PlusCircle,
  FileCode,
  ArrowRight,
  RefreshCw,
  Cpu,
  Layers,
  KeyRound,
  ExternalLink,
  GitBranch,
  BrainCircuit,
  CheckCircle2,
} from "lucide-react";
import { McpToolDefinition, CloudflareTunnelConfig, ChatMessage, ArchitecturePreset } from "../types";

interface DiscoveryArchitectProps {
  tools: McpToolDefinition[];
  onAddTool: (tool: McpToolDefinition) => void;
  tunnelConfig: CloudflareTunnelConfig;
  onUpdateTunnel: (tunnel: CloudflareTunnelConfig) => void;
  onNavigateToTab: (tab: string) => void;
  activePreset: ArchitecturePreset;
  onSelectPreset: (preset: ArchitecturePreset) => void;
  lang: "fa" | "en";
}

export const DiscoveryArchitect: React.FC<DiscoveryArchitectProps> = ({
  tools,
  onAddTool,
  tunnelConfig,
  onUpdateTunnel,
  onNavigateToTab,
  activePreset,
  onSelectPreset,
  lang,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init-1",
      role: "assistant",
      content:
        lang === "fa"
          ? `درود! من **معمار ارشد ابری و یکپارچه‌سازی (Senior Cloud & Integration Architect)** هستم.

هدف ما راه‌اندازی پل ارتباطی سرورلس بر بستر Cloudflare Worker است که دقیقاً برای دو کاربرد کلیدی شما طراحی شده است:

1. **اتصال گیت‌هاب به عنوان سرور MCP (GitHub API Bridge)**:
نرم‌افزار شما آدرس یک سرور MCP را می‌خواهد تا بتواند به گیت‌هاب وصل شود. با این ورکر، کلودفلر نقش سرور MCP اختصاصی شما را بازی می‌کند و توکن امنیتی شما (\`GITHUB_TOKEN\`) را روی لبه سرورلس کلودفلر نگه می‌دارد و ابزارهایی مثل ایجاد Issue، خواندن فایل‌ها، بررسی کدهای ریپازیتوری و جستجو را در اختیار نرم‌افزار می‌گذارد.

2. **تبدیل هوش مصنوعی فقط با API Token به سرور MCP (AI / LLM Relay)**:
سرویس یا مدلی دارید که فقط ای‌پی‌آی توکن دارد، اما نرم‌افزار یا ایجنت شما به سرور MCP نیاز دارد. این ورکر توکن شما (\`AI_API_KEY\`) را در پس‌زمینه تزریق کرده و اندپوینت‌های تولید متن و چت را به ابزارهای استاندارد MCP تبدیل می‌کند.

3. **اتصال سرویس‌های محلی و خصوصی (Zero Trust Tunnel)**:
اتصال به REST و GraphQL محلی بدون پورت پابلیک یا آی‌پی ثابت.

یکی از سناریوهای بالا را در پنل زیر انتخاب کنید یا جزئیات درخواست خود را در چت بنویسید تا کدها برایتان شخصی‌سازی شوند.`
          : `Greetings! I am your **Senior Cloud & Integration Architect**.

Our mission is to establish a serverless Cloudflare Worker bridge specifically engineered for your core scenarios:

1. **GitHub API to MCP Server Bridge**:
Your software requires an MCP Server address to interact with GitHub. The Cloudflare Worker acts as your personal MCP Server, storing your \`GITHUB_TOKEN\` securely on Cloudflare Edge and exposing native tools for repository inspection, file reading, issue creation, and code search.

2. **AI / LLM API Token to MCP Relay**:
You have an AI model or custom LLM that only accepts an API token via REST. The Worker bridges it, injecting \`AI_API_KEY\` and translating chat/completion endpoints into standard MCP tools.

3. **Internal Zero Trust Tunnel**:
Connecting proprietary local or private REST/GraphQL APIs with $0 cost and no public open ports.

Select a preset above or chat below to customize your tools.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Quick converter state
  const [showConverter, setShowConverter] = useState(false);
  const [rawApiInput, setRawApiInput] = useState(`curl -X POST https://api.github.com/repos/owner/repo/issues \\
  -H "Authorization: Bearer YOUR_GITHUB_TOKEN" \\
  -H "Accept: application/vnd.github.v3+json" \\
  -d '{"title": "Bug found", "body": "Details here"}'`);
  const [converting, setConverting] = useState(false);
  const [conversionResult, setConversionResult] = useState<any>(null);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      role: "user",
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/architect/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          currentTools: tools,
          tunnelConfig,
          activePreset,
        }),
      });

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: "msg-res-" + Date.now(),
        role: "assistant",
        content: data.text || "No response received.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "assistant",
          content: `Error communicating with architect: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickConvert = async () => {
    if (!rawApiInput.trim()) return;
    setConverting(true);
    setConversionResult(null);

    try {
      const res = await fetch("/api/architect/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiType: "cURL / REST / OpenAPI / GraphQL",
          rawInput: rawApiInput,
          serviceName: activePreset === "github" ? "GitHub API" : "Custom Service",
        }),
      });

      const data = await res.json();
      setConversionResult(data);
    } catch (err: any) {
      alert(`Conversion error: ${err.message}`);
    } finally {
      setConverting(false);
    }
  };

  const handleAddConvertedTool = (toolData: any) => {
    const newTool: McpToolDefinition = {
      id: "tool-gen-" + Date.now(),
      name: toolData.name || "custom_generated_tool",
      description: toolData.description || "Generated MCP Tool",
      method: toolData.method || "POST",
      endpoint: toolData.endpoint || "/api/custom",
      targetBaseUrl: toolData.endpoint?.startsWith("http") ? undefined : (activePreset === "github" ? "https://api.github.com" : undefined),
      authSecretName: activePreset === "github" ? "GITHUB_TOKEN" : (activePreset === "ai_relay" ? "AI_API_KEY" : "TARGET_API_KEY"),
      headers: toolData.headers || { "Content-Type": "application/json" },
      parameters: toolData.parameters || { type: "object", properties: {} },
      graphqlQuery: toolData.graphqlQuery,
      mockResponse: {
        status: "success",
        simulated: true,
        message: `Successfully executed ${toolData.name}`,
      },
    };
    onAddTool(newTool);
  };

  return (
    <div className="space-y-6">
      {/* 3 Core Architecture Presets Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-600" />
            <span>
              {lang === "fa"
                ? "انتخاب سناریوی پل ارتباطی ورکر (Preset Scenarios)"
                : "Select Worker Bridge Scenario"}
            </span>
          </h2>
          <span className="text-xs text-stone-500">
            {lang === "fa" ? "با انتخاب هر گزینه، کدهای ریپازیتوری و ابزارها هماهنگ می‌شوند." : "Clicking a preset reconfigures worker code and tools."}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Preset 1: GitHub Bridge */}
          <div
            onClick={() => onSelectPreset("github")}
            className={`p-4 rounded-xl border-2 cursor-pointer transition relative flex flex-col justify-between ${
              activePreset === "github"
                ? "bg-orange-50/60 border-orange-500 shadow-sm"
                : "bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/50"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                  <span className="w-7 h-7 rounded-lg bg-stone-900 text-white flex items-center justify-center">
                    <GitBranch className="w-4 h-4" />
                  </span>
                  <span>{lang === "fa" ? "پل اختصاصی گیت‌هاب" : "GitHub API Bridge"}</span>
                </div>
                {activePreset === "github" && (
                  <span className="text-orange-600 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{lang === "fa" ? "فعال" : "Active"}</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-stone-600 leading-relaxed mb-3">
                {lang === "fa"
                  ? "نرم‌افزار شما فقط ورودی سرور MCP قبول می‌کند؟ این ورکر آدرس سرور MCP را ارائه کرده و با توکن GITHUB_TOKEN به گیت‌هاب متصل می‌شود."
                  : "Provides an MCP Server URL for software needing GitHub access via GITHUB_TOKEN (Issues, Files, Commits)."}
              </p>
            </div>

            <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500">
              <span className="font-mono text-stone-700 font-semibold">5 ابزار آماده</span>
              <span className="text-orange-700 font-medium">GITHUB_TOKEN</span>
            </div>
          </div>

          {/* Preset 2: AI / LLM Model to MCP Relay */}
          <div
            onClick={() => onSelectPreset("ai_relay")}
            className={`p-4 rounded-xl border-2 cursor-pointer transition relative flex flex-col justify-between ${
              activePreset === "ai_relay"
                ? "bg-orange-50/60 border-orange-500 shadow-sm"
                : "bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/50"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                  <span className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                    <BrainCircuit className="w-4 h-4" />
                  </span>
                  <span>{lang === "fa" ? "تبدیل هوش مصنوعی به MCP" : "AI Model to MCP Relay"}</span>
                </div>
                {activePreset === "ai_relay" && (
                  <span className="text-orange-600 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{lang === "fa" ? "فعال" : "Active"}</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-stone-600 leading-relaxed mb-3">
                {lang === "fa"
                  ? "مدل هوش مصنوعی دارید که فقط با API Token سرویس می‌دهد؟ این ورکر آن را به عنوان ابزار در قالب سرور MCP ترجمه می‌کند."
                  : "Wraps any AI service with an API key into an MCP tool, injecting AI_API_KEY securely on the edge."}
              </p>
            </div>

            <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500">
              <span className="font-mono text-stone-700 font-semibold">3 ابزار چت/کد</span>
              <span className="text-purple-700 font-medium">AI_API_KEY</span>
            </div>
          </div>

          {/* Preset 3: Zero Trust Tunnel */}
          <div
            onClick={() => onSelectPreset("internal_tunnel")}
            className={`p-4 rounded-xl border-2 cursor-pointer transition relative flex flex-col justify-between ${
              activePreset === "internal_tunnel"
                ? "bg-orange-50/60 border-orange-500 shadow-sm"
                : "bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/50"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                  <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <span>{lang === "fa" ? "API داخلی با تانل کلودفلر" : "Internal Zero-Trust Tunnel"}</span>
                </div>
                {activePreset === "internal_tunnel" && (
                  <span className="text-orange-600 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{lang === "fa" ? "فعال" : "Active"}</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-stone-600 leading-relaxed mb-3">
                {lang === "fa"
                  ? "سرویس‌های REST یا GraphQL لوکال سرور بدون آی‌پی پابلیک با دیمن رایگان cloudflared به ورکر متصل می‌شوند."
                  : "Bridges private localhost/on-prem REST and GraphQL endpoints via Cloudflare Zero Trust tunnel."}
              </p>
            </div>

            <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500">
              <span className="font-mono text-stone-700 font-semibold">CRM & GraphQL</span>
              <span className="text-emerald-700 font-medium">cloudflared ($0)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split: Architect Chat (Left) & Quick Tool Synthesizer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chat / Discovery Console (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-stone-200 shadow-xs flex flex-col h-[600px]">
          {/* Header */}
          <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  {lang === "fa" ? "مشاوره معمار ارشد کلودفلر و MCP" : "Senior Architect Consultation"}
                </h3>
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Gemini 3.8 Flash • Serverless MCP Specialist</span>
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateToTab("autodeploy")}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold transition flex items-center gap-1 shadow-2xs"
              >
                <Sparkles className="w-3 h-3" />
                <span>{lang === "fa" ? "دیپلوی خودکار با توکن‌ها" : "1-Click Auto Deploy"}</span>
              </button>
              <button
                onClick={() => {
                  const prompt =
                    lang === "fa"
                      ? "من می‌خواهم یک ورکر در کلودفلر داشته باشم که نرم‌افزارم به عنوان سرور MCP به آن وصل شود و از طریق توکن اختصاصی گیت‌هاب، فایل‌های ریپازیتوری را بخواند و Issue بسازد. مراحل را بگو."
                      : "I need my Cloudflare Worker to act as a personal MCP Server for GitHub using my Personal Access Token. Explain the exact flow.";
                  setInputMessage(prompt);
                }}
                className="text-[11px] px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition"
              >
                {lang === "fa" ? "نمونه سوال" : "Sample Prompt"}
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs leading-relaxed">
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[90%] p-3 rounded-xl whitespace-pre-wrap ${
                      isUser
                        ? "bg-orange-600 text-white rounded-br-xs"
                        : "bg-stone-100 text-stone-800 rounded-bl-xs border border-stone-200/80"
                    }`}
                  >
                    {m.content}
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1 px-1">{m.timestamp}</span>
                </div>
              );
            })}
            {loading && (
              <div className="flex items-center gap-2 text-stone-500 text-xs py-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-600" />
                <span>{lang === "fa" ? "در حال تدوین پاسخ تخصصی..." : "Architect is thinking..."}</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-stone-200 bg-white">
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
                    ? "پرسش یا مشخصات API خود را بنویسید (مثلاً: چطور گیت‌هاب را با توکن متصل کنم؟)..."
                    : "Ask the architect or specify endpoints to translate..."
                }
                className="flex-1 px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-stone-50/50"
              />
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="p-2 rounded-lg bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white transition disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Quick Tool Synthesizer & Converter (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span>{lang === "fa" ? "تبدیل فوری cURL یا API به ابزار MCP" : "cURL to MCP Converter"}</span>
              </h3>
              <span className="text-[11px] text-stone-400 font-mono">AI Parser</span>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              {lang === "fa"
                ? "دستور cURL، داکیومنت یا درخواست نمونه API خود را وارد کنید تا هوش مصنوعی بلافاصله آن را به اسکیمای JSON Schema و ابزار آماده در ورکر تبدیل کند:"
                : "Paste your cURL or OpenAPI snippet. The architect will convert it to valid MCP tool schemas."}
            </p>

            <textarea
              rows={6}
              value={rawApiInput}
              onChange={(e) => setRawApiInput(e.target.value)}
              placeholder="curl -X POST https://api.github.com/..."
              className="w-full text-xs font-mono p-3 rounded-lg border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 leading-relaxed"
            />

            <button
              type="button"
              onClick={handleQuickConvert}
              disabled={converting || !rawApiInput.trim()}
              className="w-full py-2.5 px-4 rounded-lg bg-stone-900 hover:bg-stone-800 active:bg-black text-white text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {converting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-400" />
                  <span>{lang === "fa" ? "در حال تبدیل به اسکیمای MCP..." : "Translating..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  <span>{lang === "fa" ? "تبدیل به ابزار MCP (Translate to Tool)" : "Convert to MCP Tool"}</span>
                </>
              )}
            </button>
          </div>

          {/* Result of conversion */}
          {conversionResult && (
            <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-800">
                  {lang === "fa" ? "ابزارهای تولید شده:" : "Generated Tools:"}
                </span>
                <span className="text-emerald-600 text-[11px] font-semibold">Valid Schema</span>
              </div>

              {conversionResult.tools?.map((t: any, idx: number) => (
                <div key={idx} className="p-2 bg-white rounded border border-stone-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-stone-900 text-xs">{t.name}</span>
                    <button
                      onClick={() => handleAddConvertedTool(t)}
                      className="inline-flex items-center gap-1 text-[11px] text-orange-600 hover:text-orange-700 font-bold"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>{lang === "fa" ? "افزودن به ورکر" : "Add to Worker"}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-600">{t.description}</p>
                  <div className="text-[10px] text-stone-400 font-mono">
                    {t.method} {t.endpoint}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Link to View Full Repo */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="text-stone-500">
              {tools.length} {lang === "fa" ? "ابزار فعال در این مخزن" : "tools active in repo"}
            </span>
            <button
              onClick={() => onNavigateToTab("repo")}
              className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-semibold"
            >
              <span>{lang === "fa" ? "مشاهده کدهای ورکر" : "Inspect Code"}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
