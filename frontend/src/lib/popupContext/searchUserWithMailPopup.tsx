import { useState } from "react";
import { apiJson, hc, type ResType } from "../api/api";
import InputGroupUI from "../style/imputGroupUI";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPerson } from "@fortawesome/free-solid-svg-icons";
import { PopupCard } from "./popupCard";
import { Button } from "react-bootstrap";
import { useQuery } from "@tanstack/react-query";

type UserProfile = ResType<
  (typeof hc.apiv1.user.lookupByEmail)["$post"]
>[number];

const SearchUserWithMail = ({
  onSelect,
}: {
  onSelect: (user: UserProfile) => void;
}) => {
  const [email, setEmail] = useState<string>("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const usersQuery = useQuery({
    queryKey: ["user-lookup", submittedEmail],
    enabled: submittedEmail.length > 0,
    queryFn: (): Promise<UserProfile[]> =>
      apiJson(
        hc.apiv1.user.lookupByEmail.$post({
          json: { email: submittedEmail },
        }),
        "ユーザーの検索に失敗しました。",
      ),
  });
  const result = usersQuery.data || [];

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
                onClick={() => {
                  setSelectedUser(null);
                  setSubmittedEmail(email);
                }}
                disabled={!email || usersQuery.isFetching}
              >
                {usersQuery.isFetching ? "検索中" : "検索"}
              </button>
            </div>
          </div>
          <div className="mt-3">
            {usersQuery.error ? (
              <p className="text-danger">ユーザーの検索に失敗しました。</p>
            ) : submittedEmail &&
              result.length === 0 &&
              !usersQuery.isFetching ? (
              <p>該当するユーザーが見つかりません。</p>
            ) : result.length > 0 ? (
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
            ) : null}
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
