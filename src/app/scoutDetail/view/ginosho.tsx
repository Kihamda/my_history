import convertInputDate from "@/tools/date/convertInputDate";
import { Ginosho } from "@/types/scout/gionosho";
import ShowData from "@/style/showData";

const GinoshoList = ({
  ginosho,
}: {
  ginosho: Ginosho[];
}): React.ReactElement => {
  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">技能章</h5>
      </div>
      <div className="card-body">
        {ginosho && ginosho.length > 0 ? (
          ginosho.map((doc) => {
            return (
              <ShowData
                key={doc.id}
                label={doc.name}
                value={convertInputDate(doc.date)}
                memo={doc.description}
              />
            );
          })
        ) : (
          <p>取得済みの技能章はありません</p>
        )}
      </div>
    </div>
  );
};

export default GinoshoList;
