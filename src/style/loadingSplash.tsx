import React from "react";

type LoadingSplashProps = {
  message?: string;
  fullScreen?: boolean;
};

const LoadingSplash: React.FC<LoadingSplashProps> = ({
  message = "Now Loading..  .",
  fullScreen = true,
}) => {
  const containerStyle: React.CSSProperties = fullScreen
    ? {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100%",
      }
    : {};

  return (
    <div style={containerStyle}>
      <div className="text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading</span>
        </div>
        <div className="mt-2">{message}</div>
      </div>
    </div>
  );
};

export default LoadingSplash;
