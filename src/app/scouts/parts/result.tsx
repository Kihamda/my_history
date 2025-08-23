import { Scout } from "@/types/scout/scout";

const SearchResultCard = ({ result }: { result: Scout }) => {
  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">{result.personal.name}</h5>
        <p className="card-text">Scout ID: {result.personal.ScoutId}</p>
        <p className="card-text">Current Unit: {result.personal.currentUnit}</p>
      </div>
    </div>
  );
};

export default SearchResultCard;
