import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ShowData = ({
  label,
  value,
  memo,
  bordered = false,
  detailAction,
}: {
  label: string;
  value?: string;
  memo?: string;
  bordered?: boolean;
  detailAction?: Function;
}) => {
  return (
    <div
      className="mt-1 pb-2 d-flex"
      style={bordered ? { borderBottom: "1px solid #dee2e6" } : {}}
    >
      <div className="flex-grow-1">
        <p className="mb-1 text-secondary">{label}</p>
        {value && value.length > 0 && (
          <h4 className="mb-0" style={{ lineHeight: "1em" }}>
            <FontAwesomeIcon icon={faCaretRight} className="me-2" />
            {value}
          </h4>
        )}
        {memo && memo.length > 0 && (
          <>
            <p
              className="text-secondary ms-4 m-0"
              style={{ fontSize: "0.7rem" }}
            >
              {memo}
            </p>
          </>
        )}
      </div>
      <div className="flex-grow-0 d-flex align-items-center">
        {detailAction && (
          <button className="btn btn-link p-0" onClick={() => detailAction()}>
            <FontAwesomeIcon icon={faCaretRight} className="me-2" />
            詳細
          </button>
        )}
      </div>
    </div>
  );
};
export default ShowData;
