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
          <Link className="dropdown-item" to="/app/home">
            一般モード
          </Link>
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

const HeaderGod: FC<{ name: string }> = ({ name }) => {
  // ログアウト処理
  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom border-bottom-dark fixed-top">
      <div className="container">
        <NavLink
          className="navbar-brand fw-bold d-flex align-items-center"
          to="/god/home"
        >
          <img
            src="/logos/nohaikei.svg"
            alt="My History"
            className="d-inline-block align-text-top"
            style={{ height: "1.9rem" }}
          />
          <span className="ms-2 d-none d-md-inline text-danger">God Mode</span>
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
                <NavLink className="nav-link" to="/god/home">
                  ホーム
                </NavLink>
              </li>
              <li className="nav-item" data-bs-dismiss="offcanvas">
                <NavLink className="nav-link" to="/god/scouts">
                  スカウト検索
                </NavLink>
              </li>
              <li className="nav-item" data-bs-dismiss="offcanvas">
                <NavLink className="nav-link" to="/god/group">
                  グループ管理
                </NavLink>
              </li>
            </ul>
            <ul className="navbar-nav ms-auto d-none d-lg-flex">
              <UserDropdown name={name} />
            </ul>
          </div>
          <div className="offcanvas-footer d-lg-none text-center">
            <div className="d-grid align-content-center justify-content-center mb-3">
              <UserDropdown name={name} showTop />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default HeaderGod;
