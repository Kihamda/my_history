import { useState } from "react";
import { hc, type ResType } from "../api/api";
import InputGroupUI from "../style/imputGroupUI";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPerson } from "@fortawesome/free-solid-svg-icons";
import { raiseError } from "@f/errorHandler";
import { PopupCard } from "./popupCard";
import { Button } from "react-bootstrap";

type UserProfile = ResType<
  (typeof hc.apiv1.user.lookupByEmail)["$post"]
>[number];

const SearchUserWithMail = ({
  onSelect,
}: {
  onSelect: (user: UserProfile) => void;
}) => {
  const [email, setEmail] = useState<string>("");
  const [result, setResult] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const handleSearch = async () => {
    const result = await hc.apiv1.user.lookupByEmail.$post({ json: { email } });
    if (result.status === 200) {
      const users = await result.json();
      setResult(users);
    } else {
      setResult([]);
      raiseError("ユーザーの検索に失敗しました。");
    }
  };

  return (
    <PopupCard
      title="メールアドレスでユーザーを検索"
      children={
        <>
          <div className="d-flex w-100">
            <div className="flex-grow-1">
              <InputGroupUI
                label="メールアドレス"
                value={email}
                setValueFunc={(e) => setEmail(e)}
              />
            </div>
            <div>
              <button
                className="btn btn-primary ms-2"
                onClick={handleSearch}
                disabled={!email}
              >
                検索
              </button>
            </div>
          </div>
          <div className="mt-3">
            {result.length === 0 ? (
              <p>該当するユーザーが見つかりません。</p>
            ) : (
              <ul className="list-group">
                {result.map((user) => (
                  <li
                    key={user.uid}
                    className={
                      "list-group-item list-group-item-action" +
                      (selectedUser?.uid === user.uid ? " bg-light" : "")
                    }
                    onClick={() => {
                      setSelectedUser(user);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="d-flex align-content-center justify-content-between w-100 ">
                      <div>
                        <FontAwesomeIcon
                          icon={faPerson}
                          className="me-2 fs-3"
                        />
                        <span className="fs-4">{user.profile.displayName}</span>
                      </div>
                      ({user.email})
                    </div>
                    {user.profile.statusMessage}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      }
      footer={
        <div className="text-end">
          <Button
            disabled={!selectedUser}
            onClick={() => {
              if (selectedUser) {
                onSelect(selectedUser);
              }
            }}
          >
            {selectedUser
              ? selectedUser.profile.displayName + "を選択する"
              : "対象を選択してください"}
          </Button>
        </div>
      }
    />
  );
};

export default SearchUserWithMail;
