import React from "react";

import { Button } from "react-bootstrap";
import { Link } from "react-scroll";

/**
 * containerの中にrowを入れてlg以上の画面サイズで2つのコンポーネントを並べる
 * Featuresコンポーネント
 */

const Features = (): React.ReactElement => {
  return (
    <div className="container text-center">
      <div className="row">
        <h1 className="mb-4">FEATURES</h1>
        <p>
          <b>My Historyアプリ</b>には以下の情報を登録できます。
        </p>
        <div className="col-12 col-lg-6 p-5 d-flex justify-content-center">
          <img
            src="\assets\landing\features.webp"
            alt="features"
            className="img-fluid"
            style={{
              borderRadius: "1rem",
            }}
          />
        </div>
        <div className="col-12 col-lg-6 d-flex flex-column justify-content-center">
          <ul className="text-start">
            <li>活動履歴の管理</li>
            <li>メンバー情報の一元管理</li>
            <li>イベントスケジュールの共有</li>
            <li>活動報告の作成と共有</li>
            <li>写真や動画の保存と共有</li>
          </ul>
          <Link className="mt-3" to="contact" smooth={true} duration={500}>
            <Button variant="outline-secondary">次へ↓</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Features;
