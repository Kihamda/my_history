import { Button } from "react-bootstrap";
import { logout } from "../common/firebase/userAuth/login";
import { useAuthContext } from "../common/firebase/authContext";
import { Navigate } from "react-router-dom";

const App = () => {
  const { user } = useAuthContext();

  if (!user) {
    return <Navigate to="/auth/login" />;
  }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Button variant="primary" onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default App;
