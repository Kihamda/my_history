import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ShowData = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="mt-2">
      <p className="mb-0">{label}</p>
      <h4 className="text-primary">
        <FontAwesomeIcon icon={faCaretRight} className="me-2" />
        {value}
      </h4>
    </div>
  );
};
export default ShowData;
