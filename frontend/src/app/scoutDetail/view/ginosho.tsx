import ShowData from "@f/style/showData";
import { usePopup } from "@f/style/fullscreanPopup";
import type { ScoutData } from "@f/lib/api/apiTypes";
import ginoshoMap from "@f/lib/master/ginoshos";

type Ginosho = ScoutData["ginosho"][number];

type GinoshoWithMaster = {
  data: Ginosho;
  master: (typeof ginoshoMap)[string];
};

const GinoshoList = ({
  ginosho,
}: {
  ginosho: Ginosho[];
}): React.ReactElement => {
  const popup = usePopup();

  const ginoshoList: GinoshoWithMaster[] = ginosho
    .map((item) => ({ data: item, master: ginoshoMap[item.uniqueId] }))
    .filter((item) => item !== undefined);

  const certCount = ginoshoList.filter((item) => item.master.cert).length;

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">技能章</h5>
      </div>
      <div className="card-body">
        {ginoshoList.length > 0 ? (
          ginoshoList.map((doc, index) => {
            const dt = doc.data;
            const ms = doc.master;
            return (
              <ShowData
                key={dt.uniqueId}
                label={ms.name + (ms.cert ? " (考査員認定)" : " (隊長認定)")}
                value={
                  dt.achievedDate ||
                  `未取得 (${dt.details.filter((d) => d.done).length}/${
                    dt.details.length
                  })`
                }
                bordered={ginosho.length - index > 1 && true}
                detailAction={() => {
                  popup.showPopup({
                    content: <DetailPopup data={doc} />,
                    title: "技能章詳細",
                    footer: (
                      <a
                        href={ms.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        日本連盟のページへ
                      </a>
                    ),
                  });
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

const DetailPopup = ({
  data,
}: {
  data: GinoshoWithMaster;
}): React.ReactElement => {
  const dt = data.data;
  const ms = data.master;
  return (
    <>
      <h4 className="pb-1" style={{ borderBottom: "1px solid #000000ff" }}>
        {ms.name + (ms.cert ? " (考査員認定)" : " (隊長認定)")}
      </h4>
      <div key={dt.uniqueId}>
        <ShowData
          label="取得日時"
          value={dt.achievedDate ? dt.achievedDate : "未取得"}
        />
        <ShowData
          label="認定区分"
          value={ms.cert ? "考査員認定" : "隊長認定"}
        />
        <ShowData label={ms.cert ? "考査員" : "隊長"} value={dt.certBy} />
        <h4
          style={{ borderBottom: "1px solid #000000ff" }}
          className="mt-3 pb-1"
        >
          細目
        </h4>
        {ms.details && ms.details.length > 0 ? (
          ms.details.map((detail, index) => (
            <ShowData
              key={`${dt.uniqueId}-${index}`}
              label={`細目 ${detail.number}`}
              value={
                dt.details[index].achievedDate
                  ? dt.details[index].achievedDate
                  : `未取得`
              }
              memo={detail.description}
            />
          ))
        ) : (
          <p>細目はありません</p>
        )}
      </div>
    </>
  );
};
