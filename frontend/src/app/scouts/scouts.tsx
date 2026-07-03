import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import SearchboxCard from "./parts/searchBoxCard";
import queryParser from "./queryParser";
import SearchResultCard from "./parts/result";
import { getSearchQueryCache, setSearchQueryCache } from "@f/lib/localCache";
import FullWidthCardHeader from "@f/lib/style/fullWidthCardHeader";
import LoadingSplash from "@f/lib/style/loadingSplash";
import type {
  ScoutSearchRequest,
  ScoutSearchResponse,
} from "@f/lib/api/apiTypes";
import { apiJson, hc } from "@f/lib/api/api";
import { useAuthContext } from "@f/authContext";
import { useQuery } from "@tanstack/react-query";
const ScoutsForGroup: React.FC<{
  belongGroupId: string;
  searchBox: string;
}> = ({ belongGroupId, searchBox }) => {
  const [searchQuery, setSearchQuery] = useState<ScoutSearchRequest>(() => {
    const cached = belongGroupId
      ? getSearchQueryCache(belongGroupId)
      : null;
    const fallback = {
      scoutId: "",
      name: "",
      currentUnit: [],
      belongGroupId: belongGroupId ?? "",
    };

    if (searchBox) {
      const { scoutId, name, currentUnit } = queryParser(searchBox);
      return {
        scoutId,
        name,
        currentUnit,
        belongGroupId: belongGroupId ?? "",
      };
    }

    return {
      ...(cached || fallback),
      belongGroupId: belongGroupId || "",
    };
  });
  const [submittedQuery, setSubmittedQuery] =
    useState<ScoutSearchRequest | null>(() =>
      searchBox || getSearchQueryCache(belongGroupId) ? searchQuery : null,
    );

  const searchResult = useQuery({
    queryKey: ["scout-search", belongGroupId, submittedQuery],
    enabled: !!belongGroupId && submittedQuery !== null,
    queryFn: (): Promise<ScoutSearchResponse> =>
      apiJson(
        hc.apiv1.scout.search.$post({ json: submittedQuery! }),
        "スカウトの検索に失敗しました。",
      ),
  });

  useEffect(() => {
    if (submittedQuery) {
      setSearchQueryCache(belongGroupId, submittedQuery);
    }
  }, [belongGroupId, submittedQuery]);

  const handleSearch = (queryBefore: ScoutSearchRequest) => {
    const query = {
      ...queryBefore,
      belongGroupId,
    };
    setSearchQuery(query);
    setSubmittedQuery(query);
  };

  const result = searchResult.data || [];
  const hasSearched = submittedQuery !== null;

  return (
    <div>
      <SearchboxCard SearchRequest={searchQuery} SearchFunc={handleSearch} />
      <div className="mt-3">
        <FullWidthCardHeader
          title="検索結果"
          memo="各カードをクリックすると詳細が表示されます。"
        />
        <div className="row">
          {searchResult.isPending && hasSearched ? (
            <div className="text-center mt-3">
              <LoadingSplash message="Loading..." fullScreen={false} />
            </div>
          ) : (
            <>
              {!hasSearched ? (
                <div className="text-center mt-3">
                  条件を入力して検索してください。
                </div>
              ) : result.length === 0 ? (
                <div className="text-center mt-3">
                  該当するスカウトが見つかりませんでした。
                </div>
              ) : (
                <>
                  {result.map((item) => (
                    <div
                      className="col-12 col-md-6 col-lg-4 mt-3"
                      key={item.id}
                    >
                      <Link
                        to={`/app/scouts/${item.id}/view`}
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

const Scouts: React.FC = () => {
  const searchBox = (useLocation().state?.searchName || "") as string;
  const belongGroupId = useAuthContext().currentGroup?.id;

  if (!belongGroupId) {
    return (
      <div className="text-center mt-3">
        所属グループが設定されていないため、スカウトの検索はできません。
      </div>
    );
  }

  return (
    <ScoutsForGroup
      key={belongGroupId}
      belongGroupId={belongGroupId}
      searchBox={searchBox}
    />
  );
};

export default Scouts;
