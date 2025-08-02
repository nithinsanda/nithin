import { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { toast } from 'react-hot-toast';
import adminApi from '../services/api';
import BottomNav from '../components/BottomNav';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const toastShownRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    revenueChange: 0,
    lastMonthRevenue: 0,
    averageOrderValue: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  
  const [salesData, setSalesData] = useState({
    labels: [],
    datasets: [{
      label: 'Sales',
      data: [],
      borderColor: '#06b6d4',
      backgroundColor: 'rgba(6, 182, 212, 0.2)',
      tension: 0.4,
      borderWidth: 2,
    }],
  });



  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await fetchDashboardData();
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        if (!toastShownRef.current) {
          toast.error('Failed to load dashboard data');
          toastShownRef.current = true;
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000);

    return () => {
      clearInterval(interval);
      toastShownRef.current = false;
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const ordersResponse = await adminApi.orders.getAll();
      const orders = ordersResponse.data;

      // Calculate current month's sales
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const currentMonthOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      });

      const lastMonthOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
      });

      const currentMonthSales = currentMonthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const lastMonthSales = lastMonthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const salesChange = lastMonthSales ? ((currentMonthSales - lastMonthSales) / lastMonthSales) * 100 : 0;

      // Calculate average order value
      const averageOrderValue = orders.length ? orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length : 0;

      // Calculate stats
      const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);

      setStats({
        totalSales,
        revenueChange: salesChange,
        lastMonthRevenue: lastMonthSales,
        averageOrderValue,
      });

      // Get recent orders
      const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(order => ({
          id: order._id,
          customer: order.user?.name || 'N/A',
          amount: order.totalAmount,
          status: order.status,
          date: new Date(order.createdAt).toLocaleDateString(),
        }));

      setRecentOrders(recentOrders);

      // Calculate sales by month
      const monthlySales = orders.reduce((acc, order) => {
        const month = new Date(order.createdAt).toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + order.totalAmount;
        return acc;
      }, {});

      const months = Object.keys(monthlySales);
      const sales = Object.values(monthlySales);

      setSalesData(prev => ({
        ...prev,
        labels: months,
        datasets: [{
          ...prev.datasets[0],
          data: sales,
        }],
      }));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      throw error;
    }
  };

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      await fetchDashboardData();
      toast.success('Dashboard data refreshed');
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-gray-900 to-black min-h-screen pb-20 md:pb-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          Dashboard Overview
        </h1>
        <button
          onClick={handleRefresh}
          className="bg-cyan-600 text-white px-6 py-2.5 rounded-lg hover:bg-cyan-500 transition-all duration-200 w-full md:w-auto shadow-lg hover:shadow-cyan-500/25"
        >
          Refresh Data
        </button>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-slate-800/50 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300">
          <h3 className="text-slate-400 text-sm font-medium">Total Sales</h3>
          <p className="text-2xl md:text-3xl font-bold text-white mt-2">₹{stats.totalSales.toLocaleString()}</p>
          <div className="flex items-center mt-1 md:mt-2">
            <span className={`text-xs md:text-sm flex items-center ${
              stats.revenueChange >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              <span className="w-2 h-2 rounded-full mr-2 animate-pulse" style={{ backgroundColor: stats.revenueChange >= 0 ? '#34d399' : '#f87171' }}></span>
              {stats.revenueChange >= 0 ? '↑' : '↓'} {Math.abs(stats.revenueChange).toFixed(1)}%
            </span>
            <span className="text-xs md:text-sm text-slate-400 ml-2">
              vs last month
            </span>
          </div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-slate-700/50 hover:border-amber-500/50 transition-all duration-300">
          <h3 className="text-slate-400 text-sm font-medium">Avg. Order Value</h3>
          <p className="text-2xl md:text-3xl font-bold text-white mt-2">₹{stats.averageOrderValue.toLocaleString()}</p>
          <p className="text-xs md:text-sm text-amber-400 mt-1 md:mt-2 flex items-center">
            <span className="w-2 h-2 rounded-full bg-amber-400 mr-2 animate-pulse"></span>
            Last month: ₹{stats.lastMonthRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-slate-800/50 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-slate-700/50 mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-semibold mb-4 text-white">Sales Trend</h2>
        <div className="h-64 md:h-80">
          <Line
            data={salesData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(148, 163, 184, 0.1)',
                  },
                  ticks: {
                    color: '#94a3b8',
                  }
                },
                x: {
                  grid: {
                    color: 'rgba(148, 163, 184, 0.1)',
                  },
                  ticks: {
                    color: '#94a3b8',
                  }
                },
              },
              plugins: {
                legend: {
                  position: 'top',
                  labels: {
                    color: '#94a3b8',
                  }
                }
              },
            }}
          />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-slate-800/50 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-slate-700/50 mb-6">
        <h2 className="text-lg md:text-xl font-semibold mb-4 text-white">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-700/30 transition-colors duration-150">
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{order.id.slice(-6)}
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.customer}
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{order.amount.toLocaleString()}
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;