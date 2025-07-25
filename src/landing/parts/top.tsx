import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LinkWithOffset from "./linkwithoffset";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons/faChevronDown";
import BlurCard from "../../style/cardDesign";
import React from "react";
import FillBackgroundDesign from "../../style/fillBackgroundDesign";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons/faArrowRight";
import { Link } from "react-router-dom";

/**
 * ランディングページの一番上の表示用
 *
 */

const LandTop: React.FC = () => {
  return (
    <FillBackgroundDesign backgroundImagePath="/assets/landing/bg.webp">
      <div className="container text-white d-flex justify-content-left align-items-center position-relative">
        <div
          className="p-5 "
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            borderLeft: "5px solid rgb(255, 255, 255)",
            backdropFilter: "blur(5px)",
          }}
        >
          <h1 style={{ fontSize: "4rem" }}>ボーイスカウト活動に革新を</h1>
          <p>
            デジタル技術による団運営の円滑化で未来のスカウト活動を創造していく
          </p>
          <p>
            スカウトによって作られた、スカウトのための情報管理アプリである
            <br />「<span className="fw-bold">My Historyアプリ</span>」 は
            ボーイスカウトの活動記録をデジタルで管理し、団の運営をサポートします。
          </p>
          <div className="mt-3 d-flex">
            <Link to="/auth/register" className="text-decoration-none">
              <BlurCard
                className="d-flex justify-content-center align-items-center"
                style={{
                  marginTop: "1rem",
                  cursor: "pointer",
                }}
                aria-label="Get Started"
              >
                Get Started：今すぐ始めよう
                <FontAwesomeIcon icon={faArrowRight} />
              </BlurCard>
            </Link>
          </div>
        </div>
      </div>
      <LinkWithOffset
        to="about"
        className="text-center position-absolute bottom-0 mb-3"
        style={{
          textDecoration: "none",
        }}
      >
        <BlurCard>
          詳細はこちら
          <br />
          <FontAwesomeIcon icon={faChevronDown} />
        </BlurCard>
      </LinkWithOffset>
    </FillBackgroundDesign>
  );
};

export default LandTop;
