import React from "react";

interface FillBackgroundDesignProps {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  backgroundImagePath: string;
}

const FillBackgroundDesign: React.FC<FillBackgroundDesignProps> = ({
  className = "",
  style = {},
  children,
  backgroundImagePath,
}) => {
  return (
    <div
      className={`h-100 d-flex position-relative flex-column justify-content-center align-items-center ${className}`}
      style={{
        backgroundImage: `url(${backgroundImagePath})`,
        backgroundSize: "cover",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default FillBackgroundDesign;
