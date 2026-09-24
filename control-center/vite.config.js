import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function copyExhibitionImages() {
  const sourceRoot = path.resolve(__dirname, "../playnice-site/public/exhibition");
  const targetRoot = path.resolve(__dirname, "dist/exhibition");
  const allowed = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

  const copyTree = (sourceDir, targetDir) => {
    if (!fs.existsSync(sourceDir)) return;
    for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
      const sourcePath = path.join(sourceDir, entry.name);
      const targetPath = path.join(targetDir, entry.name);
      if (entry.isDirectory()) {
        copyTree(sourcePath, targetPath);
        continue;
      }
      if (!allowed.has(path.extname(entry.name).toLowerCase())) continue;
      fs.mkdirSync(targetDir, { recursive: true });
      fs.copyFileSync(sourcePath, targetPath);
    }
  };

  return {
    name: "copy-exhibition-images",
    closeBundle() {
      copyTree(sourceRoot, targetRoot);
    }
  };
}

export default defineConfig({
  plugins: [react(), copyExhibitionImages()],
  resolve: {
    alias: {
      "@shop": path.resolve(__dirname, "../playnice-site/src")
    }
  },
  server: {
    fs: {
      allow: [path.resolve(__dirname, "..")]
    }
  }
});
