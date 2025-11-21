import { useState, useEffect } from 'react';
import { ConsumerAccount } from './components/ConsumerAccount';
import { RestaurantAccount } from './components/RestaurantAccount';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { LogOut } from 'lucide-react';
import svgPaths from './imports/svg-8v4mfggej5';
import { AppProvider, useApp } from './context/AppContext';
import { authService } from './services';
import { Toaster } from 'sonner';

type AccountType = 'customer' | 'restaurant';
type AppView = 'login' | 'signup' | 'app';

function AppContent() {
  const [currentView, setCurrentView] = useState<AppView>('login');
  const [accountType, setAccountType] = useState<AccountType>('customer');
  const { currentUser, setCurrentUser } = useApp();

  // currentUser가 변경될 때 자동으로 accountType 설정
  useEffect(() => {
    if (currentUser) {
      const type = currentUser.role === 'customer' ? 'customer' : 'restaurant';
      setAccountType(type);
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setCurrentUser(null);
      setCurrentView('login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  // 로그인/회원가입 화면 표시
  if (currentView === 'login') {
    return (
      <Login
        onLogin={(type) => {
          setAccountType(type);
          setCurrentView('app');
        }}
        onSignupClick={() => setCurrentView('signup')}
      />
    );
  }

  if (currentView === 'signup') {
    return (
      <Signup
        onLoginClick={() => setCurrentView('login')}
        onSignupComplete={() => setCurrentView('app')} // ✅ 회원가입 완료 후 바로 앱 화면으로
      />
    );
  }

  // 메인 앱 화면

  return (
    <div 
      className="min-h-screen overflow-auto relative w-full"
      style={{
        backgroundImage:
          "linear-gradient(rgb(240, 244, 255) 0%, rgb(255, 255, 255) 50%, rgb(232, 239, 255) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)",
      }}
    >
      {/* 배경 장식 요소 */}
      <div className="absolute bg-[#4a6cf7] blur-3xl filter right-0 opacity-5 rounded-full size-[500px] top-0 pointer-events-none" />
      <div className="absolute bg-[#3451d9] blur-3xl filter left-0 opacity-5 rounded-full size-[500px] top-[400px] pointer-events-none" />

      {/* 헤더 */}
      <header className="sticky top-0 bg-[rgba(255,255,255,0.8)] backdrop-blur-sm border-b border-[#d4e1ff] z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-b from-[#5570f1] to-[#4a6cf7] rounded-2xl shadow-lg p-2.5">
                <svg className="size-6" fill="none" viewBox="0 0 24 24">
                  <g>
                    <path d="M8 22H16" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    <path d="M7 10H17" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    <path d="M12 15V22" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    <path d={svgPaths.p28adc680} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </g>
                </svg>
              </div>
              <span className="font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold text-xl text-[#4a6cf7]">
                후문 한잔
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-b from-[#5570f1] to-[#4a6cf7] hover:from-[#4a6cf7] hover:to-[#3451d9] transition-all rounded-full shadow-lg px-5 py-2.5 flex items-center gap-2"
            >
              <LogOut className="size-4 text-white" />
              <span className="font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] text-sm text-white">
                로그아웃
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 relative z-10">
        {accountType === 'customer' && <ConsumerAccount />}
        {accountType === 'restaurant' && <RestaurantAccount />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Toaster position="top-center" richColors />
      <AppContent />
    </AppProvider>
  );
}