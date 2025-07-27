import { useState } from "react";
import { useLocation } from "react-router";
import SearchQuery from "@/types/search/searchQueryType";
import SearchboxCard from "./parts/searchBoxCard";
import queryParser from "./queryParser";

const Scouts: React.FC = () => {
  // 遷移元からの検索名を取得
  const searchBox = (useLocation().state?.searchName || "") as string;

  // 検索クエリの初期化
  let initialSearchQuery: SearchQuery = {
    scoutId: "",
    name: "",
    currentUnit: [],
    expectedUnit: [],
  };

  if (searchBox) {
    const { scoutId, name, currentUnit, expectedUnit } = queryParser(searchBox);

    initialSearchQuery = {
      scoutId: scoutId,
      name: name,
      currentUnit: currentUnit,
      expectedUnit: expectedUnit,
    };
  }

  const [searchQuery, setSearchQuery] =
    useState<SearchQuery>(initialSearchQuery);

  // 検索結果の状態
  //const [result, setResult] = useState<SearchQuery[]>([]);

  return (
    <div>
      <h1>{JSON.stringify(searchQuery)}</h1>
      <SearchboxCard
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    </div>
  );
};

export default Scouts;
