import * as fs from "fs";
import * as path from "path";
import { buildHelpPages, buildLandingPage } from "./builder";

// このファイルが存在するディレクトリ (staticSiteMarger/) を基点にする
export const __dirname = path.join(path.resolve());

// ---------------------------------------------------------------------------
// ユーティリティ
// ---------------------------------------------------------------------------

/** パスがディレクトリとして存在するか確認する */
const isDir = (targetPath: string): boolean => {
  try {
    return fs.statSync(targetPath).isDirectory();
  } catch {
    return false;
  }
};

/** ディレクトリが無ければ作成する（recursive） */
const ensureDir = (targetPath: string): void => {
  if (!isDir(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }
};

/** ディレクトリをクリアして再作成する */
const resetDir = (targetPath: string): void => {
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  }
  fs.mkdirSync(targetPath, { recursive: true });
};

// ---------------------------------------------------------------------------
// パス定義
// ---------------------------------------------------------------------------

const PATHS = {
  helpPages: path.join(__dirname, "help/pages"),
  dist: path.join(__dirname, "dist"),
  distHelp: path.join(__dirname, "dist/help"),
  public: path.join(__dirname, "public"),
  frontendDist: path.join(__dirname, "../frontend/dist"),
  backendBuildTmp: path.join(__dirname, "../backend/buildTmp"),
} as const;

// ---------------------------------------------------------------------------
// ビルドステップ
// ---------------------------------------------------------------------------

const getMarkdownFiles = (): string[] => {
  if (!isDir(PATHS.helpPages)) {
    console.warn(`[staticSiteMarger] Directory not found: ${PATHS.helpPages}`);
    return [];
  }

  return fs
    .readdirSync(PATHS.helpPages)
    .filter((file) => file.endsWith(".md"))
    .map((file) => path.join(PATHS.helpPages, file));
};

/** staticSiteMarger/dist を初期化して help サブディレクトリも作成する */
const initDistDir = (): void => {
  resetDir(PATHS.dist);
  ensureDir(PATHS.distHelp);
};

/** public/ の静的アセットを dist/ にコピーする */
const copyPublicAssets = (): void => {
  if (!isDir(PATHS.public)) {
    console.warn(
      `[staticSiteMarger] Public directory not found: ${PATHS.public}`,
    );
    return;
  }
  ensureDir(PATHS.dist);
  fs.cpSync(PATHS.public, PATHS.dist, { recursive: true });
};

/**
 * staticSiteMarger/dist を frontend/dist にマージする。
 * - frontend/dist の index.html はまだ存在していれば spa.html に退避させる
 * - その後 dist/ の内容を上書きコピーする（ランディング用 index.html を配置）
 */
const copyToDist = (): void => {
  if (!isDir(PATHS.dist)) {
    console.warn(`[staticSiteMarger] dist not found. Run build first.`);
    return;
  }

  ensureDir(PATHS.frontendDist);

  const srcIndex = path.join(PATHS.frontendDist, "index.html");
  const spaHtml = path.join(PATHS.frontendDist, "spa.html");

  if (!fs.existsSync(spaHtml) && fs.existsSync(srcIndex)) {
    fs.cpSync(srcIndex, spaHtml);
  }

  if (fs.existsSync(srcIndex)) {
    fs.rmSync(srcIndex, { force: true });
  }

  fs.cpSync(PATHS.dist, PATHS.frontendDist, { recursive: true });
};

/** frontend/dist を backend/buildTmp にコピーする */
const copyToBackend = (): void => {
  if (!isDir(PATHS.frontendDist)) {
    console.warn(
      `[staticSiteMarger] frontend/dist not found: ${PATHS.frontendDist}`,
    );
    return;
  }
  ensureDir(path.dirname(PATHS.backendBuildTmp));
  fs.cpSync(PATHS.frontendDist, PATHS.backendBuildTmp, { recursive: true });
};

// ---------------------------------------------------------------------------
// エントリーポイント
// ---------------------------------------------------------------------------

export const main = async (test: boolean): Promise<void> => {
  console.log("Starting static site generation...");

  const markdownFiles = getMarkdownFiles();
  console.log(`Found ${markdownFiles.length} markdown files.`);

  initDistDir();
  await buildLandingPage();
  await buildHelpPages(markdownFiles);
  copyPublicAssets();

  if (!test) {
    copyToDist();
    copyToBackend();
  }
};
