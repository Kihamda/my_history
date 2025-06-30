import { FC } from "react";
import { Button, Card } from "react-bootstrap";
import { useAuthContext } from "@/firebase/authContext";
import { Navigate } from "react-router-dom";
import { sendEmailVerification } from "firebase/auth";

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

const VerifyEmail: FC = () => {
  const { user } = useAuthContext();

  if (!user) {
    return <Navigate to="/auth/login" />;
  }

  if (user.emailVerified) {
    // メールアドレスが既に確認済みの場合、アプリケーションのホームにリダイレクト
    return <Navigate to="/app" />;
  }

  return (
    <Card.Body>
      <Card.Title className="text-center">
        <h2>メールアドレス認証</h2>
      </Card.Title>
      <div className="text-center">
        <p>
          メールアドレスの認証が必要です。登録されたメールアドレス({user.email}
          )に認証リンクを送信しました。
        </p>
        <p>メールを確認してください。</p>
        <div className="row justify-content-around pb-3">
          <div className="mt-3 d-flex flex-column align-items-center col-12 col-md-6">
            <Button
              onClick={() => {
                sendEmailVerification(user).then(() => {
                  alert(
                    "認証メールを再送信しました。メールを確認してください。"
                  );
                });
              }}
            >
              認証メールの再送信
            </Button>
          </div>
          <div className="mt-3 d-flex flex-column align-items-center col-12 col-md-6">
            <Button
              variant="secondary"
              onClick={() => {
                window.location.reload();
              }}
            >
              認証の状態を確認
            </Button>
          </div>
        </div>
        認証メールが届かない場合は、迷惑メールフォルダを確認してください。
        <br />
        認証メールを再送信すると前のメールは無効化されます。
      </div>
    </Card.Body>
  );
};

export default VerifyEmail;
