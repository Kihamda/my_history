import React, { useState } from "react";
import { Card, Form, Button, InputGroup, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import { register, sendVerificationEmail } from "@f/authContext";
import { raiseError } from "@f/errorHandler";
import { useMutation } from "@tanstack/react-query";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const registerMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const registered = await register(email, password);
      if (!registered) return false;
      return sendVerificationEmail();
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      raiseError("パスワードが一致しません。");
      return;
    }

    if (!agreed) {
      raiseError("利用規約とプライバシーポリシーに同意する必要があります。");
      return;
    }

    if (registerMutation.isPending) return;
    registerMutation.mutate({ email, password });
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
          <Form.Label>パスワード</Form.Label>
          <InputGroup>
            <InputGroup.Text>
              <FontAwesomeIcon icon={faLock} />
            </InputGroup.Text>
            <Form.Control
              type="password"
              placeholder="パスワードを入力してください"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputGroup>
        </Form.Group>

        <Form.Group controlId="formConfirmPassword" className="mb-3">
          <Form.Label>パスワードの確認</Form.Label>
          <InputGroup>
            <InputGroup.Text>
              <FontAwesomeIcon icon={faLock} />
            </InputGroup.Text>
            <Form.Control
              type="password"
              placeholder="パスワードをもう一度入力してください"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </InputGroup>
        </Form.Group>

        <Form.Group controlId="formBasicCheckbox" className="mb-3">
          <Form.Check
            type="checkbox"
            label="利用規約とプライバシーポリシーに同意します。"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            required
          />
        </Form.Group>

        <Button
          variant="primary"
          size="lg"
          type="submit"
          className="w-100 mt-4"
          disabled={!agreed || registerMutation.isPending}
        >
          {registerMutation.isPending && (
            <Spinner
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="me-2"
            />
          )}
          {registerMutation.isPending ? "登録中" : "登録"}
        </Button>
      </Form>
    </Card.Body>
  );
};

export default Register;
