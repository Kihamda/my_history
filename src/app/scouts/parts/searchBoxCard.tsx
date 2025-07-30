import UnitSelector from "@/tools/components/unitSelector";
import { ScoutUnitList, ScoutUnitNameMap } from "@/types/scout/scoutUnit";
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
    if (current.scoutId && current.scoutId.length < 9) {
      explainMessage.push("登録番号は9桁以上で入力してください。");
      return explainMessage.join("");
    }

    if (current.currentUnit.length > 0) {
      explainMessage.push(
        current.currentUnit.map((unit) => ScoutUnitNameMap[unit]).join(", ") +
          "に所属している"
      );
      if (current.experiencedUnit.length > 0) {
        explainMessage.push("か、");
      }
    }

    if (current.experiencedUnit.length > 0) {
      explainMessage.push(
        current.experiencedUnit
          .map((unit) => ScoutUnitNameMap[unit])
          .join(", ") + "に所属していた"
      );
      if (
        current.currentUnit.length === 0 &&
        current.experiencedUnit.length > 0
      ) {
        explainMessage.push("OB・OG(既卒)の");
      }
    }

    explainMessage.push("スカウトの");

    if (current.name && current.scoutId) {
      explainMessage.push("うち、\n");
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
        <h3 className="card-title text-center">スカウトを検索する</h3>
        <div className="row mb-2">
          <div className="col-12 col-md-6">
            <InputGroup className="mb-2">
              <InputGroup.Text>名前</InputGroup.Text>
              <FormControl
                type="text"
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
          </div>
          <div className="col-12 col-md-6">
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
        </div>
        <div className="row mb-2">
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
          <div className="col-12 col-md-6">
            <label className="form-label">
              経験した隊
              {searchQueryInput?.experiencedUnit.length > 0 ? (
                <>
                  {searchQueryInput?.experiencedUnit.length}件
                  <span
                    onClick={() =>
                      setSearchQueryInput({
                        ...searchQueryInput,
                        experiencedUnit: [],
                      })
                    }
                    className="link-primary"
                  >
                    ＜選択解除＞
                  </span>
                </>
              ) : (
                <>
                  <span
                    onClick={() =>
                      setSearchQueryInput({
                        ...searchQueryInput,
                        experiencedUnit: ScoutUnitList,
                      })
                    }
                    className="link-primary"
                  >
                    ＜すべて選択＞
                  </span>
                </>
              )}
            </label>
            <UnitSelector
              units={searchQueryInput?.experiencedUnit}
              onChange={(units) =>
                setSearchQueryInput({
                  ...searchQueryInput,
                  experiencedUnit: units,
                })
              }
              id="experiencedUnitSelector"
            />
          </div>
        </div>
        <p className="text-center mb-3" style={{ whiteSpace: "pre-line" }}>
          <b>検索条件</b>
          <br />
          {getExplain(searchQueryInput)}
        </p>
        <div className="d-flex align-items-center justify-content-center">
          <button
            className="btn btn-primary me-2"
            onClick={() => handleSearch(searchQueryInput)}
          >
            検索
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setSearchQueryInput(searchQuery)}
          >
            リセット
          </button>
        </div>
      </div>
    </Card>
  );
};
export default SearchboxCard;
