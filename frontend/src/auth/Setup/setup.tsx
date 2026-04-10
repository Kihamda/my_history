import React, { useState } from "react";
import { Card, Form, Button } from "react-bootstrap";
import FormGroup from "../formGroup";
import { hc } from "@f/lib/api/api";
import { raiseError } from "@f/errorHandler";

/**
 * @fileoverview
 * `Register`コンポーネントは新規登録フォームを提供します。
 * ユーザーはメールアドレス、パスワード、パスワードの確認を入力し、
 * 利用規約とプライバシーポリシーに同意する必要があります。
 *
 * @component
 * @example
 * <Register />
 *
 * @returns {React.FC} 新規登録フォームを含むReactコンポーネント
 *
 * @remarks
 * - `useState`フックを使用してフォームの入力値を管理します。
 * - `handleSubmit`関数でフォームの送信を処理します。
 * - `FormGroup`コンポーネントを使用して各入力フィールドをグループ化します。
 * - `Form.Check`コンポーネントを使用して利用規約とプライバシーポリシーへの同意を確認します。
 * - 登録ボタンは利用規約とプライバシーポリシーに同意しない限り無効になります。
 */

const Setup: React.FC = () => {
  const [displayName, setDisplayName] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await hc.apiv1.user.createUser.$post({
        json: {
          displayName: displayName,
          statusMessage: statusMessage,
          acceptsInvite: false, // 初期値はfalseで設定。ユーザーが後で変更できるようにする。
        },
      });
      alert("ユーザープロフィールが作成されました。");
      window.location.reload();
    } catch (error) {
      raiseError("ユーザーの作成中にエラーが発生しました。", "error");
      console.error(error);
    }
  };

  return (
    <Card.Body>
      <Card.Title className="text-center">
        <h2>プロフィール作成</h2>
      </Card.Title>
      <Form onSubmit={handleSubmit}>
        <FormGroup
          controlId="displayName"
          label="表示名（誰でも閲覧可能。実名等非推奨）"
        >
          <Form.Control
            type="text"
            placeholder="表示名を入力してください"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </FormGroup>
        <FormGroup
          controlId="formStatusMessage"
          label="ステータスメッセージ（任意）"
        >
          <Form.Control
            type="text"
            placeholder="ステータスメッセージを入力してください"
            value={statusMessage}
            onChange={(e) => setStatusMessage(e.target.value)}
          />
        </FormGroup>
        <div className="w-100 text-center">
          <Button variant="primary" type="submit" className="mt-3 text-center">
            登録
          </Button>
        </div>
      </Form>
    </Card.Body>
  );
};

export default Setup;
