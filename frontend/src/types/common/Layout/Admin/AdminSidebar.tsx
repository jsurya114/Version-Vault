import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogoIcon } from '../AppHeader';
import { useAppDispatch } from '../../../../app/hooks';
import { logoutThunk } from '../../../../features/auth/authThunks';
import { ROUTES } from '../../../../constants/routes';

const AdminSidebar = ({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate(ROUTES.ADMIN_LOGIN);
  };

  const menuItems = [
    { label: 'Overview', path: ROUTES.ADMIN_DASHBOARD },
    { label: 'User Management', path: ROUTES.ADMIN_USERS },
    { label: 'Repository Management', path: ROUTES.ADMIN_REPOS },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden" 
          onClick={onClose} 
        />
      )}
      <aside 
        className={`w-44 shrink-0 border-r border-gray-800 flex-col py-4 bg-gray-950 fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } md:flex`}
      >
      <div className="px-4 mb-6 flex items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)}>
        <LogoIcon className="w-8 h-8" />
        <span className="font-bold text-white text-sm tracking-tight">VersionVault</span>
      </div>

      <nav className="flex flex-col gap-1 px-2 flex-1">
        {menuItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== ROUTES.ADMIN_DASHBOARD && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400 font-medium'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400/80 hover:text-red-400 hover:bg-red-400/10 text-sm transition-all duration-200"
        >
          Sign out
        </button>
      </div>
    </aside>
    </>
  );
};

export default AdminSidebar;
