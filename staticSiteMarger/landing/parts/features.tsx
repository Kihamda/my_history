import React from "react";

import { Button } from "react-bootstrap";
import Link from "./linkwithoffset";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons/faUsers";
import { faLock } from "@fortawesome/free-solid-svg-icons/faLock";
import { faMobile } from "@fortawesome/free-solid-svg-icons/faMobile";

/**
 * Features セクション
 * 実装済み機能をイコン付きカードで表示
 */

const FEATURES = [
  {
    icon: faUsers,
    title: "スカウト情報をまとめて管理",
    items: [
      "メンバー情報・進級記録・活動履歴を一画面で確認",
      "検索ですぐに必要な情報にたどり着ける",
      "指導者が代わってもデータはそのまま引き継げる",
    ],
  },
  {
    icon: faMobile,
    title: "いつでもどこでも確認",
    items: [
      "スカウト自身が進級状況や章の取得を確認できる",
      "保護者も活動の記録をスマホで見られる",
      "PCでもスマホでも同じように使える",
    ],
  },
  {
    icon: faLock,
    title: "安全なアクセス管理",
    items: [
      "管理者・編集者・閲覧者の3段階の権限",
      "見せたい情報だけを必要な人に共有",
      "招待制だから安心して利用できる",
    ],
  },
] as const;

const Features = (): React.ReactElement => {
  return (
    <div className="container py-2">
      <div className="row">
        <div className="col-12 text-center mb-4">
          <h2 className="mb-2">できること</h2>
          <p className="mb-0 text-muted">指導者にもスカウトにも便利な機能</p>
        </div>

        {FEATURES.map((feat) => (
          <div key={feat.title} className="col-12 col-lg-4 mb-3">
            <div className="card h-100 border-0 border-top border-3 border-dark shadow-sm">
              <div className="card-body">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle bg-dark text-white mb-3"
                  style={{ width: 48, height: 48 }}
                >
                  <FontAwesomeIcon
                    icon={feat.icon}
                    style={{ height: "1.1rem" }}
                  />
                </div>
                <h3 className="h5 mb-2">{feat.title}</h3>
                <ul className="mb-0 ps-3">
                  {feat.items.map((item) => (
                    <li key={item} className="mb-1">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}

        <div className="col-12 d-flex justify-content-center mt-2">
          <Link to="flow">
            <Button variant="outline-secondary">はじめかたを見る</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Features;
