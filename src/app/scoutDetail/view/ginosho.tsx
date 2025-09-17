import convertInputDate from "@/tools/date/convertInputDate";
import { Ginosho } from "@/types/scout/ginosho";
import ShowData from "@/style/showData";
import { usePopup } from "@/fullscreanPopup";

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
                value={convertInputDate(doc.date)}
                bordered={ginosho.length - index > 1 && true}
                detailAction={() => {
                  popup.showPopup({ content: <DetailPopup data={doc} /> });
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

const DetailPopup = ({ data }: { data: Ginosho }) => {
  return (
    <div>
      <h5>{data.name}</h5>
      <p>{data.cert ? "考査員認定" : "隊長認定"}</p>
      <p>{data.description}</p>
    </div>
  );
};
