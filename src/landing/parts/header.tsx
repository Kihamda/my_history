import SignInUp from "./signiniup";
import LinkWithOffset from "./linkwithoffset";
/**
 * ランディングページ用のヘッダー
 * アプリ側では使いません
 */

const Header = () => {
  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom border-bottom-dark fixed-top">
      <div className="container">
        <LinkWithOffset
          className="navbar-brand fw-bold d-flex align-items-center"
          to="top"
        >
          My History
        </LinkWithOffset>

        <div
          className="offcanvas offcanvas-start"
          id="offcanvas"
          aria-labelledby="offcanvasLabel"
        >
          <div className="offcanvas-body">
            <ul className="navbar-nav">
              <li className="nav-item" data-bs-dismiss="offcanvas">
                <LinkWithOffset className="nav-link" to="about">
                  ABOUT
                </LinkWithOffset>
              </li>
              <li className="nav-item" data-bs-dismiss="offcanvas">
                <LinkWithOffset className="nav-link" to="features">
                  できること
                </LinkWithOffset>
              </li>
              <li className="nav-item" data-bs-dismiss="offcanvas">
                <LinkWithOffset className="nav-link" to="id">
                  制作記録
                </LinkWithOffset>
              </li>
              <li className="nav-item" data-bs-dismiss="offcanvas">
                <LinkWithOffset className="nav-link" to="id">
                  制作者について
                </LinkWithOffset>
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
