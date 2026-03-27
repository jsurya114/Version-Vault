import React from 'react';
import { Star } from 'lucide-react';

interface PinnedRepoCardProps {
  name: string;
  description?: string;
  language: string;
  languageColor: string;
  stars: string | number;
  onClick?: () => void;
}

const PinnedRepoCard: React.FC<PinnedRepoCardProps> = ({
  name,
  description,
  language,
  languageColor,
  stars,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="group bg-gray-900/40 border border-gray-800 hover:border-blue-500/50 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5"
    >
      <div className="flex flex-col h-full justify-between">
        <div className="mb-4">
          <h3 className="text-white text-lg font-bold group-hover:text-blue-400 transition-colors">
            {name}
          </h3>
          {description && <p className="text-gray-500 text-sm mt-1 line-clamp-2">{description}</p>}
        </div>

        <div className="flex items-center gap-6 text-xs mt-auto">
          <div className="flex items-center gap-2 text-gray-400 font-medium">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: languageColor }} />
            {language}
          </div>

          <div className="flex items-center gap-1.5 text-gray-400 font-medium group-hover:text-yellow-400 transition-colors">
            <Star className="w-3.5 h-3.5" />
            {stars}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PinnedRepoCard;
