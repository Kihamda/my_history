import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const SignInUp = () => {
  return (
    <>
      <Link to="/auth/signup" className="me-2">
        <Button>新規登録</Button>
      </Link>
      <Link to="/auth/login">
        <Button variant="outline-secondary">ログイン</Button>
      </Link>
    </>
  );
};

export default SignInUp;
