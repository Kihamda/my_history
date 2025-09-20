import { NavLink } from "react-router";

import { logout } from "@/firebase/userAuth/loginLogout";
import { FC } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

const Header: FC<{ name: string; isLeader: boolean; isAdmin: boolean }> = ({
  name,
  isLeader,
  isAdmin,
}) => {
  // ログアウト処理
  const handleLogout = () => {
    logout();
  };

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
              <li className="nav-item" data-bs-dismiss="offcanvas">
                <NavLink className="nav-link" to="/app/setting">
                  設定
                </NavLink>
              </li>
              <li className="nav-item" data-bs-dismiss="offcanvas">
                <a
                  className="nav-link"
                  href="https://kihamdanet.notion.site/13cfca102538805c9daac48b39574ef7"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ヘルプページ
                </a>
              </li>
            </ul>
            <ul className="navbar-nav ms-auto d-none d-lg-flex dropdown">
              <button
                type="button"
                className="btn btn-outline-secondary dropdown-toggle"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <FontAwesomeIcon icon={faUser} /> {name + "さん"}
              </button>
              <ul className="dropdown-menu me-3">
                <li>
                  <a className="dropdown-item" onClick={handleLogout}>
                    ログアウト
                  </a>
                </li>
              </ul>
            </ul>
          </div>
          <div className="offcanvas-footer d-lg-none text-center">
            <div className="d-grid align-content-center justify-content-center mb-3">
              <span>{name + "さん"}</span>
              <button className="btn btn-primary" onClick={handleLogout}>
                ログアウト
              </button>
            </div>
            <div className="row">
              <div className="col-12">
                <p>
                  Copyright © 2024
                  <a
                    className="noAtag ms-3"
                    href="https://kihamda.net/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Dai.M
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
