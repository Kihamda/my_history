import type { ScoutSearchResponse } from "@/lib/api/apiTypes";

const SearchResultCard = ({
  result,
}: {
  result: ScoutSearchResponse[number];
}) => {
  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">{result.name}</h5>
        <p className="card-text">Scout ID: {result.scoutId}</p>
        <p className="card-text">Current Unit: {result.currentUnitName}</p>
      </div>
    </div>
  );
};

export default SearchResultCard;
