import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Code2,
  Globe,
  Database,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { McpToolDefinition, HttpMethod } from "../types";

interface ToolSchemaManagerProps {
  tools: McpToolDefinition[];
  onAddTool: (tool: McpToolDefinition) => void;
  onUpdateTool: (tool: McpToolDefinition) => void;
  onDeleteTool: (id: string) => void;
  lang: "fa" | "en";
}

export const ToolSchemaManager: React.FC<ToolSchemaManagerProps> = ({
  tools,
  onAddTool,
  onUpdateTool,
  onDeleteTool,
  lang,
}) => {
  const [selectedToolId, setSelectedToolId] = useState<string>(tools[0]?.id || "");
  const [isCreating, setIsCreating] = useState(false);

  // Form State for create/edit
  const [formData, setFormData] = useState<{
    id?: string;
    name: string;
    description: string;
    method: HttpMethod;
    endpoint: string;
    paramName: string;
    paramType: string;
    paramDesc: string;
    paramRequired: boolean;
    graphqlQuery: string;
  }>({
    name: "",
    description: "",
    method: "GET",
    endpoint: "/api/v1/resource",
    paramName: "id",
    paramType: "string",
    paramDesc: "Primary identifier for the resource",
    paramRequired: true,
    graphqlQuery: "",
  });

  const selectedTool = tools.find((t) => t.id === selectedToolId) || tools[0];

  const handleSaveNewTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newTool: McpToolDefinition = {
      id: "tool-" + Date.now(),
      name: formData.name.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
      description: formData.description || "Custom translated MCP tool",
      method: formData.method,
      endpoint: formData.endpoint || "/api/resource",
      headers: {
        "Content-Type": "application/json",
      },
      parameters: {
        type: "object",
        properties: formData.paramName
          ? {
              [formData.paramName]: {
                type: formData.paramType,
                description: formData.paramDesc,
              },
            }
          : {},
        required: formData.paramRequired && formData.paramName ? [formData.paramName] : [],
      },
      graphqlQuery: formData.method === "GRAPHQL" ? formData.graphqlQuery : undefined,
      mockResponse: {
        status: "success",
        simulated: true,
        endpoint: formData.endpoint,
        data: { id: "res-9001", message: "Sample response from target API" },
      },
    };

    onAddTool(newTool);
    setSelectedToolId(newTool.id);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-stone-900">
            {lang === "fa" ? "اسکیمای ابزارهای MCP (Protocol Translation)" : "MCP Tools Schema & Protocol Mappings"}
          </h2>
          <p className="text-xs text-stone-500">
            {lang === "fa"
              ? "ابزارهای زیر به صورت JSON-RPC 2.0 در مسیرهای /sse و /message به Claude Desktop و ایجنت‌های هوش مصنوعی ارائه می‌شوند."
              : "Tools listed here are converted to JSON Schema and exposed via /sse and /message to LLM agents."}
          </p>
        </div>

        <button
          onClick={() => {
            setIsCreating(true);
            setFormData({
              name: "query_new_endpoint",
              description: "Describe what this tool does for LLM reasoning",
              method: "GET",
              endpoint: "/api/v1/items/{itemId}",
              paramName: "itemId",
              paramType: "string",
              paramDesc: "Identifier of the item",
              paramRequired: true,
              graphqlQuery: "",
            });
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === "fa" ? "افزودن ابزار جدید" : "Add MCP Tool"}</span>
        </button>
      </div>

      {/* Creation Modal / Drawer */}
      {isCreating && (
        <form
          onSubmit={handleSaveNewTool}
          className="bg-white p-5 rounded-xl border-2 border-orange-400 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>{lang === "fa" ? "تعریف ابزار جدید MCP" : "Define New MCP Tool"}</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-stone-400 hover:text-stone-600 text-xs font-bold"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                {lang === "fa" ? "نام ابزار (Tool Name - snake_case)" : "Tool Name (snake_case)"}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded border border-stone-300 font-mono text-xs focus:ring-2 focus:ring-orange-500"
                placeholder="fetch_user_orders"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                {lang === "fa" ? "متد پروتکل (HTTP Method)" : "Protocol Method"}
              </label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value as HttpMethod })}
                className="w-full px-3 py-2 rounded border border-stone-300 font-semibold text-xs focus:ring-2 focus:ring-orange-500"
              >
                <option value="GET">GET (Query params)</option>
                <option value="POST">POST (JSON Body)</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
                <option value="GRAPHQL">GRAPHQL (POST Query/Mutation)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-stone-700 mb-1">
                {lang === "fa" ? "مسیر در سرور داخلی (Endpoint Path)" : "Internal Target Endpoint Path"}
              </label>
              <input
                type="text"
                required
                value={formData.endpoint}
                onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                className="w-full px-3 py-2 rounded border border-stone-300 font-mono text-xs focus:ring-2 focus:ring-orange-500"
                placeholder="/api/v1/users/{userId}/orders"
              />
              <span className="text-[11px] text-stone-500">
                {lang === "fa"
                  ? "متغیرهای مسیر را مانند {userId} بنویسید؛ به صورت خودکار توسط ورکر جایگزین می‌شوند."
                  : "Use {paramName} for URL path variables; the worker replaces them automatically."}
              </span>
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-stone-700 mb-1">
                {lang === "fa" ? "توضیح برای ایجنت هوش مصنوعی (Description for LLM)" : "Description for LLM"}
              </label>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 rounded border border-stone-300 text-xs focus:ring-2 focus:ring-orange-500"
                placeholder="Fetch active user orders with shipment tracking details"
              />
            </div>

            {formData.method === "GRAPHQL" && (
              <div className="md:col-span-2">
                <label className="block font-semibold text-stone-700 mb-1">
                  GraphQL Query
                </label>
                <textarea
                  rows={4}
                  value={formData.graphqlQuery}
                  onChange={(e) => setFormData({ ...formData, graphqlQuery: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-stone-300 font-mono text-xs focus:ring-2 focus:ring-orange-500"
                  placeholder="query GetUser($userId: ID!) { user(id: $userId) { id name email } }"
                />
              </div>
            )}

            {/* Parameter Definitions */}
            <div className="md:col-span-2 p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
              <h4 className="text-xs font-bold text-stone-800">
                {lang === "fa" ? "تعریف پارامتر ورودی (Input Parameter)" : "Input Parameter Definition"}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Param name (e.g. userId)"
                  value={formData.paramName}
                  onChange={(e) => setFormData({ ...formData, paramName: e.target.value })}
                  className="px-2 py-1.5 rounded border border-stone-300 font-mono text-xs"
                />
                <select
                  value={formData.paramType}
                  onChange={(e) => setFormData({ ...formData, paramType: e.target.value })}
                  className="px-2 py-1.5 rounded border border-stone-300 text-xs"
                >
                  <option value="string">string</option>
                  <option value="number">number</option>
                  <option value="boolean">boolean</option>
                  <option value="object">object</option>
                </select>
                <input
                  type="text"
                  placeholder="Description"
                  value={formData.paramDesc}
                  onChange={(e) => setFormData({ ...formData, paramDesc: e.target.value })}
                  className="px-2 py-1.5 rounded border border-stone-300 text-xs sm:col-span-2"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 rounded border border-stone-300 text-xs font-medium text-stone-600 hover:bg-stone-100"
            >
              {lang === "fa" ? "انصراف" : "Cancel"}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold"
            >
              {lang === "fa" ? "ثبت و به‌روزرسانی ورکر" : "Save Tool"}
            </button>
          </div>
        </form>
      )}

      {/* Main Grid: Tools List & Tool Details Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tool Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {tools.map((tool) => {
            const isSelected = tool.id === selectedToolId;
            return (
              <div
                key={tool.id}
                onClick={() => setSelectedToolId(tool.id)}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  isSelected
                    ? "bg-orange-50/70 border-orange-400 shadow-xs ring-1 ring-orange-200"
                    : "bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        tool.method === "GET"
                          ? "bg-blue-100 text-blue-700"
                          : tool.method === "POST"
                          ? "bg-emerald-100 text-emerald-700"
                          : tool.method === "GRAPHQL"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-stone-100 text-stone-700"
                      }`}
                    >
                      {tool.method}
                    </span>
                    <h3 className="font-mono text-xs font-bold text-stone-900">{tool.name}</h3>
                  </div>

                  {tools.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTool(tool.id);
                      }}
                      className="text-stone-400 hover:text-red-600 p-1 transition"
                      title="حذف ابزار"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-stone-600 line-clamp-2 mb-2">{tool.description}</p>

                <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
                  <span className="truncate max-w-[200px]">{tool.endpoint}</span>
                  <span className="text-stone-400">
                    {Object.keys(tool.parameters.properties || {}).length} params
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Tool Inspector & Schema Representation (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
          {selectedTool ? (
            <>
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 font-mono">
                      {selectedTool.name}
                    </h3>
                    <span className="text-xs text-stone-500">
                      Target: {selectedTool.method} {selectedTool.endpoint}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-semibold px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Valid MCP Schema
                </span>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-stone-700 mb-1">
                  {lang === "fa" ? "توضیحات ایجنت (Agent Prompt Context)" : "Agent Context"}
                </h4>
                <p className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-200 leading-relaxed">
                  {selectedTool.description}
                </p>
              </div>

              {/* Input Schema Parameters */}
              <div>
                <h4 className="text-xs font-bold text-stone-700 mb-1">
                  {lang === "fa" ? "پارامترهای ورودی (inputSchema Properties)" : "Input Schema Properties"}
                </h4>
                <div className="overflow-x-auto border border-stone-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 text-stone-600 border-b border-stone-200">
                      <tr>
                        <th className="p-2 font-medium">Parameter</th>
                        <th className="p-2 font-medium">Type</th>
                        <th className="p-2 font-medium">Required</th>
                        <th className="p-2 font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {Object.entries(selectedTool.parameters.properties || {}).map(
                        ([propName, propDef]: [string, any]) => {
                          const isRequired = (selectedTool.parameters.required || []).includes(
                            propName
                          );
                          return (
                            <tr key={propName} className="hover:bg-stone-50/50">
                              <td className="p-2 font-mono font-bold text-stone-900">{propName}</td>
                              <td className="p-2 font-mono text-blue-600">{propDef.type}</td>
                              <td className="p-2">
                                {isRequired ? (
                                  <span className="text-red-600 font-semibold text-[10px] bg-red-50 px-1.5 py-0.5 rounded">
                                    Required
                                  </span>
                                ) : (
                                  <span className="text-stone-400 text-[10px]">Optional</span>
                                )}
                              </td>
                              <td className="p-2 text-stone-600">{propDef.description}</td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* GraphQL Query if applicable */}
              {selectedTool.graphqlQuery && (
                <div>
                  <h4 className="text-xs font-bold text-purple-700 mb-1">GraphQL Document</h4>
                  <pre className="p-3 bg-stone-900 text-purple-300 rounded-lg text-xs font-mono overflow-x-auto">
                    {selectedTool.graphqlQuery}
                  </pre>
                </div>
              )}

              {/* Raw MCP Tool JSON Definition */}
              <div>
                <h4 className="text-xs font-bold text-stone-700 mb-1">
                  {lang === "fa" ? "خروجی خام اسکیمای پروتکل MCP" : "Raw MCP JSON-RPC Definition"}
                </h4>
                <pre className="p-3 bg-stone-900 text-emerald-400 rounded-lg text-xs font-mono overflow-x-auto max-h-48">
                  {JSON.stringify(
                    {
                      name: selectedTool.name,
                      description: selectedTool.description,
                      inputSchema: selectedTool.parameters,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-stone-400 text-xs">
              No tool selected. Click a tool or create a new one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
