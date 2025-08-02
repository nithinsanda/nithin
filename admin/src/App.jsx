import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Presets";
import Orders from "./pages/Orders";

import Login from "./pages/auth/Login";


import ForgotPassword from "./pages/auth/ForgotPassword";
import Presets from "./pages/Presets";

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/*"
          element={
            <PrivateRoute>
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <div className="pt-16 pb-20">
                <Routes>
                  <Route index element={<Dashboard />} />
                  <Route path="presets" element={<Presets/>} />
                  <Route path="orders" element={<Orders />} />
               
                </Routes>
              </div>
              <BottomNav />
            </div>
              </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;



// import { Routes, Route } from "react-router-dom";
// import { Toaster } from "react-hot-toast";

// import Navbar from "./components/Navbar";
// import BottomNav from "./components/BottomNav";

// import Dashboard from "./pages/Dashboard";

// import Orders from "./pages/Orders";
// import Presets from "./pages/Presets";

// const App = () => {
//   return (
//     <>
      
//       <div className="min-h-screen bg-black text-white">
//         <Navbar />
//         <div className="pt-16 pb-20">
//           <Routes>
//             <Route index element={<Dashboard />} />
//             <Route path="Presets" element={<Presets/>} />
//             <Route path="orders" element={<Orders />} />
//           </Routes>
//         </div>
//         <BottomNav />
//       </div>
//     </>
//   );
// };

// export default App;
