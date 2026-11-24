import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Orders from "./pages/Orders";
import Payments from "./pages/Payments";
import Users from "./pages/Users";
import Promotions from "./pages/Promotions";
import Reports from "./pages/Reports";
import AddProduct from "./pages/AddProduct";
import AdminLayout from "./components/AdminLayout";
import ProtectedAdminRoute from "./routes/ProtectedAdminRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/products"
            element={<Products />}
          />

          <Route
            path="/categories"
            element={<Categories />}
          />

          <Route
            path="/orders"
            element={<Orders />}
          />

          <Route
            path="/payments"
            element={<Payments />}
          />

          <Route
            path="/users"
            element={<Users />}
          />

          <Route
            path="/promotions"
            element={<Promotions />}
          />

          <Route
            path="/reports"
            element={<Reports />}
          />
        </Route>

        <Route
          path="/products"
          element={<Products />}
        />

        <Route
          path="/products/add"
          element={<AddProduct />}
        />
        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;