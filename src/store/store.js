import { configureStore } from '@reduxjs/toolkit';
import employeeReducer, { persistEmployees, persistMiddleware } from './slices/employeeSlice';
import themeReducer from './slices/themeSlice';
import bookmarkReducer from './slices/bookmarkSlice';
import designationReducer from './slices/designationSlice';

const persistenceMiddleware = store => {
  let timeoutId = null;
  
  return next => action => {
    const result = next(action);
    
    // Only persist for employee-related actions that modify data
    if (action.type.startsWith('employees/') && 
        !action.type.includes('persist') && 
        !action.type.includes('load')) {
      
      // Clear existing timeout to debounce multiple rapid changes
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Debounce persistence to avoid excessive writes
      timeoutId = setTimeout(() => {
        try {
          store.dispatch(persistEmployees());
        } catch (error) {
          console.error('Persistence failed:', error);
          // Could dispatch an error action here if needed
        }
      }, 1000); // 1 second debounce
    }
    
    return result;
  };
};


const store = configureStore({
  reducer: {
    employees: employeeReducer,
    theme: themeReducer,
    bookmarks: bookmarkReducer,
    designations: designationReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types in serializability checks
        ignoredActions: [
          'employees/addEmployee',
          'employees/updateEmployee',
          'employees/persistEmployees/fulfilled',
          'employees/loadEmployees/fulfilled',
          'bookmarks/saveBookmark/fulfilled'
        ],
      },
    }).concat(persistenceMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;