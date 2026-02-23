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
    title: "スカウト情報を一元管理",
    items: [
      "活動履歴、進級記録、章の達成をまとめて管理",
      "検索で必要な情報へすぐ到達",
      "最終更新日が残るので引き継ぎしやすい",
    ],
  },
  {
    icon: faLock,
    title: "役割ごとに安全に運営",
    items: [
      "ADMIN ・ EDIT ・ VIEW の3段階ロール",
      "招待と権限変更を画面から実行",
      "必要な人だけ編集できる",
    ],
  },
  {
    icon: faMobile,
    title: "既存運用から移行しやすい",
    items: [
      "連盟向け既存ツールと併用しやすい設計",
      "メール認証つきで導入ハードルを下げる",
      "スマホでも同じように使える",
    ],
  },
] as const;

const Features = (): React.ReactElement => {
  return (
    <div className="container py-2">
      <div className="row">
        <div className="col-12 text-center mb-4">
          <h2 className="mb-2">できること</h2>
          <p className="mb-0 text-muted">実装済みの主な機能です</p>
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
            <Button variant="outline-secondary">導入の流れを見る</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Features;
