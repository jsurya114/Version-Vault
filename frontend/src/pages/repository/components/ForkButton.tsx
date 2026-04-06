import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { GitFork } from 'lucide-react';
import { AppDispatch } from '../../../app/store';
import { forkRepoThunk } from '../../../features/repository/repositoryThunks';

import { SuccessSonar } from '../../../types/common/Layout/SuccessSonar';
import { ErrorSonar } from '../../../types/common/Layout/ErrorSonar';
interface ForkButtonProps {
  username: string;
  reponame: string;
  forksCount: number;
}
export const ForkButton: React.FC<ForkButtonProps> = ({ username, reponame, forksCount }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isForking, setIsForking] = useState(false);

  // Tracking both Success and Error Sonar state
  const [sonar, setSonar] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    subtitle?: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    subtitle: '',
  });
  const handleForkClick = async () => {
    if (!username || !reponame) return;
    setIsForking(true);

    try {
      const newForkedRepo = await dispatch(forkRepoThunk({ username, reponame })).unwrap();
      setSonar({
        isOpen: true,
        type: 'success',
        title: 'Successfully Forked!',
        subtitle: 'Redirecting to your new repository...',
      });
      setTimeout(() => {
        navigate(`/${newForkedRepo.ownerUsername}/${newForkedRepo.name}`);
      }, 1500);
    } catch (errorMessage) {
      // Trigger the ERROR sonar!
      setSonar({
        isOpen: true,
        type: 'error',
        title: 'Fork Failed',
        subtitle: errorMessage as string,
      });
    } finally {
      setIsForking(false);
    }
  };
  const closeSonar = () => setSonar({ ...sonar, isOpen: false });
  return (
    <>
      <div className="flex items-center">
        <button
          onClick={handleForkClick}
          disabled={isForking}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-l-lg border transition ${
            isForking
              ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed opacity-70'
              : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <GitFork className={`w-3 h-3 ${isForking ? 'animate-pulse' : ''}`} />
          {isForking ? 'Forking...' : 'Fork'}
        </button>
        <span className="px-2 py-1 text-xs bg-gray-800 border border-l-0 border-gray-700 text-gray-300 rounded-r-lg">
          {forksCount}
        </span>
      </div>
      {/* Render the appropriate Sonar */}
      {sonar.type === 'success' ? (
        <SuccessSonar
          isOpen={sonar.isOpen}
          onClose={closeSonar}
          title={sonar.title}
          subtitle={sonar.subtitle}
          duration={1500}
        />
      ) : (
        <ErrorSonar
          isOpen={sonar.isOpen}
          onClose={closeSonar}
          title={sonar.title}
          subtitle={sonar.subtitle}
          duration={4000} // Longer duration for errors to easily read them
        />
      )}
    </>
  );
};
