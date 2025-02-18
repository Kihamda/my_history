import React, { useState } from "react";
import { Card, Form, Button } from "react-bootstrap";
import FormGroup from "../formGroup";
import BlurCard from "../../common/style/cardDesign";

/**
 * @fileoverview
 * `Registar`コンポーネントは新規登録フォームを提供します。
 * ユーザーはメールアドレス、パスワード、パスワードの確認を入力し、
 * 利用規約とプライバシーポリシーに同意する必要があります。
 *
 * @component
 * @example
 * <Registar />
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

const Registar: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle form submission logic here
  };

  return (
    <BlurCard style={{ width: "30rem" }}>
      <Card.Body>
        <Card.Title className="text-center">
          <h2>新規登録</h2>
        </Card.Title>
        <Form onSubmit={handleSubmit}>
          <FormGroup controlId="formEmail" label="メールアドレス">
            <Form.Control
              type="email"
              placeholder="abc@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup controlId="formPassword" label="パスワード">
            <Form.Control
              type="password"
              placeholder="パスワードを入力してください"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup controlId="formConfirmPassword" label="パスワードの確認">
            <Form.Control
              type="password"
              placeholder="パスワードをもう一度入力してください"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup controlId="formBasicCheckbox" label="">
            <Form.Check
              type="checkbox"
              label="利用規約とプライバシーポリシーに同意します。"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              required
            />
          </FormGroup>
          <div className="w-100 text-center">
            <Button
              variant="primary"
              type="submit"
              className="mt-3 text-center"
              disabled={!agreed}
            >
              登録
            </Button>
          </div>
        </Form>
      </Card.Body>
    </BlurCard>
  );
};

export default Registar;
