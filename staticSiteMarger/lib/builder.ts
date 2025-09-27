import fs from "fs";
import path from "path";
import staticLandingPage from "../landing/landing";
import { __dirname } from "lib/main";

const templateBuilder = (content: string, title: string): string => {
  const template = fs.readFileSync(
    path.join(__dirname, "template.html"),
    "utf-8"
  );

  const finalHtml = template
    .replace('<div id="root"></div>', `<div id="root">${content}</div>`)
    .replace("<title></title>", `<title>${title}</title>`);
  return finalHtml;
};

// LPをビルドしてdistにぶち込む関数
export const buildLandingPage = async () => {
  const landingContent = staticLandingPage();
  const finalHtml = templateBuilder(landingContent, "My Historyアプリ");

  const outputPath = path.join(__dirname, "dist", "index.html");
  fs.writeFileSync(outputPath, finalHtml, "utf-8");
};

export default templateBuilder;
