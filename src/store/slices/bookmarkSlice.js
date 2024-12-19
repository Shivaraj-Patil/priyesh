import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bookmarkedEmployees: {}  // Using employeeId as key
};

const bookmarkSlice = createSlice({
  name: 'bookmarks',
  initialState,
  reducers: {
    toggleBookmark: (state, action) => {
      const employeeId = action.payload;
      if (state.bookmarkedEmployees[employeeId]) {
        delete state.bookmarkedEmployees[employeeId];
      } else {
        state.bookmarkedEmployees[employeeId] = {
          timestamp: Date.now()
        };
      }
      // Persist to localStorage
      try {
        localStorage.setItem('orgChartBookmarks', JSON.stringify(state.bookmarkedEmployees));
      } catch (error) {
        console.error('Failed to save bookmarks:', error);
      }
    },
    loadBookmarks: (state) => {
      try {
        const savedBookmarks = localStorage.getItem('orgChartBookmarks');
        if (savedBookmarks) {
          state.bookmarkedEmployees = JSON.parse(savedBookmarks);
        }
      } catch (error) {
        console.error('Failed to load bookmarks:', error);
        state.bookmarkedEmployees = {};
      }
    }
  }
});

// Action Creators
export const { toggleBookmark, loadBookmarks } = bookmarkSlice.actions;

// Selectors
export const selectBookmarkedEmployees = (state) => state.bookmarks.bookmarkedEmployees;
export const selectIsEmployeeBookmarked = (state, employeeId) => 
  !!state.bookmarks.bookmarkedEmployees[employeeId];

export default bookmarkSlice.reducer;