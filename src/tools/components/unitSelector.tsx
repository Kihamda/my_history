import { ScoutUnit, ScoutUnitList, ScoutUnitNameMap } from "@/types/scoutUnit";
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
        {ScoutUnitList.map((scoutUnit) => (
          <ToggleButton
            id={`tbg-check-${scoutUnit}-${id}`}
            key={scoutUnit}
            value={scoutUnit}
            variant="outline-secondary"
            className="mb-1"
          >
            {ScoutUnitNameMap[scoutUnit]}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </div>
  );
};

export default UnitSelector;
