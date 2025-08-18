import { Scout } from "@/types/scout/scout";
import React from "react";

const ScoutDetailEditor = ({
  scoutData,
  setScoutData,
}: {
  scoutData: Scout;
  setScoutData: React.Dispatch<React.SetStateAction<Scout | undefined>>;
}): React.ReactElement => {
  // デフォルトの戻り値
  return (
    <div>
      <h1>Edit Scout Detail</h1>
      <p>Editing scout with ID: {scoutData.id}</p>
      <p>{JSON.stringify(scoutData)}</p>
    </div>
  );
};

export default ScoutDetailEditor;
