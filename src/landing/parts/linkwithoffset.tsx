import { Link } from "react-scroll";
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
  offset?: number;
  children: ReactNode;
  to: string;
  className?: string;
  style?: React.CSSProperties; // 他のプロパティを許可するためのインデックスシグネチャ
}

const LinkWithOffset: React.FC<LinkWithOffsetProps> = ({
  offset = -50,
  children,
  to,
  className,
  style,
}) => {
  return (
    <Link
      to={to}
      smooth={true}
      duration={300}
      offset={offset}
      className={className}
      aria-label={`Link to ${to}`}
      style={style}
    >
      {children}
    </Link>
  );
};

export default LinkWithOffset;
