import * as fs from "fs";
import * as path from "path";

import staticLandingPage from "./landing/landing";

/**
 * Markdownファイルを読み込み、HTMLに変換して保存する関数
 * @param markdownPath 変換するMarkdownファイルのパス
 */
const __dirname = path.join(path.resolve(), "staticBuilder");

const buildLandingPage = async () => {
  const template = fs.readFileSync(
    path.join(__dirname, "template.html"),
    "utf-8"
  );
  const landingContent = staticLandingPage();
  const finalHtml = template.replace(
    '<div id="root"></div>',
    `<div id="root">${landingContent}</div>`
  );

  const outputPath = path.join(__dirname, "dist", "index.html");
  fs.writeFileSync(outputPath, finalHtml, "utf-8");
};

const copyToDist = () => {
  const sourcePath = path.join(__dirname, "dist");
  const destPath = path.join(__dirname, "../dist");

  fs.cpSync(sourcePath, destPath, { recursive: true });
};

const createDistDir = () => {
  const distPath = path.join(__dirname, "dist");
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath);
  } else {
    fs.rmSync(distPath, { recursive: true, force: true });
    fs.mkdirSync(distPath);
  }
};

const main = async () => {
  createDistDir();
  buildLandingPage();
  copyToDist();
};

main();
