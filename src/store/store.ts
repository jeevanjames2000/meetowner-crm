import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web

import authentication from './slices/authSlice';
import userSlice from './slices/userslice';
import propertyDetails from './slices/propertyDetails';
import leadSlice from './slices/leadslice';
import projectSlice from './slices/projectSlice';
import places from "./slices/places";
import builderReducer from './slices/builderslice';

import { initializeAuthState } from "../utils/authutils";

// Persist config (only for auth slice)
const authPersistConfig = {
    key: "auth",
    storage,
    whitelist: ["isAuthenticated", "token", "user"], // only these fields will persist
};

// Combine reducers
const rootReducer = combineReducers({
    auth: persistReducer(authPersistConfig, authentication),
    user: userSlice,
    property: propertyDetails,
    lead: leadSlice,
    projects: projectSlice,
    builder: builderReducer,
    places: places
});

const preloadedState = {
    auth: initializeAuthState()
};

const store = configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
    devTools: true,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
