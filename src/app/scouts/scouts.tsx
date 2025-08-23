import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import SearchQuery from "@/types/search/searchQueryType";
import SearchboxCard from "./parts/searchBoxCard";
import queryParser from "./queryParser";
import searchScout from "@/firebase/scoutDb/searchScout";
import { useAuthContext } from "@/firebase/authContext";
import SearchResultCard from "./parts/result";
import { Scout } from "@/types/scout/scout";
import getObjectDiff from "@/tools/getObjectDiff";
import {
  getSearchQueryCache,
  setSearchQueryCache,
} from "@/tools/localCache/searchQueryCache";
import { getScoutsCache, setScoutsCache } from "@/tools/localCache/scoutsCache";
import FullWidthCardHeader from "@/style/fullWidthCardHeader";

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

  const [result, setResult] = useState<Scout[]>(getScoutsCache() || []); // 初期値としてローカルストレージから取得したスカウトデータを使用

  const [isPending, setIsPending] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setResult(await searchScout(searchQuery, groupId));
      setIsPending(false);
    };
    if (
      (searchQuery.scoutId ||
        searchQuery.name ||
        searchQuery.currentUnit.length > 0) &&
      Object.keys(getObjectDiff(searchQuery, initialSearchQuery)).length > 0
    ) {
      // 検索クエリが設定されている場合のみ検索を実行
      // SearchQueryが変更されたときに検索クエリを更新
      setIsPending(true);
      setSearchQueryCache(searchQuery);
      fetchData();
    }
  }, [searchQuery]);

  useEffect(() => {
    // 検索結果をローカルストレージに保存
    setScoutsCache(result);
  }, [result]);

  return (
    <div>
      <SearchboxCard
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
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
