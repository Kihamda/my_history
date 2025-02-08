import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LinkWithOffset from "./linkwithoffset";
import SignInUp from "./signiniup";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons/faChevronDown";
import BlurCard from "../../common/style/cardDesign";
import React from "react";
import FillBackgroundDesign from "../../common/style/fillBackgroundDesign";

/**
 * ランディングページの一番上の表示用
 *
 */

const LandTop: React.FC = () => {
  return (
    <FillBackgroundDesign backgroundImagePath="/assets/landing/bg.webp">
      <BlurCard>
        <div
          className="text-center"
          style={{
            padding: "3rem",
          }}
        >
          <h1>My Historyアプリ</h1>
          <p>My History of Scouting プロジェクト</p>
          <div className="mt-3">
            <SignInUp />
          </div>
        </div>
      </BlurCard>
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
