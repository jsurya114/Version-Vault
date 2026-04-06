import React, { useEffect, useState } from 'react';
import { Trash2, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  fetchCommentThunk,
  createCommentThunk,
  deleteCommentThunk,
} from 'src/features/comments/commentThunk';
import {
  selectCommentsMeta,
  selectComments,
  selectCommentsLoading,
} from 'src/features/comments/commentSelector';
import { selectAuthUser } from '../../../features/auth/authSelectors';
import ConfirmModal from '../Modal/ConfirmModal';
import { clearComments } from 'src/features/comments/commentSlice';

interface CommentSectionProps {
  username: string;
  reponame: string;
  targetType: 'issue' | 'pr';
  targetId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  username,
  reponame,
  targetType,
  targetId,
}) => {
  const dispatch = useAppDispatch();
  const comments = useAppSelector(selectComments);
  const isLoading = useAppSelector(selectCommentsLoading);
  const meta = useAppSelector(selectCommentsMeta);
  const authUser = useAppSelector(selectAuthUser);
  const [content, setContent] = useState('');
  const [page, setPage] = useState(1);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const handleDeleteClick = (commentId: string) => {
    setCommentToDelete(commentId);
    setIsDeleteModalOpen(true);
  };
  const handleConfirmDelete = () => {
    if (commentToDelete) {
      dispatch(deleteCommentThunk({ commentId: commentToDelete }));
      setIsDeleteModalOpen(false);
      setCommentToDelete(null);
    }
  };

  useEffect(() => {
    return () => {
      dispatch(clearComments());
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [targetId]);
  useEffect(() => {
    if (targetId) {
      dispatch(fetchCommentThunk({ username, reponame, targetType, targetId, page }));
    }
  }, [targetId, page]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    dispatch(createCommentThunk({ username, reponame, targetType, targetId, content }));
    setContent('');
    setPage(1);
  };

  return (
    <div className="mt-8 border-t border-gray-800 pt-6">
      <h3 className="text-white font-semibold mb-4">Comments ({comments.length})</h3>

      <div className="space-y-4 mb-6">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white font-bold">
                  {comment.authorUsername[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium text-white">{comment.authorUsername}</span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>

              {authUser?.userId === comment.authorUsername && (
                <button
                  onClick={() => handleDeleteClick(comment.id)}
                  className="text-gray-500 hover:text-red-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-gray-300 text-sm whitespace-pre-wrap">{comment.content}</p>
          </div>
        ))}
        {meta.page < meta.totalPages && (
          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={isLoading}
            className="w-full py-2 text-sm text-blue-400 hover:text-blue-300 
               bg-gray-900 border border-gray-800 rounded-lg 
               hover:bg-gray-800 transition disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : `Show More (${meta.total - comments.length} remaining)`}
          </button>
        )}
      </div>

      {authUser ? (
        <form onSubmit={handleSubmit} className="mt-4">
          <textarea
            className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500 transition"
            placeholder="Leave a comment..."
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={isLoading || !content.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg transition"
            >
              Comment
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-400">You must be logged in to comment.</p>
        </div>
      )}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        confirmColor="bg-red-600"
        icon={<AlertCircle className="w-5 h-5 text-red-500" />}
      />
    </div>
  );
};

export default React.memo(CommentSection);
