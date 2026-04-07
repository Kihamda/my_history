import { raiseError } from "@f/errorHandler";
import { hc, type ResType } from "@f/lib/api/api";
import { PopupCard } from "@f/lib/popupContext/popupCard";
import { useEffect, useState } from "react";
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
  const [shareSettings, setShareSettings] = useState<ShareSettings[] | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [newData, setNewData] = useState<ShareSettings | null>(null);

  // 共有設定の追加
  const handleAdd = async () => {
    // ここで新しい共有設定を追加するAPIを呼び出す

    if (!newData) {
      raiseError("新しい共有設定のデータがありません");
      return;
    }

    try {
      const response = await hc.apiv1.scout[":id"]["share"]["$post"]({
        param: { id },
        json: {
          targetUserId: newData.id,
        },
      });
      if (response.status === 200) {
        setIsEditing(false);
        setNewData(null);
        handleLoad();
      } else {
        const errorData = await response.json();
        raiseError("共有設定の追加に失敗しました", "error", errorData.message);
      }
    } catch (error) {
      raiseError("共有設定の追加に失敗しました");
    }
  };

  // 共有設定の読み込み
  const handleLoad = async () => {
    try {
      const data = await hc.apiv1.scout[":id"]["share"]["$get"]({
        param: { id },
      });

      if (data.status == 200) {
        setShareSettings(await data.json());
      } else {
        raiseError("共有設定の取得に失敗しました");
      }
    } catch (error) {
      raiseError("共有設定の取得に失敗しました");
    }
  };

  // 共有設定の削除
  const handleDelete = async (targetUserId: string) => {
    try {
      const response = await hc.apiv1.scout[":id"]["share"]["$delete"]({
        param: { id },
        json: {
          targetUserId,
        },
      });
      if (response.status === 200) {
        handleLoad();
      } else {
        const errorData = await response.json();
        raiseError("共有設定の削除に失敗しました", "error", errorData.message);
      }
    } catch (error) {
      raiseError("共有設定の削除に失敗しました");
    }
  };

  // コンポーネントがマウントされたとき、またはidが変更されたときに共有設定を読み込む
  useEffect(() => {
    handleLoad();
  }, [id]);

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
              <Button onClick={handleAdd}>追加</Button>
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
      {!shareSettings ? (
        <div>共有設定を読み込んでいます...</div>
      ) : shareSettings.length === 0 ? (
        <div>共有設定がありません</div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {shareSettings.map((setting) => (
            <div className="d-flex border-bottom pb-2" key={setting.id}>
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
    } catch (error) {
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
          <Button onClick={() => handleSearch(query)}>検索</Button>
        </div>
      </div>

      {results.map((user) => (
        <div className="p-2 border-bottom d-flex flex-column" key={user.uid}>
          <div className="flex-grow-1">
            <h3 className="mb-0">{user.profile.displayName}</h3>
            <p>
              {user.email}:{user.uid}
            </p>
            <p>{user.profile.statusMessage}</p>
          </div>
          <div>
            <Button onClick={() => onUserSelect(user)}>選択</Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShareBoxPopupCard;
