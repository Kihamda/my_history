import { type FC, type FormEvent, useState } from "react";
import { Button, Card, Form, InputGroup, Spinner } from "react-bootstrap";
import { Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightToBracket,
  faEnvelope,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import { login } from "@f/authContext";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card.Body className="px-4 pb-4 pt-3">
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formEmail" className="mb-3">
          <Form.Label>メールアドレス</Form.Label>
          <InputGroup>
            <InputGroup.Text>
              <FontAwesomeIcon icon={faEnvelope} />
            </InputGroup.Text>
            <Form.Control
              type="email"
              placeholder="abc@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>
        </Form.Group>

        <Form.Group controlId="formPassword" className="mb-3">
          <div className="d-flex justify-content-between">
            <Form.Label>パスワード</Form.Label>
            <Link to="/auth/reset">忘れた場合</Link>
          </div>
          <InputGroup>
            <InputGroup.Text>
              <FontAwesomeIcon icon={faLock} />
            </InputGroup.Text>
            <Form.Control
              type="password"
              placeholder="パスワードを入力してください"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputGroup>
        </Form.Group>

        <Button
          variant="primary"
          size="lg"
          type="submit"
          className="w-100 mt-4"
          disabled={isSubmitting || email.length === 0 || password.length === 0}
        >
          {isSubmitting && (
            <Spinner
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="me-2"
            />
          )}
          {isSubmitting ? "ログイン中" : "ログイン"}
          {!isSubmitting && (
            <FontAwesomeIcon icon={faArrowRightToBracket} className="ms-2" />
          )}
        </Button>
      </Form>
      <p className="text-muted small mb-0 mt-3">
        メール認証が未完了の場合は、ログイン後に確認画面へ移動します。
      </p>
    </Card.Body>
  );
};

export default Signin;
