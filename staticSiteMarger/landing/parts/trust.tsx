import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons/faCircleCheck";

/**
 * 信頼性訴求 + 最終CTAセクション
 */

const TRUST_ITEMS = [
  "Firebase認証による本人確認。メール認証済みのアカウントのみ利用可能",
  "ADMIN / EDIT / VIEW のロールで編集範囲を管理できる",
  "Cloudflare Workersで配信。国内からのアクセスが速い",
  "ランディングは静的生成、本体は型安全なSPAで長期運用しやすい",
] as const;

const Trust = (): React.ReactElement => {
  return (
    <div className="container py-2">
      <div className="row align-items-center g-4">
        <div className="col-12 col-lg-7">
          <h2 className="mb-4">安心して導入できる理由</h2>
          <div className="d-flex flex-column gap-3">
            {TRUST_ITEMS.map((item) => (
              <div key={item} className="d-flex align-items-start gap-3">
                <FontAwesomeIcon
                  icon={faCircleCheck}
                  className="text-dark flex-shrink-0"
                  style={{ height: "1.25rem", marginTop: "0.15rem" }}
                />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div
            className="card border-0 shadow"
            style={{ borderTop: "4px solid #212529" }}
          >
            <div className="card-body p-4">
              <h3 className="h5 mb-2">導入は小さく始めてもOK</h3>
              <p className="mb-4 text-muted small">
                一部の隊だけで試してみながら、慣れたら全体に広げるという進め方がさまざまな団でうまくいっています。
              </p>
              <div className="d-grid gap-2">
                <a href="/auth/register" className="btn btn-dark btn-lg">
                  無料登録して始める
                </a>
                <a href="/auth/login" className="btn btn-outline-secondary">
                  すでにアカウントがある
                </a>
                <a
                  href="/help/"
                  className="btn btn-link text-decoration-none text-body-secondary"
                >
                  使い方ヘルプを見る
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trust;
