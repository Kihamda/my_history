import React from "react";

import Header from "./parts/header";
import LandTop from "./parts/top";

import About from "./parts/about";
import Features from "./parts/features";
import Flow from "./parts/flow";
import Trust from "./parts/trust";

/**
 *
 * ランディングページ
 * 各パートはpartsフォルダ内で実装
 *
 */

const Landing = (): React.ReactElement => {
  return (
    <>
      <Header />
      <div id="top" className="vh-100">
        <LandTop />
      </div>
      <div id="about" className="py-5">
        <About />
      </div>
      <div id="features" className="py-5 bg-light">
        <Features />
      </div>
      <div id="flow" className="py-5">
        <Flow />
      </div>
      <div id="trust" className="py-5 bg-light">
        <Trust />
      </div>

      {/* モバイルでフローティングバーがコンテンツを隠さないようにする余白 */}
      <div className="d-md-none" style={{ height: "72px" }} />

      {/* モバイル専用フローティングCTA スクロール位置関係なく常に表示 */}
      <div
        className="d-md-none"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1040,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(8px)",
          borderTop: "1px solid #dee2e6",
          padding: "0.75rem 1rem",
          boxShadow: "0 -4px 16px rgba(0,0,0,0.12)",
        }}
      >
        <a
          href="/auth/register"
          className="btn btn-dark w-100 py-2"
          aria-label="無料ではじめる"
        >
          無料ではじめる
        </a>
      </div>
    </>
  );
};

// 静的に出力する

import { renderToString } from "react-dom/server";
const staticLandingPage = (): string => {
  const html = renderToString(<Landing />);

  return html;
};

export default staticLandingPage;
