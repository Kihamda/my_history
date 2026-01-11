import type { FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import { Link, Route, Routes, useLocation } from "react-router";

export interface SidebarData {
  title: string;
  path: string;
  routeElement: React.ReactElement;
  icon?: FontAwesomeIconProps["icon"];
  index: {
    key: string;
    label: string;
  }[];
}

const normalize = (value: string) => {
  const trimmed = value.replace(/\/+$/, "");
  return trimmed.length === 0 ? "/" : trimmed.toLowerCase();
};
const isActivePath = (
  targetPath: string,
  currentPath: string,
  pathBase: string
) => {
  const current = normalize(currentPath);
  const target = normalize(pathBase + targetPath);

  if (target === "/") return current === "/";
  return current === target;
};

const SidebarUI = ({
  data,
  pathBase,
}: {
  data: SidebarData[];
  pathBase: string;
}) => {
  const { pathname } = useLocation();

  const current = data.find((d) => isActivePath(d.path, pathname, pathBase));
  return (
    <div className="row mt-3">
      <div className="col-12 col-md-4 col-lg-3">
        {current && (
          <div className="card mb-3">
            <div className="card-header">
              <h5 className="mb-0">{current.title}</h5>
            </div>
            <div className="list-group list-group-flush">
              {current.index.map((item) => (
                <a
                  key={item.key}
                  href={`#${item.key}`}
                  className="list-group-item list-group-item-action"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="card mb-3 d-none d-md-block">
          <div className="card-header">
            <h5 className="mb-0">ページ一覧</h5>
          </div>
          <div className="list-group list-group-flush">
            {data.map((item) => (
              <Link
                key={item.title}
                to={normalize(pathBase + item.path)}
                className="list-group-item list-group-item-action"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="col-12 col-md-8 col-lg-9">
        <Routes>
          {data.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.routeElement}
            />
          ))}
        </Routes>
      </div>
      <div className="col-12 d-block d-md-none">
        <div className="card mt-3">
          <div className="card-header">
            <h5 className="mb-0">ページ一覧</h5>
          </div>
          <div className="list-group list-group-flush">
            {data.map((item) => (
              <Link
                key={item.title}
                to={normalize(pathBase + item.path)}
                className="list-group-item list-group-item-action"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarUI;
