import { Scout } from "@/types/scout/scout";
import { Link } from "react-router";

const SearchResultCard = ({ result }: { result: Scout }) => {
  return (
    <div className="card">
      <Link
        to={`/app/scouts/${result.id}`}
        className="text-decoration-none text-dark"
        state={{ scout: result }}
      >
        <div className="card-body">
          <h5 className="card-title">{result.personal.name}</h5>
          <p className="card-text">Scout ID: {result.personal.ScoutId}</p>
          <p className="card-text">
            Current Unit: {result.personal.currentUnit}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default SearchResultCard;
