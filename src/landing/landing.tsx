import About from "./parts/about";
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
      <div className="vh-100">
        <LandTop />
      </div>
      <div id="about">
        <About />
      </div>
    </>
  );
};

export default Landing;
