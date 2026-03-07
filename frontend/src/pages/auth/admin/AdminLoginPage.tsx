import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch,useAppSelector } from "src/app/hooks";
import { loginThunk } from "src/features/auth/authThunks";
import { clearError } from "src/features/auth/authSlice";
import { selectAuthLoading,selectAuthUser,selectAuthError } from "src/features/auth/authSelectors";
import { ROUTES } from "src/constants/routes";


const AdminLoginPage=()=>{
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const isLoading =useAppSelector(selectAuthLoading)
    const user = useAppSelector(selectAuthUser)
    const error = useAppSelector(selectAuthError)

    const [formData,setFormData]=useState({userId:'',password:''})
    const [showPassword,setShowPassword]=useState(false)
    const [fieldErrors,setFieldErrors]=useState<Record<string,string>>({})
    const [bootText,setBootText]=useState<string[]>([])

      // Terminal boot animation
  useEffect(() => {
    const lines = [
      '> Initializing secure channel...',
      '> Verifying admin credentials protocol...',
      '> Encrypted tunnel established.',
      '> VersionVault Admin Portal v1.0.0',
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < lines.length) {
        setBootText((prev) => [...prev, lines[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 400);
    return () => clearInterval(interval);
  }, []);

  useEffect(()=>{
    if(user){
        if(user.role==='admin'){
            navigate(ROUTES.ADMIN_DASHBOARD)
        }else{
            dispatch({type:"auth/logout"})
        }
    }
  },[user])

  useEffect(()=>{
    if(error) dispatch(clearError())
  },[formData])

    const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.userId.trim()) errors.userId = 'User ID is required';
    if (!formData.password) errors.password = 'Password is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    dispatch(loginThunk(formData));
  };
 return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-10 font-mono">

      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,70,0.015) 2px, rgba(0,255,70,0.015) 4px)',
        }}
      />

      <div className="w-full max-w-lg z-10">

        {/* Terminal Header */}
        <div className="bg-gray-950 border border-green-500/30 rounded-t-xl px-4 py-2 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-green-500/60 text-xs ml-2">admin@version-vault ~ secure-login</span>
        </div>

        {/* Terminal Body */}
        <div className="bg-gray-950 border-x border-green-500/30 px-6 py-4 min-h-24">
          {bootText.map((line, i) => (
            <p key={i} className="text-green-400 text-xs leading-relaxed">
              {line}
            </p>
          ))}
          {bootText.length < 4 && (
            <span className="text-green-400 text-xs animate-pulse">█</span>
          )}
        </div>

        {/* Main Card */}
        <div className="bg-gray-950 border border-green-500/30 border-t-0 rounded-b-xl px-8 py-8">

          {/* Title */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs tracking-widest uppercase">Secure Access Portal</span>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Version<span className="text-green-400">Vault</span> Admin
            </h1>
            <p className="text-gray-500 text-xs mt-1 tracking-wider">
              AUTHORIZED PERSONNEL ONLY
            </p>
          </div>

          {/* Warning */}
          <div className="mb-6 p-3 border border-yellow-500/30 bg-yellow-500/5 rounded-lg flex items-start gap-2">
            <span className="text-yellow-400 text-sm">⚠</span>
            <p className="text-yellow-400/80 text-xs leading-relaxed">
              All access attempts are logged and monitored. Unauthorized access is a criminal offense.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 border border-red-500/30 bg-red-500/5 rounded-lg flex items-center gap-2">
              <span className="text-red-400 text-sm">✗</span>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Admin ID */}
            <div>
              <label className="block text-green-400/70 text-xs mb-1 tracking-wider uppercase">
                Admin ID
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500/50 text-sm">$</span>
                <input
                  type="text"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  placeholder="admin_id"
                  className="w-full bg-black border border-green-500/30 rounded-lg pl-8 pr-4 py-2.5 text-green-300 placeholder-green-900 focus:outline-none focus:border-green-400 transition text-sm"
                />
              </div>
              {fieldErrors.userId && (
                <p className="text-red-400 text-xs mt-1">✗ {fieldErrors.userId}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-green-400/70 text-xs mb-1 tracking-wider uppercase">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500/50 text-sm">$</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-black border border-green-500/30 rounded-lg pl-8 pr-10 py-2.5 text-green-300 placeholder-green-900 focus:outline-none focus:border-green-400 transition text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-green-700 hover:text-green-400 transition"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-400 text-xs mt-1">✗ {fieldErrors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-500/10 hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed border border-green-500/40 hover:border-green-400 text-green-400 font-semibold py-2.5 rounded-lg transition text-sm mt-2 tracking-wider"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-pulse">█</span> AUTHENTICATING...
                </span>
              ) : (
                '> AUTHENTICATE'
              )}
            </button>

          </form>

          {/* Footer */}
          {/* <p className="text-center text-gray-700 text-xs mt-6">
            Not an admin?{' '}
            <Link to={ROUTES.LOGIN} className="text-green-600 hover:text-green-400 transition">
              User Login →
            </Link>
          </p> */}

        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;