import type { ScoutSearchResponse } from "@f/lib/api/apiTypes";

const SearchResultCard = ({
  result,
}: {
  result: ScoutSearchResponse[number];
}) => {
  return (
    <div className="card hover-shadow d-flex" style={{ cursor: "pointer" }}>
      <div className="card-body flex-grow-1">
        <h5 className="card-title">{result.name}</h5>
        <p className="card-text">
          登録番号: {result.scoutId}
          <br />
          現隊: {result.currentUnitName}
        </p>
      </div>
      <div
        style={{
          width: "5px",
          backgroundColor: `#007bff`,
          borderRadius:
            "0 calc(var(--bs-card-border-radius) - 1px) calc(var(--bs-card-border-radius) - 1px) 0",
        }}
      ></div>
    </div>
  );
};

export default SearchResultCard;
