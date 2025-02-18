import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

/**
 * サインインボタンだけ共通化
 * @returns ログイン・新規登録ボタン
 */

const SignInUp = () => {
  return (
    <>
      <Link to="/auth/registar" className="me-2">
        <Button>新規登録</Button>
      </Link>
      <Link to="/auth/login">
        <Button variant="outline-secondary">ログイン</Button>
      </Link>
    </>
  );
};

export default SignInUp;
