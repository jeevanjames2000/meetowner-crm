import { configureStore } from "@reduxjs/toolkit";


import authentication from './slices/authSlice';
import userSlice from './slices/userslice';
import propertyDetails from './slices/propertyDetails';
import leadSlice from './slices/leadslice';
import projectSlice from './slices/projectSlice';
import builderReducer from './slices/builderslice';


import { initializeAuthState } from "../utils/authutils";

const preloadedState = {
    auth : initializeAuthState()
}

const store =  configureStore({
    reducer : {
        auth:authentication,
        user:userSlice,
        property:propertyDetails,
        lead:leadSlice,
        projects:projectSlice,
        builder:builderReducer
    },
    preloadedState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
    devTools: true
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

