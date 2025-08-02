import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import SearchQuery, {
  SearchResultScoutData,
} from "@/types/search/searchQueryType";
import SearchboxCard from "./parts/searchBoxCard";
import queryParser from "./queryParser";
import searchScout from "@/firebase/scoutDb/searchScout";
import { useAuthContext } from "@/firebase/authContext";

const Scouts: React.FC = () => {
  // 遷移元からの検索名を取得
  const searchBox = (useLocation().state?.searchName || "") as string;

  // グループIDを取得
  const groupId = useAuthContext()?.joinGroupId || "";

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

  const [result, setResult] = useState<SearchResultScoutData[]>([]);
  // const [result, setResult] = useState<Object[]>([]); // 仮の初期値として空のオブジェクトを設定

  const [isPending, setIsPending] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setResult(await searchScout(searchQuery, groupId));
      setIsPending(false);
    };
    if (
      searchQuery.scoutId ||
      searchQuery.name ||
      searchQuery.currentUnit.length > 0
    ) {
      // 検索クエリが設定されている場合のみ検索を実行
      // SearchQueryが変更されたときに検索クエリを更新
      setIsPending(true);
      fetchData();
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
        {isPending && <div>Loading...</div>}
        {!isPending && result.length === 0 && (
          <div>該当するスカウトが見つかりませんでした。</div>
        )}
        {result.map((item, index) => (
          <div key={index + JSON.stringify(item)}>{JSON.stringify(item)}</div>
        ))}
      </div>
    </div>
  );
};

export default Scouts;
