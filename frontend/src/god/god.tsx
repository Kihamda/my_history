import { useAuthContext } from "@f/authContext";
import { Navigate, Routes } from "react-router";
import HeaderGod from "./headerGod";
import { Route } from "react-router";
import GodHome from "./home";
import GodScoutPage from "./scout/scout";
import GodGroupPage from "./group/group";
import CreateScoutBatPage from "./scout/createScoutBat";
import GodUserPage from "./user/user";

const GodMode = () => {
  const context = useAuthContext(false);
  if (!context?.token || !context?.user) {
    return <Navigate to="/auth/login" />;
  }
  if (!context.user.auth.isGod) {
    return <Navigate to="/auth/login" />;
  }

  return (
    <div>
      <HeaderGod name={context.user.profile.displayName} />
      <div className="container mb-3" style={{ marginTop: "4.5rem" }}>
        <Routes>
          <Route path="/home" element={<GodHome />} />
          <Route path="/scouts" element={<GodScoutPage />} />
          <Route path="/scouts-batch" element={<CreateScoutBatPage />} />
          <Route path="/group" element={<GodGroupPage />} />
          <Route path="*" element={<Navigate to="/god/home" />} />
          <Route path="/user" element={<GodUserPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default GodMode;
