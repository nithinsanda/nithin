import { useState } from "react";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import adminApi from "../../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Request code, 2: Verify code, 3: Reset password
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Email is required");

    setLoading(true);
    try {
      const res = await adminApi.auth.forgotPassword({ email });
      toast.success("Reset code sent to your email");
      setStep(2); // Move to verification step
      
      // For testing - show the code in console
      if (res.data?.testCode) {
        console.log("Test reset code:", res.data.testCode);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!resetCode) return toast.error("Please enter the reset code");
    setStep(3); // Move to password reset step
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword) return toast.error("Please enter a new password");
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");

    setLoading(true);
    try {
      await adminApi.auth.resetPassword({ 
        email, 
        code: resetCode, 
        newPassword 
      });
      
      toast.success("Password reset successfully!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h2 className="text-3xl font-extrabold text-center mb-6 text-slate-100">
              Forgot Password
            </h2>
            <p className="text-slate-400 text-center mb-6">
              Enter your email and we'll send you a verification code
            </p>
            <form onSubmit={handleRequestCode} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  className="w-full p-3 border border-slate-600 bg-slate-900 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Sending Code..." : "Send Verification Code"}
              </button>
            </form>
          </>
        );

      case 2:
        return (
          <>
            <h2 className="text-3xl font-extrabold text-center mb-6 text-slate-100">
              Enter Verification Code
            </h2>
            <p className="text-slate-400 text-center mb-6">
              We've sent a 6-digit code to {email}
            </p>
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-slate-600 bg-slate-900 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-center text-xl tracking-widest"
                  placeholder="123456"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || resetCode.length !== 6}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Verify Code
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-slate-400 hover:text-white w-full text-center mt-4"
              >
                Back to email
              </button>
            </form>
          </>
        );

      case 3:
        return (
          <>
            <h2 className="text-3xl font-extrabold text-center mb-6 text-slate-100">
              Create New Password
            </h2>
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  className="w-full p-3 border border-slate-600 bg-slate-900 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <p className="mt-1 text-xs text-slate-500">
                  Must be at least 6 characters
                </p>
              </div>
              <button
                type="submit"
                disabled={loading || newPassword.length < 6}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold shadow-lg hover:shadow-green-500/25 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Updating..." : "Reset Password"}
              </button>
            </form>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-slate-800 p-10 rounded-3xl shadow-2xl border border-slate-700 relative animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="bg-slate-700 rounded-full p-3 shadow-md">
            <svg className="h-10 w-10 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3-3-1.343-3-3zm0 0V7a4 4 0 10-8 0v4a4 4 0 008 0zm0 0v4a4 4 0 008 0v-4a4 4 0 00-8 0z" />
            </svg>
          </div>
        </div>

        {renderStep()}

        <div className="text-center mt-6 text-sm">
          <span className="text-slate-400">Remembered your password?</span>{" "}
          <Link
            to="/login"
            className="text-slate-300 hover:text-white font-medium transition-colors duration-200 hover:underline"
          >
            Back to Login →
          </Link>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
