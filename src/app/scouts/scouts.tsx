import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
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

  // ローカルストレージからスカウトデータと検索クエリを取得
  const cache = getStorage();
  console.log("Cache:", cache);

  // 検索クエリの初期化
  let initialSearchQuery: SearchQuery = cache.searchQuery || {
    scoutId: "",
    name: "",
    currentUnit: [],
  };

  // 検索窓から来た人用
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

  const [result, setResult] = useState<Scout[]>(cache.scouts || []); // 初期値としてローカルストレージから取得したスカウトデータを使用

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

  useEffect(() => {
    // 検索結果をローカルストレージに保存
    setStorage(result, searchQuery);
  }, [result]);

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
            <Link
              to={`/app/scouts/${item.id}`}
              className="text-decoration-none text-dark"
              state={{ scout: item }}
              onClick={() => setStorage(result, searchQuery)}
            >
              <SearchResultCard result={item} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

const setStorage = (scouts: Scout[], query: SearchQuery) => {
  // スカウトデータをローカルストレージに保存する関数
  localStorage.setItem("scouts", JSON.stringify(scouts));
  localStorage.setItem("searchQuery", JSON.stringify(query));
};

const getStorage = (): {
  scouts: Scout[] | null;
  searchQuery: SearchQuery | null;
} => {
  // ローカルストレージからスカウトデータと検索クエリを取得する関数
  const scouts: Scout[] = JSON.parse(localStorage.getItem("scouts") || "[]");
  const searchQuery: SearchQuery = JSON.parse(
    localStorage.getItem("searchQuery") || "{}"
  );

  const scoutsValid = scouts?.length > 0 ? scouts : null;
  const searchQueryValid =
    Object.keys(searchQuery).length > 0 ? searchQuery : null;

  return { scouts: scoutsValid, searchQuery: searchQueryValid };
};

export default Scouts;
