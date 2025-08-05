import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import SearchQuery from "@/types/search/searchQueryType";
import SearchboxCard from "./parts/searchBoxCard";
import queryParser from "./queryParser";
import searchScout from "@/firebase/scoutDb/searchScout";
import { useAuthContext } from "@/firebase/authContext";
import SearchResultCard from "./parts/result";
import { Scout } from "@/types/scout/scout";

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

  const [result, setResult] = useState<Scout[]>([]);
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
      <div className="mt-5 row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h3 className="card-title">検索結果</h3>
              <p>各カードをクリックすると詳細が表示されます。</p>
            </div>
          </div>
        </div>
        {isPending && <div className="text-center mt-3">Loading...</div>}
        {!isPending && result.length === 0 && (
          <div className="text-center mt-3">
            該当するスカウトが見つかりませんでした。
          </div>
        )}
        {result.map((item, index) => (
          <div className="col-12 col-md-6 col-lg-4 mt-3" key={index}>
            <SearchResultCard result={item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Scouts;
