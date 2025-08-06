import ShowData from "@/style/showData";
import convertInputDate from "@/tools/date/convertInputDate";
import { Scout } from "@/types/scout/scout";

const Profile = ({ scoutData }: { scoutData: Scout }): React.ReactElement => {
  return (
    <div className="card">
      <div className="card-body">
        <h3>基本情報</h3>
        <ShowData label="名前" value={scoutData.personal.name} />
        <ShowData label="登録番号" value={scoutData.personal.ScoutId} />
        <ShowData
          label="誕生日"
          value={convertInputDate(scoutData.personal.birthday)}
        />
        {/* Profile content goes here */}
      </div>
    </div>
  );
};
export default Profile;
