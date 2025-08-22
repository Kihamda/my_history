import convertInputDate from "@/tools/date/convertInputDate";
import { Ginosho, GinoshoMasterList } from "@/types/scout/gionosho";
import ShowData from "@/style/showData";
import { useEffect, useState } from "react";
import LoadingSplash from "@/style/loadingSplash";
import { getGinoshoMasterList } from "@/masterRecord/ginosho";

const GinoshoList = ({
  ginosho,
}: {
  ginosho: Ginosho[];
}): React.ReactElement => {
  const [ginoshoDb, setGinoshoDb] = useState<GinoshoMasterList[]>([]);

  useEffect(() => {
    getGinoshoMasterList().then((data) => {
      setGinoshoDb(data);
    });
  }, []);

  const certCount = ginosho.filter(
    (doc) => ginoshoDb.find((item) => item.id === doc.unique)?.cert
  ).length;

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">技能章</h5>
      </div>
      <div className="card-body">
        {ginoshoDb.length === 0 ? (
          <LoadingSplash />
        ) : ginosho && ginosho.length > 0 ? (
          ginosho.map((doc, index) => {
            const data = ginoshoDb.filter((item) => item.id === doc.unique)[0];
            return (
              <ShowData
                key={doc.id}
                label={
                  data?.name + (data?.cert ? " (考査員認定)" : " (隊長認定)")
                }
                value={convertInputDate(doc.date)}
                memo={doc.description}
                bordered={ginosho.length - index > 1 && true}
                detailAction={() => {
                  console.log("詳細表示機能は未実装です");
                }}
              />
            );
          })
        ) : (
          <p>取得済みの技能章はありません</p>
        )}
      </div>
      <div className="card-footer">
        合計 {ginosho.length} 件(うち考査員認定 {certCount} 件)
      </div>
    </div>
  );
};

export default GinoshoList;
