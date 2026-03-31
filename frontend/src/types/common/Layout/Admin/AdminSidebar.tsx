import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../../app/hooks';
import { logoutThunk } from '../../../../features/auth/authThunks';
import { ROUTES } from '../../../../constants/routes';

const AdminSidebar = () => {
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
    <aside className="w-44 shrink-0 border-r border-gray-800 flex flex-col py-4 bg-gray-950">
      <div className="px-4 mb-6 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
        </div>
        <span className="text-white font-bold text-sm">VersionVault</span>
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
  );
};

export default AdminSidebar;
