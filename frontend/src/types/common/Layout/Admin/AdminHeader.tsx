import { useAppSelector } from '../../../../app/hooks';
import { selectAuthUser } from '../../../../features/auth/authSelectors';

const AdminHeader = () => {
  const adminUser = useAppSelector(selectAuthUser);

  return (
    <header className="border-b border-gray-800 px-6 py-3 flex items-center justify-between bg-gray-950 shrink-0">
      <div className="relative">
        <input
          type="text"
          placeholder="Search or jump to..."
          className="bg-gray-900 border border-gray-700 rounded-lg pl-4 pr-16 py-1.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-500 w-64 transition-all duration-200"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 text-[10px] font-bold border border-gray-800 rounded px-1 px-1 py-0.5">
          ⌘K
        </span>
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
