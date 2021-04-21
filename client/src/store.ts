import { TypedUseSelectorHook, useSelector as useReduxSelector } from 'react-redux';
import { configureStore, getDefaultMiddleware, createSlice } from '@reduxjs/toolkit';

import { State } from './types';

const initialState: State = {
  requests: 0,
  error: null,
  user: null,
  ownedGroups: [],
  users: [],
  groups: []
};

export const { actions, reducer } = createSlice({
  name: 'store',
  initialState,
  reducers: {
    set: (state, action) => ({ ...state, ...action.payload }),
    changeRequests: (state, action) => {
      state.requests += action.payload;
    },
    updateGroup: (state, action) => {
      const { index, ...update } = action.payload;

      if (update.status === 'deleted' && state.groups[index].status === 'new') {
        state.groups.splice(index, 1);
      } else {
        state.groups[index] = {
          ...state.groups[index],
          ...update
        };

        if (state.groups[index].status === 'unchanged') state.groups[index].status = 'changed';
      }
    }
  }
});

const store = configureStore({
  reducer,
  devTools: true,
  middleware: getDefaultMiddleware()
});

export default store;

export { useDispatch } from 'react-redux';

export const useSelector: TypedUseSelectorHook<State> = useReduxSelector;
