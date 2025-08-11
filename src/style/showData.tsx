import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ShowData = ({
  label,
  value,
  memo,
}: {
  label: string;
  value?: string;
  memo?: string;
}) => {
  return (
    <div className="mt-2">
      <p className="mb-0 text-secondary">{label}</p>
      {value && value.length > 0 && (
        <h4 style={{ lineHeight: "0.1rem" }}>
          <FontAwesomeIcon icon={faCaretRight} className="me-2" />
          {value}
          {memo && memo.length > 0 && (
            <>
              <br />
              <span
                className="text-secondary ms-4"
                style={{ fontSize: "0.6rem" }}
              >
                {memo}
              </span>
            </>
          )}
        </h4>
      )}
    </div>
  );
};
export default ShowData;
