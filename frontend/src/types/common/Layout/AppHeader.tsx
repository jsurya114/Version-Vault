import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Search, LogOut } from 'lucide-react';
import { useAppDispatch, useAppSelector } from 'src/app/hooks';
import { selectAuthUser } from 'src/features/auth/authSelectors';
import { logoutThunk } from 'src/features/auth/authThunks';
import { selectRepositories } from 'src/features/repository/repositorySelectors';
import { ROUTES } from 'src/constants/routes';

const AppHeader = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectAuthUser);
  const repositories = useAppSelector(selectRepositories);

  // get first repo for PR/Issues links
  const firstRepo = repositories[0];

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const navLinks = [
    {
      label: 'Pull Requests',
      onClick: () => {
        if (firstRepo) {
          navigate(`/${firstRepo.ownerUsername}/${firstRepo.name}/pulls`);
        } else {
          navigate(ROUTES.REPO_LIST);
        }
      },
    },
    {
      label: 'Issues',
      onClick: () => {
        if (firstRepo) {
          navigate(`/${firstRepo.ownerUsername}/${firstRepo.name}/issues`);
        } else {
          navigate(ROUTES.REPO_LIST);
        }
      },
    },
    {
      label: 'ChatRoom',
      onClick: () => {},
    },
  ];

  return (
    <nav className="border-b border-gray-800 px-6 py-3 flex items-center justify-between sticky top-0 bg-gray-950/95 backdrop-blur z-50">
      <div className="flex items-center gap-4">
        <Link to={ROUTES.HOME} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          </div>
          <span className="font-bold text-white text-sm">VersionVault</span>
        </Link>

        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search or jump to..."
            className="bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-12 py-1.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-500 w-64 transition"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 text-xs border border-gray-700 rounded px-1">
            ⌘K
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => (
            <span
              key={item.label}
              onClick={item.onClick}
              className="text-gray-400 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-gray-800 cursor-pointer transition"
            >
              {item.label}
            </span>
          ))}
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
        </button>

        {/* Avatar dropdown */}
        <div className="relative group">
          <button className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            {user?.username?.[0]?.toUpperCase() ?? 'U'}
          </button>
          <div className="absolute right-0 top-10 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
            <div className="px-4 py-3 border-b border-gray-800">
              <p className="text-white text-sm font-medium">{user?.username}</p>
              <p className="text-gray-500 text-xs">{user?.userId}</p>
            </div>
            <div className="py-1">
              <Link
                to={`/users/${user?.userId}`}
                className="w-full flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 text-sm transition"
              >
                Your Profile
              </Link>
              <Link
                to={ROUTES.REPO_LIST}
                className="w-full flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 text-sm transition"
              >
                Your Repositories
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-gray-800 text-sm transition"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AppHeader;
