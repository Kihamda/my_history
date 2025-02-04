import SignInUp from "./signiniup";
import { Link } from "react-scroll";

/**
 * ランディングページの一番上の表示用
 *
 */

const LandTop = () => {
  const BlurCardStyle = {
    boxShadow: "0px 0px 40px 20px   rgba(130, 130, 130, 0.2)",
    color: "white",
    backdropFilter: "blur(10px)",
    border: "2px solid rgba(255, 255, 255, 0.75)",
  };
  return (
    <div
      className="h-100 d-flex position-relative flex-column justify-content-center align-items-center"
      style={{
        backgroundImage: "url(/assets/bg.webp)",
        backgroundSize: "cover",
      }}
    >
      <div
        className="text-center"
        style={{
          borderRadius: "1rem",
          padding: "3rem",
          ...BlurCardStyle,
        }}
      >
        <h1>My Historyアプリ</h1>
        <p>My History of Scouting プロジェクト</p>
        <div className="mt-3">
          <SignInUp />
        </div>
      </div>
      <Link
        to="about"
        className="text-center position-absolute bottom-0 mb-3"
        style={{
          borderRadius: "1rem",
          padding: "1rem",
          textDecoration: "none",
          ...BlurCardStyle,
        }}
      >
        詳細はこちら
        <br />↓
      </Link>
    </div>
  );
};

export default LandTop;
