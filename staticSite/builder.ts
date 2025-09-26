import fs from "fs";
import path from "path";
import { __dirname } from "main";

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

export default templateBuilder;
