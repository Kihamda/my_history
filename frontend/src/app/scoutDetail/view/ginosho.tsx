import convertInputDate from "@/tools/date/convertInputDate";
import { Ginosho } from "@/types/frontend/scout/ginosho";
import ShowData from "@/frontend/style/showData";
import { usePopup } from "@/frontend/style/fullscreanPopup";

const GinoshoList = ({
  ginosho,
}: {
  ginosho: Ginosho[];
}): React.ReactElement => {
  const popup = usePopup();

  const certCount = ginosho.filter((item) => item.cert).length;

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">技能章</h5>
      </div>
      <div className="card-body">
        {ginosho && ginosho.length > 0 ? (
          ginosho.map((doc, index) => {
            return (
              <ShowData
                key={doc.id}
                label={doc.name + (doc.cert ? " (考査員認定)" : " (隊長認定)")}
                value={
                  doc.has
                    ? convertInputDate(doc.date)
                    : `未取得 (${doc.details.filter((d) => d.has).length}/${
                        doc.details.length
                      })`
                }
                bordered={ginosho.length - index > 1 && true}
                detailAction={() => {
                  popup.showPopup({
                    content: <DetailPopup data={doc} />,
                    title: "技能章詳細",
                    footer: (
                      <a
                        href={doc.url}
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

const DetailPopup = ({ data }: { data: Ginosho }): React.ReactElement => {
  return (
    <>
      <h4 className="pb-1" style={{ borderBottom: "1px solid #000000ff" }}>
        {data.name}
      </h4>
      <div key={data.id}>
        <ShowData
          label="取得日時"
          value={data.has ? convertInputDate(data.date) : "未取得"}
        />
        <ShowData
          label="認定区分"
          value={data.cert ? "考査員認定" : "隊長認定"}
        />
        <ShowData label={data.cert ? "考査員" : "隊長"} value={data.certName} />
        <h4
          style={{ borderBottom: "1px solid #000000ff" }}
          className="mt-3 pb-1"
        >
          細目
        </h4>
        {data.details && data.details.length > 0 ? (
          data.details.map((detail) => (
            <ShowData
              key={detail.sort}
              label={`細目 ${detail.number}`}
              value={detail.has ? convertInputDate(detail.date) : `未取得`}
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
