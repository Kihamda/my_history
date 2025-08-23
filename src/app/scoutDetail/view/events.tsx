import ShowData from "@/style/showData";
import {
  ScoutEvent,
  ScoutEventType,
  ScoutEventTypeMap,
} from "@/types/scout/event";
import { useState } from "react";

const Events = ({ events }: { events: ScoutEvent[] }) => {
  const [eventFilter, setEventFilter] = useState<ScoutEventType>();

  const eventList = events.filter((event) =>
    eventFilter ? event.type == eventFilter : true
  );

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
            <ShowData
              key={event.id}
              label={event.title}
              value={`${event.start}～${event.end}`}
            />
          ))
        ) : (
          <p>イベント情報はありません。</p>
        )}
      </div>
    </div>
  );
};

export default Events;
