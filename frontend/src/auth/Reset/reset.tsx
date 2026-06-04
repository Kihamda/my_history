import { type FC, type FormEvent, useState } from "react";
import { Card, Form, Button, InputGroup, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { resetPassword } from "@f/authContext";

const Reset: FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    // パスワードリセット処理を実装する
    setIsSubmitting(true);
    try {
      await resetPassword(email);
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

        <Button
          variant="primary"
          size="lg"
          type="submit"
          className="w-100 mt-4"
          disabled={isSubmitting || email.length === 0}
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
          {isSubmitting ? "送信中" : "リセットメール送信"}
        </Button>
      </Form>
    </Card.Body>
  );
};

export default Reset;
