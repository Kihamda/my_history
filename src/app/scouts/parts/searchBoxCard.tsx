import SearchQuery from "@/types/search/searchQueryType";

const SearchboxCard = ({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: SearchQuery;
  setSearchQuery: React.Dispatch<React.SetStateAction<SearchQuery>>;
}) => {
  return (
    <div className="card">
      <div className="card-body">
        <h2>Search Scouts</h2>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery?.name || ""}
          onChange={(e) =>
            setSearchQuery({ ...searchQuery, name: e.target.value })
          }
        />
        <button onClick={() => console.log("Searching...")}>Search</button>
      </div>
    </div>
  );
};

export default SearchboxCard;
