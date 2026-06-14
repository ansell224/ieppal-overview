import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import AnimatedLogo from '../components/AnimatedLogo';
import { InlineSpinner } from '../components/LoadingSpinner';

/* Override AnimatedLogo styles to blend with the login page */
const loginLogoOverrides = `
  .login-animated-logo .alogo-face-card {
    background: transparent;
    backdrop-filter: none;
    border: none;
    box-shadow: none;
    padding: 0;
    overflow: visible;
  }
  .login-animated-logo .alogo-face-card:hover {
    background: transparent;
    border-color: transparent;
    transform: none;
  }
  .login-animated-logo .alogo-face-container {
    margin: 0;
    background: linear-gradient(135deg, rgba(236,72,153,0.15), rgba(249,115,22,0.15));
    border-color: rgba(236,72,153,0.2);
  }
  .login-animated-logo .alogo-face-bg {
    background: white;
  }
  .login-animated-logo .alogo-hover-glow {
    display: none;
  }
  .login-animated-logo .alogo-speech-bubble {
    display: none;
  }
  .login-animated-logo .alogo-bobbing {
    animation-delay: 1s;
    animation-fill-mode: backwards;
  }
  .login-animated-logo .alogo-halo {
    animation-delay: 1s;
    animation-fill-mode: backwards;
  }

  @keyframes loginFadeUp {
    from {
      opacity: 0;
      transform: translateY(18px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .login-fade-in {
    opacity: 0;
    animation: loginFadeUp 0.7s ease-out forwards;
  }
`;

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, loading, user } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (user?.role === 'ADMIN') {
        navigate("/admin", { replace: true });
      } else if (user?.role === 'STUDENT') {
        navigate("/my-profile", { replace: true });
      } else {
        navigate("/classrooms", { replace: true });
      }
    }
  }, [isAuthenticated, loading, user, navigate]);

  const logoutReason = searchParams.get('reason');
  const logoutMessageMap = {
    ACCOUNT_DISABLED: 'Your account has been disabled. Please contact the administrator.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    INVALID_EXPIRED_TOKEN: 'Your session has expired. Please log in again.',
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.user.role === 'ADMIN') {
        navigate("/admin");
      } else if (result.user.role === 'STUDENT') {
        navigate("/my-profile");
      } else {
        navigate("/classrooms");
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = (err && err.message) || '';
      const status = (err && err.status) || 0;
      if (msg === 'INVALID_CREDENTIALS' || status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (msg === 'EMAIL_AND_PASSWORD_REQUIRED') {
        setError('Please enter both email and password.');
      } else if (msg === 'ACCOUNT_DISABLED' || status === 403) {
        setError('Your account has been disabled. Please contact the administrator.');
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f5f1eb]">
      <style>{loginLogoOverrides}</style>

      {/* Left Panel — Branding */}
      <div className="lg:w-[63%] flex flex-col items-start justify-center lg:justify-start lg:pt-[30vh] px-6 sm:px-10 lg:px-16 xl:px-20 py-8 relative overflow-hidden">
        <div
          className="login-fade-in flex items-center gap-4 sm:gap-6 lg:gap-10"
          style={{ '--logo-face-size': '1em', animationDelay: '0.1s' }}
        >
          <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] leading-none tracking-tight text-neutral-900 whitespace-nowrap">
            IEP Pal
          </h1>
          <div className="login-animated-logo shrink-0 text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem]">
            <AnimatedLogo />
          </div>
        </div>

        <p className="login-fade-in mt-1 sm:mt-2 font-serif text-lg sm:text-2xl md:text-3xl lg:text-4xl text-neutral-400 italic leading-tight" style={{ animationDelay: '0.25s' }}>
          Your best pal in learning support.
        </p>

        <p className="login-fade-in mt-3 text-sm sm:text-base text-neutral-500 max-w-md leading-relaxed font-light" style={{ animationDelay: '0.4s' }}>
          IEP Pal assists educators in their efforts to nurture students
          into confident self-advocates. By centralizing support, educators
          can build authentic relationships and focus less on the
          administrative tasks.
        </p>

        <p className="hidden lg:block text-xs text-neutral-400 absolute bottom-8 left-16 xl:left-20">
          &copy; {new Date().getFullYear()} IEP Pal. Built for educators, students, parents, and learning support specialists.
        </p>
      </div>

      {/* Vertical Divider */}
      <div className="login-fade-in hidden lg:flex items-center justify-center self-stretch" style={{ animationDelay: '0.5s' }}>
        <div className="w-px bg-black h-64" />
      </div>

      {/* Right Panel — Login Form */}
      <div className="lg:w-[37%] flex flex-col items-center justify-center lg:justify-start lg:pt-[30vh] px-6 sm:px-10 lg:px-16">
        <div className="w-full max-w-sm">

          <h2 className="login-fade-in font-serif text-3xl sm:text-4xl text-neutral-900 mb-2" style={{ animationDelay: '0.3s' }}>
            Sign in
          </h2>
          <p className="login-fade-in text-neutral-400 text-sm mb-10" style={{ animationDelay: '0.4s' }}>
            Enter your credentials to continue
          </p>

          {logoutReason && logoutMessageMap[logoutReason] && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {logoutMessageMap[logoutReason]}
            </div>
          )}

          {error && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="login-fade-in space-y-5" style={{ animationDelay: '0.5s' }}>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-white border border-neutral-200 rounded-lg text-neutral-900 text-sm placeholder-neutral-300 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 transition-colors"
                placeholder="name@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-white border border-neutral-200 rounded-lg text-neutral-900 text-sm placeholder-neutral-300 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 transition-colors"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-2 bg-neutral-800 text-white rounded-lg text-sm font-medium hover:bg-neutral-900 active:bg-neutral-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <InlineSpinner />
                  Signing in...
                </span>
              ) : (
                "Continue"
              )}
            </button>
          </form>

          <div className="login-fade-in mt-10 pt-8 border-t border-neutral-200" style={{ animationDelay: '0.6s' }}>
            <p className="text-xs text-neutral-400 text-center">
              Contact your administrator for access
            </p>
          </div>

        </div>
      </div>

      {/* Mobile footer */}
      <p className="lg:hidden text-xs text-neutral-400 text-center pb-8">
        &copy; {new Date().getFullYear()} IEP Pal. Built for educators.
      </p>

    </div>
  );
}
