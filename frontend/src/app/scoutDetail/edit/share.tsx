import { raiseError } from "@f/errorHandler";
import { hc, type ResType } from "@f/lib/api/api";
import { useEffect, useState } from "react";

type ShareSettings = ResType<(typeof hc.apiv1.scout)[":id"]["share"]["$get"]>;

const ShareBox = ({ id }: { id: string }) => {
  const [shareSettings, setShareSettings] = useState<ShareSettings | null>(
    null,
  );

  const handleLoad = async () => {
    try {
      const data = await hc.apiv1.scout[":id"]["share"]["$get"]({
        param: { id },
      });
      setShareSettings(await data.json());
    } catch (error) {
      raiseError("共有設定の取得に失敗しました");
    }
  };

  useEffect(() => {
    handleLoad();
  }, [id]);

  return <></>;
};

export default ShareBox;
