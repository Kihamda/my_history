import * as fs from "fs";
import * as path from "path";

import staticLandingPage from "./landing/landing";
import templateBuilder from "./builder";

/**
 * Markdownファイルを読み込み、HTMLに変換して保存する関数
 * @param markdownPath 変換するMarkdownファイルのパス
 */
const __dirname = path.join(path.resolve(), "staticBuilder");

const getAllMarkdownFiles = (): string[] => {
  const markdownFiles: string[] = [];
  const dirPath = path.join(__dirname, "help", "markdown");

  fs.readdirSync(dirPath).forEach((file) => {
    if (file.endsWith(".md")) {
      markdownFiles.push(path.join(dirPath, file));
    }
  });

  return markdownFiles;
};

// LPをビルドしてdistにぶち込む関数
const buildLandingPage = async () => {
  const landingContent = staticLandingPage();
  const finalHtml = templateBuilder(landingContent, "My Historyアプリ");

  const outputPath = path.join(__dirname, "dist", "index.html");
  fs.writeFileSync(outputPath, finalHtml, "utf-8");
};

// build時にviteの方のdistにコピーする。
const copyToDist = () => {
  const sourcePath = path.join(__dirname, "dist");
  const destPath = path.join(__dirname, "../dist");

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

const main = async () => {
  console.log("Starting static site generation...");
  const markdownFiles = getAllMarkdownFiles();
  console.log(`Found ${markdownFiles} markdown files.`);
  createDistDir();
  buildLandingPage();
  copyToDist();
};

main();
