import { FC, FormEvent, useState } from "react";
import { Card, Form, Button } from "react-bootstrap";
import FormGroup from "../formGroup";
import { login } from "../../common/firebase/userAuth/login";

/**
 * @fileoverview
 * `Signin`コンポーネントはログインフォームを提供します。
 * ユーザーはメールアドレスとパスワードを入力し、ログインボタンを押すことができます。
 *
 * @component
 * @example
 * <Signin />
 *
 * @returns {FC} ログインフォームを含むReactコンポーネント
 *
 * @remarks
 * - `useState`フックを使用してフォームの入力値を管理します。
 * - `handleSubmit`関数でフォームの送信を処理します。
 * - `FormGroup`コンポーネントを使用して各入力フィールドをグループ化します。
 */

const Signin: FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await login(email, password);
  };

  return (
    <Card.Body>
      <Card.Title className="text-center">
        <h2>ログイン</h2>
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

        <div className="w-100 text-center">
          <Button variant="primary" type="submit" className="mt-3 text-center">
            ログイン
          </Button>
        </div>
      </Form>
    </Card.Body>
  );
};

export default Signin;
