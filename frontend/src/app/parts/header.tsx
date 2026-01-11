import { Link, NavLink } from "react-router";

import { logout } from "@f/authContext";
import type { FC } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

const UserDropdown: FC<{ name: string; showTop?: boolean }> = ({
  name,
  showTop = false,
}) => {
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dropdown">
      <button
        type="button"
        className="btn btn-outline-secondary dropdown-toggle"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <FontAwesomeIcon icon={faUser} /> {name + "さん"}
      </button>
      <ul
        className="dropdown-menu"
        style={showTop ? { top: "auto", bottom: "110%" } : {}}
      >
        <li>
          <Link className="dropdown-item" to="/app/setting">
            設定
          </Link>
        </li>
        <li>
          <a
            className="dropdown-item"
            href="/help"
            target="_blank"
            rel="noopener noreferrer"
          >
            ヘルプページ
          </a>
        </li>
        <li>
          <hr className="dropdown-divider" />
        </li>
        <li>
          <a className="dropdown-item" onClick={handleLogout}>
            ログアウト
          </a>
        </li>
      </ul>
    </div>
  );
};

const Header: FC<{ name: string; isLeader: boolean; isAdmin: boolean }> = ({
  name,
  isLeader,
  isAdmin,
}) => {
  // ログアウト処理
  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom border-bottom-dark fixed-top">
      <div className="container">
        <NavLink
          className="navbar-brand fw-bold d-flex align-items-center"
          to="/app/home"
        >
          <img
            src="/logos/nohaikei.svg"
            alt="My History"
            className="d-inline-block align-text-top"
            style={{ height: "1.9rem" }}
          />
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvas"
          aria-controls="offcanvas"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div
          className="offcanvas offcanvas-start"
          id="offcanvas"
          aria-labelledby="offcanvasLabel"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title">メニュー</h5>
            <button
              type="button"
              className="btn-close text-reset"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body">
            <ul className="navbar-nav">
              <li className="nav-item" data-bs-dismiss="offcanvas">
                <NavLink className="nav-link" to="/app/home">
                  ホーム
                </NavLink>
              </li>
              {isLeader && (
                <li className="nav-item" data-bs-dismiss="offcanvas">
                  <NavLink className="nav-link" to="/app/scouts">
                    スカウト検索
                  </NavLink>
                </li>
              )}
              {isAdmin && (
                <li className="nav-item" data-bs-dismiss="offcanvas">
                  <NavLink className="nav-link" to="/app/group">
                    グループ管理
                  </NavLink>
                </li>
              )}
            </ul>
            <ul className="navbar-nav ms-auto d-none d-lg-flex">
              <UserDropdown name={name} />
            </ul>
          </div>
          <div className="offcanvas-footer d-lg-none text-center">
            <div className="d-grid align-content-center justify-content-center mb-3">
              <UserDropdown name={name} showTop />
            </div>
            <div className="row">
              <div className="col-12">
                <p>
                  Copyright © 2024-2025
                  <a
                    className="noAtag ms-3"
                    href="https://kihamda.net/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Made with ❤ by Kihamda.NET
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
