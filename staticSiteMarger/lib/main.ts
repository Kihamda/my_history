import * as fs from "fs";
import * as path from "path";
import { buildLandingPage } from "./builder";

/**
 * Markdownファイルを読み込み、HTMLに変換して保存する関数
 * @param markdownPath 変換するMarkdownファイルのパス
 */
export const __dirname = path.join(path.resolve());

const getAllMarkdownFiles = (): string[] => {
  const markdownFiles: string[] = [];
  const dirPath = path.join(__dirname, "help/pages");

  fs.readdirSync(dirPath).forEach((file) => {
    if (file.endsWith(".md")) {
      markdownFiles.push(path.join(dirPath, file));
    }
  });

  return markdownFiles;
};

const copyToBackend = () => {
  const sourcePath = path.join(__dirname, "../frontend/dist");
  const destPath = path.join(__dirname, "../backend/buildTmp");

  fs.cpSync(sourcePath, destPath, { recursive: true });
};

// build時にviteの方のdistにコピーする。
const copyToDist = () => {
  const sourcePath = path.join(__dirname, "dist");
  const destPath = path.join(__dirname, "../frontend/dist/");

  if (!fs.existsSync(path.join(destPath, "spa.html"))) {
    fs.cpSync(
      path.join(destPath, "index.html"),
      path.join(destPath, "spa.html"),
      {
        recursive: true,
      }
    );
  }

  fs.rmSync(path.join(destPath, "index.html"), {
    recursive: true,
    force: true,
  });

  fs.cpSync(sourcePath, destPath, { recursive: true });
};

// distディレクトリを作成する関数
// 既に存在する場合は削除してから作成
const createDistDir = () => {
  const distPath = path.join(__dirname, "dist");
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath);
  } else {
    fs.rmSync(distPath, { recursive: true, force: true });
    fs.mkdirSync(distPath);
  }
  fs.mkdirSync(path.join(distPath, "help"), { recursive: true });
};

const copyPublicAssets = () => {
  const publicPath = path.join(__dirname, "public");
  const distPublicPath = path.join(__dirname, "dist");

  fs.cpSync(publicPath, distPublicPath, { recursive: true });
};

export const main = async (test: boolean) => {
  console.log("Starting static site generation...");
  const markdownFiles = getAllMarkdownFiles();
  console.log(`Found ${markdownFiles} markdown files.`);
  createDistDir();
  buildLandingPage();
  copyPublicAssets();

  console.log(test);
  if (!test) {
    copyToDist();
    copyToBackend();
  }
};
