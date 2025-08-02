// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { toast } from "react-hot-toast";
// import adminApi from "../../services/api";

// const Login = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});

//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.email) {
//       newErrors.email = "Email is required";
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = "Email is invalid";
//     }
//     if (!formData.password) {
//       newErrors.password = "Password is required";
//     }
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//     if (errors[name]) {
//       setErrors((prev) => ({
//         ...prev,
//         [name]: "",
//       }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     setLoading(true);
//     try {
//       const response = await adminApi.auth.login(formData);
//       localStorage.setItem("adminToken", response.data.token);
//       localStorage.setItem("adminUser", JSON.stringify(response.data.user));
//       toast.success("Login successful");
//       navigate("/");
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <img
//           src="/images/logo.png"
//           alt="logo"
//           className="w-16 h-auto mx-auto"
//         />
//         <div>
//           <h2 className="mt-6 text-center text-4xl font-black text-red-600 transition-colors duration-200">
//             Admin Login
//           </h2>
//         </div>
//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           <div className="rounded-md shadow-sm -space-y-px">
//             <div>
//               <label
//                 htmlFor="email"
//                 className="block text-sm font-extrabold text-gray-600 uppercase tracking-wider mb-1"
//               >
//                 Email address
//               </label>

//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 autoComplete="email"
//                 required
//                 className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
//                   errors.password ? "border-red-300" : "border-green-500"
//                 } placeholder-gray-500 text-gray-900 font-bold rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 hover:border-green-600 focus:z-10 sm:text-sm`}
//                 placeholder="Email address"
//                 value={formData.email}
//                 onChange={handleChange}
//               />
//               {errors.email && (
//                 <p className="mt-1 text-sm text-red-600">{errors.email}</p>
//               )}
//             </div>
//             <div>
//               <label
//                 htmlFor="password"
//                 className="block text-sm font-extrabold text-gray-600 uppercase tracking-wider mb-1"
//               >
//                 Password
//               </label>

//               <input
//                 id="password"
//                 name="password"
//                 type="password"
//                 autoComplete="current-password"
//                 required
//                 className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
//                   errors.password ? "border-red-300" : "border-green-500"
//                 } placeholder-gray-500 text-gray-900 font-bold rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 hover:border-green-600 focus:z-10 sm:text-sm`}
//                 placeholder="Password"
//                 value={formData.password}
//                 onChange={handleChange}
//               />
//               {errors.password && (
//                 <p className="mt-1 text-sm text-red-600">{errors.password}</p>
//               )}
//             </div>
//           </div>

//           <div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 transition-colors duration-200"
//             >
//               {loading ? (
//                 <span className="absolute left-0 inset-y-0 flex items-center pl-3">
//                   <svg
//                     className="animate-spin h-5 w-5 text-white"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     ></circle>
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                     ></path>
//                   </svg>
//                 </span>
//               ) : null}
//               {loading ? "Signing in..." : "Sign in"}
//             </button>
//           </div>
//         </form>
//  <div className="flex justify-center items-center mb-6">
//           <Link
//             to="/forgot-password"
//             className="text-sm text-red-500 font-bold hover:underline text-center sm:text-base"
//           >
//             Forgot password?
//           </Link>
//         </div>

//         <div className="text-center">
//           <p className="text-sm text-gray-600">
//             Don't have an account?{" "}
//             <Link to="/signup" className="font-medium text-red-600 ">
//               Sign up
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;


// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { toast } from "react-hot-toast";
// import adminApi from "../../services/api";

// const Login = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});

//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.email) {
//       newErrors.email = "Email is required";
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = "Email is invalid";
//     }
//     if (!formData.password) {
//       newErrors.password = "Password is required";
//     }
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//     if (errors[name]) {
//       setErrors((prev) => ({
//         ...prev,
//         [name]: "",
//       }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     setLoading(true);
//     try {
//       const response = await adminApi.auth.login(formData);
//       localStorage.setItem("adminToken", response.data.token);
//       localStorage.setItem("adminUser", JSON.stringify(response.data.user));
//       toast.success("Login successful");
//       navigate("/");
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-violet-900 via-purple-800 to-pink-800">
//       {/* Animated Background Elements */}
//       <div className="absolute inset-0">
//         <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-pink-400 to-violet-400 rounded-full opacity-20 blur-3xl animate-pulse"></div>
//         <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full opacity-20 blur-3xl animate-pulse delay-1000"></div>
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-10 blur-3xl animate-pulse delay-500"></div>
//       </div>

//       {/* Main Content */}
//       <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
//         <div className="w-full max-w-md">
//           {/* Logo Container */}
//           <div className="text-center mb-8">
//             <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl mb-6">
//               <img
//                 src="/images/logo.png"
//                 alt="logo"
//                 className="w-12 h-12 object-contain"
//               />
//             </div>
//             <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent mb-2">
//               Admin Portal
//             </h1>
//             <p className="text-white/70 text-lg">Welcome back to your dashboard</p>
//           </div>

//           {/* Login Card */}
//           <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8">
//             <form onSubmit={handleSubmit} className="space-y-6">
//               {/* Email Field */}
//               <div className="space-y-2">
//                 <label htmlFor="email" className="block text-white/90 text-sm font-medium">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <input
//                     id="email"
//                     name="email"
//                     type="email"
//                     autoComplete="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     className={`w-full px-4 py-4 bg-white/10 backdrop-blur-sm border rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent transition-all duration-300 ${
//                       errors.email ? "border-red-400/50 focus:ring-red-400/50" : "border-white/30"
//                     }`}
//                     placeholder="Enter your email"
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-r from-pink-400/10 to-violet-400/10 rounded-2xl pointer-events-none opacity-0 transition-opacity duration-300 peer-focus:opacity-100"></div>
//                 </div>
//                 {errors.email && (
//                   <p className="text-red-300 text-sm flex items-center space-x-1">
//                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                     </svg>
//                     <span>{errors.email}</span>
//                   </p>
//                 )}
//               </div>

//               {/* Password Field */}
//               <div className="space-y-2">
//                 <label htmlFor="password" className="block text-white/90 text-sm font-medium">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <input
//                     id="password"
//                     name="password"
//                     type="password"
//                     autoComplete="current-password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     className={`w-full px-4 py-4 bg-white/10 backdrop-blur-sm border rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent transition-all duration-300 ${
//                       errors.password ? "border-red-400/50 focus:ring-red-400/50" : "border-white/30"
//                     }`}
//                     placeholder="Enter your password"
//                   />
//                 </div>
//                 {errors.password && (
//                   <p className="text-red-300 text-sm flex items-center space-x-1">
//                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                     </svg>
//                     <span>{errors.password}</span>
//                   </p>
//                 )}
//               </div>

//               {/* Submit Button */}
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-pink-500/25 focus:outline-none focus:ring-2 focus:ring-pink-400/50 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
//               >
//                 <div className="flex items-center justify-center space-x-2">
//                   {loading && (
//                     <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
//                     </svg>
//                   )}
//                   <span className="text-lg">{loading ? "Signing in..." : "Sign In"}</span>
//                 </div>
//               </button>

//               {/* Links */}
//               <div className="flex flex-col space-y-4 text-center">
//                 <Link
//                   to="/forgot-password"
//                   className="text-white/70 hover:text-white text-sm font-medium transition-colors duration-200 hover:underline"
//                 >
//                   Forgot your password?
//                 </Link>
//                 <div className="flex items-center justify-center space-x-1 text-sm text-white/70">
//                   <span>Don't have an account?</span>
//                   <Link
//                     to="/signup"
//                     className="text-pink-300 hover:text-pink-200 font-medium transition-colors duration-200 hover:underline"
//                   >
//                     Sign up
//                   </Link>
//                 </div>
//               </div>
//             </form>
//           </div>

//           {/* Footer */}
//           <div className="text-center mt-8">
//             <p className="text-white/50 text-sm">
//               Secure admin access • Protected by encryption
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import adminApi from "../../services/api";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await adminApi.auth.login(formData);
      localStorage.setItem("adminToken", response.data.token);
      localStorage.setItem("adminUser", JSON.stringify(response.data.user));
      toast.success("Login successful");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-slate-700/30 rounded-full opacity-40 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-slate-600/20 rounded-full opacity-30 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-slate-500/20 rounded-full opacity-20 blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo Container */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl mb-6">
              <img
                src="/images/logo.png"
                alt="logo"
                className="w-12 h-12 object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Admin Portal
            </h1>
            <p className="text-slate-300 text-lg">Welcome back to your dashboard</p>
          </div>

          {/* Login Card */}
          <div className="bg-slate-800/50 backdrop-blur-sm p-6 md:p-8 rounded-xl border border-slate-700/50 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-white text-sm font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-4 bg-slate-900/50 backdrop-blur-sm border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300 ${
                      errors.email ? "border-red-500/50 focus:ring-red-500/50" : "border-slate-700/50"
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-sm flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-white text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-4 bg-slate-900/50 backdrop-blur-sm border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300 ${
                      errors.password ? "border-red-500/50 focus:ring-red-500/50" : "border-slate-700/50"
                    }`}
                    placeholder="Enter your password"
                  />
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-slate-500/25 focus:outline-none focus:ring-2 focus:ring-slate-500 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none border border-slate-600/50"
              >
                <div className="flex items-center justify-center space-x-2">
                  {loading && (
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  )}
                  <span className="text-lg">{loading ? "Signing in..." : "Sign In"}</span>
                </div>
              </button>

              {/* Links */}
              <div className="flex flex-col space-y-4 text-center">
                <Link
                  to="/forgot-password"
                  className="text-slate-400 hover:text-slate-300 text-sm font-medium transition-colors duration-200 hover:underline"
                >
                  Forgot your password?
                </Link>
                <div className="flex items-center justify-center space-x-1 text-sm text-slate-400">
                  <span>Don't have an account?</span>
                  <Link
                    to="/signup"
                    className="text-slate-300 hover:text-white font-medium transition-colors duration-200 hover:underline"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-slate-500 text-sm">
              Secure admin access • Protected by encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
