import { useAuthContext } from "@f/authContext";
import { raiseError } from "@f/errorHandler";
import FullWidthCardHeader from "@f/lib/style/fullWidthCardHeader";
import InputGroupUI from "@f/lib/style/imputGroupUI";
import { useState } from "react";

const GroupTopPage = () => {
  const { currentGroup } = useAuthContext();

  if (!currentGroup) {
    raiseError("グループが選択されていません。");
    return <></>;
  }

  const [changedCurrentGroup, setChangedCurrentGroup] = useState(currentGroup);

  return (
    <>
      <FullWidthCardHeader title="グループ設定" />
      <div className="mt-3 card">
        <div className="card-body">
          <p>グループの各種設定を行います。</p>
          <InputGroupUI
            label="グループ名"
            value={changedCurrentGroup.name}
            setValueFunc={(e) =>
              setChangedCurrentGroup({
                ...changedCurrentGroup,
                name: e,
              })
            }
          />
        </div>
      </div>
    </>
  );
};

export default GroupTopPage;
