import React, { useState } from "react";
import { Card, Form, Button } from "react-bootstrap";
import FormGroup from "../formGroup";
import BlurCard from "../../common/style/cardDesign";

const Reset: React.FC = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle password reset logic here
  };

  return (
    <BlurCard style={{ width: "30rem" }}>
      <Card.Body>
        <Card.Title className="text-center">
          <h2>パスワードリセット</h2>
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

          <div className="w-100 text-center">
            <Button
              variant="primary"
              type="submit"
              className="mt-3 text-center"
            >
              リセットメール送信
            </Button>
          </div>
        </Form>
      </Card.Body>
    </BlurCard>
  );
};

export default Reset;
