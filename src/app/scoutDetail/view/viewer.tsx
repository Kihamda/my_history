import { Scout } from "@/types/scout/scout";

const ScoutDetailViewer = ({
  scoutData,
}: {
  scoutData: Scout;
}): React.ReactElement => {
  return (
    <>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">{scoutData.personal.name}</h5>
          <p className="card-text">Scout ID: {scoutData.personal.ScoutId}</p>
          <p className="card-text">
            Current Unit: {scoutData.personal.currentUnit}
          </p>
        </div>
        <h1>Scout Detail Viewer</h1>
        <p>Viewing scout details...</p>
      </div>
    </>
  );
};

export default ScoutDetailViewer;
