import About from "./parts/about";
import Features from "./parts/features";
import Header from "./parts/header";
import LandTop from "./parts/top";

/**
 *
 * ランディングページ
 * 各パートはpartsフォルダ内で実装
 *
 */

const Landing = () => {
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

export default Landing;
