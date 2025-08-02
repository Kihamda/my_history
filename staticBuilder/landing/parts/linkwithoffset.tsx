import React, { ReactNode } from "react";

/**
 * スクロール時にオフセットを設定できるリンクコンポーネント
 * @param offset オフセット
 * @param to リンク先
 * @returns リンクコンポーネント
 *
 */

//
interface LinkWithOffsetProps {
  children: ReactNode;
  to: string;
  className?: string;
  style?: React.CSSProperties; // 他のプロパティを許可するためのインデックスシグネチャ
}

const Link: React.FC<LinkWithOffsetProps> = ({
  children,
  to,
  className,
  style,
}) => {
  return (
    <a href={to} className={className} style={style}>
      {children}
    </a>
  );
};

export default Link;
