import React, { useState } from "react";
import { Card, Form, Button } from "react-bootstrap";
import FormGroup from "../formGroup";
import createUser from "../../common/firebase/userAuth/createUser";

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // 新規登録処理を実装する
    if (password !== confirmPassword) {
      alert("パスワードが一致しません。");
      return;
    }

    if (!agreed) {
      alert("利用規約とプライバシーポリシーに同意する必要があります。");
      return;
    }

    try {
      await createUser(email, password);
      alert(
        "ユーザーが成功裏に作成されました。メールアドレス認証のためのメールを送信したので、URLをクリックして続行してください。"
      );
    } catch (error) {
      alert("ユーザーの作成中にエラーが発生しました。");
      console.error(error);
    }
  };

  return (
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
  );
};

export default Registar;
