import { McpToolDefinition, CloudflareTunnelConfig, RepoFile, ArchitecturePreset } from "../types";

export const githubTools: McpToolDefinition[] = [
  {
    id: "gh-1",
    name: "github_get_repository",
    description: "Fetch comprehensive GitHub repository metadata, stars, forks, language, and default branch via personal GitHub API Token",
    method: "GET",
    endpoint: "/repos/{owner}/{repo}",
    targetBaseUrl: "https://api.github.com",
    authSecretName: "GITHUB_TOKEN",
    headers: {
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "Cloudflare-Worker-MCP-Bridge"
    },
    parameters: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "GitHub organization or account username (e.g. 'octocat')"
        },
        repo: {
          type: "string",
          description: "Repository name (e.g. 'Hello-World')"
        }
      },
      required: ["owner", "repo"]
    },
    mockResponse: {
      id: 1296269,
      name: "Hello-World",
      full_name: "octocat/Hello-World",
      private: false,
      owner: { login: "octocat", type: "User" },
      description: "My first repository on GitHub!",
      stargazers_count: 3200,
      forks_count: 2100,
      open_issues_count: 14,
      default_branch: "main",
      html_url: "https://github.com/octocat/Hello-World"
    }
  },
  {
    id: "gh-2",
    name: "github_get_file_contents",
    description: "Read files, source code, or configs from a GitHub repository using your personal GitHub Token",
    method: "GET",
    endpoint: "/repos/{owner}/{repo}/contents/{path}",
    targetBaseUrl: "https://api.github.com",
    authSecretName: "GITHUB_TOKEN",
    headers: {
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "Cloudflare-Worker-MCP-Bridge"
    },
    parameters: {
      type: "object",
      properties: {
        owner: { type: "string", description: "Repository owner username" },
        repo: { type: "string", description: "Repository name" },
        path: { type: "string", description: "Relative file path inside the repo (e.g. 'src/index.ts' or 'package.json')" },
        ref: { type: "string", description: "Optional git branch, tag or commit SHA (default: default branch)" }
      },
      required: ["owner", "repo", "path"]
    },
    mockResponse: {
      name: "package.json",
      path: "package.json",
      sha: "3d2182049bf6a1c890f937666270830",
      size: 512,
      type: "file",
      content: "{\n  \"name\": \"my-project\",\n  \"version\": \"1.0.0\"\n}",
      encoding: "utf-8"
    }
  },
  {
    id: "gh-3",
    name: "github_create_issue",
    description: "Create a new issue in a GitHub repository with title, body, and labels",
    method: "POST",
    endpoint: "/repos/{owner}/{repo}/issues",
    targetBaseUrl: "https://api.github.com",
    authSecretName: "GITHUB_TOKEN",
    headers: {
      "Accept": "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      "User-Agent": "Cloudflare-Worker-MCP-Bridge"
    },
    parameters: {
      type: "object",
      properties: {
        owner: { type: "string", description: "Repository owner username" },
        repo: { type: "string", description: "Repository name" },
        title: { type: "string", description: "Issue title" },
        body: { type: "string", description: "Issue description/markdown body" },
        labels: { type: "array", description: "Array of label names (e.g. ['bug', 'help wanted'])" }
      },
      required: ["owner", "repo", "title"]
    },
    mockResponse: {
      id: 994218,
      number: 42,
      title: "Automated issue created by LLM Agent",
      state: "open",
      created_at: "2025-03-12T10:00:00Z",
      html_url: "https://github.com/octocat/Hello-World/issues/42"
    }
  },
  {
    id: "gh-4",
    name: "github_list_issues",
    description: "List issues from a GitHub repository with filter by state (open, closed, all)",
    method: "GET",
    endpoint: "/repos/{owner}/{repo}/issues",
    targetBaseUrl: "https://api.github.com",
    authSecretName: "GITHUB_TOKEN",
    headers: {
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "Cloudflare-Worker-MCP-Bridge"
    },
    parameters: {
      type: "object",
      properties: {
        owner: { type: "string", description: "Repository owner" },
        repo: { type: "string", description: "Repository name" },
        state: { type: "string", enum: ["open", "closed", "all"], description: "Filter by issue state (default: open)" }
      },
      required: ["owner", "repo"]
    },
    mockResponse: [
      { number: 101, title: "Refactor database connection pool", state: "open", comments: 3 },
      { number: 102, title: "Fix SSE reconnection timeout", state: "open", comments: 1 }
    ]
  },
  {
    id: "gh-5",
    name: "github_search_repositories",
    description: "Search repositories on GitHub by keywords, language or topic",
    method: "GET",
    endpoint: "/search/repositories",
    targetBaseUrl: "https://api.github.com",
    authSecretName: "GITHUB_TOKEN",
    headers: {
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "Cloudflare-Worker-MCP-Bridge"
    },
    parameters: {
      type: "object",
      properties: {
        q: { type: "string", description: "Search query (e.g. 'mcp server language:typescript')" }
      },
      required: ["q"]
    },
    mockResponse: {
      total_count: 28,
      items: [
        { full_name: "modelcontextprotocol/servers", description: "Model Context Protocol servers repository", stargazers_count: 4800 }
      ]
    }
  }
];

export const aiRelayTools: McpToolDefinition[] = [
  {
    id: "ai-1",
    name: "ai_model_chat_completion",
    description: "Proxy prompt and system instructions to your personal AI model / LLM service via API Token, returning structured completions to the MCP Client",
    method: "POST",
    endpoint: "/v1/chat/completions",
    targetBaseUrl: "https://api.openai.com",
    authSecretName: "AI_API_KEY",
    headers: {
      "Content-Type": "application/json"
    },
    parameters: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "User input prompt to send to the AI model"
        },
        systemPrompt: {
          type: "string",
          description: "Optional system directive or persona instructions"
        },
        model: {
          type: "string",
          description: "Model ID (e.g. 'gpt-4o', 'deepseek-chat', 'claude-3-5-sonnet', or custom)"
        },
        temperature: {
          type: "number",
          description: "Sampling temperature between 0.0 and 1.0 (default: 0.7)"
        }
      },
      required: ["prompt"]
    },
    mockResponse: {
      id: "chatcmpl-mcp-bridge-001",
      model: "custom-ai-relay",
      choices: [
        {
          message: {
            role: "assistant",
            content: "Hello! I am your AI model accessed through your personal Cloudflare Worker MCP bridge. The API token was safely injected server-side without exposing it to the client."
          },
          finish_reason: "stop"
        }
      ],
      usage: { prompt_tokens: 35, completion_tokens: 42, total_tokens: 77 }
    }
  },
  {
    id: "ai-2",
    name: "ai_code_review_assistant",
    description: "Send code snippet to a specialized AI model for automated code review, bug hunting, and security auditing",
    method: "POST",
    endpoint: "/v1/chat/completions",
    targetBaseUrl: "https://api.openai.com",
    authSecretName: "AI_API_KEY",
    headers: {
      "Content-Type": "application/json"
    },
    parameters: {
      type: "object",
      properties: {
        codeSnippet: {
          type: "string",
          description: "Source code to be reviewed"
        },
        language: {
          type: "string",
          description: "Programming language (e.g. 'typescript', 'python', 'rust')"
        },
        focusArea: {
          type: "string",
          description: "Specific focus (e.g. 'security', 'performance', 'readability')"
        }
      },
      required: ["codeSnippet"]
    },
    mockResponse: {
      analysis: "Code Audit Passed with 1 Recommendation",
      recommendations: [
        "Sanitize input parameters before constructing dynamic queries to prevent injection."
      ],
      securityScore: "A+"
    }
  },
  {
    id: "ai-3",
    name: "ai_translate_text",
    description: "Translate text accurately between Persian, English, and other languages using your AI API key",
    method: "POST",
    endpoint: "/v1/chat/completions",
    targetBaseUrl: "https://api.openai.com",
    authSecretName: "AI_API_KEY",
    headers: {
      "Content-Type": "application/json"
    },
    parameters: {
      type: "object",
      properties: {
        text: { type: "string", description: "Original text to translate" },
        targetLanguage: { type: "string", description: "Target language (e.g. 'Persian', 'English', 'German')" }
      },
      required: ["text", "targetLanguage"]
    },
    mockResponse: {
      translatedText: "این متن با موفقیت توسط پل ابری ورکر به زبان مقصد ترجمه شد.",
      sourceLanguageDetected: "English",
      confidence: 0.99
    }
  }
];

export const internalTunnelTools: McpToolDefinition[] = [
  {
    id: "tool-1",
    name: "get_customer_profile",
    description: "Fetch proprietary customer CRM records by Customer ID or Email address via secure internal API",
    method: "GET",
    endpoint: "/api/v1/customers/{customerId}",
    headers: {
      "Accept": "application/json"
    },
    parameters: {
      type: "object",
      properties: {
        customerId: {
          type: "string",
          description: "Unique internal customer identification code (e.g., CUST-9821)"
        },
        includeBilling: {
          type: "boolean",
          description: "Whether to include sensitive billing metadata in output"
        }
      },
      required: ["customerId"]
    },
    mockResponse: {
      customerId: "CUST-9821",
      fullName: "Reza Farhadi",
      email: "reza.farhadi@internal-corp.net",
      tier: "Enterprise Platinum",
      status: "Active",
      createdAt: "2024-01-15T08:30:00Z",
      assignedManager: "Sarah Connor",
      contractValueUSD: 145000
    }
  },
  {
    id: "tool-2",
    name: "query_graphql_catalog",
    description: "Execute structured GraphQL queries against internal product and inventory service via Cloudflare Tunnel",
    method: "GRAPHQL",
    endpoint: "/graphql",
    headers: {
      "Content-Type": "application/json"
    },
    parameters: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Product category to filter by (e.g. 'hardware', 'licenses')"
        },
        limit: {
          type: "number",
          description: "Maximum items to retrieve (default: 10)"
        }
      },
      required: ["category"]
    },
    graphqlQuery: `query GetInventory($category: String!, $limit: Int) {
  inventory(category: $category, limit: $limit) {
    sku
    name
    warehouseStock
    reservedUnits
    unitPrice
    lastRestocked
  }
}`,
    mockResponse: {
      data: {
        inventory: [
          { sku: "HW-EDGE-01", name: "Cloudflare Edge Gateway Node", warehouseStock: 42, reservedUnits: 8, unitPrice: 850.00, lastRestocked: "2025-02-10" },
          { sku: "LIC-CORP-MCP", name: "Internal MCP Agent Connector License", warehouseStock: 999, reservedUnits: 15, unitPrice: 120.00, lastRestocked: "2025-03-01" }
        ]
      }
    }
  },
  {
    id: "tool-3",
    name: "create_support_ticket",
    description: "Create a priority support incident ticket in internal ERP/Ticketing system with severity tracking",
    method: "POST",
    endpoint: "/api/v1/tickets",
    headers: {
      "Content-Type": "application/json"
    },
    parameters: {
      type: "object",
      properties: {
        customerId: {
          type: "string",
          description: "Customer ID associated with this support request"
        },
        subject: {
          type: "string",
          description: "Brief summary of the issue"
        },
        severity: {
          type: "string",
          description: "Incident severity level: 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'",
          enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
        },
        description: {
          type: "string",
          description: "Detailed description of the incident"
        }
      },
      required: ["customerId", "subject", "severity", "description"]
    },
    mockResponse: {
      ticketId: "INC-2025-8842",
      status: "OPEN",
      priority: "CRITICAL",
      slaDueHours: 2,
      assignedTeam: "Tier-3 Cloud Operations",
      message: "Ticket created successfully via MCP Cloudflare Bridge"
    }
  }
];

export const initialTools: McpToolDefinition[] = githubTools;

export const defaultTunnelConfig: CloudflareTunnelConfig = {
  tunnelName: "mcp-api-bridge-tunnel",
  tunnelId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  hostname: "internal-api.mycompany.com",
  localServiceUrl: "http://localhost:8080",
  authType: "cf-access",
  cfAccessClientId: "948bf823e421098a72b.access",
  cfAccessClientSecret: "3029f8a81239c018274a98bce1"
};

export function generateRepoFiles(
  tools: McpToolDefinition[],
  tunnel: CloudflareTunnelConfig,
  preset: ArchitecturePreset = "github"
): RepoFile[] {
  const toolsCode = generateToolsTypeScript(tools);

  return [
    {
      path: "wrangler.toml",
      filename: "wrangler.toml",
      category: "config",
      language: "toml",
      content: `# Cloudflare Worker MCP Bridge Configuration
name = "mcp-api-bridge-worker"
main = "src/index.ts"
compatibility_date = "2025-04-01"
compatibility_flags = ["nodejs_compat"]

[vars]
MCP_SERVER_NAME = "Cloudflare-Personal-MCP-Bridge"
MCP_SERVER_VERSION = "1.0.0"
TUNNEL_BASE_URL = "https://${tunnel.hostname || "internal-api.mycompany.com"}"
AUTH_TYPE = "${tunnel.authType}"

# Secrets to configure in Cloudflare Dashboard (Settings -> Variables):
# For GitHub Bridge:
# - GITHUB_TOKEN: Your GitHub Personal Access Token (ghp_...)
#
# For AI / LLM Relay:
# - AI_API_KEY: Your OpenAI, DeepSeek, Groq, or custom AI service token
#
# For Zero Trust Tunnel:
# - CF_ACCESS_CLIENT_ID: Cloudflare Access Service Token Client ID
# - CF_ACCESS_CLIENT_SECRET: Cloudflare Access Service Token Client Secret
#
# Optional security between your MCP client and this Worker:
# - MCP_SHARED_SECRET: Secret required in 'x-mcp-secret' header
`
    },
    {
      path: "package.json",
      filename: "package.json",
      category: "config",
      language: "json",
      content: JSON.stringify(
        {
          name: "mcp-api-bridge-worker",
          version: "1.0.0",
          description: "Serverless bridge exposing GitHub, AI models, and internal APIs as Model Context Protocol (MCP) tools via Cloudflare Workers",
          main: "src/index.ts",
          type: "module",
          scripts: {
            dev: "wrangler dev",
            deploy: "wrangler deploy",
            types: "wrangler types"
          },
          dependencies: {
            "@modelcontextprotocol/sdk": "^1.6.1",
            "zod": "^3.24.2"
          },
          devDependencies: {
            "@cloudflare/workers-types": "^4.20250224.0",
            "typescript": "^5.7.3",
            "wrangler": "^3.111.0"
          }
        },
        null,
        2
      )
    },
    {
      path: "tsconfig.json",
      filename: "tsconfig.json",
      category: "config",
      language: "json",
      content: JSON.stringify(
        {
          compilerOptions: {
            target: "ES2022",
            module: "ESNext",
            moduleResolution: "bundler",
            lib: ["ES2022"],
            types: ["@cloudflare/workers-types"],
            strict: true,
            skipLibCheck: true,
            noEmit: true
          },
          include: ["src/**/*"]
        },
        null,
        2
      )
    },
    {
      path: "src/index.ts",
      filename: "index.ts",
      category: "source",
      language: "typescript",
      content: `/**
 * Cloudflare Worker MCP Bridge Entry Point
 * Implements Model Context Protocol (MCP) transport over Server-Sent Events (SSE)
 * and direct HTTP JSON-RPC 2.0 streaming.
 */

import { executeTool, listAvailableTools } from "./tools";
import { Env } from "./types";

// In-memory session store for active SSE streams
const sseSessions = new Map<string, { controller: ReadableStreamDefaultController }>();

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Standard CORS headers for MCP client connections (Claude Desktop, Cursor, Custom Agents)
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-mcp-secret, CF-Access-Client-Id, CF-Access-Client-Secret",
      "Access-Control-Max-Age": "86400",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Health check endpoint
    if (url.pathname === "/" || url.pathname === "/health") {
      return new Response(
        JSON.stringify({
          status: "healthy",
          server: env.MCP_SERVER_NAME || "cloudflare-mcp-bridge",
          runtime: "Cloudflare Workers",
          registeredTools: listAvailableTools().map(t => t.name),
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Optional Agent Security Verification
    if (env.MCP_SHARED_SECRET) {
      const incomingSecret = request.headers.get("x-mcp-secret") || url.searchParams.get("secret");
      if (incomingSecret !== env.MCP_SHARED_SECRET) {
        return new Response(
          JSON.stringify({ error: "Unauthorized: Invalid or missing x-mcp-secret header" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 1. SSE Connection Endpoint: GET /sse
    if (url.pathname === "/sse" && request.method === "GET") {
      const sessionId = crypto.randomUUID();
      const messageEndpoint = \`\${url.origin}/message?sessionId=\${sessionId}\`;

      const stream = new ReadableStream({
        start(controller) {
          sseSessions.set(sessionId, { controller });

          // Send initial 'endpoint' event per MCP SSE Specification
          const initialEvent = \`event: endpoint\\ndata: \${messageEndpoint}\\n\\n\`;
          controller.enqueue(new TextEncoder().encode(initialEvent));
        },
        cancel() {
          sseSessions.delete(sessionId);
        },
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive",
        },
      });
    }

    // 2. Message Post Endpoint: POST /message?sessionId=...
    if (url.pathname === "/message" && request.method === "POST") {
      const sessionId = url.searchParams.get("sessionId");
      let body: any;
      try {
        body = await request.json();
      } catch {
        return new Response("Invalid JSON payload", { status: 400, headers: corsHeaders });
      }

      const responsePayload = await handleJsonRpc(body, env);

      // If active SSE session exists, send via SSE stream as well
      if (sessionId && sseSessions.has(sessionId)) {
        const session = sseSessions.get(sessionId)!;
        const sseFrame = \`event: message\\ndata: \${JSON.stringify(responsePayload)}\\n\\n\`;
        try {
          session.controller.enqueue(new TextEncoder().encode(sseFrame));
        } catch {
          sseSessions.delete(sessionId);
        }
      }

      // Return direct JSON-RPC HTTP response
      return new Response(JSON.stringify(responsePayload), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Direct MCP HTTP POST Endpoint: POST /mcp
    if (url.pathname === "/mcp" && request.method === "POST") {
      const body = await request.json();
      const responsePayload = await handleJsonRpc(body, env);
      return new Response(JSON.stringify(responsePayload), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },
};

/**
 * Handle incoming JSON-RPC 2.0 requests per Model Context Protocol Specification
 */
async function handleJsonRpc(req: any, env: Env): Promise<any> {
  const { jsonrpc, id, method, params } = req;

  if (jsonrpc !== "2.0") {
    return {
      jsonrpc: "2.0",
      id: id || null,
      error: { code: -32600, message: "Invalid Request: jsonrpc must be '2.0'" },
    };
  }

  switch (method) {
    case "initialize":
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: {
              listChanged: true,
            },
            logging: {},
          },
          serverInfo: {
            name: env.MCP_SERVER_NAME || "cloudflare-personal-mcp-bridge",
            version: env.MCP_SERVER_VERSION || "1.0.0",
          },
        },
      };

    case "notifications/initialized":
      return { jsonrpc: "2.0", id, result: {} };

    case "ping":
      return { jsonrpc: "2.0", id, result: {} };

    case "tools/list":
      return {
        jsonrpc: "2.0",
        id,
        result: {
          tools: listAvailableTools(),
        },
      };

    case "tools/call":
      if (!params || !params.name) {
        return {
          jsonrpc: "2.0",
          id,
          error: { code: -32602, message: "Invalid params: 'name' is required" },
        };
      }
      try {
        const toolResult = await executeTool(params.name, params.arguments || {}, env);
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: typeof toolResult === "string" ? toolResult : JSON.stringify(toolResult, null, 2),
              },
            ],
          },
        };
      } catch (err: any) {
        return {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32000,
            message: \`Tool execution failed: \${err.message || String(err)}\`,
          },
        };
      }

    default:
      return {
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: \`Method '\${method}' not supported\` },
      };
  }
}
`
    },
    {
      path: "src/tools/index.ts",
      filename: "index.ts",
      category: "source",
      language: "typescript",
      content: toolsCode
    },
    {
      path: "src/middleware/target.ts",
      filename: "target.ts",
      category: "source",
      language: "typescript",
      content: `/**
 * Target API & Tunnel Dispatcher Middleware
 * Seamlessly routes requests to GitHub API, Third-Party AI Services,
 * or Internal Zero Trust Tunnels, securely injecting API tokens on Cloudflare Edge.
 */

import { Env } from "../types";

export interface TargetRequestOptions {
  path: string;
  method: string;
  targetBaseUrl?: string;
  authSecretName?: string;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
}

export async function forwardToTarget(options: TargetRequestOptions, env: Env): Promise<any> {
  // Determine destination: direct SaaS (GitHub / AI) or Cloudflare Tunnel
  const baseUrl = options.targetBaseUrl || env.TUNNEL_BASE_URL;
  if (!baseUrl) {
    throw new Error("No targetBaseUrl specified and TUNNEL_BASE_URL is not configured in worker environment.");
  }

  // Construct final URL with path parameter substitutions
  let targetPath = options.path;
  const remainingParams = { ...(options.params || {}) };

  // Replace {paramName} in path (e.g. /repos/{owner}/{repo} -> /repos/octocat/Hello-World)
  if (options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      const placeholder = \`{\${key}}\`;
      if (targetPath.includes(placeholder)) {
        targetPath = targetPath.replace(placeholder, encodeURIComponent(String(value)));
        delete remainingParams[key];
      }
    }
  }

  const targetUrl = new URL(targetPath, baseUrl);

  // If GET/DELETE, append remaining parameters as query string
  if (options.method === "GET" || options.method === "DELETE") {
    for (const [key, val] of Object.entries(remainingParams)) {
      if (val !== undefined && val !== null) {
        targetUrl.searchParams.append(key, String(val));
      }
    }
  }

  // Base Headers
  const requestHeaders: Record<string, string> = {
    "User-Agent": "Cloudflare-Worker-MCP-Bridge/1.0",
    ...(options.headers || {}),
  };

  // 1. Inject API Token from Cloudflare Worker Secrets
  if (options.authSecretName) {
    const secretValue = (env as any)[options.authSecretName];
    if (secretValue) {
      // GitHub standard or Bearer standard
      requestHeaders["Authorization"] = \`Bearer \${secretValue}\`;
    }
  } else if (env.TARGET_API_KEY) {
    if (env.AUTH_TYPE === "bearer-token") {
      requestHeaders["Authorization"] = \`Bearer \${env.TARGET_API_KEY}\`;
    } else if (env.AUTH_TYPE === "api-key") {
      requestHeaders["x-api-key"] = env.TARGET_API_KEY;
    }
  }

  // 2. Inject Cloudflare Access Service Token for Zero Trust Tunnels
  if (env.CF_ACCESS_CLIENT_ID && env.CF_ACCESS_CLIENT_SECRET) {
    requestHeaders["CF-Access-Client-Id"] = env.CF_ACCESS_CLIENT_ID;
    requestHeaders["CF-Access-Client-Secret"] = env.CF_ACCESS_CLIENT_SECRET;
  }

  // 3. Format Request Body
  let requestBody: string | undefined = undefined;
  if (options.method !== "GET" && options.method !== "DELETE") {
    if (options.body) {
      requestBody = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
      if (!requestHeaders["Content-Type"]) {
        requestHeaders["Content-Type"] = "application/json";
      }
    }
  }

  const response = await fetch(targetUrl.toString(), {
    method: options.method,
    headers: requestHeaders,
    body: requestBody,
  });

  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      \`Target API (\${targetUrl.host}) responded with HTTP \${response.status}: \${errorText.slice(0, 300)}\`
    );
  }

  if (contentType.includes("application/json")) {
    return await response.json();
  } else {
    return await response.text();
  }
}
`
    },
    {
      path: "src/types.ts",
      filename: "types.ts",
      category: "source",
      language: "typescript",
      content: `/**
 * Cloudflare Worker Environment Bindings & Types
 */

export interface Env {
  // Public variables in wrangler.toml [vars]
  MCP_SERVER_NAME?: string;
  MCP_SERVER_VERSION?: string;
  TUNNEL_BASE_URL?: string;
  AUTH_TYPE?: "cf-access" | "bearer-token" | "api-key" | "none";

  // Secrets configured in Cloudflare Dashboard (Settings -> Variables)
  GITHUB_TOKEN?: string;
  AI_API_KEY?: string;
  CF_ACCESS_CLIENT_ID?: string;
  CF_ACCESS_CLIENT_SECRET?: string;
  TARGET_API_KEY?: string;
  MCP_SHARED_SECRET?: string;
}

export interface McpToolSchema {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}
`
    },
    {
      path: "tunnel/config.yml",
      filename: "config.yml",
      category: "tunnel",
      language: "yaml",
      content: `# Cloudflare Zero Trust Tunnel Daemon Configuration (cloudflared)
# Only needed if you are exposing a local/internal private API.
# For public APIs like GitHub or OpenAI, no tunnel is needed!

tunnel: ${tunnel.tunnelId || "a1b2c3d4-e5f6-7890-abcd-ef1234567890"}
credentials-file: /etc/cloudflared/${tunnel.tunnelId || "a1b2c3d4-e5f6-7890-abcd-ef1234567890"}.json

ingress:
  - hostname: ${tunnel.hostname || "internal-api.mycompany.com"}
    service: ${tunnel.localServiceUrl || "http://localhost:8080"}
  - service: http_status:404
`
    },
    {
      path: "tunnel/docker-compose.yml",
      filename: "docker-compose.yml",
      category: "tunnel",
      language: "yaml",
      content: `# Run Cloudflare Tunnel (cloudflared) with 1 command (for local APIs):
# docker compose up -d

version: "3.8"

services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: mcp_cloudflare_tunnel
    restart: unless-stopped
    command: tunnel --no-autoupdate run --token \${TUNNEL_TOKEN:-eyJhIjoiZXhhbXBsZSJ9}
    network_mode: host
`
    },
    {
      path: ".github/workflows/deploy.yml",
      filename: "deploy.yml",
      category: "ci-cd",
      language: "yaml",
      content: `name: Deploy Cloudflare Worker MCP Bridge

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy Worker to Cloudflare Edge
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - name: Install Dependencies
        run: npm ci

      - name: Publish to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy
`
    },
    {
      path: ".env.example",
      filename: ".env.example",
      category: "config",
      language: "toml",
      content: `# Secrets to configure in Cloudflare Dashboard (Settings -> Variables):

# 1. For GitHub MCP Bridge:
GITHUB_TOKEN=ghp_your_github_personal_access_token

# 2. For AI Model Relay:
AI_API_KEY=sk-your_ai_model_api_token

# 3. For Zero-Trust Tunnel (optional):
CF_ACCESS_CLIENT_ID=your_cf_access_client_id.access
CF_ACCESS_CLIENT_SECRET=your_cf_access_client_secret

# 4. Optional Security between MCP Client and Worker:
MCP_SHARED_SECRET=your_optional_secret_token
`
    },
    {
      path: "README.md",
      filename: "README.md",
      category: "docs",
      language: "markdown",
      content: generateReadmeMarkdown(tools, tunnel)
    }
  ];
}

function generateToolsTypeScript(tools: McpToolDefinition[]): string {
  const toolDeclarations = tools.map((tool) => {
    return `  {
    name: ${JSON.stringify(tool.name)},
    description: ${JSON.stringify(tool.description)},
    inputSchema: ${JSON.stringify(tool.parameters, null, 4)}
  }`;
  }).join(",\n");

  const executionCases = tools.map((tool) => {
    if (tool.method === "GRAPHQL") {
      return `    case ${JSON.stringify(tool.name)}: {
      return await forwardToTarget({
        path: ${JSON.stringify(tool.endpoint)},
        method: "POST",
        targetBaseUrl: ${tool.targetBaseUrl ? JSON.stringify(tool.targetBaseUrl) : "undefined"},
        authSecretName: ${tool.authSecretName ? JSON.stringify(tool.authSecretName) : "undefined"},
        headers: ${JSON.stringify(tool.headers || { "Content-Type": "application/json" })},
        body: {
          query: \`${tool.graphqlQuery?.replace(/`/g, "\\`") || ""}\`,
          variables: args
        }
      }, env);
    }`;
    }

    // Special AI chat completion format
    if (tool.endpoint === "/v1/chat/completions") {
      return `    case ${JSON.stringify(tool.name)}: {
      const messages: any[] = [];
      if (args.systemPrompt) {
        messages.push({ role: "system", content: args.systemPrompt });
      }
      messages.push({ role: "user", content: args.prompt || args.codeSnippet || args.text || JSON.stringify(args) });

      return await forwardToTarget({
        path: ${JSON.stringify(tool.endpoint)},
        method: "POST",
        targetBaseUrl: ${tool.targetBaseUrl ? JSON.stringify(tool.targetBaseUrl) : "undefined"},
        authSecretName: ${tool.authSecretName ? JSON.stringify(tool.authSecretName) : "undefined"},
        headers: ${JSON.stringify(tool.headers || { "Content-Type": "application/json" })},
        body: {
          model: args.model || "gpt-4o-mini",
          messages,
          temperature: args.temperature ?? 0.7
        }
      }, env);
    }`;
    }

    const isGetOrDelete = tool.method === "GET" || tool.method === "DELETE";
    return `    case ${JSON.stringify(tool.name)}: {
      return await forwardToTarget({
        path: ${JSON.stringify(tool.endpoint)},
        method: ${JSON.stringify(tool.method)},
        targetBaseUrl: ${tool.targetBaseUrl ? JSON.stringify(tool.targetBaseUrl) : "undefined"},
        authSecretName: ${tool.authSecretName ? JSON.stringify(tool.authSecretName) : "undefined"},
        headers: ${JSON.stringify(tool.headers || {})},
        ${isGetOrDelete ? "params: args," : "body: args,"}
      }, env);
    }`;
  }).join("\n\n");

  return `/**
 * MCP Tools Registry & Protocol Translator
 * Generated automatically for Cloudflare Workers
 */

import { forwardToTarget } from "../middleware/target";
import { Env, McpToolSchema } from "../types";

// Registered MCP Tools exposed to LLM Agents
export function listAvailableTools(): McpToolSchema[] {
  return [
${toolDeclarations}
  ];
}

// Dispatcher translating MCP tool invocation to target REST / GraphQL / AI requests
export async function executeTool(toolName: string, args: Record<string, any>, env: Env): Promise<any> {
  switch (toolName) {
${executionCases}

    default:
      throw new Error(\`Unknown tool: \${toolName}\`);
  }
}
`;
}

function generateReadmeMarkdown(tools: McpToolDefinition[], tunnel: CloudflareTunnelConfig): string {
  return `# 🚀 Cloudflare Worker Personal MCP Server & API Bridge

یک سرور و میان‌افزار **Model Context Protocol (MCP)** شخصی و رایگان ($0/month) روی **Cloudflare Workers** برای اتصال نرم‌افزارها و ایجنت‌های هوش مصنوعی (مانند Claude Desktop، Cursor، LangChain یا نرم‌افزارهای اختصاصی) به:
1. **GitHub API** با Personal Access Token شما.
2. **سرویس‌های هوش مصنوعی مستقل** با API Token اختصاصی (تبدیل هر مدل به ابزار MCP).
3. **APIهای محلی و داخلی** از طریق تانل کلودفلر (Cloudflare Zero Trust Tunnel).

---

## 🏗️ نحوه عملکرد پل ارتباطی (How the Bridge Works)

\`\`\`text
[ نرم‌افزار شما (که فقط سرور MCP می‌پذیرد) ]
                 │
                 ▼  (پروتکل استاندارد MCP روی استریم SSE)
     [ Cloudflare Worker شما ]
                 │
      ┌──────────┴──────────────────────────┐
      ▼                                     ▼
[ گیت‌هاب یا هوش مصنوعی شما ]       [ سرویس‌های داخلی از طریق تانل ]
(با توکن امنیتی GITHUB_TOKEN        (http://localhost:8080 بدون پورت پابلیک)
یا AI_API_KEY ذخیره در ورکر)
\`\`\`

---

## 🛠️ مراحل اتصال ریپازیتوری در داشبورد کلودفلر (Cloudflare Dashboard Git Connection)

1. **پوش به گیت‌هاب:** این فایل‌ها را در یک ریپازیتوری جدید در گیت‌هاب خود پوش کنید:
   \`\`\`bash
   git init
   git add .
   git commit -m "feat: personal cloudflare MCP bridge"
   git branch -M main
   git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
   git push -u origin main
   \`\`\`

2. **اتصال در داشبورد کلودفلر:**
   - به [dash.cloudflare.com](https://dash.cloudflare.com) بروید.
   - از منوی سمت چپ به مسیر **Compute (Workers) > Workers & Pages** بروید.
   - دکمه آبی **Create Application** را بزنید و تب **Workers** را انتخاب کنید.
   - روی **Connect to Git** کلیک کنید، اکانت گیت‌هاب و نام ریپازیتوری را انتخاب نمایید.
   - دکمه **Save and Deploy** را بزنید.

3. **تنظیم توکن‌ها و رمزها (Secrets):**
   - در صفحه ورکر در کلودفلر، به مسیر **Settings > Variables and Secrets** بروید:
     - برای گیت‌هاب: \`GITHUB_TOKEN\` را با توکن خود (\`ghp_...\`) بسازید.
     - برای هوش مصنوعی: \`AI_API_KEY\` را با کلید ای‌پی‌آی خود اضافه کنید.
     - برای تانل داخلی: \`CF_ACCESS_CLIENT_ID\` و \`CF_ACCESS_CLIENT_SECRET\`.

---

## 🔌 نحوه استفاده در نرم‌افزارها و کلاینت‌های MCP

آدرس سرور MCP شما پس از ساخته شدن به این صورت خواهد بود:
\`https://mcp-api-bridge-worker.YOUR_SUBDOMAIN.workers.dev/sse\`

کافیست این آدرس را به نرم‌افزار خود بدهید! به عنوان مثال در Claude Desktop:

\`\`\`json
{
  "mcpServers": {
    "my-personal-bridge": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote-client",
        "https://mcp-api-bridge-worker.YOUR_SUBDOMAIN.workers.dev/sse"
      ]
    }
  }
}
\`\`\`

---

## 🤖 ابزارهای فعال در این ریپازیتوری:
${tools.map((t, idx) => `${idx + 1}. **\`${t.name}\`** [${t.method}]: ${t.description}`).join("\n")}
`;
}
