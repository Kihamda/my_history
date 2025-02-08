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
  [key: string]: any;
}

const LinkWithOffset = ({
  offset = -50,
  children,
  to,
  className,
  ...props
}: LinkWithOffsetProps) => {
  return (
    <Link
      to={to}
      smooth={true}
      duration={300}
      offset={offset}
      className={className}
      {...props}
    >
      {children}
    </Link>
  );
};

export default LinkWithOffset;
