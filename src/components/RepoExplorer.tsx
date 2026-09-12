import React, { useState } from "react";
import {
  Folder,
  FileCode,
  Copy,
  Check,
  Download,
  Terminal,
  FileText,
  Settings,
  Shield,
  Layers,
  ExternalLink,
} from "lucide-react";
import { RepoFile } from "../types";
import { downloadRepoZip } from "../utils/zipExporter";

interface RepoExplorerProps {
  files: RepoFile[];
  lang: "fa" | "en";
}

export const RepoExplorer: React.FC<RepoExplorerProps> = ({ files, lang }) => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>("wrangler.toml");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const selectedFile = files.find((f) => f.path === selectedFilePath) || files[0];

  const handleCopyContent = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setDownloading(true);
      await downloadRepoZip(files, "shen-mcp-server-worker.zip");
    } catch (err) {
      console.error("ZIP download failed", err);
    } finally {
      setDownloading(false);
    }
  };

  const getFileIcon = (file: RepoFile) => {
    switch (file.category) {
      case "config":
        return <Settings className="w-3.5 h-3.5 text-stone-400" />;
      case "source":
        return <FileCode className="w-3.5 h-3.5 text-orange-400" />;
      case "tunnel":
        return <Shield className="w-3.5 h-3.5 text-emerald-400" />;
      case "ci-cd":
        return <Terminal className="w-3.5 h-3.5 text-blue-400" />;
      case "docs":
        return <FileText className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <FileCode className="w-3.5 h-3.5 text-stone-400" />;
    }
  };

  // Group files by folder
  const fileGroups: Record<string, RepoFile[]> = {
    "Root (Worker Config & Secrets)": [],
    "src (MCP SSE & Tools Engine)": [],
    "src/middleware (Zero-Trust Tunnel)": [],
    "tunnel (cloudflared Zero-Cost Daemon)": [],
    ".github/workflows (Automated CI/CD)": [],
  };

  files.forEach((file) => {
    if (file.path.startsWith("src/middleware/")) {
      fileGroups["src/middleware (Zero-Trust Tunnel)"].push(file);
    } else if (file.path.startsWith("src/")) {
      fileGroups["src (MCP SSE & Tools Engine)"].push(file);
    } else if (file.path.startsWith("tunnel/")) {
      fileGroups["tunnel (cloudflared Zero-Cost Daemon)"].push(file);
    } else if (file.path.startsWith(".github/")) {
      fileGroups[".github/workflows (Automated CI/CD)"].push(file);
    } else {
      fileGroups["Root (Worker Config & Secrets)"].push(file);
    }
  });

  return (
    <div className="space-y-6" dir={lang === "fa" ? "rtl" : "ltr"}>
      {/* Action Banner */}
      <div className="neu-convex p-4 sm:p-5 rounded-2xl border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>{lang === "fa" ? "ساختار کامل ریپازیتوری ورکر (Cloudflare Worker Codebase)" : "Complete Worker Repository Code"}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-600/20 text-orange-400 border border-orange-500/30">
              {files.length} Files
            </span>
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            {lang === "fa"
              ? "این فایل‌ها آماده کامیت در گیت‌هاب و استقرار مستقیم روی لبه Cloudflare Workers هستند."
              : "Ready to push to GitHub and deploy on Cloudflare Workers edge."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadZip}
            disabled={downloading}
            className="neu-btn-primary px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>
              {downloading
                ? lang === "fa"
                  ? "در حال زیپ کردن..."
                  : "Packing..."
                : lang === "fa"
                ? "دانلود کل ریپازیتوری (ZIP)"
                : "Download Repo (ZIP)"}
            </span>
          </button>
        </div>
      </div>

      {/* Explorer Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* File Tree (4 cols) */}
        <div className="lg:col-span-4 neu-flat rounded-2xl border border-stone-800 p-4 overflow-y-auto max-h-[700px]">
          <div className="text-xs font-bold text-stone-300 mb-3 px-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-orange-400" />
              <span>{lang === "fa" ? "درخت فایل‌های مخزن" : "Repository File Tree"}</span>
            </span>
            <span className="text-[10px] text-stone-500 font-mono">{files.length} files</span>
          </div>

          <div className="space-y-4 text-xs">
            {Object.entries(fileGroups).map(([groupTitle, groupFiles]) => {
              if (groupFiles.length === 0) return null;
              return (
                <div key={groupTitle} className="space-y-1.5">
                  <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider px-1">
                    {groupTitle}
                  </div>
                  {groupFiles.map((file) => {
                    const isSelected = file.path === selectedFilePath;
                    return (
                      <button
                        key={file.path}
                        onClick={() => setSelectedFilePath(file.path)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left font-mono transition text-xs ${
                          isSelected
                            ? "neu-inset text-orange-300 font-bold border border-orange-500/40"
                            : "text-stone-400 hover:text-stone-200 hover:bg-stone-900/60"
                        }`}
                      >
                        {getFileIcon(file)}
                        <span className="truncate">{file.path}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* File Viewer (8 cols) */}
        <div className="lg:col-span-8 neu-convex rounded-2xl border border-stone-800/90 flex flex-col overflow-hidden">
          {/* File Header */}
          <div className="bg-stone-950/80 px-4 py-3 border-b border-stone-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-stone-200 font-mono">
              <FileCode className="w-4 h-4 text-orange-500" />
              <span className="font-bold">{selectedFile.path}</span>
              <span className="text-[10px] text-stone-400 px-2 py-0.5 rounded-full bg-stone-900 border border-stone-800 uppercase font-mono">
                {selectedFile.language}
              </span>
            </div>

            <button
              onClick={handleCopyContent}
              className="neu-btn px-3 py-1.5 rounded-xl text-stone-300 hover:text-white text-[11px] font-semibold flex items-center gap-1.5 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{lang === "fa" ? "کپی شد" : "Copied"}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-400" />
                  <span>{lang === "fa" ? "کپی کد" : "Copy Code"}</span>
                </>
              )}
            </button>
          </div>

          {/* File Content */}
          <div className="p-4 overflow-x-auto text-xs font-mono leading-relaxed text-stone-300 flex-1 max-h-[620px] bg-stone-950/60">
            <pre className="whitespace-pre">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
