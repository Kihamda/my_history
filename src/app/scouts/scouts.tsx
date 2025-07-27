import { useLocation } from "react-router";

const Scouts = () => {
  // 遷移元からの検索名を取得
  const searchName = useLocation().state?.searchName;

  return (
    <div>
      <h1>Scouts</h1>
    </div>
  );
};

export default Scouts;

export interface searchQuery {
  id: string;
  name: string;
}
