import { Link } from "react-scroll";
import { ReactNode } from "react";

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
}

const LinkWithOffset = ({
  offset = -50,
  children,
  to,
  className,
}: LinkWithOffsetProps) => {
  return (
    <Link
      to={to}
      smooth={true}
      duration={300}
      offset={offset}
      className={className}
      aria-label={`Link to ${to}`}
    >
      {children}
    </Link>
  );
};

export default LinkWithOffset;
