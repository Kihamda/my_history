import { usePopup } from "@f/lib/popupContext/fullscreanPopup";
import { Button, InputGroup } from "react-bootstrap";
import { useState } from "react";
import InputGroupUI from "@f/lib/style/imputGroupUI";
import ShowData from "@f/lib/style/showData";
import type { ScoutData } from "@f/lib/api/apiTypes";
import ginoshoMap from "@f/lib/master/ginoshos";
import { PopupCard } from "@f/lib/popupContext/popupCard";

type Ginosho = ScoutData["ginosho"][number];

type GinoshoWithMaster = {
  data: Ginosho;
  master: (typeof ginoshoMap)[string];
};

const GinoshoList = ({
  ginosho,
  setGinoshoFunc,
}: {
  ginosho: Ginosho[];
  setGinoshoFunc: (Ginosho: Ginosho[]) => void;
}): React.ReactElement => {
  const popup = usePopup();

  const showPopup = (data: Ginosho) => {
    popup.showPopup({
      content: (
        <DetailPopup
          data={data}
          setDataFunc={(newData) => {
            const newList = [...ginosho];
            const index = newList.findIndex(
              (item) => item.uniqueId === data.uniqueId,
            );
            if (newData === null) {
              // 削除
              if (index !== -1) {
                newList.splice(index, 1);
                setGinoshoFunc(newList);
              }
            } else if (index !== -1) {
              newList[index] = newData;
              setGinoshoFunc(newList);
            } else {
              // 新規追加
              setGinoshoFunc([...newList, newData]);
            }
          }}
        />
      ),
    });
  };

  const createNewRecord = () => {
    // 新規作成処理
    const newData: Ginosho = {
      uniqueId: "",
      achievedDate: "",
      certBy: "",
      details: [],
    };

    // 追加したデータの編集画面を開く
    showPopup(newData);
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
                key={doc.uniqueId}
                value={
                  doc.achievedDate
                    ? doc.achievedDate
                    : `未取得(${
                        doc.details.filter((d) => d.achievedDate).length
                      }/${doc.details.length})`
                }
                label={
                  doc.uniqueId
                    ? ginoshoMap[doc.uniqueId].name +
                      (ginoshoMap[doc.uniqueId].cert
                        ? " (考査員認定)"
                        : " (隊長認定)")
                    : `未設定`
                }
                detailButtonContent="編集"
                bordered={index < ginosho.length - 1}
                detailAction={() => showPopup(doc)}
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
  setDataFunc: (data: Ginosho | null) => void;
}): React.ReactElement => {
  const [dataTmp, setDataTmp] = useState<GinoshoWithMaster>({
    data,
    master: ginoshoMap[data.uniqueId],
  });

  const popup = usePopup();

  return (
    <PopupCard
      title={
        dataTmp.master
          ? dataTmp.master.name +
            (dataTmp.master.cert ? " (考査員認定)" : " (隊長認定)")
          : "技能章詳細"
      }
    >
      <div
        style={{ borderBottom: "1px solid #000000ff" }}
        className="d-flex mb-3"
      >
        <h4 className="flex-grow-1 mt-auto">基本情報</h4>
        <div className="flex-grow-0">
          <Button
            variant="primary"
            className="m-1"
            onClick={() => {
              setDataFunc(dataTmp.data);
              popup.hidePopup();
            }}
          >
            保存
          </Button>
          <Button
            variant="danger"
            className="m-1"
            onClick={() => {
              if (confirm("この技能章の記録を削除します。よろしいですか？")) {
                setDataFunc(null);
                popup.hidePopup();
              }
            }}
          >
            削除
          </Button>
        </div>
      </div>
      <div key={data.uniqueId}>
        <InputGroup>
          <InputGroup.Text>技能章名</InputGroup.Text>
          <select
            className="form-select"
            value={dataTmp.data.uniqueId}
            onChange={async (e) => {
              setDataTmp({
                data: {
                  ...dataTmp.data,
                  uniqueId: e.target.value,
                  details: e.target.value
                    ? ginoshoMap[e.target.value].details.map(() => ({
                        done: false,
                        achievedDate: "",
                      }))
                    : [],
                },
                master: ginoshoMap[e.target.value],
              });
            }}
            disabled={dataTmp.data.uniqueId !== ""} // 一度設定したら変更不可
          >
            <option value="">選択してください</option>
            {Object.entries(ginoshoMap).map(([id, item]) => (
              <option key={id} value={id}>
                {item.name + (item.cert ? " (考査員認定)" : " (隊長認定)")}
              </option>
            ))}
          </select>
        </InputGroup>
        {dataTmp.master ? (
          <>
            <p>
              誤選択の場合は一度「削除」してから再度記録を作成してください。
            </p>
            <InputGroupUI
              label={dataTmp.master.cert ? "考査員名" : "隊長名"}
              className="mt-2"
              value={dataTmp.data.certBy}
              setValueFunc={(v) => {
                setDataTmp({
                  ...dataTmp,
                  data: { ...dataTmp.data, certBy: v },
                });
              }}
            />
            <InputGroupUI
              label={dataTmp.data.achievedDate ? "取得済" : "未取得"}
              type="date"
              className="mt-2"
              chkbox={dataTmp.data.achievedDate !== ""}
              setChkboxFunc={(checked) => {
                setDataTmp({
                  ...dataTmp,
                  data: {
                    ...dataTmp.data,
                    achievedDate: checked
                      ? new Date().toISOString().split("T")[0]
                      : "",
                  },
                });
              }}
              value={dataTmp.data.achievedDate || ""}
              setValueFunc={(v) => {
                setDataTmp({
                  ...dataTmp,
                  data: { ...dataTmp.data, achievedDate: v },
                });
              }}
            />
            <h4 style={{ borderBottom: "1px solid #000000ff" }}>細目</h4>
            {dataTmp.data.details.length > 0 ? (
              dataTmp.data.details.map((detail, index) => {
                const ms = dataTmp.master.details[index];
                return (
                  <InputGroupUI
                    key={index}
                    type="date"
                    label={`細目 ${ms.number}`}
                    value={detail.achievedDate || ""}
                    setValueFunc={(v) => {
                      const newDetails = [...dataTmp.data.details];
                      newDetails[index] = {
                        ...newDetails[index],
                        achievedDate: new Date(v).toISOString().split("T")[0],
                      };
                      setDataTmp({
                        ...dataTmp,
                        data: { ...dataTmp.data, details: newDetails },
                      });
                    }}
                    explain={ms.description}
                    chkbox={detail.done}
                    setChkboxFunc={(checked) => {
                      const newDetails = [...dataTmp.data.details];
                      newDetails[index] = {
                        ...newDetails[index],
                        done: checked,
                        achievedDate: checked
                          ? new Date().toISOString().split("T")[0]
                          : newDetails[index].achievedDate,
                      };
                      setDataTmp({
                        ...dataTmp,
                        data: { ...dataTmp.data, details: newDetails },
                      });
                    }}
                  />
                );
              })
            ) : (
              <p>細目はありません</p>
            )}
          </>
        ) : (
          <p>
            技能章が選択されていません。一度選択すると二度と変更できません。
          </p>
        )}
      </div>
    </PopupCard>
  );
};
