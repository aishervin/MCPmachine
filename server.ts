import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Initialize Gemini client with custom key or fallback to environment variable
let defaultGeminiClient: GoogleGenAI | null = null;

function getGeminiClient(customApiKey?: string): GoogleGenAI {
  const cleanCustomKey = (customApiKey || "").trim();
  const apiKey = cleanCustomKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "کلید API جمینای تنظیم نشده است. لطفاً کلید API خود را در بخش «مدیریت توکن‌ها» وارد کرده و دکمه تست را بزنید."
    );
  }

  // If a custom key is provided per request, create a fresh instance
  if (cleanCustomKey) {
    return new GoogleGenAI({
      apiKey: cleanCustomKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  // Otherwise reuse default client
  if (!defaultGeminiClient) {
    defaultGeminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return defaultGeminiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    role: "Senior Cloud & Integration Architect",
    environment: "Serverless / Cloudflare / MCP / LLM Agents",
    timestamp: new Date().toISOString(),
  });
});

// Architectural Chat & Discovery endpoint
app.post("/api/architect/chat", async (req, res) => {
  try {
    const { messages, currentTools, tunnelConfig, geminiToken } = req.body;

    const systemInstruction = `You are the Senior Cloud & Integration Architect and Automated Deployment Specialist for "SHΞN™ MCP Server" (created by Exclusive SHΞN™ made, Telegram: @shervini).

CORE CAPABILITIES & RESPONSIBILITIES:
1. Conversational Requirement Discovery:
   - When the user explains what they want in natural language (Farsi or English), intuitively grasp their exact intention.
   - Lead the conversation autonomously and calmly. Ask questions step-by-step so the user never feels lost.
   - For example:
     a) "I have software that only accepts an MCP server address, but I want it to connect to GitHub with an API token":
        Explain how the Cloudflare Worker acts as their personal MCP server, storing their GITHUB_TOKEN on Cloudflare Edge, and exposing native tools (issues, file reading, repos).
     b) "I have an AI model that only provides an API token, and I want it to act as an MCP server for my software":
        Explain how the Worker translates /chat/completions into MCP tools with AI_API_KEY injected automatically.
     c) "I want to automatically create the repo and deploy the worker from this app":
        Explain that they can open the "🔑 کلیدها و توکن‌ها" (Credentials) in the top navbar to save their tokens, or click "دیپلوی خودکار" directly from the chat.
     d) "How to deploy this entire React app to Cloudflare Pages with auto-update / CI/CD":
        Explain that this React app is 100% ready for Cloudflare Pages!
        Provide the exact build settings:
        - Framework preset: Vite
        - Build command: npm run build:pages
        - Build output directory: dist
        - Root directory: / (leave blank)
        - Node version: 20 (Environment variable NODE_VERSION=20)
        Mention that 'public/_redirects' is already included for seamless single-page application (SPA) routing, and that connecting it to GitHub means every git push will trigger auto-build and update automatically on Cloudflare Pages!

2. Step-by-Step Interactive Guidance:
   - Break down the process into clear, reassuring steps:
     - Step 1: Tool Selection & Scenario (GitHub tools, AI Relay, or Custom REST/GraphQL).
     - Step 2: Credentials (GitHub Token with 'repo' scope, Cloudflare Token with Workers Edit, and Account ID).
     - Step 3: One-click commit, push to GitHub, and deployment to Cloudflare Edge.
     - Step 4: Final delivery of the live SSE server URL (https://{worker}.{subdomain}.workers.dev/sse) and client configuration.

3. Zero-Cost & Security:
   - Reassure the user that Cloudflare Workers free tier allows 100,000 requests/day at $0 cost.
   - Secrets are securely saved on Cloudflare Edge and in local client storage.

4. Language & Tone:
   - If addressed in Persian (Farsi), respond in fluent, polite, clear, friendly Persian with bullet points.
   - If addressed in English, respond in articulate, professional English.`;

    const ai = getGeminiClient(geminiToken);

    // Prepare contents for Gemini
    const contents = (messages || []).map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    if (contents.length === 0) {
      contents.push({
        role: "user",
        parts: [
          {
            text: "Hello architect. Please introduce your discovery approach and ask what REST/GraphQL API I want to convert to MCP tools for my Cloudflare Worker repository.",
          },
        ],
      });
    }

    // Use gemini-3.1-flash-lite strictly as configured
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      text: response.text || "No response generated.",
    });
  } catch (error: any) {
    console.error("Gemini Architect Chat Error:", error);
    res.status(500).json({
      error: error.message || "Failed to communicate with Architectural Assistant.",
    });
  }
});

// Auto-generate / convert API to MCP Tool Schema endpoint
app.post("/api/architect/convert", async (req, res) => {
  try {
    const { apiType, rawInput, serviceName, geminiToken } = req.body;

    const ai = getGeminiClient(geminiToken);

    const prompt = `You are an expert MCP (Model Context Protocol) architect.
Convert the following ${apiType} definition or snippet into one or more MCP Tool declarations.
Service Name context: ${serviceName || "MyProprietaryAPI"}
Input definition:
${rawInput}

Return a valid JSON object matching this schema:
{
  "tools": [
    {
      "name": "string (snake_case, e.g. get_user_by_id)",
      "description": "Clear explanation of what the tool does for the LLM agent",
      "method": "GET | POST | PUT | DELETE | GRAPHQL",
      "endpoint": "URL path relative to base tunnel URL, e.g. /api/v1/users/{id}",
      "headers": { "Header-Name": "value or {{SECRET_NAME}}" },
      "parameters": {
        "type": "object",
        "properties": {
          "field_name": {
            "type": "string | number | boolean | array | object",
            "description": "parameter description"
          }
        },
        "required": ["list of required property names"]
      },
      "graphqlQuery": "optional string if GraphQL",
      "responseTransform": "optional JS expression or note to format payload"
    }
  ],
  "architecturalNotes": "Brief architectural advice on auth, rate limiting or tunnel routing for these tools"
}

Respond ONLY with valid JSON. No markdown backticks.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonText = response.text || "{}";
    const parsed = JSON.parse(jsonText);
    res.json(parsed);
  } catch (error: any) {
    console.error("Architect Convert Error:", error);
    res.status(500).json({
      error: error.message || "Failed to convert API definition.",
    });
  }
});

// MCP Simulation endpoint (emulates the Cloudflare Worker runtime for testing)
app.post("/api/simulate/mcp", (req, res) => {
  const { jsonrpc, method, params, id, registeredTools } = req.body;

  if (jsonrpc !== "2.0") {
    return res.status(400).json({
      jsonrpc: "2.0",
      error: { code: -32600, message: "Invalid Request: jsonrpc must be '2.0'" },
      id: id || null,
    });
  }

  // Handle MCP Protocol methods
  if (method === "initialize") {
    return res.json({
      jsonrpc: "2.0",
      result: {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {
            listChanged: true,
          },
          logging: {},
        },
        serverInfo: {
          name: "cloudflare-mcp-api-bridge",
          version: "1.0.0",
          runtime: "Cloudflare Workers / V8 Isolate",
        },
      },
      id,
    });
  }

  if (method === "notifications/initialized") {
    return res.status(204).end();
  }

  if (method === "ping") {
    return res.json({
      jsonrpc: "2.0",
      result: {},
      id,
    });
  }

  if (method === "tools/list") {
    const tools = (registeredTools || []).map((t: any) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.parameters || { type: "object", properties: {} },
    }));

    return res.json({
      jsonrpc: "2.0",
      result: {
        tools,
      },
      id,
    });
  }

  if (method === "tools/call") {
    const { name, arguments: toolArgs } = params || {};
    const tool = (registeredTools || []).find((t: any) => t.name === name);

    if (!tool) {
      return res.json({
        jsonrpc: "2.0",
        error: {
          code: -32601,
          message: `Tool not found: ${name}`,
        },
        id,
      });
    }

    // Simulate execution through Cloudflare Worker & Tunnel
    const mockOutput = {
      status: "success",
      executedVia: "Cloudflare Worker -> Zero Trust Tunnel",
      timestamp: new Date().toISOString(),
      tool: tool.name,
      targetEndpoint: tool.endpoint,
      method: tool.method,
      receivedArguments: toolArgs,
      simulatedResult: {
        message: `Successfully called ${tool.name} with provided arguments`,
        data: tool.mockResponse || {
          id: toolArgs?.id || "mock-1234",
          status: "active",
          details: "Verified via Cloudflare Worker Middleware",
        },
      },
    };

    return res.json({
      jsonrpc: "2.0",
      result: {
        content: [
          {
            type: "text",
            text: JSON.stringify(mockOutput, null, 2),
          },
        ],
      },
      id,
    });
  }

  res.json({
    jsonrpc: "2.0",
    error: {
      code: -32601,
      message: `Method '${method}' is not implemented`,
    },
    id,
  });
});

// Verify credentials (GitHub, Cloudflare, and Gemini/AI)
app.post("/api/verify/credentials", async (req, res) => {
  const { githubToken, cloudflareToken, cloudflareAccountId, geminiToken } = req.body;
  const results: any = {};

  if (githubToken) {
    try {
      const ghRes = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          "User-Agent": "Cloudflare-Worker-MCP-Agent/1.0",
          Accept: "application/vnd.github.v3+json",
        },
      });
      if (ghRes.ok) {
        const ghData = await ghRes.json();
        results.github = {
          valid: true,
          username: ghData.login,
          name: ghData.name,
          avatar: ghData.avatar_url,
        };
      } else {
        const err = await ghRes.json().catch(() => ({}));
        results.github = { valid: false, error: err.message || `HTTP ${ghRes.status}` };
      }
    } catch (e: any) {
      results.github = { valid: false, error: e.message };
    }
  }

  if (cloudflareToken) {
    try {
      const cfRes = await fetch("https://api.cloudflare.com/client/v4/user/tokens/verify", {
        headers: {
          Authorization: `Bearer ${cloudflareToken}`,
          "Content-Type": "application/json",
        },
      });
      const cfData = await cfRes.json();
      if (cfRes.ok && cfData.success) {
        results.cloudflare = {
          valid: true,
          status: cfData.result?.status || "active",
          accountId: cloudflareAccountId,
        };
      } else {
        results.cloudflare = {
          valid: false,
          error: cfData.errors?.[0]?.message || `HTTP ${cfRes.status}`,
        };
      }
    } catch (e: any) {
      results.cloudflare = { valid: false, error: e.message };
    }
  }

  if (geminiToken) {
    try {
      const testAi = getGeminiClient(geminiToken);
      const testResp = await testAi.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: "test",
      });

      if (testResp && testResp.text) {
        results.gemini = {
          valid: true,
          status: "active",
          model: "gemini-3.1-flash-lite",
        };
      } else {
        results.gemini = {
          valid: false,
          error: "پاسخی از مدل جمینای دریافت نشد.",
        };
      }
    } catch (e: any) {
      results.gemini = {
        valid: false,
        error: e.message || "کلید نامعتبر است یا دسترسی به مدل محدود شده است.",
      };
    }
  }

  res.json(results);
});

// Automated GitHub Repository Creator & Committer
app.post("/api/github/deploy-repo", async (req, res) => {
  const { githubToken, repoName, description, isPrivate, files } = req.body;

  if (!githubToken) {
    return res.status(400).json({ error: "Missing GitHub Personal Access Token" });
  }

  const cleanRepoName = (repoName || "mcp-api-bridge-worker")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-");

  try {
    // 1. Get authenticated user
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        "User-Agent": "Cloudflare-Worker-MCP-Agent/1.0",
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!userRes.ok) {
      const errData = await userRes.json();
      return res.status(401).json({ error: `GitHub Auth Failed: ${errData.message}` });
    }
    const userData = await userRes.json();
    const owner = userData.login;

    // 2. Create Repository (or use existing)
    let repoUrl = "";
    const createRepoRes = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${githubToken}`,
        "User-Agent": "Cloudflare-Worker-MCP-Agent/1.0",
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: cleanRepoName,
        description: description || "Cloudflare Worker Model Context Protocol (MCP) Bridge",
        private: !!isPrivate,
        auto_init: false,
      }),
    });

    if (createRepoRes.ok) {
      const createdRepo = await createRepoRes.json();
      repoUrl = createdRepo.html_url;
    } else if (createRepoRes.status === 422) {
      // Repository likely already exists; retrieve it
      repoUrl = `https://github.com/${owner}/${cleanRepoName}`;
    } else {
      const err = await createRepoRes.json();
      return res.status(createRepoRes.status).json({ error: err.message || "Failed to create repository" });
    }

    // 3. Commit files via GitHub Contents API
    const committedFiles: string[] = [];
    if (Array.isArray(files)) {
      for (const file of files) {
        try {
          const contentBase64 = Buffer.from(file.content, "utf-8").toString("base64");

          // Check if file already exists to get SHA for update
          const checkRes = await fetch(
            `https://api.github.com/repos/${owner}/${cleanRepoName}/contents/${file.path}`,
            {
              headers: {
                Authorization: `Bearer ${githubToken}`,
                "User-Agent": "Cloudflare-Worker-MCP-Agent/1.0",
                Accept: "application/vnd.github.v3+json",
              },
            }
          );

          let sha: string | undefined = undefined;
          if (checkRes.ok) {
            const checkData = await checkRes.json();
            sha = checkData.sha;
          }

          const putRes = await fetch(
            `https://api.github.com/repos/${owner}/${cleanRepoName}/contents/${file.path}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${githubToken}`,
                "User-Agent": "Cloudflare-Worker-MCP-Agent/1.0",
                Accept: "application/vnd.github.v3+json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                message: `feat(mcp): add/update ${file.path}`,
                content: contentBase64,
                sha,
              }),
            }
          );

          if (putRes.ok) {
            committedFiles.push(file.path);
          }
        } catch (fileErr) {
          console.error(`Error uploading file ${file.path}:`, fileErr);
        }
      }
    }

    res.json({
      success: true,
      owner,
      repoName: cleanRepoName,
      repoUrl,
      committedCount: committedFiles.length,
      committedFiles,
    });
  } catch (error: any) {
    console.error("GitHub Deploy Error:", error);
    res.status(500).json({ error: error.message || "GitHub automated deployment failed" });
  }
});

// Automated Cloudflare Worker Deployer
app.post("/api/cloudflare/deploy-worker", async (req, res) => {
  const { cloudflareToken, cloudflareAccountId, scriptName, workerCode, secrets } = req.body;

  if (!cloudflareToken || !cloudflareAccountId) {
    return res.status(400).json({ error: "Missing Cloudflare API Token or Account ID" });
  }

  const cleanScriptName = (scriptName || "mcp-api-bridge-worker")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-");

  try {
    // 1. Upload Worker Script to Cloudflare
    // Cloudflare Workers API allows direct JavaScript/ESM script upload
    const uploadRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/workers/scripts/${cleanScriptName}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${cloudflareToken}`,
          "Content-Type": "application/javascript",
        },
        body: workerCode,
      }
    );

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok || !uploadData.success) {
      const msg = uploadData.errors?.[0]?.message || `Upload failed with status ${uploadRes.status}`;
      return res.status(uploadRes.status || 400).json({ error: msg, details: uploadData.errors });
    }

    // 2. Set Secrets if provided
    const configuredSecrets: string[] = [];
    if (secrets && typeof secrets === "object") {
      for (const [key, val] of Object.entries(secrets)) {
        if (val && typeof val === "string") {
          try {
            await fetch(
              `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/workers/scripts/${cleanScriptName}/secrets`,
              {
                method: "PUT",
                headers: {
                  Authorization: `Bearer ${cloudflareToken}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name: key,
                  text: val,
                  type: "secret_text",
                }),
              }
            );
            configuredSecrets.push(key);
          } catch (secErr) {
            console.error(`Failed to set secret ${key}:`, secErr);
          }
        }
      }
    }

    // 3. Enable workers.dev subdomain route
    await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/workers/scripts/${cleanScriptName}/subdomain`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cloudflareToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled: true }),
      }
    );

    // 4. Retrieve workers.dev subdomain name
    let subdomain = "subdomain";
    try {
      const subRes = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/workers/subdomain`,
        {
          headers: {
            Authorization: `Bearer ${cloudflareToken}`,
          },
        }
      );
      if (subRes.ok) {
        const subData = await subRes.json();
        subdomain = subData.result?.subdomain || "workers";
      }
    } catch {
      // ignore
    }

    const workerUrl = `https://${cleanScriptName}.${subdomain}.workers.dev/sse`;
    const healthUrl = `https://${cleanScriptName}.${subdomain}.workers.dev/health`;

    res.json({
      success: true,
      scriptName: cleanScriptName,
      workerUrl,
      healthUrl,
      subdomain,
      configuredSecrets,
    });
  } catch (error: any) {
    console.error("Cloudflare Deploy Error:", error);
    res.status(500).json({ error: error.message || "Cloudflare automated deployment failed" });
  }
});

// Vite Middleware integration for Full-Stack Applet
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Cloudflare MCP Architect Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
