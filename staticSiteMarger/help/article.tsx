import React from "react";

import { renderToString } from "react-dom/server";
import { marked } from "marked";

const Article = ({ md }: { md: string }): React.JSX.Element => {
  const content = md ? marked(md) : "No content available";
  return (
    <div className="container">
      <h1>Article</h1>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

const getStartingHTML = (input: string): string => {
  const html = renderToString(<Article md={input} />);
  return html;
};

export default getStartingHTML;
