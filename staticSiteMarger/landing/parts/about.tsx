import React from "react";

/**
 * containerの中にrowを入れてlg以上の画面サイズで2つのコンポーネントを並べる
 * @returns Aboutコンポーネント
 */

import { Button } from "react-bootstrap";
import LinkWithOffset from "./linkwithoffset";

const About = (): React.ReactElement => {
  return (
    <div className="container">
      <div className="row align-items-center flex-column-reverse flex-lg-row">
        <div className="col-12 col-lg-6 d-flex flex-column justify-content-center py-4 py-lg-5">
          <h2 className="mb-3">このアプリについて</h2>
          <p className="mb-3">
            団運営では、名簿・進級記録・活動履歴など多くの情報を扱います。
            それらがバラバラになっていると、引き継ぎのたびに手間がかかります。
          </p>
          <p className="mb-4">
            My Historyは、その情報を一か所にまとめるためのツールです。
            登録・閲覧・検索が同じ画面でできるので、指導者の日常的な作業が減ります。
          </p>

          <LinkWithOffset to="features" className="d-block">
            <Button variant="outline-secondary">何ができるか見る</Button>
          </LinkWithOffset>
        </div>

        <div className="col-12 col-lg-6 p-3 p-lg-5 d-flex justify-content-center">
          <img
            src="/landing/about.webp"
            alt="スカウト活動のイメージ"
            className="img-fluid"
            style={{
              borderRadius: "1rem",
              maxHeight: "420px",
              objectFit: "cover",
              width: "100%",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default About;
