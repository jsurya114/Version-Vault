export type ActivityActionType = 'starred_repo' | 'forked_repo' | 'followed_user' | 'created_repo';

export interface IActivity {
  id: string;
  actorId: string;
  actorUsername: string;
  actorAvatar?: string;
  actionType: ActivityActionType;
  targetId: string;
  targetName: string;
  createdAt: string;
}

export interface ActivityResponseDTO {
  success: boolean;
  data: IActivity[];
}

export interface PaginatedActivityResponse {
  data: IActivity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface ActivityState {
  feed: IActivity[];
  total: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
}

export const initialState: ActivityState = {
  feed: [],
  total: 0,
  totalPages: 0,
  currentPage: 1,
  isLoading: false,
  error: null,
};
