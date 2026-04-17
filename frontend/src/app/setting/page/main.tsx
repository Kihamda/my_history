import { useAuthContext } from "@f/authContext";
import { raiseError } from "@f/errorHandler";
import { hc } from "@f/lib/api/api";
import InputGroupUI from "@f/lib/style/imputGroupUI";
import { useState } from "react";
import { Button, FormSelect } from "react-bootstrap";

const MainPage = () => {
  const currentUserData = useAuthContext().user;
  const [setting, setSetting] = useState(currentUserData);

  const handleSave = async () => {
    try {
      const result = await hc.apiv1.user.updateProfile.$post({
        json: {
          displayName: setting.profile.displayName,
          statusMessage: setting.profile.statusMessage,
          acceptsInvite: setting.profile.acceptsInvite,
        },
      });
      if (result.status === 200) {
        raiseError("プロフィールを更新しました", "success");
      } else {
        raiseError("プロフィールの更新に失敗しました", "error");
      }
    } catch {
      raiseError("プロフィールの更新に失敗しました");
    }
  };

  return (
    <>
      <div className="card mb-3">
        <div className="card-body">
          <h2 className="card-title mb-3">プロフィール設定</h2>

          <InputGroupUI
            label="表示名"
            value={setting.profile.displayName}
            setValueFunc={(value) =>
              setSetting({
                ...setting,
                profile: { ...setting.profile, displayName: value },
              })
            }
          />
          <h5 className="mt-4">ステータスメッセージ</h5>
          <textarea
            className="form-control"
            placeholder="ステータスメッセージ（例: ボーイスカウト歴10年のベテランです！）"
            value={setting.profile.statusMessage}
            rows={5}
            onChange={(e) =>
              setSetting({
                ...setting,
                profile: { ...setting.profile, statusMessage: e.target.value },
              })
            }
          />
        </div>
      </div>
      <div className="card mb-3">
        <div className="card-body">
          <h2 className="card-title mb-3">セキュリティ設定</h2>
          <p>
            グループからの招待を受け取るかどうかを設定します。招待を拒否すると、グループからの新しい招待が届かなくなります。
            <br />
            既に受け取っている招待には影響しません。
          </p>
          <div className="mb-3">
            <FormSelect
              value={setting.profile.acceptsInvite ? "accept" : "deny"}
              onChange={(e) =>
                setSetting({
                  ...setting,
                  profile: {
                    ...setting.profile,
                    acceptsInvite: e.target.value === "accept",
                  },
                })
              }
            >
              <option value="accept">招待を受け取る</option>
              <option value="deny">招待を受け取らない</option>
            </FormSelect>
          </div>
        </div>
      </div>
      <div className="card mb-3">
        <div className="card-body d-flex justify-content-end">
          <Button variant="primary" onClick={handleSave}>
            設定を保存
          </Button>
          <Button
            variant="secondary"
            className="ms-2"
            onClick={() => {
              if (confirm("変更を破棄してもよろしいですか？")) {
                setSetting(currentUserData);
              }
            }}
          >
            変更を戻す
          </Button>
        </div>
      </div>
    </>
  );
};

export default MainPage;
