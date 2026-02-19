import React from "react";

import Header from "./parts/header";
import LandTop from "./parts/top";

import About from "./parts/about";
import Features from "./parts/features";

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
      <div id="about" className="mt-5 pb-3">
        <About />
      </div>
      <div id="features" className="mt-5 pb-3">
        <Features />
      </div>
    </>
  );
};

//性的に出力したい

import { renderToString } from "react-dom/server";
const staticLandingPage = (): string => {
  const html = renderToString(<Landing />);

  return html;
};

export default staticLandingPage;
