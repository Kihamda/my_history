import { NavLink } from "react-router-dom";

import { logout } from "@/firebase/userAuth/loginLogout";
import { FC } from "react";

const Header: FC<{ name: string; isLeader: boolean }> = ({
  name,
  isLeader,
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
          My History
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
                <NavLink className="nav-link" to="/app/header">
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
              <li className="nav-item" data-bs-dismiss="offcanvas">
                <NavLink className="nav-link" to="/app/group">
                  グループ管理
                </NavLink>
              </li>
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
            <ul className="navbar-nav ms-auto d-none d-lg-flex">
              <span className="d-grid align-content-center me-3">
                {name + " さん"}
              </span>
              <li className="nav-item d-flex">
                <button className="btn btn-primary" onClick={handleLogout}>
                  ログアウト
                </button>
              </li>
            </ul>
          </div>
          <div className="offcanvas-footer d-lg-none text-center">
            <div className="d-grid align-content-center justify-content-center mb-3">
              <span>{name + " さん"}</span>
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
