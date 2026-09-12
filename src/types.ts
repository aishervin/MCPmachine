export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "GRAPHQL";

export interface ToolParameterProperty {
  type: string;
  description: string;
  enum?: string[];
  default?: any;
}

export interface McpToolDefinition {
  id: string;
  name: string;
  description: string;
  method: HttpMethod;
  endpoint: string;
  targetBaseUrl?: string; // e.g. "https://api.github.com" or empty to use Tunnel
  authSecretName?: string; // e.g. "GITHUB_TOKEN" or "AI_API_KEY" or "TARGET_API_KEY"
  headers?: Record<string, string>;
  parameters: {
    type: "object";
    properties: Record<string, ToolParameterProperty>;
    required?: string[];
  };
  graphqlQuery?: string;
  responseTransform?: string;
  mockResponse?: any;
}

export type ArchitecturePreset = "github" | "ai_relay" | "internal_tunnel" | "custom";

export interface UserCredentials {
  githubToken: string;
  cloudflareToken: string;
  cloudflareAccountId: string;
  geminiToken?: string;
  repoName?: string;
  workerName?: string;
  isPrivate?: boolean; // Default true (private repository)
  hardcodeSecrets?: boolean; // Hardcode secrets into worker file for private repo
}

export interface DeploymentLogStep {
  id: string;
  title: string;
  status: "pending" | "running" | "success" | "error";
  details?: string;
  url?: string;
  timestamp: string;
}

export interface CloudflareTunnelConfig {
  tunnelName: string;
  tunnelId: string;
  hostname: string;
  localServiceUrl: string;
  authType: "none" | "cf-access" | "bearer-token" | "api-key";
  cfAccessClientId?: string;
  cfAccessClientSecret?: string;
  customToken?: string;
}

export interface RepoFile {
  path: string;
  filename: string;
  category: "config" | "source" | "tunnel" | "ci-cd" | "docs";
  language: "json" | "typescript" | "yaml" | "toml" | "markdown";
  content: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface ProtocolLogEntry {
  id: string;
  timestamp: string;
  direction: "client->worker" | "worker->client" | "worker->tunnel";
  type: "sse_event" | "jsonrpc_req" | "jsonrpc_res" | "tunnel_fetch";
  data: any;
}
