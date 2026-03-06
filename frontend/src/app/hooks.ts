import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from './store';

//using these instead of plain useDispatch and useSelector
//they are type to our store so no need to every time

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T => useSelector(selector);
