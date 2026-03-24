import { createSlice } from '@reduxjs/toolkit';
import { prInitialState } from '../../types/pullrequest/pullrequest.types';
import { createPRThunk, listPRThunk, getPRThunk, mergePRThunk, closePRThunk } from './prThunk';

const prSlice = createSlice({
  name: 'pullrequest',
  initialState: prInitialState,
  reducers: {
    clearSelectedPR: (state) => {
      state.selectedPR = null;
    },
    clearPRError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      //create
      .addCase(createPRThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPRThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.prs.unshift(action.payload);
      })
      .addCase(createPRThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // list
      .addCase(listPRThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(listPRThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.prs = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(listPRThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // get single
      .addCase(getPRThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPRThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedPR = action.payload;
      })
      .addCase(getPRThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      //merge
      .addCase(mergePRThunk.pending, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(mergePRThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.prs = state.prs.map((pr) => (pr.id === action.payload.id ? action.payload : pr));
        if (state.selectedPR?.id === action.payload.id) {
          state.selectedPR = action.payload;
        }
      })
      .addCase(mergePRThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      //close
      .addCase(closePRThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(closePRThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.prs = state.prs.map((pr) => (pr.id === action.payload.id ? action.payload : pr));
        if (state.selectedPR?.id === action.payload.id) {
          state.selectedPR = action.payload;
        }
      })
      .addCase(closePRThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedPR, clearPRError } = prSlice.actions;
export default prSlice.reducer;
