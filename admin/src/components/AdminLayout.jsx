import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../App.css";

function AdminLayout() {
  const navigate = useNavigate();

  const adminUser = JSON.parse(
    localStorage.getItem("adminUser") || "null"
  );

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    navigate("/login");
  };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>SmartCart</h2>
          <span>Admin</span>
        </div>

        <nav className="sidebar-menu">
          <NavLink to="/dashboard">
            Dashboard
          </NavLink>

          <NavLink to="/products">
            Quản lý sản phẩm
          </NavLink>

          <NavLink to="/categories">
            Quản lý danh mục
          </NavLink>

          <NavLink to="/orders">
            Quản lý đơn hàng
          </NavLink>

          <NavLink to="/payments">
            Quản lý thanh toán
          </NavLink>

          <NavLink to="/users">
            Quản lý người dùng
          </NavLink>

          <NavLink to="/promotions">
            Quản lý khuyến mãi
          </NavLink>

          <NavLink to="/reports">
            Thống kê & Báo cáo
          </NavLink>
        </nav>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Đăng xuất
        </button>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div>
            <h3>SmartCart Admin</h3>
          </div>

          <div>
            {adminUser?.fullName ||
              adminUser?.email ||
              "Admin"}
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;