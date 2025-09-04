import UnitSelector from "@/tools/components/unitSelector";
import { ScoutUnitNameMap } from "@/types/scout/scoutUnit";
import SearchQuery from "@/types/search/searchQueryType";
import { useState } from "react";
import { Card, FormControl, InputGroup } from "react-bootstrap";

const SearchboxCard = ({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: SearchQuery;
  setSearchQuery: React.Dispatch<React.SetStateAction<SearchQuery>>;
}) => {
  const [searchQueryInput, setSearchQueryInput] =
    useState<SearchQuery>(searchQuery);

  // 検索ボックスのコンポーネント
  // 検索クエリを更新するための関数を定義
  const handleSearch = (query: SearchQuery) => {
    setSearchQuery(query);
    // searchQueryが変わるとscouts.tsxのuseEffectが発火する
  };

  const getExplain = (current: SearchQuery) => {
    let explainMessage: string[] = [];

    if (!current.name && !current.scoutId && current.currentUnit.length === 0) {
      return "検索条件が設定されていません。";
    }

    if (current.scoutId && current.scoutId.length < 9) {
      explainMessage.push("登録番号は9桁以上で入力してください。");
      return explainMessage.join("");
    }

    if (current.currentUnit.length > 0) {
      explainMessage.push(
        current.currentUnit.map((unit) => ScoutUnitNameMap[unit]).join(", ") +
          "の"
      );
    }
    explainMessage.push("スカウトの");

    if (current.name || current.scoutId) {
      explainMessage.push("うち、");
    }

    if (current.name && current.scoutId) {
      explainMessage.push("\n");
    }

    if (current.name) {
      explainMessage.push(`名前が「${current.name}」と一致する`);
      if (current.scoutId) {
        explainMessage.push("か、");
      }
    }
    if (current.scoutId) {
      explainMessage.push(`登録番号が「${current.scoutId}」と一致する`);
    }

    explainMessage.push("人を検索します。");

    return explainMessage.join("");
  };

  return (
    <Card>
      <div className="card-body">
        <h3 className="card-title">スカウトを検索する</h3>
        <div className="row mt-3 mb-2">
          <div className="col-12 col-md-6">
            <InputGroup className="mb-2">
              <InputGroup.Text>名前</InputGroup.Text>
              <FormControl
                placeholder="松田 太郎"
                value={searchQueryInput?.name}
                onChange={(e) =>
                  setSearchQueryInput({
                    ...searchQueryInput,
                    name: e.target.value,
                  })
                }
              />
            </InputGroup>
            <InputGroup className="mb-2">
              <InputGroup.Text>登録番号</InputGroup.Text>
              <FormControl
                type="number"
                placeholder="1234567890"
                value={searchQueryInput?.scoutId}
                onChange={(e) =>
                  setSearchQueryInput({
                    ...searchQueryInput,
                    scoutId: e.target.value,
                  })
                }
              />
            </InputGroup>
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label">現在の所属隊</label>
            <UnitSelector
              units={searchQueryInput?.currentUnit}
              onChange={(units) =>
                setSearchQueryInput({
                  ...searchQueryInput,
                  currentUnit: units,
                })
              }
              id="currentUnitSelector"
            />
          </div>
        </div>
      </div>
      <div className="card-footer">
        <div className="row">
          <div className="col-12 col-md-9">
            <span style={{ whiteSpace: "pre-line" }}>
              {getExplain(searchQueryInput)}
            </span>
          </div>
          <div className="col-12 col-md-3 d-flex justify-content-end align-items-center">
            <button
              className="btn btn-primary me-2 text-nowrap"
              onClick={() => handleSearch(searchQueryInput)}
            >
              検索
            </button>
            <button
              className="btn btn-secondary text-nowrap"
              onClick={() => setSearchQueryInput(searchQuery)}
            >
              リセット
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};
export default SearchboxCard;
