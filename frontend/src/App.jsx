import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import { logoutUser } from "./services/authService";

import "./App.css";

function Home() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="test-home">
      <h1>SmartCart</h1>

      {user ? (
        <>
          <h2>Xin chào, {user.fullName}</h2>

          <p>{user.email}</p>

          <button
            type="button"
            onClick={handleLogout}
          >
            Đăng xuất
          </button>
        </>
      ) : (
        <>
          <p>Bạn chưa đăng nhập.</p>

          <Link to="/login">
            Đăng nhập
          </Link>

          <Link to="/register">
            Đăng ký
          </Link>
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;