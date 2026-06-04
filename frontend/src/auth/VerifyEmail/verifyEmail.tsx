import { type FC } from "react";
import { Alert, Button, Card } from "react-bootstrap";
import { useAuthContext, sendVerificationEmail } from "@f/authContext";
import { Navigate } from "react-router";
import { raiseError } from "@f/errorHandler";

/**
 * @fileoverview
 * `VerifyEmail`コンポーネントはメールアドレス認証画面を提供します。
 * ユーザーは認証メールを確認し、再送信ボタンを押すことができます。
 *
 * @component
 * @example
 * <VerifyEmail />
 *
 * @returns {FC} メールアドレス認証画面を含むReactコンポーネント
 *
 * @remarks
 * - `useState`フックを使用してフォームの入力値を管理します。
 * - `handleSubmit`関数でフォームの送信を処理します。
 * - `FormGroup`コンポーネントを使用して各入力フィールドをグループ化します。
 */

const VerifyEmail: FC = () => {
  const token = useAuthContext(false)?.token;

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
          onClick={async () => {
            await sendVerificationEmail();
            raiseError("認証メールを再送信しました。", "success");
          }}
        >
          認証メールの再送信
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={async () => {
            window.location.reload();
          }}
        >
          認証の状態を確認
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
