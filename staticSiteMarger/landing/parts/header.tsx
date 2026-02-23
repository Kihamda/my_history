import React from "react";
import SignInUp from "./signiniup";
import LinkWithOffset from "./linkwithoffset";

/**
 * ランディングページ用のヘッダー
 * モバイルはオフキャンバスメニューを使用
 */

const NAV_ITEMS = [
  { to: "about", label: "概要" },
  { to: "features", label: "できること" },
  { to: "flow", label: "導入の流れ" },
  { to: "trust", label: "安心の理由" },
] as const;

const Header = (): React.ReactElement => {
  return (
    <>
      <nav className="navbar bg-body-tertiary border-bottom border-dark-subtle fixed-top shadow-sm">
        <div className="container">
          <LinkWithOffset className="navbar-brand fw-bold fs-5" to="top">
            My History
          </LinkWithOffset>

          {/* デスクトップ用ナビ */}
          <ul className="navbar-nav flex-row gap-3 d-none d-lg-flex mx-auto">
            {NAV_ITEMS.map((item) => (
              <li key={item.to} className="nav-item">
                <LinkWithOffset className="nav-link" to={item.to}>
                  {item.label}
                </LinkWithOffset>
              </li>
            ))}
          </ul>

          <div className="d-flex align-items-center gap-2">
            <div className="d-none d-md-flex">
              <SignInUp />
            </div>
            {/* モバイルハンバーガー */}
            <button
              className="navbar-toggler d-lg-none border-0"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#navOffcanvas"
              aria-label="メニューを開く"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>
        </div>
      </nav>

      {/* モバイル用オフキャンバスメニュー */}
      <div
        className="offcanvas offcanvas-end"
        id="navOffcanvas"
        aria-labelledby="navOffcanvasLabel"
      >
        <div className="offcanvas-header border-bottom">
          <span className="fw-bold fs-5" id="navOffcanvasLabel">
            My History
          </span>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="閉じる"
          />
        </div>
        <div className="offcanvas-body d-flex flex-column">
          <ul className="navbar-nav gap-0">
            {NAV_ITEMS.map((item) => (
              <li
                key={item.to}
                className="nav-item"
                data-bs-dismiss="offcanvas"
              >
                <LinkWithOffset
                  className="nav-link py-3 border-bottom fs-5"
                  to={item.to}
                >
                  {item.label}
                </LinkWithOffset>
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-4 d-grid gap-2">
            <a href="/auth/register" className="btn btn-dark btn-lg">
              無料ではじめる
            </a>
            <a href="/auth/login" className="btn btn-outline-secondary">
              ログイン
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
