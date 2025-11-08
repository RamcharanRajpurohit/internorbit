import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import slices
import authSlice from './slices/authSlice';
import profileSlice from './slices/profileSlice';
import internshipSlice from './slices/internshipSlice';
import applicationSlice from './slices/applicationSlice';
import interactionSlice from './slices/savedSlice';

// Import clear actions
import { clearAllApplicationData } from './slices/applicationSlice';
import { clearAllInteractionData } from './slices/savedSlice';
import { clearAllInternshipData } from './slices/internshipSlice';
import { clearProfiles } from './slices/profileSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'profile', 'application', 'interaction', 'internship'], // Persist all user data for better UX
};

// Root reducer
const rootReducer = combineReducers({
  auth: authSlice,
  profile: profileSlice,
  internship: internshipSlice,
  application: applicationSlice,
  interaction: interactionSlice,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat((store: any) => (next: any) => (action: any) => {
      // Handle signout action to clear all data
      if (action.type === 'auth/signOut/fulfilled') {
        // Clear all application, interaction and internship data when signout completes
        store.dispatch(clearAllApplicationData());
        store.dispatch(clearAllInteractionData());
        store.dispatch(clearAllInternshipData());
        store.dispatch(clearProfiles());
      }
      return next(action);
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;