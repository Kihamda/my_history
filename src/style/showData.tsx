import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ShowData = ({
  label,
  value,
  memo,
  bordered = false,
}: {
  label: string;
  value?: string;
  memo?: string;
  bordered?: boolean;
}) => {
  return (
    <div
      className="pb-3"
      style={bordered ? { borderBottom: "1px solid #dee2e6" } : {}}
    >
      <p className="mb-1 text-secondary">{label}</p>
      {value && value.length > 0 && (
        <h4 className="mb-0" style={{ lineHeight: "1em" }}>
          <FontAwesomeIcon icon={faCaretRight} className="me-2" />
          {value}
        </h4>
      )}
      {memo && memo.length > 0 && (
        <>
          <p className="text-secondary ms-4 m-0" style={{ fontSize: "0.6rem" }}>
            {memo}
          </p>
        </>
      )}
    </div>
  );
};
export default ShowData;
