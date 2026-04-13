import { useAppSelector } from '../../../../app/hooks';
import { selectAuthUser } from '../../../../features/auth/authSelectors';

const AdminHeader = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const adminUser = useAppSelector(selectAuthUser);

  return (
    <header className="border-b border-gray-800 px-3 xs:px-4 sm:px-6 py-2 xs:py-3 flex items-center justify-between bg-gray-950 shrink-0 gap-2 relative z-30">
      <div className="flex items-center gap-2">
        <button 
          className="md:hidden text-gray-400 hover:text-white shrink-0 -ml-1 p-1" 
          onClick={onMenuClick}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="relative">
        <input
          type="text"
          placeholder="Search or jump to..."
          className="bg-gray-900 border border-gray-700 rounded-lg pl-3 xs:pl-4 pr-10 xs:pr-16 py-1.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-500 w-40 xs:w-52 sm:w-64 transition-all duration-200"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 text-[10px] font-bold border border-gray-800 rounded px-1 px-1 py-0.5">
          ⌘K
        </span>
      </div>
      </div>

      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden shadow-md ring-1 ring-white/10">
        {adminUser?.avatar ? (
          <img
            src={adminUser.avatar}
            alt={adminUser.username}
            className="w-full h-full object-cover"
          />
        ) : (
          (adminUser?.username?.[0]?.toUpperCase() ?? 'A')
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
