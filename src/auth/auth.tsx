import { Link, Navigate, Route, Routes } from "react-router-dom";
import FillBackgroundDesign from "../common/style/fillBackgroundDesign";
import BlurCard from "../common/style/cardDesign";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouseChimney } from "@fortawesome/free-solid-svg-icons";

const Auth = () => {
  return (
    <FillBackgroundDesign
      className="vh-100"
      backgroundImagePath="/assets/auth/bg.webp"
    >
      <Routes>
        <Route path="/" element={<Navigate to={"/auth/login"} />} />
        <Route path="/registar" element={<></>} />
        <Route path="/signin" element={<></>} />
        <Route path="/reset" element={<></>} />
      </Routes>
      <Link
        to="/"
        className="position-absolute"
        style={{
          top: "1%",
          left: "1%",
          textDecoration: "none",
        }}
      >
        <BlurCard
          style={{
            padding: "0.5rem 1rem",
          }}
        >
          <FontAwesomeIcon icon={faHouseChimney} />
          ホームに戻る
        </BlurCard>
      </Link>
    </FillBackgroundDesign>
  );
};

export default Auth;
