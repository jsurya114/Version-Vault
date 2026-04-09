import { RootState } from '../../app/store';

export const selectChatMessages = (state: RootState) => state.chat.messages;
export const selectSelectedChatMessage = (state: RootState) => state.chat.selectedMessage;
export const selectIsChatLoading = (state: RootState) => state.chat.isLoading;
export const selectChatMeta = (state: RootState) => state.chat.meta;
export const selectChatError = (state: RootState) => state.chat.error;
export const selectChatConversations = (state: RootState) => state.chat.conversation;
