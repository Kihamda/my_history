import { useState } from "react";
import { Link, useLocation } from "react-router";
import SearchboxCard from "./parts/searchBoxCard";
import queryParser from "./queryParser";
import SearchResultCard from "./parts/result";
import { getSearchQueryCache, setSearchQueryCache } from "@/lib/localCache";
import FullWidthCardHeader from "@/style/fullWidthCardHeader";
import type { SearchRequest, SearchResult } from "b@/types/api/search";
import { hc } from "@/authContext";
import { getResultsCache } from "./cache";
import { raiseError } from "@/errorHandler";
import LoadingSplash from "@/style/loadingSplash";

const Scouts: React.FC = () => {
  // 遷移元からの検索名を取得
  const searchBox = (useLocation().state?.searchName || "") as string;

  // 検索クエリの初期化
  let initialSearchQuery: SearchRequest = getSearchQueryCache() || {
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
    useState<SearchRequest>(initialSearchQuery);

  const [result, setResult] = useState<SearchResult[]>(getResultsCache() || []); // 初期値としてローカルストレージから取得したスカウトデータを使用

  const [isPending, setIsPending] = useState<boolean>(false);

  const handleSearch = async (query: SearchRequest) => {
    setIsPending(true);
    setSearchQuery(query);
    setSearchQueryCache(searchQuery);

    // 検索実行
    try {
      const search = await hc?.api.scout.search.$get({
        p: JSON.stringify(query),
      });

      if (search?.status !== 200) {
        raiseError("Search API call failed: " + (await search?.text()));
        setResult([]);
        setIsPending(false);
        return;
      }
      const searchResult: SearchResult[] = (await search?.json()) || [];
      setResult(searchResult);
    } catch (error) {
      raiseError("Search API call failed:" + error);
      setResult([]);
    }

    setSearchQueryCache(searchQuery);
    setIsPending(false);
  };

  return (
    <div>
      <SearchboxCard SearchRequest={searchQuery} SearchFunc={handleSearch} />
      <div className="mt-5">
        <FullWidthCardHeader
          title="検索結果"
          memo="各カードをクリックすると詳細が表示されます。"
        />
        <div className="row">
          {isPending ? (
            <div className="text-center mt-3">
              <LoadingSplash message="Loading..." fullScreen={false} />
            </div>
          ) : (
            <>
              {result.length === 0 ? (
                <div className="text-center mt-3">
                  該当するスカウトが見つかりませんでした。
                </div>
              ) : (
                <>
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
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scouts;
