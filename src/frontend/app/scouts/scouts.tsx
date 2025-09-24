import { useState } from "react";
import { Link, useLocation } from "react-router";
import {
  SearchQuery,
  SearchResult,
} from "@/types/frontend/search/searchQueryType";
import SearchboxCard from "./parts/searchBoxCard";
import queryParser from "./queryParser";
import searchScout from "@/backend/scoutDb/searchScout";
import { useAuthContext } from "@/backend/authContext";
import SearchResultCard from "./parts/result";
import getObjectDiff from "@/tools/getObjectDiff";
import {
  getSearchQueryCache,
  setSearchQueryCache,
} from "@/tools/localCache/searchQueryCache";
import { getScoutsCache, setScoutsCache } from "@/tools/localCache/scoutsCache";
import FullWidthCardHeader from "@/frontend/style/fullWidthCardHeader";

const Scouts: React.FC = () => {
  // 遷移元からの検索名を取得
  const searchBox = (useLocation().state?.searchName || "") as string;

  // グループIDを取得
  const groupId = useAuthContext()?.joinGroupId || "";

  // 検索クエリの初期化
  let initialSearchQuery: SearchQuery = getSearchQueryCache() || {
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

  const [result, setResult] = useState<SearchResult[]>(getScoutsCache() || []); // 初期値としてローカルストレージから取得したスカウトデータを使用

  const [isPending, setIsPending] = useState<boolean>(false);

  const handleSearch = async (query: SearchQuery) => {
    if (Object.keys(getObjectDiff(query, searchQuery)).length === 0) {
      // 差分がない場合は何もしない
      return;
    }
    setIsPending(true);
    setSearchQuery(query);
    setSearchQueryCache(searchQuery);

    // 検索実行
    const searchResult = await searchScout(query, groupId);

    setResult(searchResult);
    setScoutsCache(searchResult);
    setIsPending(false);
  };

  return (
    <div>
      <SearchboxCard searchQuery={searchQuery} SearchFunc={handleSearch} />
      <div className="mt-5">
        <FullWidthCardHeader
          title="検索結果"
          memo="各カードをクリックすると詳細が表示されます。"
        />
        <div className="row">
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
              >
                <SearchResultCard result={item} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Scouts;
