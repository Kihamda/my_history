import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons/faUsers";
import { faUser } from "@fortawesome/free-solid-svg-icons/faUser";
import { CONTACT_URL } from "./constants";

/**
 * 2つのペルソナ向けカードで利用者像を提示するセクション
 */

const About = (): React.ReactElement => {
  return (
    <div className="container">
      <div className="text-center mb-5">
        <h2 className="mb-3">こんな方に使われています</h2>
        <p className="text-muted mb-0">
          My Historyは、団に関わるすべての人のためのツールです
        </p>
      </div>

      <div className="row g-4">
        {/* 指導者向け */}
        <div className="col-12 col-lg-6">
          <div
            className="card h-100 border-0 shadow-sm"
            style={{ borderTop: "4px solid #212529" }}
          >
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle bg-dark text-white flex-shrink-0"
                  style={{ width: 48, height: 48 }}
                >
                  <FontAwesomeIcon
                    icon={faUsers}
                    style={{ height: "1.1rem" }}
                  />
                </div>
                <h3 className="h5 mb-0">指導者・団の運営者の方</h3>
              </div>
              <p className="text-muted small mb-3">こんな悩みはありませんか</p>
              <ul className="mb-4">
                <li className="mb-2">
                  名簿や進級記録がExcelやノートにバラバラ
                </li>
                <li className="mb-2">指導者が代わるたびに引き継ぎが大変</li>
                <li className="mb-2">必要なデータをすぐに確認できない</li>
              </ul>
              <p className="small text-muted mb-3">
                My
                Historyなら、すべての情報を一か所で管理。引き継ぎの負担も減らせます。
              </p>
              <a href={CONTACT_URL} className="btn btn-dark w-100">
                導入を相談する
              </a>
            </div>
          </div>
        </div>

        {/* スカウト・保護者向け */}
        <div className="col-12 col-lg-6">
          <div
            className="card h-100 border-0 shadow-sm"
            style={{ borderTop: "4px solid #212529" }}
          >
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle bg-dark text-white flex-shrink-0"
                  style={{ width: 48, height: 48 }}
                >
                  <FontAwesomeIcon icon={faUser} style={{ height: "1.1rem" }} />
                </div>
                <h3 className="h5 mb-0">スカウト・保護者の方</h3>
              </div>
              <p className="text-muted small mb-3">
                こんなこと思ったことはありませんか
              </p>
              <ul className="mb-4">
                <li className="mb-2">自分がどこまで進級したか把握しづらい</li>
                <li className="mb-2">活動の記録を振り返る手段がない</li>
                <li className="mb-2">団の情報を手元で確認したい</li>
              </ul>
              <p className="small text-muted mb-3">
                My
                Historyで、進級状況や活動履歴をいつでもスマホから確認できます。
              </p>
              <a href="/auth/register" className="btn btn-outline-dark w-100">
                無料ではじめる
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
