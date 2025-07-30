import React from "react";
import { renderToString } from "react-dom/server";

const Help = (): React.JSX.Element => {
  return (
    <div>
      <h1>Help</h1>
      <p>This is the help page.</p>
      <p>Here you can find information about how to use the application.</p>
    </div>
  );
};

const getStartingHTML = (): string => {
  const html = renderToString(<Help />);
  return html;
};

export default getStartingHTML;
