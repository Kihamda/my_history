import type { ScoutData } from "@/lib/api/apiTypes";
import { ScoutEventTypeMap, type ScoutEventType } from "@/lib/master/events";
import { useState } from "react";
import { Button, InputGroup } from "react-bootstrap";

const Events = ({
  events,
  setEventFunc,
}: {
  events: ScoutData["event"];
  setEventFunc: (events: ScoutData["event"]) => void;
}) => {
  const [eventFilter, setEventFilter] = useState<ScoutEventType | null>(null);

  const eventListLength = events.filter((event) =>
    eventFilter ? event.type == eventFilter : true
  ).length;

  const createNewRecord = () => {
    // 新規作成処理
    const newData: ScoutData["event"][number] = {
      name: "",
      startDate: new Date().toUTCString().split("T")[0],
      endDate: new Date().toUTCString().split("T")[0],
      description: "",
      type: eventFilter || "camp",
    };
    setEventFunc([...events, newData]);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">活動・参加</h5>
      </div>
      <div className="card-body">
        <div className="d-flex">
          <p className="mb-0 flex-grow-1">
            {eventListLength}件が見つかりました
          </p>
          <div className="dropdown">
            <button
              type="button"
              className="btn btn-outline-secondary dropdown-toggle"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {eventFilter ? ScoutEventTypeMap[eventFilter] : "すべて表示"}
            </button>
            <ul className="dropdown-menu">
              <li>
                <span
                  className={`dropdown-item ${
                    eventFilter === undefined ? "active" : ""
                  }`}
                  onClick={() => setEventFilter(null)}
                >
                  すべて表示
                </span>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              {Object.keys(ScoutEventTypeMap).map((key) => (
                <li key={key}>
                  <span
                    className={`dropdown-item ${
                      eventFilter === key ? "active" : ""
                    }`}
                    onClick={() => setEventFilter(key as ScoutEventType)}
                  >
                    {ScoutEventTypeMap[key as ScoutEventType]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {events && eventListLength > 0 ? (
          events.map((event, index) => {
            if (eventFilter && event.type !== eventFilter) {
              return null;
            }

            return (
              <div
                key={index}
                style={{ borderTop: "1px solid #ccc" }}
                className="pt-2 mt-2"
              >
                <InputGroup>
                  <InputGroup.Text>名目</InputGroup.Text>
                  <input
                    type="text"
                    className="form-control"
                    value={event.name}
                    onChange={(e) => {
                      setEventFunc(
                        events.toSpliced(index, 1, {
                          ...event,
                          name: e.target.value,
                        })
                      );
                    }}
                  />
                  <InputGroup.Text>分類</InputGroup.Text>
                  <select
                    className="form-select"
                    value={event.type}
                    onChange={(e) => {
                      setEventFunc(
                        events.toSpliced(index, 1, {
                          ...event,
                          type: e.target.value as ScoutEventType,
                        })
                      );
                    }}
                  >
                    {Object.keys(ScoutEventTypeMap).map((key) => (
                      <option key={key} value={key}>
                        {ScoutEventTypeMap[key as ScoutEventType]}
                      </option>
                    ))}
                  </select>
                </InputGroup>
                <InputGroup className="mt-2">
                  <InputGroup.Text>期間</InputGroup.Text>
                  <input
                    type="date"
                    className="form-control"
                    value={event.startDate}
                    onChange={(e) => {
                      setEventFunc(
                        events.toSpliced(index, 1, {
                          ...event,
                          startDate: e.target.value,
                        })
                      );
                    }}
                  />

                  <InputGroup.Text>～</InputGroup.Text>
                  <input
                    type="date"
                    className="form-control"
                    value={event.endDate}
                    onChange={(e) => {
                      setEventFunc(
                        events.toSpliced(index, 1, {
                          ...event,
                          endDate: e.target.value,
                        })
                      );
                    }}
                  />
                </InputGroup>
                <InputGroup className="mt-2">
                  <InputGroup.Text>メモ</InputGroup.Text>
                  <textarea
                    className="form-control"
                    value={event.description}
                    placeholder="イベントに関するメモ"
                    onChange={(e) =>
                      setEventFunc(
                        events.toSpliced(index, 1, {
                          ...event,
                          description: e.target.value,
                        })
                      )
                    }
                  />
                </InputGroup>
                <div className="mt-2 text-end">
                  <Button
                    variant="danger"
                    onClick={() =>
                      setEventFunc(events.filter((_, i) => i !== index))
                    }
                  >
                    この記録を削除
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <p>イベント情報はありません。</p>
        )}
      </div>
      <div className="card-footer text-end">
        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
          <button className="btn btn-primary" onClick={createNewRecord}>
            新規記録の作成
          </button>
        </div>
      </div>
    </div>
  );
};

export default Events;
