import Header from "./header";
import { Scout } from "@/types/scout/scout";
import Profile from "./profile";
import Units from "./units";

const ScoutDetailViewer = ({
  scoutData,
}: {
  scoutData: Scout;
}): React.ReactElement => {
  return (
    <>
      <Header scoutData={scoutData} />
      <Profile scoutDataPersonal={scoutData.personal} />
      <Units scoutDataUnit={scoutData.unit} />
    </>
  );
};

export default ScoutDetailViewer;
