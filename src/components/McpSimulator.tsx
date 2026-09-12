import React, { useState } from "react";
import {
  Play,
  RotateCcw,
  Terminal,
  Layers,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowDownRight,
  Radio,
} from "lucide-react";
import { McpToolDefinition, ProtocolLogEntry } from "../types";

interface McpSimulatorProps {
  tools: McpToolDefinition[];
  lang: "fa" | "en";
}

export const McpSimulator: React.FC<McpSimulatorProps> = ({ tools, lang }) => {
  const [sessionId, setSessionId] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [logs, setLogs] = useState<ProtocolLogEntry[]>([]);
  const [selectedToolName, setSelectedToolName] = useState<string>(tools[0]?.name || "");
  const [toolArgsJson, setToolArgsJson] = useState<string>(
    JSON.stringify({ repo: "my-org/project-repo", title: "Bug report via MCP" }, null, 2)
  );
  const [executing, setExecuting] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const addLog = (
    direction: ProtocolLogEntry["direction"],
    type: ProtocolLogEntry["type"],
    data: any
  ) => {
    const newEntry: ProtocolLogEntry = {
      id: "log-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      direction,
      type,
      data,
    };
    setLogs((prev) => [newEntry, ...prev]);
  };

  const handleConnectSse = () => {
    const newSession = crypto.randomUUID();
    setSessionId(newSession);
    setIsConnected(true);

    addLog("client->worker", "sse_event", {
      action: "GET /sse",
      headers: { Accept: "text/event-stream" },
    });

    setTimeout(() => {
      addLog("worker->client", "sse_event", {
        event: "endpoint",
        data: `https://mcp-bridge.your-subdomain.workers.dev/message?sessionId=${newSession}`,
      });
    }, 400);
  };

  const handleToolsList = () => {
    if (!isConnected) return;

    addLog("client->worker", "jsonrpc_req", {
      jsonrpc: "2.0",
      id: "req-list-1",
      method: "tools/list",
      params: {},
    });

    setTimeout(() => {
      addLog("worker->client", "jsonrpc_res", {
        jsonrpc: "2.0",
        id: "req-list-1",
        result: {
          tools: tools.map((t) => ({
            name: t.name,
            description: t.description,
            inputSchema: t.parameters,
          })),
        },
      });
    }, 350);
  };

  const handleToolChange = (name: string) => {
    setSelectedToolName(name);
    const targetTool = tools.find((t) => t.name === name);
    if (targetTool) {
      const sampleArgs: Record<string, any> = {};
      Object.keys(targetTool.parameters.properties || {}).forEach((prop) => {
        sampleArgs[prop] =
          targetTool.parameters.properties[prop].type === "number"
            ? 100
            : targetTool.parameters.properties[prop].type === "boolean"
            ? true
            : "sample_value";
      });
      setToolArgsJson(JSON.stringify(sampleArgs, null, 2));
    }
  };

  const handleExecuteToolCall = () => {
    if (!isConnected) return;

    let parsedArgs = {};
    try {
      parsedArgs = JSON.parse(toolArgsJson);
    } catch {
      alert("Invalid JSON format in tool arguments");
      return;
    }

    const reqId = "req-call-" + Math.floor(Math.random() * 1000);
    setExecuting(true);

    addLog("client->worker", "jsonrpc_req", {
      jsonrpc: "2.0",
      id: reqId,
      method: "tools/call",
      params: {
        name: selectedToolName,
        arguments: parsedArgs,
      },
    });

    setTimeout(() => {
      const simulatedResponse = {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                status: "success",
                toolExecuted: selectedToolName,
                edgeDurationMs: 38,
                injectedAuth: "Bearer [SECURE_EDGE_TOKEN]",
                returnedData: {
                  id: "obj_" + Math.random().toString(36).substr(2, 6),
                  echoArgs: parsedArgs,
                  timestamp: new Date().toISOString(),
                },
              },
              null,
              2
            ),
          },
        ],
        isError: false,
      };

      setLastResult(simulatedResponse);
      addLog("worker->client", "jsonrpc_res", {
        jsonrpc: "2.0",
        id: reqId,
        result: simulatedResponse,
      });
      setExecuting(false);
    }, 700);
  };

  return (
    <div className="space-y-6" dir={lang === "fa" ? "rtl" : "ltr"}>
      {/* Overview & Session Connection Bar */}
      <div className="neu-convex p-4 sm:p-5 rounded-2xl border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-orange-500" />
            <span>
              {lang === "fa"
                ? "شبیه‌ساز و تست زنده پروتکل MCP (Live Protocol Inspector)"
                : "Live MCP Protocol Inspector & Simulator"}
            </span>
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            {lang === "fa"
              ? "آزمایش تعاملات JSON-RPC 2.0 و رویدادهای SSE بین کلاینت MCP (مانند Claude Desktop) و ورکر کلودفلر."
              : "Test JSON-RPC 2.0 protocol interactions and SSE frames with the Cloudflare Worker in real-time."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isConnected ? (
            <button
              onClick={handleConnectSse}
              className="neu-btn-primary px-4 py-2 rounded-xl text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{lang === "fa" ? "اتصال به استریم SSE (/sse)" : "Connect SSE (/sse)"}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Session Active</span>
              </span>
              <button
                onClick={handleToolsList}
                className="neu-btn px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-300 hover:text-white"
              >
                tools/list
              </button>
              <button
                onClick={() => {
                  setIsConnected(false);
                  setLogs([]);
                  setLastResult(null);
                }}
                className="neu-btn p-2 rounded-xl text-stone-400 hover:text-white"
                title="Reset session"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Simulator Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Tool Execution Panel (5 cols) */}
        <div className="lg:col-span-5 neu-flat rounded-2xl border border-stone-800 p-5 space-y-4">
          <h3 className="text-xs font-bold text-white border-b border-stone-800/80 pb-2">
            {lang === "fa" ? "فراخوانی متد tools/call" : "Execute tools/call"}
          </h3>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              {lang === "fa" ? "انتخاب ابزار MCP" : "Select Tool"}
            </label>
            <select
              value={selectedToolName}
              onChange={(e) => handleToolChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl neu-inset font-mono text-xs text-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              {tools.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name} ({t.method} {t.endpoint})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-stone-300">
                {lang === "fa" ? "آرگومان‌های ورودی (JSON Arguments)" : "Input Arguments (JSON)"}
              </label>
              <span className="text-[10px] text-stone-500 font-mono">params.arguments</span>
            </div>
            <textarea
              rows={5}
              value={toolArgsJson}
              onChange={(e) => setToolArgsJson(e.target.value)}
              className="w-full font-mono text-xs p-3 rounded-xl neu-inset text-stone-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <button
            onClick={handleExecuteToolCall}
            disabled={executing || !isConnected}
            className="w-full py-2.5 px-4 rounded-xl neu-btn-primary text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {executing
                ? lang === "fa"
                  ? "در حال ارسال به لبه کلودفلر..."
                  : "Dispatching..."
                : lang === "fa"
                ? "اجرای ابزار (Send tools/call)"
                : "Call Tool (JSON-RPC)"}
            </span>
          </button>

          {!isConnected && (
            <p className="text-[11px] text-orange-400 text-center">
              {lang === "fa"
                ? "⚠️ ابتدا روی «اتصال به استریم SSE» در بالا کلیک کنید."
                : "⚠️ Click 'Connect SSE' above to initiate session."}
            </p>
          )}

          {/* Last Result Card */}
          {lastResult && (
            <div className="pt-2 border-t border-stone-800/80 space-y-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{lang === "fa" ? "نتیجه دریافتی از ورکر:" : "Response Result:"}</span>
              </span>
              <pre className="p-3 neu-inset text-emerald-300 rounded-xl text-xs font-mono overflow-x-auto max-h-56">
                {JSON.stringify(lastResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Protocol Inspector Console (7 cols) */}
        <div className="lg:col-span-7 neu-convex rounded-2xl border border-stone-800 flex flex-col overflow-hidden">
          <div className="bg-stone-950/80 px-4 py-3 border-b border-stone-800 flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-orange-500" />
              <span>{lang === "fa" ? "کنسول فریم‌های پروتکل (SSE & JSON-RPC)" : "Protocol Frames Log"}</span>
            </span>
            <span className="text-[10px] text-stone-500 font-mono">{logs.length} events</span>
          </div>

          <div className="p-4 overflow-y-auto max-h-[560px] space-y-2.5 text-xs font-mono">
            {logs.length === 0 ? (
              <div className="text-center py-16 text-stone-500 text-xs">
                {lang === "fa"
                  ? "هیچ رویدادی ثبت نشده است. ابتدا روی «اتصال به استریم SSE» کلیک کنید."
                  : "No events logged yet. Connect to SSE stream to start recording frames."}
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-xl border ${
                    log.direction === "client->worker"
                      ? "bg-orange-950/20 border-orange-500/30 text-orange-200"
                      : "bg-stone-900/80 border-stone-800 text-stone-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 text-[10px]">
                    <span className="font-bold uppercase tracking-wider text-orange-400">
                      {log.direction} • {log.type}
                    </span>
                    <span className="text-stone-500">{log.timestamp}</span>
                  </div>
                  <pre className="overflow-x-auto text-[11px] leading-relaxed">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
