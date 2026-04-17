import { raiseError } from "@f/errorHandler";
import { hc, type ResType } from "@f/lib/api/api";
import { PopupCard } from "@f/lib/popupContext/popupCard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "react-bootstrap";
import InputGroupUI from "../style/imputGroupUI";

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
  const queryClient = useQueryClient();
  const queryKey = ["scout-share-settings", id] as const;

  const shareQuery = useQuery<ShareSettings[]>({
    queryKey,
    queryFn: async () => {
      const data = await hc.apiv1.scout[":id"]["share"]["$get"]({
        param: { id },
      });

      if (!data.ok) {
        raiseError("共有設定の取得に失敗しました", "error", await data.text());
        return [];
      }

      return await data.json();
    },
    retry: false,
  });

  const shareSettings = shareQuery.data ?? [];

  const addShareMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      const response = await hc.apiv1.scout[":id"]["share"]["$post"]({
        param: { id },
        json: {
          targetUserId,
        },
      });

      if (!response.ok) {
        raiseError(
          "共有設定の追加に失敗しました",
          "error",
          (await response.json()).message,
        );
        return false;
      }

      return true;
    },
    onSuccess: async (succeeded) => {
      if (!succeeded) {
        return;
      }

      setIsEditing(false);
      setNewData(null);
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteShareMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      const response = await hc.apiv1.scout[":id"]["share"]["$delete"]({
        param: { id },
        json: {
          targetUserId,
        },
      });

      if (!response.ok) {
        raiseError(
          "共有設定の削除に失敗しました",
          "error",
          await response.text(),
        );
        return false;
      }

      return true;
    },
    onSuccess: async (succeeded) => {
      if (!succeeded) {
        return;
      }

      await queryClient.invalidateQueries({ queryKey });
    },
  });

  // 共有設定の追加
  const handleAdd = async () => {
    if (!newData) {
      raiseError("新しい共有設定のデータがありません");
      return;
    }

    await addShareMutation.mutateAsync(newData.id);
  };

  // 共有設定の削除
  const handleDelete = async (targetUserId: string) => {
    await deleteShareMutation.mutateAsync(targetUserId);
  };

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
                onClick={() => {
                  if (
                    confirm(`本当に${newData.name}さんを共有に追加しますか？`)
                  ) {
                    handleAdd();
                  }
                }}
              >
                追加
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
      {shareQuery.isPending ? (
        <div>共有設定を読み込んでいます...</div>
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
                    onClick={() => handleDelete(setting.id)}
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
  const [results, setResults] = useState<SearchUserResult[]>([]);

  const handleSearch = async (query: string) => {
    try {
      const response = await hc.apiv1.user["lookupByEmail"]["$post"]({
        json: { email: query },
      });
      if (response.status === 200) {
        const data = await response.json();
        setResults(data);
      } else {
        raiseError("ユーザーの検索に失敗しました");
      }
    } catch {
      raiseError("ユーザーの検索に失敗しました");
    }
  };

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
          <Button className="ms-2" onClick={() => handleSearch(query)}>
            検索
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
