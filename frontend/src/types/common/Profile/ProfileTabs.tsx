import React from 'react';

interface ProfileTabsProps {
  activeTab: 'overview' | 'repositories';
  onTabChange: (tab: 'overview' | 'repositories') => void;
  repoCount: number;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, onTabChange, repoCount }) => {
  return (
    <div className="flex items-center gap-1 bg-gray-900/50 p-1 rounded-xl border border-gray-800 mb-8 w-fit mx-auto">
      <button
        onClick={() => onTabChange('overview')}
        className={`px-8 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
          activeTab === 'overview'
            ? 'bg-gray-800 text-white shadow-lg'
            : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        Overview
      </button>
      <button
        onClick={() => onTabChange('repositories')}
        className={`px-8 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
          activeTab === 'repositories'
            ? 'bg-gray-800 text-white shadow-lg'
            : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        Repositories
        <span className="bg-gray-800/50 px-1.5 py-0.5 rounded text-[10px] text-gray-400 border border-gray-700">
          {repoCount}
        </span>
      </button>
    </div>
  );
};

export default ProfileTabs;
