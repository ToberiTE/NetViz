import { combineReducers, configureStore } from '@reduxjs/toolkit';
import Reducer from './reducers/Slice';

const rootReducer = combineReducers({
    Reducer,
})

const store = configureStore({
    reducer: rootReducer
})

export type RootState = ReturnType<typeof store.getState>;

export default store;