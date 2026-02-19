import { Link, NavLink } from "react-router";

import { logout, useAuthContext } from "@f/authContext";
import type { FC } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { usePopup } from "@f/lib/popupContext/fullscreanPopup";
import { PopupCard } from "@f/lib/popupContext/popupCard";

const HandleChangePopup = () => {
  const { hidePopup } = usePopup();
  const { user, currentGroup, setCurrentGroup } = useAuthContext();
  return (
    <PopupCard
      title="グループを選択"
      children={
        <>
          <select
            className="form-select"
            defaultValue={currentGroup?.id || ""}
            onChange={(e) => {
              setCurrentGroup(
                e.target.value.length === 0 ? null : e.target.value,
              );
            }}
          >
            <option value="">グループ未選択</option>
            {user.auth.memberships.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </>
      }
      footer={
        <div className="text-end">
          <button
            className="btn btn-secondary"
            onClick={() => {
              hidePopup();
            }}
          >
            閉じる
          </button>
        </div>
      }
    />
  );
};

const UserDropdown: FC<{ name: string; isGod: boolean; showTop?: boolean }> = ({
  name,
  isGod,
  showTop = false,
}) => {
  const handleLogout = () => {
    logout();
  };

  const { showPopup } = usePopup();

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
        <li style={{ cursor: "pointer" }}>
          <span
            className="dropdown-item"
            onClick={() => showPopup({ content: <HandleChangePopup /> })}
          >
            グループを選択
          </span>
        </li>
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
        {isGod && (
          <li>
            <Link className="dropdown-item" to="/god">
              God Mode
            </Link>
          </li>
        )}
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

const Header: FC = () => {
  const { user, currentGroup } = useAuthContext();
  const { showPopup } = usePopup();

  const isLeader = currentGroup != undefined || false; // リーダーかどうかのフラグ。
  const isAdmin = currentGroup?.role == "ADMIN" || false;
  const isGod = user.auth.isGod || false;
  const name = user.profile.displayName || "名称未設定";
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
            <ul className="navbar-nav ms-auto d-none d-lg-flex align-items-center">
              <span
                className="me-2"
                style={{ cursor: "pointer" }}
                onClick={() => showPopup({ content: <HandleChangePopup /> })}
              >
                {currentGroup ? "所属:" + currentGroup.name : "グループ未選択"}
              </span>
              <UserDropdown name={name} isGod={isGod} />
            </ul>
          </div>
          <div className="offcanvas-footer d-lg-none text-center">
            <div className="d-grid align-content-center justify-content-center mb-3">
              <UserDropdown name={name} isGod={isGod} showTop />
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
