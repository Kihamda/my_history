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
                value={
                  doc.has
                    ? convertInputDate(doc.date)
                    : `未取得 (${doc.details.filter((d) => d.has).length}/${
                        doc.details.length
                      })`
                }
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

const DetailPopup = ({ data }: { data: Ginosho }): React.ReactElement => {
  return (
    <>
      <div
        style={{ borderBottom: "1px solid #000000ff" }}
        className="d-flex mb-3"
      >
        <h4 className="flex-grow-1 mt-auto">{data.name}</h4>
      </div>
      <div key={data.id}>
        <InputGroup>
          <InputGroup.Text>技能章名</InputGroup.Text>
          <select
            className="form-select"
            value={dataTmp.unique}
            onChange={async (e) => {
              const selectedMaster = await getGinoshoDetail(e.target.value);
              setDataTmp({
                ...dataTmp,
                unique: selectedMaster?.id || "",
                name: selectedMaster?.name || "",
                cert: selectedMaster?.cert || false,
                details:
                  selectedMaster?.details.map((detail) => ({
                    id: detail.id,
                    has: false,
                    date: new Date(),
                  })) || [],
              });
              setDetailList(selectedMaster ? selectedMaster.details : []);
            }}
          >
            <option value="">選択してください</option>
            {masterData?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name + (item.cert ? " (考査員認定)" : " (隊長認定)")}
              </option>
            ))}
          </select>
        </InputGroup>
        <InputGroupUI
          label={dataTmp.cert ? "考査員名" : "隊長名"}
          className="mt-2"
          value={dataTmp.certName}
          setValueFunc={(v) => {
            setDataTmp({ ...dataTmp, certName: v });
          }}
        />
        <InputGroupUI
          label={dataTmp.has ? "取得済" : "未取得"}
          type="date"
          className="mt-2"
          chkbox={dataTmp.has}
          setChkboxFunc={(checked) => {
            setDataTmp({ ...dataTmp, has: checked });
          }}
          value={convertInputDate(dataTmp.date)}
          setValueFunc={(v) => {
            setDataTmp({ ...dataTmp, date: new Date(v) });
          }}
        />
        <h4 style={{ borderBottom: "1px solid #000000ff" }}>細目</h4>
        {DetailList.length > 0 ? (
          DetailList.map((detail, index) => (
            <InputGroupUI
              key={index}
              type="date"
              label={`細目 ${detail.number}`}
              value={convertInputDate(dataTmp.details[index].date)}
              setValueFunc={(v) => {
                const newDetails = [...dataTmp.details];
                newDetails[index] = { ...newDetails[index], date: new Date(v) };
                setDataTmp({ ...dataTmp, details: newDetails });
              }}
              explain={detail.description}
              chkbox={dataTmp.details[index].has}
              setChkboxFunc={(checked) => {
                const newDetails = [...dataTmp.details];
                newDetails[index] = {
                  ...newDetails[index],
                  has: checked,
                  date: checked ? new Date() : newDetails[index].date,
                };
                setDataTmp({ ...dataTmp, details: newDetails });
              }}
            />
          ))
        ) : (
          <p>細目はありません</p>
        )}
      </div>
    </>
  );
};
