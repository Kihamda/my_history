import { type FC } from "react";
import { Alert, Button, Card } from "react-bootstrap";
import { useAuthContext, sendVerificationEmail } from "@f/authContext";
import { Navigate } from "react-router";
import { useMutation } from "@tanstack/react-query";

const VerifyEmail: FC = () => {
  const token = useAuthContext(false)?.token;
  const resendMutation = useMutation({
    mutationFn: sendVerificationEmail,
  });
  const checkMutation = useMutation({
    mutationFn: async () => {
      await token?.reload();
      window.location.reload();
    },
  });

  if (!token) {
    return <Navigate to="/auth/login" />;
  }

  return (
    <Card.Body className="px-4 pb-4 pt-3">
      <Alert variant="info" className="mb-4">
        <p className="mb-2">
          メールアドレスの認証が必要です。登録されたメールアドレス({token.email}
          )に認証リンクを送信しました。
        </p>
        <p className="mb-0">メールを確認してください。</p>
      </Alert>
      <div className="d-grid gap-2">
        <Button
          size="lg"
          disabled={resendMutation.isPending}
          onClick={() => resendMutation.mutate()}
        >
          {resendMutation.isPending ? "送信中" : "認証メールの再送信"}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          disabled={checkMutation.isPending}
          onClick={() => checkMutation.mutate()}
        >
          {checkMutation.isPending ? "確認中" : "認証の状態を確認"}
        </Button>
      </div>
      <p className="text-muted small mb-0 mt-3">
        認証メールが届かない場合は、迷惑メールフォルダを確認してください。
        認証メールを再送信すると前のメールは無効化されます。
      </p>
    </Card.Body>
  );
};

export default VerifyEmail;
