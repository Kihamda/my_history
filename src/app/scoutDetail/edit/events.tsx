import convertInputDate from "@/tools/date/convertInputDate";
import getRandomStr from "@/tools/getRandomStr";
import {
  ScoutEvent,
  ScoutEventType,
  ScoutEventTypeMap,
} from "@/types/scout/event";
import { useState } from "react";
import { Button, InputGroup } from "react-bootstrap";

const Events = ({
  events,
  setEventFunc,
}: {
  events: ScoutEvent[];
  setEventFunc: (events: ScoutEvent[]) => void;
}) => {
  const [eventFilter, setEventFilter] = useState<ScoutEventType>();

  const eventList = events.filter((event) =>
    eventFilter ? event.type == eventFilter : true
  );

  const createNewRecord = () => {
    // 新規作成処理
    const newData: ScoutEvent = {
      id: getRandomStr(20),
      title: "",
      start: new Date(),
      end: new Date(),
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
            {eventList.length}件が見つかりました
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
                  onClick={() => setEventFilter(undefined)}
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
        {eventList && eventList.length > 0 ? (
          eventList.map((event) => (
            <div
              key={event.id}
              style={{ borderTop: "1px solid #ccc" }}
              className="pt-2 mt-2"
            >
              <InputGroup>
                <InputGroup.Text>名目</InputGroup.Text>
                <input
                  type="text"
                  className="form-control"
                  value={event.title}
                  onChange={(e) => {
                    setEventFunc(
                      events.map((ev) =>
                        ev.id === event.id
                          ? { ...ev, title: e.target.value }
                          : ev
                      )
                    );
                  }}
                />
                <InputGroup.Text>分類</InputGroup.Text>
                <select
                  className="form-select"
                  value={event.type}
                  onChange={(e) => {
                    setEventFunc(
                      events.map((ev) =>
                        ev.id === event.id
                          ? { ...ev, type: e.target.value as ScoutEventType }
                          : ev
                      )
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
                  value={convertInputDate(event.start)}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    setEventFunc(
                      events.map((ev) =>
                        ev.id === event.id ? { ...ev, start: newDate } : ev
                      )
                    );
                  }}
                />

                <InputGroup.Text>～</InputGroup.Text>
                <input
                  type="date"
                  className="form-control"
                  value={convertInputDate(event.end)}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    setEventFunc(
                      events.map((ev) =>
                        ev.id === event.id ? { ...ev, end: newDate } : ev
                      )
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
                      events.map((ev) =>
                        ev.id === event.id
                          ? { ...ev, description: e.target.value }
                          : ev
                      )
                    )
                  }
                />
              </InputGroup>
              <div className="mt-2 text-end">
                <Button
                  variant="danger"
                  onClick={() =>
                    setEventFunc(events.filter((ev) => ev.id !== event.id))
                  }
                >
                  この記録を削除
                </Button>
              </div>
            </div>
          ))
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
