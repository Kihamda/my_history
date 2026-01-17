import { useState } from "react";
import { Link, useLocation } from "react-router";
import SearchboxCard from "./parts/searchBoxCard";
import queryParser from "./queryParser";
import SearchResultCard from "./parts/result";
import { getSearchQueryCache, setSearchQueryCache } from "@f/lib/localCache";
import FullWidthCardHeader from "@f/lib/style/fullWidthCardHeader";
import { getResultsCache, setResultsCache } from "./cache";
import { raiseError } from "@f/errorHandler";
import LoadingSplash from "@f/lib/style/loadingSplash";
import type {
  ScoutSearchRequest,
  ScoutSearchResponse,
} from "@f/lib/api/apiTypes";
import { hc } from "@f/lib/api/api";
import { useAuthContext } from "@f/authContext";
const Scouts: React.FC = () => {
  // 遷移元からの検索名を取得
  const searchBox = (useLocation().state?.searchName || "") as string;
  const belongGroupId = useAuthContext().user.currentGroup?.id;

  if (!belongGroupId) {
    return (
      <div className="text-center mt-3">
        所属グループが設定されていないため、スカウトの検索はできません。
      </div>
    );
  }

  // 検索クエリの初期化
  let initialSearchQuery: ScoutSearchRequest = getSearchQueryCache() || {
    scoutId: "",
    name: "",
    currentUnit: [],
    belongGroupId,
  };

  // 検索窓から来た人用
  if (searchBox) {
    const { scoutId, name, currentUnit } = queryParser(searchBox);

    initialSearchQuery = {
      scoutId: scoutId,
      name: name,
      currentUnit: currentUnit,
      belongGroupId,
    };
  }

  const [searchQuery, setSearchQuery] =
    useState<ScoutSearchRequest>(initialSearchQuery);

  const [result, setResult] = useState<ScoutSearchResponse>(
    getResultsCache() || []
  ); // 初期値としてローカルストレージから取得したスカウトデータを使用

  const [isPending, setIsPending] = useState<boolean>(false);

  const handleSearch = async (queryBefore: ScoutSearchRequest) => {
    const query = {
      ...queryBefore,
      belongGroupId,
    };
    setIsPending(true);
    setSearchQuery(query);
    setSearchQueryCache(query);

    // 検索実行
    try {
      const search = await hc?.apiv1.scout.search.$post({
        json: query,
      });

      if (search?.status !== 200) {
        raiseError("Search API call failed: " + (await search?.text()));
        setResult([]);
        setIsPending(false);
        return;
      }
      const searchResult: ScoutSearchResponse = (await search?.json()) || [];
      setResult(searchResult);
      setResultsCache(searchResult);
    } catch (error) {
      raiseError("Search API call failed:" + error);
      setResult([]);
    }
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
