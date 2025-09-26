import React from "react";

import { Button } from "react-bootstrap";
/**
 * サインインボタンだけ共通化 * @returns ログイン・新規登録ボタン
 */

const SignInUp = (): React.ReactElement => {
  return (
    <>
      <a href="/auth/register" className="me-2">
        <Button>新規登録</Button>
      </a>
      <a href="/auth/login">
        <Button variant="outline-secondary">ログイン</Button>
      </a>
    </>
  );
};

export default SignInUp;
