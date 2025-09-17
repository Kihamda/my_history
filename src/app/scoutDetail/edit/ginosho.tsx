import { Ginosho } from "@/types/scout/ginosho";
import { usePopup } from "@/fullscreanPopup";
import { Button, InputGroup } from "react-bootstrap";
import getRandomStr from "@/tools/getRandomStr";
import {
  getGinoshoDetail,
  getGinoshoMasterList,
  GinoshoMaster,
} from "@/types/master/ginosho";
import { Suspense, useEffect, useState } from "react";
import LoadingSplash from "@/style/loadingSplash";
import InputGroupUI from "@/style/imputGroupUI";
import convertInputDate from "@/tools/date/convertInputDate";
import ShowData from "@/style/showData";

const GinoshoList = ({
  ginosho,
  setGinoshoFunc,
}: {
  ginosho: Ginosho[];
  setGinoshoFunc: (Ginosho: Ginosho[]) => void;
}): React.ReactElement => {
  const popup = usePopup();

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
        has: false,
        details: [],
      },
    ]);
  };

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
                value={doc.has ? convertInputDate(doc.date) : "未取得"}
                label={
                  doc.name
                    ? doc.name + (doc.cert ? " (考査員認定)" : " (隊長認定)")
                    : "未設定"
                }
                detailButtonContent="編集"
                bordered={index < ginosho.length - 1}
                detailAction={() =>
                  popup.showPopup({
                    content: (
                      <Suspense fallback={<LoadingSplash />}>
                        <DetailPopup
                          data={doc}
                          setDataFunc={(data) => {
                            const newList = [...ginosho];
                            newList[index] = data;
                            setGinoshoFunc(newList);
                          }}
                        />
                      </Suspense>
                    ),
                  })
                }
              />
            );
          })
        ) : (
          <p>取得済みの技能章はありません</p>
        )}
      </div>

      <div className="card-footer text-end">
        <Button onClick={createNewRecord}>新規記録を作成</Button>
      </div>
    </div>
  );
};

export default GinoshoList;

const DetailPopup = ({
  data,
  setDataFunc,
}: {
  data: Ginosho;
  setDataFunc: (data: Ginosho) => void;
}): React.ReactElement => {
  const [masterData, setMasterData] = useState<GinoshoMaster[]>();
  const [dataTmp, setDataTmp] = useState<Ginosho>(data);

  useEffect(() => {
    getGinoshoMasterList().then((m) => {
      if (m) setMasterData(m);
    });
  }, []);

  return (
    <>
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
                    description: detail.description,
                    number: detail.number,
                    checked: false,
                    date: new Date(),
                  })) || [],
              });
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
        {dataTmp.details && dataTmp.details.length > 0 ? (
          dataTmp.details.map((detail, index) => (
            <InputGroupUI
              key={index}
              label={`細目 ${detail.number}`}
              value={convertInputDate(detail.date)}
              setValueFunc={(v) => {
                const newDetails = [...dataTmp.details];
                newDetails[index] = { ...newDetails[index], date: new Date(v) };
                setDataTmp({ ...dataTmp, details: newDetails });
              }}
              explain={detail.description}
              chkbox={detail.checked}
              setChkboxFunc={(checked) => {
                const newDetails = [...dataTmp.details];
                newDetails[index] = {
                  ...newDetails[index],
                  checked: checked,
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
