import * as fs from "fs";
import * as path from "path";
import staticLandingPage from "../landing/landing";
import staticHelpPage from "../help/help";
import staticHelpArticle from "../help/article";

const ROOT_DIR = path.join(path.resolve());

const TEMPLATE_PATH = path.join(ROOT_DIR, "template.html");
const OUTPUT_PATH = path.join(ROOT_DIR, "dist", "index.html");
const HELP_OUTPUT_DIR = path.join(ROOT_DIR, "dist", "help");

const applyTemplate = (content: string, title: string): string => {
  const template = fs.readFileSync(TEMPLATE_PATH, "utf-8");
  return template
    .replace('<div id="root"></div>', `<div id="root">${content}</div>`)
    .replace("<title></title>", `<title>${title}</title>`);
};

/** ランディングページを dist/index.html としてビルドする */
export const buildLandingPage = async (): Promise<void> => {
  const html = applyTemplate(staticLandingPage(), "My Historyアプリ");
  fs.writeFileSync(OUTPUT_PATH, html, "utf-8");
};

const extractTitle = (markdown: string, fallback: string): string => {
  const firstHeader = markdown.match(/^#\s+(.+)$/m);
  if (firstHeader?.[1]) {
    return firstHeader[1].trim();
  }
  return fallback;
};

const writeHelpTopPage = (): void => {
  const html = applyTemplate(staticHelpPage(), "ヘルプ | My Historyアプリ");
  fs.writeFileSync(path.join(HELP_OUTPUT_DIR, "index.html"), html, "utf-8");
};

export const buildHelpPages = async (
  markdownFiles: string[],
): Promise<void> => {
  fs.mkdirSync(HELP_OUTPUT_DIR, { recursive: true });
  writeHelpTopPage();

  for (const filePath of markdownFiles) {
    const markdown = fs.readFileSync(filePath, "utf-8");
    const slug = path.basename(filePath, ".md");
    const title = `${extractTitle(markdown, slug)} | ヘルプ`;
    const articleHtml = staticHelpArticle(markdown);
    const pageHtml = applyTemplate(articleHtml, title);
    fs.writeFileSync(
      path.join(HELP_OUTPUT_DIR, `${slug}.html`),
      pageHtml,
      "utf-8",
    );
  }
};

export default applyTemplate;
