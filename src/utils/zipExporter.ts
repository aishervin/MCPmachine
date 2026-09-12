import JSZip from "jszip";
import { RepoFile } from "../types";

export async function downloadRepoZip(files: RepoFile[], filename: string = "shen-mcp-server-worker.zip"): Promise<void> {
  const zip = new JSZip();

  files.forEach((file) => {
    zip.file(file.path, file.content);
  });

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
