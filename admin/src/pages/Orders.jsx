import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import adminApi from "../services/api";

const Orders = () => {

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.orders.getAll();
      if (response.data && response.data.success) {
        setOrders(response.data.orders || []);
        toast.success("Orders loaded successfully");
      } else {
        throw new Error(response.data?.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast.error(error.response?.data?.message || "Failed to load orders");
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
      }

      const response = await adminApi.orders.uploadImages(selectedOrder._id, formData);
      if (response.data) {
        setUploadedImages(response.data.images);
        setOrders(orders.map(order => 
          order._id === selectedOrder._id ? { ...order, images: response.data.images } : order
        ));
        toast.success("Images uploaded successfully");
      }
    } catch (error) {
      console.error("Failed to upload images:", error);
      toast.error("Failed to upload images");
    } finally {
      setIsUploading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return timeString;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "complete":
        return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
      case "delivered":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Orders Management</h1>
          <p className="text-slate-400">View and manage customer order details</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700/50">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-slate-400">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-700/30 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      #{order._id.slice(-6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-slate-400">{order.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {order.items?.length || 0} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      ₹{order.totalAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200 bg-cyan-500/10 px-3 py-1 rounded-lg hover:bg-cyan-500/20"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800/90 rounded-xl border border-slate-700/50 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-white">Order #{selectedOrder._id.slice(-6)}</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-300 transition-colors duration-200"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-lg mb-2 text-white">Customer Information</h3>
                <div className="space-y-2 text-slate-300">
                  <p><span className="font-medium text-white">Name:</span> {selectedOrder.customerName || "N/A"}</p>
                  <p><span className="font-medium text-white">Email:</span> {selectedOrder.email || "N/A"}</p>
                  <p><span className="font-medium text-white">Phone:</span> {selectedOrder.phone || "N/A"}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2 text-white">Order Information</h3>
                <div className="space-y-2 text-slate-300">
                  <p><span className="font-medium text-white">Order Date:</span> {formatDate(selectedOrder.createdAt)}</p>
                </div>
              </div>
            </div>
            

            
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">Order Items</h3>
              <div className="border border-slate-700/50 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-slate-700/50">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">Item</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">Qty</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-700/30 transition-colors duration-200">
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-300">{item.product?.name || "N/A"}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-300">{item.quantity}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-300">₹{item.price}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-300">₹{item.quantity * item.price}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-900/50">
                    <tr>
                      <td colSpan="3" className="px-4 py-2 text-right font-medium text-white">Total:</td>
                      <td className="px-4 py-2 font-medium text-white">₹{selectedOrder.totalAmount}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;