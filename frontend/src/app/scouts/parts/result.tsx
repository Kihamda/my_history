import { SearchResult } from "@/types/frontend/search/searchQueryType";

const SearchResultCard = ({ result }: { result: SearchResult }) => {
  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">{result.name}</h5>
        <p className="card-text">Scout ID: {result.scoutId}</p>
        <p className="card-text">Current Unit: {result.currentUnit}</p>
        <p className="card-text">
          経験隊: {result.experiencedUnits.join(", ")}
        </p>
      </div>
    </div>
  );
};

export default SearchResultCard;
