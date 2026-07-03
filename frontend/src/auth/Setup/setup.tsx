import React, { useState } from "react";
import { Card, Form, Button } from "react-bootstrap";
import { apiJson, hc, queryClient } from "@f/lib/api/api";
import { raiseError } from "@f/errorHandler";
import { useMutation } from "@tanstack/react-query";

const Setup: React.FC = () => {
  const [displayName, setDisplayName] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [acceptsInvite, setAcceptsInvite] = useState<"show" | "hide">("hide");
  const createUserMutation = useMutation({
    mutationFn: () =>
      apiJson(
        hc.apiv1.user.createUser.$post({
          json: {
            displayName,
            statusMessage,
            acceptsInvite: acceptsInvite === "show",
          },
        }),
        "ユーザーの作成に失敗しました。",
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["current-user"] });
      raiseError("ユーザープロフィールが作成されました。", "success");
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    createUserMutation.mutate();
  };

  return (
    <Card.Body className="px-4 pb-4 pt-3">
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="displayName" className="mb-3">
          <Form.Label>表示名</Form.Label>
          <Form.Control
            type="text"
            placeholder="表示名を入力してください"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          <Form.Text muted>誰でも閲覧可能です。実名等は推奨しません。</Form.Text>
        </Form.Group>

        <Form.Group controlId="formStatusMessage" className="mb-3">
          <Form.Label>ステータスメッセージ（任意）</Form.Label>
          <Form.Control
            type="text"
            placeholder="ステータスメッセージを入力してください"
            value={statusMessage}
            onChange={(e) => setStatusMessage(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>他のユーザーからの検索</Form.Label>
          <div className="border rounded p-3">
            <Form.Check
              type="radio"
              id="acceptsInviteShow"
              name="acceptsInvite"
              label="表示する"
              value="show"
              checked={acceptsInvite === "show"}
              onChange={() => setAcceptsInvite("show")}
            />
            <Form.Check
              type="radio"
              id="acceptsInviteHide"
              name="acceptsInvite"
              label="表示しない"
              value="hide"
              checked={acceptsInvite === "hide"}
              onChange={() => setAcceptsInvite("hide")}
            />
          </div>
          <Form.Text muted>
            表示すると、グループ管理者が招待作成時にあなたを検索できます。
          </Form.Text>
        </Form.Group>

        <Button
          variant="primary"
          size="lg"
          type="submit"
          className="w-100 mt-4"
          disabled={createUserMutation.isPending}
        >
          {createUserMutation.isPending ? "登録中" : "登録"}
        </Button>
      </Form>
    </Card.Body>
  );
};

export default Setup;
