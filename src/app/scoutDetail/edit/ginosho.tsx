import convertInputDate from "@/tools/date/convertInputDate";
import { Ginosho } from "@/types/scout/ginosho";
import ShowData from "@/style/showData";
import { usePopup } from "@/fullscreanPopup";
import { Button } from "react-bootstrap";
import getRandomStr from "@/tools/getRandomStr";
import { getGinoshoMasterList, GinoshoMaster } from "@/types/master/ginosho";
import { useEffect, useState } from "react";
import LoadingSplash from "@/style/loadingSplash";

const GinoshoList = ({
  ginosho,
  setGinoshoFunc,
}: {
  ginosho: Ginosho[];
  setGinoshoFunc: (Ginosho: Ginosho[]) => void;
}): React.ReactElement => {
  const popup = usePopup();

  const [masterData, setMasterData] = useState<GinoshoMaster[]>();

  useEffect(() => {
    getGinoshoMasterList().then((data) => {
      if (data) {
        // マスターデータの取得に成功
        setMasterData(data);
      } else {
        // マスターデータの取得に失敗
      }
    });
  }, []);

  const createNewRecord = () => {
    // 新規作成処理
    setGinoshoFunc([
      ...ginosho,
      {
        id: getRandomStr(20),
        unique: "",
        name: "",
        date: new Date(),
        cert: false,
        certName: "",
        description: "",
        details: [],
      },
    ]);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">技能章</h5>
      </div>
      {masterData ? (
        <div className="card-body">
          {ginosho && ginosho.length > 0 ? (
            ginosho.map((doc, index) => {
              return (
                <div
                  style={{
                    borderTop: index === 0 ? "none" : "1px solid #dee2e6",
                  }}
                  className="py-2"
                  key={doc.id}
                >
                  <ShowData
                    label={
                      doc.name + (doc.cert ? " (考査員認定)" : " (隊長認定)")
                    }
                    value={convertInputDate(doc.date)}
                    memo={doc.description}
                    detailAction={() => {
                      popup.showPopup({ content: <DetailPopup data={doc} /> });
                    }}
                  />
                </div>
              );
            })
          ) : (
            <p>取得済みの技能章はありません</p>
          )}
        </div>
      ) : (
        <LoadingSplash />
      )}

      <div className="card-footer text-end">
        <Button onClick={createNewRecord}>新規記録を作成</Button>
      </div>
    </div>
  );
};

export default GinoshoList;

const DetailPopup = ({ data }: { data: Ginosho }) => {
  return (
    <div>
      <h5>{data.name}</h5>
      <p>{data.cert ? "考査員認定" : "隊長認定"}</p>
      <p>{data.description}</p>
    </div>
  );
};
