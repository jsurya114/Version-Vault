import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectBranches } from '../../features/repository/repositorySelectors';
import { getBranchesThunk } from '../../features/repository/repositoryThunks';
import AppHeader from '../../types/common/Layout/AppHeader';
import AppFooter from '../../types/common/Layout/AppFooter';

import { CompareLanding } from '../../pages/pullrequest/components/CompareLanding';

const CreatePRPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { username, reponame } = useParams();
  const branches = useAppSelector(selectBranches);

  const [targetBranch] = useState('main');

  useEffect(() => {
    if (username && reponame) {
      dispatch(getBranchesThunk({ username, reponame }));
    }
  }, [dispatch, username, reponame]);

  const handleCompare = (source: string) => {
    if (!source || !targetBranch) return;
    navigate(`/${username}/${reponame}/compare/${targetBranch}...${source}`);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col overflow-x-hidden">
      <AppHeader />
      <div className="border-b border-gray-800 px-3 xs:px-4 sm:px-6 py-2">
        <div className="max-w-6xl mx-auto flex items-center gap-1 text-xs xs:text-sm text-gray-400 min-w-0 flex-wrap">
          <Link to={`/${username}/${reponame}`} className="text-blue-400 hover:underline">
            {reponame}
          </Link>
          <span>/</span>
          <span className="text-white font-semibold">New Pull Request</span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-3 xs:px-4 sm:px-6 py-6 xs:py-8 sm:py-12 w-full flex-1">
        <CompareLanding branches={branches} onSelectBranch={handleCompare} />
      </main>
      <AppFooter />
    </div>
  );
};
export default CreatePRPage;
