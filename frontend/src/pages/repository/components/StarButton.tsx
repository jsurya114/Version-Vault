import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Star } from 'lucide-react';
import { AppDispatch } from '../../../app/store';
import { toggleStarThunk } from '../../../features/repository/repositoryThunks';
import { selectAuthUser } from 'src/features/auth/authSelectors';

interface StarButtonProps {
  username: string;
  reponame: string;
  initialStars: number;
  initialStarredBy: string[];
  isOwner: boolean;
  onCountClick?: () => void;
}
export const StarButton: React.FC<StarButtonProps> = ({
  username,
  reponame,
  initialStars,
  initialStarredBy,
  isOwner,
  onCountClick,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectAuthUser);

  const [isStarred, setIsStarred] = useState(false);
  const [starsCount, setStarsCount] = useState(initialStars);

  useEffect(() => {
    if (user && initialStarredBy) {
      setIsStarred(initialStarredBy.includes(user.id));
    }
  }, [user, initialStarredBy]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop parent card from navigating
    if (isOwner) return; // Don't allow owners to star

    const wasStarred = isStarred;
    setIsStarred(!wasStarred);
    setStarsCount((prev) => (wasStarred ? Math.max(0, prev - 1) : prev + 1));

    try {
      const result = await dispatch(toggleStarThunk({ username, reponame })).unwrap();
      setIsStarred(result.isStarred);
      setStarsCount(result.starsCount);
    } catch (err) {
      setIsStarred(wasStarred);
      setStarsCount(initialStars);
      console.error(err);
    }
  };

  return (
    <div
      onClick={handleToggle}
      className={`flex items-center gap-2 px-3.5 py-1.5 text-xs rounded-lg border transition-all duration-300 font-bold select-none ${
        isOwner
          ? 'bg-gray-900/50 border-gray-800 text-gray-600 cursor-not-allowed opacity-60'
          : 'cursor-pointer ' +
            (isStarred
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.1)]'
              : 'bg-gray-800/80 border-gray-700 text-gray-300 hover:bg-gray-750 hover:text-white')
      }`}
    >
      <Star
        className={`w-3.5 h-3.5 transition-transform duration-300 ${
          isStarred ? 'fill-blue-400 text-blue-400 scale-110' : 'scale-100'
        }`}
      />

      <span>{isStarred ? 'Unstar' : 'Star'}</span>

      <div className={`w-[1px] h-3 mx-0.5 ${isStarred ? 'bg-blue-500/20' : 'bg-gray-700'}`} />

      {/* Clicking THIS span now works perfectly because it's inside a div, not a button */}
      <span
        onClick={(e) => {
          e.stopPropagation(); // Prevents handleToggle from firing
          if (onCountClick) onCountClick();
        }}
        className={`px-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer ${
          isStarred ? 'text-blue-400' : 'text-gray-300 hover:text-white'
        }`}
      >
        {starsCount}
      </span>
    </div>
  );
};
