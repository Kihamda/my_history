/**
 * containerの中にrowを入れてlg以上の画面サイズで2つのコンポーネントを並べる
 * @returns Aboutコンポーネント
 */

import { Button } from "react-bootstrap";
import LinkWithOffset from "./linkwithoffset";

const About = () => {
  return (
    <div className="container text-center">
      <div className="row">
        <div className="col-12 col-lg-6 p-5 d-flex justify-content-center">
          <img
            src="\assets\landing\about.webp"
            alt="scout"
            className="img-fluid"
            style={{
              borderRadius: "1rem",
            }}
          />
        </div>
        <div className="col-12 col-lg-6 d-flex flex-column justify-content-center">
          <h1 className="mb-4">ABOUT</h1>
          <p>
            ボーイスカウト活動には<b>多くの情報を管理すること</b>
            が求められます。
          </p>
          <p>
            情報管理がより効率的・効果的になれば、より円滑な団運営を実現するだけでなく、
            <b>今まで以上に質の高い活動</b>を実現できます。
          </p>
          <p>
            これを<b>情報通信技術を使って実現する</b>のが「My History of
            Scoutingプロジェクト」の目的です。
          </p>
          <p>
            このプロジェクトは、ボーイスカウト活動の情報を管理するためのアプリケーション
            <b>「My History」を開発する</b>ものです。
          </p>
          <LinkWithOffset to="features" className="mt-3">
            <Button variant="outline-secondary">次へ↓</Button>
          </LinkWithOffset>
        </div>
      </div>
    </div>
  );
};

export default About;
