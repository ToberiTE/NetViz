import { combineReducers, configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './reducers/dashboardSlice';

const rootReducer = combineReducers({
    dashboardReducer,
})

const store = configureStore({
    reducer: rootReducer
})

export type RootState = ReturnType<typeof store.getState>;

export default store;