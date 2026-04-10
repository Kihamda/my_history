import { useAuthContext } from "@f/authContext";
import { raiseError } from "@f/errorHandler";
import { hc } from "@f/lib/api/api";
import InputGroupUI from "@f/lib/style/imputGroupUI";
import { useState } from "react";
import { Button } from "react-bootstrap";

const MainPage = () => {
  const currentUserData = useAuthContext().user;
  const [setting, setSetting] = useState(currentUserData);

  const handleSave = async () => {
    const result = await hc.apiv1.user.updateProfile.$post({
      json: {
        displayName: setting.profile.displayName,
        statusMessage: setting.profile.statusMessage,
      },
    });
    if (result.status === 200) {
      raiseError("プロフィールを更新しました", "success");
    } else {
      raiseError("プロフィールの更新に失敗しました", "error");
    }
  };

  return (
    <>
      <div className="card mb-3">
        <div className="card-body">
          <h2 className="card-title">基本設定</h2>

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
          <InputGroupUI
            label="ステータスメッセージ"
            value={setting.profile.statusMessage}
            setValueFunc={(value) =>
              setSetting({
                ...setting,
                profile: { ...setting.profile, statusMessage: value },
              })
            }
          />
        </div>
        <div className="card-footer text-end">
          <Button variant="primary" onClick={handleSave}>
            設定を保存
          </Button>
          <Button
            variant="secondary"
            className="ms-2"
            onClick={() => setSetting(currentUserData)}
          >
            変更を戻す
          </Button>
        </div>
      </div>
    </>
  );
};

export default MainPage;
