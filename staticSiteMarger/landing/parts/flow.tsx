import React from "react";
import { Button } from "react-bootstrap";
import LinkWithOffset from "./linkwithoffset";

/**
 * 導入ステップセクション
 * デスクトップ：横並びステップ、モバイル：左ボーダータイムライン
 */

const STEPS = [
  {
    num: 1,
    title: "アカウント作成",
    body: "メール登録と初期設定だけ\n数分で使い始められます",
  },
  {
    num: 2,
    title: "メンバーを招待",
    body: "権限レベルを選んで招待するだけ\n編集できる範囲を事前に決められます",
  },
  {
    num: 3,
    title: "記録運用を開始",
    body: "スカウト情報と活動履歴を登録して検索\n引き継ぎや日常の確認が楽になります",
  },
] as const;

const Flow = (): React.ReactElement => {
  return (
    <div className="container py-2">
      <div className="text-center mb-4">
        <h2 className="mb-2">導入の流れ</h2>
        <p className="mb-0">最短3ステップで運用開始できる</p>
      </div>

      {/* デスクトップ：横並び */}
      <div className="d-none d-lg-flex align-items-start justify-content-center gap-0 mb-4">
        {STEPS.map((step, i) => (
          <React.Fragment key={step.num}>
            <div className="text-center" style={{ width: "220px" }}>
              <div
                className="d-flex align-items-center justify-content-center rounded-circle bg-dark text-white fw-bold mx-auto mb-3"
                style={{ width: 56, height: 56, fontSize: "1.4rem" }}
              >
                {step.num}
              </div>
              <div className="fw-semibold mb-1">{step.title}</div>
              <p
                className="mb-0 small text-muted"
                style={{ whiteSpace: "pre-line" }}
              >
                {step.body}
              </p>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="flex-shrink-0 align-self-start"
                style={{ marginTop: "1.5rem", width: "60px" }}
              >
                <div
                  style={{
                    height: "2px",
                    background: "#212529",
                    width: "100%",
                  }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* モバイル：左ボーダータイムライン */}
      <div className="d-lg-none d-flex flex-column gap-3 mb-4">
        {STEPS.map((step) => (
          <div
            key={step.num}
            className="d-flex gap-3"
            style={{ borderLeft: "3px solid #212529", paddingLeft: "1rem" }}
          >
            <div
              className="d-flex align-items-center justify-content-center rounded-circle bg-dark text-white fw-bold flex-shrink-0"
              style={{ width: 40, height: 40 }}
            >
              {step.num}
            </div>
            <div>
              <div className="fw-semibold mb-1">{step.title}</div>
              <p
                className="mb-0 small text-muted"
                style={{ whiteSpace: "pre-line" }}
              >
                {step.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <LinkWithOffset to="trust" className="text-decoration-none">
          <Button variant="outline-secondary">安心して使える理由を見る</Button>
        </LinkWithOffset>
      </div>
    </div>
  );
};

export default Flow;
