import InputGroupUI from "@f/lib/style/imputGroupUI";
import { useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import type { UserSearchType } from "./user";

const UserSearchBox = ({
  handleSearchFunc,
}: {
  handleSearchFunc: (query: UserSearchType) => void;
}) => {
  const [tmpSearchParams, setTmpSearchParams] = useState<UserSearchType>({
    id: "",
    isGod: "both",
    membership: "",
    invites: "",
    sharedby: "",
    email: "",
  });

  // 検索ボタンハンドラ
  const handleSearch = () => {
    handleSearchFunc(tmpSearchParams);
  };

  //本体
  return (
    <div className="card">
      <div className="card-body">
        <h3>ユーザー検索ボックス</h3>
        <Row>
          <Col sm={12} md={6}>
            <InputGroupUI
              label="ユニークID"
              value={tmpSearchParams.id}
              setValueFunc={(e) =>
                setTmpSearchParams({ ...tmpSearchParams, id: e })
              }
            />
            <InputGroupUI
              label="メールアドレス"
              value={tmpSearchParams.email}
              setValueFunc={(e) =>
                setTmpSearchParams({ ...tmpSearchParams, email: e })
              }
            />
            <select
              className="form-select mt-3"
              value={tmpSearchParams.isGod}
              onChange={(e) =>
                setTmpSearchParams({
                  ...tmpSearchParams,
                  isGod:
                    e.target.value === "true"
                      ? "true"
                      : e.target.value === "false"
                        ? "false"
                        : "both",
                })
              }
            >
              <option value="both"> 全てのユーザー</option>
              <option value="false"> 凡人ユーザー</option>
              <option value="true">神ユーザー</option>
            </select>
          </Col>
          <Col sm={12} md={6}>
            <InputGroupUI
              label="所属グループID"
              value={tmpSearchParams.membership}
              setValueFunc={(e) =>
                setTmpSearchParams({
                  ...tmpSearchParams,
                  membership: e,
                })
              }
            />

            <InputGroupUI
              label="招待グループID"
              value={tmpSearchParams.invites}
              setValueFunc={(e) =>
                setTmpSearchParams({
                  ...tmpSearchParams,
                  invites: e,
                })
              }
            />
            <InputGroupUI
              label="共有スカウトID"
              value={tmpSearchParams.sharedby}
              setValueFunc={(e) =>
                setTmpSearchParams({
                  ...tmpSearchParams,
                  sharedby: e,
                })
              }
            />
          </Col>
        </Row>
      </div>
      <div className="card-footer text-end">
        <Button className="ms-2" onClick={handleSearch}>
          検索
        </Button>
      </div>
    </div>
  );
};

export default UserSearchBox;
