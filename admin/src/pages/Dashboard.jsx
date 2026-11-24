function Dashboard() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Tổng quan hoạt động SmartCart</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <span>Tổng doanh thu</span>
          <h2>0 ₫</h2>
        </div>

        <div className="stat-card">
          <span>Đơn hàng</span>
          <h2>0</h2>
        </div>

        <div className="stat-card">
          <span>Sản phẩm</span>
          <h2>0</h2>
        </div>

        <div className="stat-card">
          <span>Người dùng</span>
          <h2>0</h2>
        </div>

        <div className="stat-card">
          <span>Thanh toán thành công</span>
          <h2>0</h2>
        </div>

        <div className="stat-card">
          <span>Thanh toán chờ xử lý</span>
          <h2>0</h2>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;