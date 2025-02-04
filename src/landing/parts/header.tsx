import { NavLink } from "react-router-dom";
import SignInUp from "./signiniup";
import { Link } from "react-scroll";

/**
 * ランディングページ用のヘッダー
 * アプリ側では使いません
 */

const Header = () => {
  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom border-bottom-dark fixed-top">
      <div className="container">
        <NavLink
          className="navbar-brand fw-bold d-flex align-items-center"
          to={"/"}
        >
          My History
        </NavLink>

        <div
          className="offcanvas offcanvas-start"
          id="offcanvas"
          aria-labelledby="offcanvasLabel"
        >
          <div className="offcanvas-body">
            <ul className="navbar-nav">
              <li className="nav-item" data-bs-dismiss="offcanvas">
                <Link className="nav-link" to="about">
                  ABOUT
                </Link>
              </li>
              <li className="nav-item" data-bs-dismiss="offcanvas">
                <Link className="nav-link" to="id">
                  できること
                </Link>
              </li>
              <li className="nav-item" data-bs-dismiss="offcanvas">
                <Link className="nav-link" to="id">
                  制作記録
                </Link>
              </li>
              <li className="nav-item" data-bs-dismiss="offcanvas">
                <Link className="nav-link" to="id">
                  制作者について
                </Link>
              </li>
            </ul>
            <ul className="navbar-nav ms-auto d-none d-lg-flex">
              <li className="nav-item d-flex">
                <SignInUp />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
