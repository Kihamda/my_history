import { type UnitType } from "../api/apiTypes";
import { ToggleButton, ToggleButtonGroup } from "react-bootstrap";

/**
 * 所属隊を選択するコンポーネント
 * @param param0 - 選択されている所属隊の配列と変更ハンドラ
 * @returns 所属隊を選択するためのUI
 *
 * 使用例:
 * ```jsx
 * <UnitSelector units={selectedUnits} onChange={(units) => setSelectedUnits(units)} />
 * ```
 */

type ScoutUnit = UnitType | "ob";
const ScoutUnitNameMap: Record<ScoutUnit, string> = {
  bvs: "ビーバー",
  cs: "カブ",
  bs: "ボーイ",
  vs: "ベンチャー",
  rs: "ローバー",
  ob: "既卒",
};

const UnitSelector = ({
  units,
  onChange,
  id,
}: {
  units: ScoutUnit[];
  onChange: (units: ScoutUnit[]) => void;
  id: string; // ユニットセレクターのID
}) => {
  return (
    <div>
      <ToggleButtonGroup
        type="checkbox"
        value={units}
        onChange={onChange}
        className="d-flex flex-wrap"
        id={id}
      >
        {Object.entries(ScoutUnitNameMap).map(([scoutUnit, label]) => (
          <ToggleButton
            id={`tbg-check-${scoutUnit}-${id}`}
            key={scoutUnit}
            value={scoutUnit}
            variant="outline-secondary"
            className="mb-1"
          >
            {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </div>
  );
};

export default UnitSelector;
