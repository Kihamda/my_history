import { useEffect, useState } from "react";
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
  };

  if (searchBox) {
    const { scoutId, name, currentUnit } = queryParser(searchBox);

    initialSearchQuery = {
      scoutId: scoutId,
      name: name,
      currentUnit: currentUnit,
    };
  }

  const [searchQuery, setSearchQuery] =
    useState<SearchQuery>(initialSearchQuery);

  // const [result, setResult] = useState<SearchQuery[]>([]);
  const [result, setResult] = useState<Object[]>([]); // 仮の初期値として空のオブジェクトを設定

  useEffect(() => {
    if (
      searchQuery.name ||
      searchQuery.scoutId ||
      searchQuery.currentUnit.length
    ) {
      // Queryが空だったときに検索を行わないようにする
      // SearchQueryが変更されたときに検索クエリを更新
      setResult([...result, { name: searchQuery.name }]);
    }
  }, [searchQuery]);
  // 検索結果の状態

  return (
    <div>
      <SearchboxCard
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <div className="mt-2">
        {result.map((item, index) => (
          <div key={index + JSON.stringify(item)}>
            {JSON.stringify(searchQuery)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Scouts;
