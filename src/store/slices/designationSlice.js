import { createSlice } from '@reduxjs/toolkit';

const initialDesignations = [
  'Chief Executive Officer',
  'Chief Technology Officer',
  'Engineering Director',
  'Engineering Manager',
  'Senior Software Engineer',
  'Software Engineer',
  'Junior Software Engineer',
  'Product Manager',
  'Project Manager',
  'Business Analyst',
  'Quality Assurance Engineer',
  'UX Designer',
  'UI Developer',
  'DevOps Engineer',
  'System Administrator'
];

const initialState = {
  designations: initialDesignations,
  loading: false,
  error: null
};

const designationSlice = createSlice({
  name: 'designations',
  initialState,
  reducers: {
    addDesignation: (state, action) => {
      if (!state.designations.includes(action.payload)) {
        state.designations.push(action.payload);
      }
    },
    removeDesignation: (state, action) => {
      state.designations = state.designations.filter(d => d !== action.payload);
    },
    updateDesignation: (state, action) => {
      const { oldDesignation, newDesignation } = action.payload;
      const index = state.designations.indexOf(oldDesignation);
      if (index !== -1) {
        state.designations[index] = newDesignation;
      }
    }
  }
});

export const {
  addDesignation,
  removeDesignation,
  updateDesignation
} = designationSlice.actions;

export const selectAllDesignations = state => state.designations.designations;

export default designationSlice.reducer;