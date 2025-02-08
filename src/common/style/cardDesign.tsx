import React from "react";

const BlurCardStyle: React.CSSProperties = {
  boxShadow: "0px 0px 40px 20px rgba(130, 130, 130, 0.2)",
  color: "white",
  backdropFilter: "blur(10px)",
  border: "2px solid rgba(255, 255, 255, 0.75)",
  padding: "1rem",
  borderRadius: "1rem",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
};

/**
 * ぼかし効果のあるカードをレンダリングするReact関数コンポーネント。
 *
 * @param {object} props - プロパティオブジェクト。
 * @param {React.ReactNode} props.children - カード内に表示されるコンテンツ。
 * @param {React.CSSProperties} [props.style] - カードに適用されるカスタムスタイル（オプション）。
 * @param {string} [props.className] - カードに適用されるカスタムクラス名（オプション）。
 *
 * @returns {JSX.Element} レンダリングされたぼかしカードコンポーネント。
 */
interface BlurCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  [key: string]: any;
}

const BlurCard: React.FC<BlurCardProps> = ({
  children,
  style,
  className,
  ...props
}) => {
  return (
    <div
      style={{ ...BlurCardStyle, ...style }}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

export default BlurCard;
