import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LinkWithOffset from "./linkwithoffset";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons/faChevronDown";
import BlurCard from "./cardDesign";
import React from "react";
import FillBackgroundDesign from "./fillBackgroundDesign";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons/faArrowRight";
import { CONTACT_URL } from "./constants";

/**
 * ランディングページの一番上の表示用
 */

const LandTop: React.FC = () => {
  return (
    <FillBackgroundDesign backgroundImagePath="landing/bg.webp">
      <div className="container text-white pt-5 px-3 px-md-4">
        <div
          className="p-4 p-md-5"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            borderLeft: "5px solid rgb(255, 255, 255)",
            backdropFilter: "blur(6px)",
          }}
        >
          <p className="mb-2" style={{ opacity: 0.7, fontSize: "0.9rem" }}>
            ボーイスカウト団向けの記録管理アプリ
          </p>
          <h1
            className="fw-bold lh-sm mb-3"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            スカウティングの記録を
            <br />
            もっとシンプルに
          </h1>
          <p className="mb-4">
            指導者の団運営から、スカウト個人の進級記録まで。
            <br className="d-none d-md-inline" />
            必要な情報にすぐアクセスできるWebアプリです。
          </p>

          <div className="d-flex flex-wrap gap-3 align-items-center">
            <a href="/auth/register" className="text-decoration-none">
              <BlurCard
                className="d-flex justify-content-center align-items-center"
                style={{ cursor: "pointer" }}
              >
                無料ではじめる
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="ms-2"
                  style={{ height: "1em" }}
                />
              </BlurCard>
            </a>
            <a href={CONTACT_URL} className="text-decoration-none">
              <BlurCard
                className="d-flex justify-content-center align-items-center"
                style={{
                  cursor: "pointer",
                  backgroundColor: "rgba(255, 255, 255, 0.25)",
                }}
              >
                団への導入を相談
              </BlurCard>
            </a>
          </div>
          <div className="mt-3">
            <a
              href="/help/"
              className="text-white text-decoration-underline small"
            >
              使い方を先に見る
            </a>
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
          詳しく見る
          <br />
          <FontAwesomeIcon icon={faChevronDown} style={{ height: "1.5em" }} />
        </BlurCard>
      </LinkWithOffset>
    </FillBackgroundDesign>
  );
};

export default LandTop;
