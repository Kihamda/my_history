import React from "react";
import { Button } from "react-bootstrap";
import LinkWithOffset from "./linkwithoffset";
import { CONTACT_URL } from "./constants";

/**
 * はじめかたセクション
 * 指導者向け・スカウト向けの2パターンを表示
 */

const LEADER_STEPS = [
  {
    num: 1,
    title: "お問い合わせ",
    body: "まずはお気軽にご相談ください\n団の規模や運用をお聞きします",
  },
  {
    num: 2,
    title: "初期設定",
    body: "グループの作成と\nメンバー登録をサポートします",
  },
  {
    num: 3,
    title: "運用スタート",
    body: "日常の記録管理をMy Historyで\n引き継ぎの心配もなくなります",
  },
] as const;

const SCOUT_STEPS = [
  {
    num: 1,
    title: "アカウント作成",
    body: "メールアドレスで無料登録\n数分で完了します",
  },
  {
    num: 2,
    title: "団に参加",
    body: "所属する団のグループに\n参加リクエストを送ります",
  },
  {
    num: 3,
    title: "記録を確認",
    body: "進級状況や活動履歴を\nいつでも確認できます",
  },
] as const;

type Step = {
  readonly num: number;
  readonly title: string;
  readonly body: string;
};

const StepRow = ({ steps }: { steps: readonly Step[] }) => (
  <>
    {/* デスクトップ：横並び */}
    <div className="d-none d-lg-flex align-items-start justify-content-center gap-0 mb-3">
      {steps.map((step, i) => (
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
          {i < steps.length - 1 && (
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
    <div className="d-lg-none d-flex flex-column gap-3 mb-3">
      {steps.map((step) => (
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
  </>
);

const Flow = (): React.ReactElement => {
  return (
    <div className="container py-2">
      <div className="text-center mb-5">
        <h2 className="mb-2">はじめかた</h2>
        <p className="mb-0 text-muted">
          それぞれの立場に合わせた始め方があります
        </p>
      </div>

      {/* 指導者向け */}
      <div className="mb-5">
        <h3 className="h5 text-center mb-4">
          <span className="badge bg-dark me-2">指導者の方</span>
          団への導入をお考えなら
        </h3>
        <StepRow steps={LEADER_STEPS} />
        <div className="text-center">
          <a href={CONTACT_URL} className="btn btn-dark">
            導入を相談する
          </a>
        </div>
      </div>

      <hr className="my-4" />

      {/* スカウト・保護者向け */}
      <div className="mb-4">
        <h3 className="h5 text-center mb-4">
          <span className="badge bg-dark me-2">スカウト・保護者の方</span>
          すでに団で導入済みなら
        </h3>
        <StepRow steps={SCOUT_STEPS} />
        <div className="text-center">
          <a href="/auth/register" className="btn btn-outline-dark">
            無料ではじめる
          </a>
        </div>
      </div>

      <div className="text-center mt-4">
        <LinkWithOffset to="trust" className="text-decoration-none">
          <Button variant="outline-secondary">安心して使える理由を見る</Button>
        </LinkWithOffset>
      </div>
    </div>
  );
};

export default Flow;
