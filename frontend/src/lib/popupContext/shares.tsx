import {
  apiJson,
  hc,
  queryClient,
  type ResType,
} from "@f/lib/api/api";
import { PopupCard } from "@f/lib/popupContext/popupCard";
import { useState } from "react";
import { Button } from "react-bootstrap";
import InputGroupUI from "../style/imputGroupUI";
import { useMutation, useQuery } from "@tanstack/react-query";

type ShareSettings = ResType<
  (typeof hc.apiv1.scout)[":id"]["share"]["$get"]
>[number];

const ShareBoxPopupCard = ({
  id,
  isEditable,
}: {
  id: string;
  isEditable?: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newData, setNewData] = useState<ShareSettings | null>(null);
  const sharesQuery = useQuery({
    queryKey: ["scout-shares", id],
    queryFn: (): Promise<ShareSettings[]> =>
      apiJson(
        hc.apiv1.scout[":id"]["share"]["$get"]({ param: { id } }),
        "共有設定の取得に失敗しました",
      ),
  });
  const addMutation = useMutation({
    mutationFn: () => {
      if (!newData) throw new Error("新しい共有設定のデータがありません");
      return apiJson(
        hc.apiv1.scout[":id"]["share"]["$post"]({
          param: { id },
          json: { targetUserId: newData.id },
        }),
        "共有設定の追加に失敗しました",
      );
    },
    onSuccess: async () => {
      setIsEditing(false);
      setNewData(null);
      await queryClient.invalidateQueries({
        queryKey: ["scout-shares", id],
      });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (targetUserId: string) =>
      apiJson(
        hc.apiv1.scout[":id"]["share"]["$delete"]({
          param: { id },
          json: { targetUserId },
        }),
        "共有設定の削除に失敗しました",
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["scout-shares", id],
      }),
  });
  const shareSettings = sharesQuery.data || [];

  // 編集モードの表示
  if (isEditing && isEditable) {
    return (
      <PopupCard
        title="新規共有"
        footer={
          <div className="text-end">
            <Button
              variant="outline-secondary"
              onClick={() => {
                setIsEditing(false);
                setNewData(null);
              }}
            >
              キャンセル
            </Button>
          </div>
        }
      >
        {newData ? (
          <div>
            <h3>{newData.name}さんを共有に追加しますか？</h3>
            <p className="mb-0">ユーザーID: {newData.id}</p>
            <p>メールアドレス: {newData.email}</p>
            <p>
              ユーザーを追加すると、そのユーザーもこのスカウトの情報を閲覧できるようになります。共有設定は後から変更・削除することも可能です。追加ボタンを押すとすぐに反映されるのでご注意ください。
            </p>
            <div className="text-end ms-2">
              <Button
                disabled={addMutation.isPending}
                onClick={() => {
                  if (
                    confirm(`本当に${newData.name}さんを共有に追加しますか？`)
                  ) {
                    addMutation.mutate();
                  }
                }}
              >
                {addMutation.isPending ? "追加中" : "追加"}
              </Button>
            </div>
          </div>
        ) : (
          <SearchUserInput
            onUserSelect={(user) =>
              setNewData({
                id: user.uid,
                email: user.email,
                name: user.profile.displayName,
              })
            }
          />
        )}
      </PopupCard>
    );
  }

  // 通常の表示モード
  return (
    <PopupCard
      title="共有設定"
      footer={
        isEditable && (
          <div className="text-end">
            <Button onClick={() => setIsEditing(true)}>新規追加</Button>
          </div>
        )
      }
    >
      {sharesQuery.isPending ? (
        <div>共有設定を読み込んでいます...</div>
      ) : sharesQuery.error ? (
        <div className="text-danger">共有設定の取得に失敗しました</div>
      ) : shareSettings.length === 0 ? (
        <div>共有設定がありません</div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {shareSettings.map((setting) => (
            <div
              className={
                "d-flex " +
                (shareSettings.length > 1 ? "border-bottom" : "") +
                " pb-2"
              }
              key={setting.id}
            >
              <div className="flex-grow-1">
                <h3 className="mb-0">{setting.name}</h3>
                <p className="mb-0">ユーザーID: {setting.id}</p>
                <p className="mb-0">メールアドレス: {setting.email}</p>
              </div>
              {isEditable && (
                <div className="d-flex align-items-center">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(setting.id)}
                  >
                    削除
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </PopupCard>
  );
};

type SearchUserResult = ResType<
  (typeof hc.apiv1.user)["lookupByEmail"]["$post"]
>[number];

const SearchUserInput = ({
  onUserSelect,
}: {
  onUserSelect: (user: SearchUserResult) => void;
}) => {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const usersQuery = useQuery({
    queryKey: ["user-lookup", submittedQuery],
    enabled: submittedQuery.length > 0,
    queryFn: (): Promise<SearchUserResult[]> =>
      apiJson(
        hc.apiv1.user["lookupByEmail"]["$post"]({
          json: { email: submittedQuery },
        }),
        "ユーザーの検索に失敗しました",
      ),
  });
  const results = usersQuery.data || [];

  return (
    <div>
      <div className="mb-3 d-flex">
        <div className="flex-grow-1">
          <InputGroupUI
            placeholder="ユーザーを検索..."
            label="メールアドレス"
            value={query}
            setValueFunc={(e) => setQuery(e)}
          />
        </div>
        <div>
          <Button
            className="ms-2"
            disabled={!query || usersQuery.isFetching}
            onClick={() => setSubmittedQuery(query)}
          >
            {usersQuery.isFetching ? "検索中" : "検索"}
          </Button>
        </div>
      </div>

      {results.map((user) => (
        <div
          className={`p-2 ${results.length > 1 ? "border-bottom" : ""} d-flex`}
          key={user.uid}
        >
          <div className="flex-grow-1">
            <h3 className="mb-0">{user.profile.displayName}</h3>
            <p>
              {user.email} <br />
              <span className="text-muted">({user.uid})</span>
            </p>
            <p>{user.profile.statusMessage}</p>
          </div>
          <div className="d-flex align-items-center">
            <Button onClick={() => onUserSelect(user)}>選択</Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShareBoxPopupCard;
