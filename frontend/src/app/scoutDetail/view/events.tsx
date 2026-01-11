import type { ScoutData } from "@f/lib/api/apiTypes";
import { ScoutEventTypeMap, type ScoutEventType } from "@f/lib/master/events";
import ShowData from "@f/style/showData";

import { useState } from "react";

type Event = ScoutData["event"][number];

const Events = ({ events }: { events: Event[] }) => {
  const [eventFilter, setEventFilter] = useState<ScoutEventType | undefined>();

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
          eventList.map((event, index) => (
            <ShowData
              key={"event-" + index}
              label={event.startDate}
              value={`${event.startDate}～${event.endDate}`}
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
