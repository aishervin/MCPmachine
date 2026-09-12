import React from "react";
import {
  GitBranch,
  Cloud,
  Shield,
  Key,
  ExternalLink,
  CheckCircle2,
  Terminal,
  Cpu,
  Layers,
  ArrowRight,
  Copy,
  Check,
} from "lucide-react";

interface DeploymentGuideProps {
  lang: "fa" | "en";
  tunnelHostname: string;
}

export const DeploymentGuide: React.FC<DeploymentGuideProps> = ({
  lang,
  tunnelHostname,
}) => {
  const [copiedSection, setCopiedSection] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const claudeConfigSnippet = `{
  "mcpServers": {
    "cloudflare-api-bridge": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote-client",
        "https://mcp-api-bridge-worker.YOUR_SUBDOMAIN.workers.dev/sse"
      ]
    }
  }
}`;

  return (
    <div className="space-y-6">
      {/* Visual Architecture Diagram */}
      <div className="bg-stone-900 text-stone-100 p-6 rounded-xl border border-stone-800 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-orange-400 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>
              {lang === "fa"
                ? "نمودار معماری بدون هزینه کلودفلر (Zero-Cost Architecture)"
                : "Zero-Cost Cloudflare & MCP Architecture"}
            </span>
          </h2>
          <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-full font-mono">
            $0 / month (Free Tier Compliant)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3.5 bg-stone-950 rounded-lg border border-stone-800 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold">
              <Cpu className="w-4 h-4" />
              <span>1. LLM Agent</span>
            </div>
            <p className="text-stone-400 text-[11px]">Claude Desktop / Cursor / LangChain / Gemini</p>
            <div className="text-[10px] bg-stone-900 p-1.5 rounded text-blue-300">
              Protocol: MCP over SSE
            </div>
          </div>

          <div className="p-3.5 bg-stone-950 rounded-lg border border-orange-800/60 space-y-2">
            <div className="flex items-center gap-2 text-orange-400 font-bold">
              <Cloud className="w-4 h-4" />
              <span>2. Cloudflare Worker</span>
            </div>
            <p className="text-stone-400 text-[11px]">Serverless Edge / V8 Isolate (100k req/day free)</p>
            <div className="text-[10px] bg-stone-900 p-1.5 rounded text-orange-300">
              Endpoints: /sse & /message
            </div>
          </div>

          <div className="p-3.5 bg-stone-950 rounded-lg border border-emerald-800/60 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Shield className="w-4 h-4" />
              <span>3. Cloudflare Tunnel</span>
            </div>
            <p className="text-stone-400 text-[11px]">Zero Trust Daemon (cloudflared, no open ports)</p>
            <div className="text-[10px] bg-stone-900 p-1.5 rounded text-emerald-300">
              Auth: CF-Access Token
            </div>
          </div>

          <div className="p-3.5 bg-stone-950 rounded-lg border border-stone-800 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold">
              <Terminal className="w-4 h-4" />
              <span>4. Target API</span>
            </div>
            <p className="text-stone-400 text-[11px]">Local/Private REST or GraphQL service</p>
            <div className="text-[10px] bg-stone-900 p-1.5 rounded text-purple-300">
              http://localhost:8080
            </div>
          </div>
        </div>
      </div>

      {/* 4 Step Deployment Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1: Connect to Git */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center">
              1
            </span>
            <h3 className="text-sm font-bold text-stone-900">
              {lang === "fa" ? "اتصال گیت‌هاب در داشبورد کلودفلر" : "Connect GitHub in Cloudflare Dashboard"}
            </h3>
          </div>

          <ol className="text-xs text-stone-600 space-y-2 list-decimal list-inside leading-relaxed">
            <li>
              {lang === "fa" ? (
                <>فایل‌های دانلودی را در یک ریپازیتوری جدید در گیت‌هاب پوش کنید.</>
              ) : (
                <>Push the downloaded repository files to a new GitHub repository.</>
              )}
            </li>
            <li>
              {lang === "fa" ? (
                <>
                  به داشبورد کلودفلر در{" "}
                  <a
                    href="https://dash.cloudflare.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-orange-600 underline font-medium"
                  >
                    dash.cloudflare.com
                  </a>{" "}
                  بروید.
                </>
              ) : (
                <>
                  Log into Cloudflare Dashboard at{" "}
                  <a
                    href="https://dash.cloudflare.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-orange-600 underline font-medium"
                  >
                    dash.cloudflare.com
                  </a>
                  .
                </>
              )}
            </li>
            <li>
              {lang === "fa" ? (
                <>
                  از منوی چپ به مسیر <strong>Compute (Workers) &gt; Workers &amp; Pages</strong> بروید.
                </>
              ) : (
                <>
                  Navigate to <strong>Compute (Workers) &gt; Workers &amp; Pages</strong>.
                </>
              )}
            </li>
            <li>
              {lang === "fa" ? (
                <>
                  روی دکمه آبی <strong>Create Application</strong> کلیک کرده، تب{" "}
                  <strong>Workers</strong> را باز کنید و گزینه <strong>Connect to Git</strong> را انتخاب نمایید.
                </>
              ) : (
                <>
                  Click <strong>Create Application</strong>, select the <strong>Workers</strong> tab, then click <strong>Connect to Git</strong>.
                </>
              )}
            </li>
            <li>
              {lang === "fa" ? (
                <>اکانت گیت‌هاب و ریپازیتوری را انتخاب کرده و روی <strong>Save and Deploy</strong> کلیک کنید.</>
              ) : (
                <>Select your GitHub account and repository, and click <strong>Save and Deploy</strong>.</>
              )}
            </li>
          </ol>
        </div>

        {/* Step 2: Environment Secrets */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center">
              2
            </span>
            <h3 className="text-sm font-bold text-stone-900">
              {lang === "fa" ? "تنظیم متغیرها و رمزها (Secrets)" : "Configure Environment Secrets"}
            </h3>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            {lang === "fa"
              ? "در صفحه ورکر در داشبورد کلودفلر به بخش Settings > Variables and Secrets بروید و مقادیر زیر را اضافه کنید:"
              : "In your Worker settings on Cloudflare Dashboard, go to Settings > Variables and Secrets and add:"}
          </p>

          <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 text-xs font-mono space-y-1.5 text-stone-700">
            <div>
              <span className="text-orange-700 font-bold">GITHUB_TOKEN</span>:{" "}
              <span className="text-stone-500">Personal Access Token (ghp_...) for GitHub Bridge</span>
            </div>
            <div>
              <span className="text-purple-700 font-bold">AI_API_KEY</span>:{" "}
              <span className="text-stone-500">API token for AI / LLM model relay</span>
            </div>
            <div>
              <span className="text-emerald-700 font-bold">CF_ACCESS_CLIENT_ID</span>:{" "}
              <span className="text-stone-500">Zero-Trust Service token client ID (if using tunnel)</span>
            </div>
            <div>
              <span className="text-emerald-700 font-bold">CF_ACCESS_CLIENT_SECRET</span>:{" "}
              <span className="text-stone-500">Zero-Trust Service token secret (if using tunnel)</span>
            </div>
            <div>
              <span className="text-stone-700 font-bold">MCP_SHARED_SECRET</span>:{" "}
              <span className="text-stone-500">Optional auth header (x-mcp-secret) for client protection</span>
            </div>
          </div>
        </div>

        {/* Step 3: Run Cloudflare Tunnel */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center">
              3
            </span>
            <h3 className="text-sm font-bold text-stone-900">
              {lang === "fa" ? "راه‌اندازی تانل رایگان روی سرور" : "Launch Free Cloudflare Tunnel"}
            </h3>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            {lang === "fa"
              ? "تانل کلودفلر بدون نیاز به آی‌پی پابلیک، سرور داخلی شما را به شبکه امن کلودفلر وصل می‌کند:"
              : "Cloudflare Tunnel securely bridges your local API to Cloudflare's edge with no port-forwarding:"}
          </p>

          <div className="p-3 bg-stone-900 text-stone-200 rounded-lg text-xs font-mono space-y-2">
            <div className="text-stone-400"># Run with Docker (fastest):</div>
            <div className="text-emerald-400">cd tunnel && docker compose up -d</div>
            <div className="text-stone-400 mt-2"># Or using cloudflared CLI:</div>
            <div className="text-emerald-400">cloudflared tunnel run --token YOUR_TOKEN</div>
          </div>
        </div>

        {/* Step 4: Connect LLM Agent */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center">
                4
              </span>
              <h3 className="text-sm font-bold text-stone-900">
                {lang === "fa" ? "اتصال Claude Desktop / Cursor" : "Connect LLM Agent (Claude Desktop)"}
              </h3>
            </div>

            <button
              onClick={() => copyToClipboard(claudeConfigSnippet, "claude")}
              className="text-stone-400 hover:text-stone-600 p-1 text-xs inline-flex items-center gap-1"
            >
              {copiedSection === "claude" ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <p className="text-xs text-stone-600">
            {lang === "fa"
              ? "این تنظیمات را در فایل `claude_desktop_config.json` قرار دهید:"
              : "Paste this into your `claude_desktop_config.json` configuration file:"}
          </p>

          <pre className="p-3 bg-stone-900 text-emerald-400 rounded-lg text-xs font-mono overflow-x-auto max-h-40">
            {claudeConfigSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
};
