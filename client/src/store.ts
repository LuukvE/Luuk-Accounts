import { TypedUseSelectorHook, useSelector as useReduxSelector } from 'react-redux';
import { configureStore, getDefaultMiddleware, createSlice } from '@reduxjs/toolkit';

import { State } from './types';

const initialState: State = {
  error: '',
  user: null
};

// Actions are generated from the methods inside the reducers property
export const { actions, reducer } = createSlice({
  name: 'store',
  initialState,
  reducers: {
    set: (state, action) => ({ ...state, ...action.payload })
  }
});

const store = configureStore({
  reducer,
  devTools: true,
  middleware: getDefaultMiddleware()
});

export default store;

export { useDispatch } from 'react-redux';

// Export a typed version of the useSelector hook
export const useSelector: TypedUseSelectorHook<State> = useReduxSelector;
