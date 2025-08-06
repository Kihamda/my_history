import Header from "./header";
import { Scout } from "@/types/scout/scout";
import Profile from "./profile";

const ScoutDetailViewer = ({
  scoutData,
}: {
  scoutData: Scout;
}): React.ReactElement => {
  return (
    <>
      <Header scoutData={scoutData} />
      <div className="row">
        <div className="col-12 col-md-6 mt-3">
          <Profile scoutData={scoutData} />
        </div>
      </div>
    </>
  );
};

export default ScoutDetailViewer;
