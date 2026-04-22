import { resetPassword, useAuthContext } from "@f/authContext";
import { raiseError } from "@f/errorHandler";
import { hc } from "@f/lib/api/api";
import InputGroupUI from "@f/lib/style/imputGroupUI";
import { deleteUser } from "firebase/auth";
import { useState } from "react";
import { Button, FormSelect } from "react-bootstrap";

const MainPage = () => {
  const currentUserData = useAuthContext().user;
  const currentUserToken = useAuthContext().token;
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

  const handleDeleteAccount = async () => {
    try {
      const result = await hc.apiv1.user.delete.$delete();
      if (result.status === 200) {
        try {
          deleteUser(currentUserToken);
          raiseError("アカウントを削除しました", "success");
        } catch {
          raiseError(
            "アカウントは削除されましたが、認証情報の削除に失敗しました。管理者にお問い合わせください",
            "error",
          );
        }
      } else {
        raiseError("アカウントの削除に失敗しました", "error");
      }
    } catch {
      raiseError("アカウントの削除に失敗しました");
    }
  };

  const handleReset = async () => {
    await resetPassword(currentUserData.email);
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
            あなたのアカウントが他のユーザに表示されるかどうかを設定します。招待を拒否すると、グループからの新しい招待が届かなくなります。
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
              <option value="accept">プロフィールを表示する</option>
              <option value="deny">プロフィールを表示しない</option>
            </FormSelect>
          </div>
        </div>
      </div>
      <div className="card mb-3">
        <div className="card-body">
          <h2 className="card-title mb-3">アカウント削除</h2>
          <p>
            アカウントを削除すると、あなたのプロフィールやスカウト記録などのデータがすべて削除されます。削除したアカウントは復元できませんのでご注意ください。
          </p>
          <Button
            variant="danger"
            onClick={() => {
              if (
                confirm(
                  "本当にアカウントを削除してもよろしいですか？この操作は取り消せません。",
                ) &&
                confirm(
                  "本当にアカウントを削除しますか？これが最後の確認です。あなたのプロフィールやスカウト記録などのデータはすべて削除されます。この操作は取り消せません。",
                )
              ) {
                handleDeleteAccount();
              }
            }}
          >
            アカウントを削除する
          </Button>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <h2 className="card-title mb-3">パスワードリセット</h2>
          <p>
            パスワードを忘れた場合やセキュリティのためにパスワードを変更したい場合は、以下のボタンをクリックしてパスワードリセットメールを送信してください。メールに記載された手順に従って新しいパスワードを設定できます。
          </p>
          <Button variant="warning" onClick={handleReset}>
            パスワードリセットメールを送信
          </Button>
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
