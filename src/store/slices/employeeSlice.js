import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { persistenceService } from '../../services/persistenceService';

export const loadEmployees = createAsyncThunk(
  'employees/loadEmployees',
  async (_, { rejectWithValue }) => {
    try {
      const result = persistenceService.loadData();
      if (result?.data) {
        return result.data;
      }
      return { byId: {}, allIds: [], version: 0 };
    } catch (error) {
      console.error('Error loading employees:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const persistEmployees = createAsyncThunk(
  'employees/persistEmployees',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { employees } = getState();
      const dataToStore = {
        byId: employees.byId,
        allIds: employees.allIds,
        version: employees.version
      };
      
      // Use the enhanced persistence service
      const success = persistenceService.saveData(dataToStore);
      if (!success) {
        throw new Error('Failed to persist data');
      }
      return dataToStore;
    } catch (error) {
      console.error('Error persisting employees:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const changeReportingLine = createAsyncThunk(
  'employees/changeReportingLine',
  async ({ employeeId, newManagerId }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const employee = state.employees.byId[employeeId];
      
      if (!employee) {
        throw new Error('Employee not found');
      }

      return {
        employeeId,
        newManagerId,
        oldManagerId: employee.managerId
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// New async thunk for employee selection
export const selectEmployeeAsync = createAsyncThunk(
  'employees/selectEmployee',
  async (employeeId, { getState, dispatch }) => {
    const state = getState();
    const employee = state.employees.byId[employeeId];
    
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Load hierarchy data for the selected employee
    const manager = employee.managerId ? state.employees.byId[employee.managerId] : null;
    const directReports = employee.directReports?.map(id => state.employees.byId[id]) || [];

    return {
      employee,
      manager,
      directReports
    };
  }
);

const initialState = {
  byId: {},
  allIds: [],
  version: 0,
  loading: false,
  error: null,
  selectedEmployee: null,
  selectedEmployeeData: {
    manager: null,
    directReports: [],
    loading: false,
    error: null
  },
  persistenceStatus: {
    lastSaved: null,
    lastError: null,
    pending: false
  }
};

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    addEmployee: (state, action) => {
      const newEmployee = {
        ...action.payload,
        id: action.payload.id || `emp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        directReports: [],
        managerId: action.payload.managerId || null
      };
      
      state.byId[newEmployee.id] = newEmployee;
      if (!state.allIds.includes(newEmployee.id)) {
        state.allIds.push(newEmployee.id);
      }

      if (newEmployee.managerId && state.byId[newEmployee.managerId]) {
        const manager = state.byId[newEmployee.managerId];
        if (!manager.directReports) {
          manager.directReports = [];
        }
        if (!manager.directReports.includes(newEmployee.id)) {
          manager.directReports.push(newEmployee.id);
        }
      }
      state.version += 1;
    },
    
    updateEmployee: (state, action) => {
      const { id, ...updates } = action.payload;
      if (state.byId[id]) {
        state.byId[id] = {
          ...state.byId[id],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        state.version += 1;
      }
    },
    
    deleteEmployee: (state, action) => {
      const employeeId = action.payload;
      const employee = state.byId[employeeId];
      
      if (employee) {
        if (employee.managerId && state.byId[employee.managerId]) {
          state.byId[employee.managerId].directReports = 
            state.byId[employee.managerId].directReports.filter(id => id !== employeeId);
        }
        
        if (employee.directReports?.length > 0) {
          employee.directReports.forEach(reporteeId => {
            if (state.byId[reporteeId]) {
              state.byId[reporteeId].managerId = employee.managerId;
              
              if (employee.managerId && state.byId[employee.managerId]) {
                if (!state.byId[employee.managerId].directReports.includes(reporteeId)) {
                  state.byId[employee.managerId].directReports.push(reporteeId);
                }
              }
            }
          });
        }
        
        delete state.byId[employeeId];
        state.allIds = state.allIds.filter(id => id !== employeeId);
        state.version += 1;
      }
    },
    
    clearSelectedEmployee: (state) => {
      state.selectedEmployee = null;
      state.selectedEmployeeData = {
        manager: null,
        directReports: [],
        loading: false,
        error: null
      };
    },
    selectEmployee(state, action) {
      state.selectedId = action.payload;
    },
    addBookmark(state, action) {
      if (!state.bookmarks.includes(action.payload)) {
        state.bookmarks.push(action.payload);
      }
    },
    removeBookmark(state, action) {
      state.bookmarks = state.bookmarks.filter(id => id !== action.payload);
    },
    clearBookmarks(state) {
      state.bookmarks = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadEmployees.fulfilled, (state, action) => {
        state.byId = action.payload.byId;
        state.allIds = action.payload.allIds;
        state.version = action.payload.version;
        state.loading = false;

        Object.values(state.byId).forEach(employee => {
          if (!employee.directReports) {
            employee.directReports = [];
          }
        });
      })
      .addCase(loadEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load employees';
      })
      // Persist employees handlers
      .addCase(persistEmployees.pending, (state) => {
        state.persistenceStatus.pending = true;
        state.persistenceStatus.lastError = null;
      })
      .addCase(persistEmployees.fulfilled, (state, action) => {
        state.persistenceStatus = {
          lastSaved: new Date().toISOString(),
          lastError: null,
          pending: false
        };
      })
      .addCase(persistEmployees.rejected, (state, action) => {
        state.persistenceStatus = {
          ...state.persistenceStatus,
          lastError: action.payload,
          pending: false
        };
      })
      .addCase(changeReportingLine.fulfilled, (state, action) => {
        const { employeeId, newManagerId, oldManagerId } = action.payload;
        const employee = state.byId[employeeId];

        if (!employee) return;

        if (oldManagerId && state.byId[oldManagerId]) {
          state.byId[oldManagerId].directReports = 
            state.byId[oldManagerId].directReports.filter(id => id !== employeeId);
        }

        if (newManagerId && state.byId[newManagerId]) {
          if (!state.byId[newManagerId].directReports) {
            state.byId[newManagerId].directReports = [];
          }
          if (!state.byId[newManagerId].directReports.includes(employeeId)) {
            state.byId[newManagerId].directReports.push(employeeId);
          }
        }

        employee.managerId = newManagerId || null;
        employee.updatedAt = new Date().toISOString();
        state.version += 1;
      })
      .addCase(selectEmployeeAsync.pending, (state) => {
        state.selectedEmployeeData.loading = true;
        state.selectedEmployeeData.error = null;
      })
      .addCase(selectEmployeeAsync.fulfilled, (state, action) => {
        const { employee, manager, directReports } = action.payload;
        state.selectedEmployee = employee;
        state.selectedEmployeeData = {
          manager,
          directReports,
          loading: false,
          error: null
        };
      })
      .addCase(selectEmployeeAsync.rejected, (state, action) => {
        state.selectedEmployeeData.loading = false;
        state.selectedEmployeeData.error = action.error.message;
        state.selectedEmployee = null;
      });
  }
});

// Selectors
export const selectAllEmployees = createSelector(
  state => state.employees,
  employees => employees.allIds.map(id => employees.byId[id])
);

export const selectEmployeeById = createSelector(
  [state => state.employees.byId, (_, id) => id],
  (employeesById, id) => employeesById[id]
);

export const selectDirectReports = createSelector(
  [state => state.employees.byId, (_, employeeId) => employeeId],
  (employeesById, employeeId) => {
    const employee = employeesById[employeeId];
    if (!employee?.directReports) return [];
    return employee.directReports.map(id => employeesById[id]).filter(Boolean);
  }
);

export const selectSelectedEmployeeData = createSelector(
  state => state.employees,
  employees => ({
    employee: employees.selectedEmployee,
    ...employees.selectedEmployeeData
  })
);

export const selectEmployeeHierarchy = createSelector(
  [state => state.employees.byId, (_, employeeId) => employeeId],
  (employeesById, employeeId) => {
    if (!employeeId || !employeesById[employeeId]) return null;

    const buildHierarchy = (id) => {
      const employee = employeesById[id];
      if (!employee) return null;

      return {
        ...employee,
        children: employee.directReports
          .map(reportId => buildHierarchy(reportId))
          .filter(Boolean)
      };
    };

    return buildHierarchy(employeeId);
  }
);

export const selectOrganizationHierarchy = createSelector(
  [state => state.employees.byId],
  (employeesById) => {
    const buildHierarchy = (managerId) => {
      const directReports = Object.values(employeesById)
        .filter(emp => emp.managerId === managerId)
        .map(emp => ({
          ...emp,
          children: buildHierarchy(emp.id)
        }));
        
      return directReports;
    };
    
    const root = Object.values(employeesById).find(emp => !emp.managerId);
    
    return root ? {
      ...root,
      children: buildHierarchy(root.id)
    } : null;
  }
);

// Export actions and middleware
export const {
  addEmployee,
  updateEmployee,
  deleteEmployee,
  clearSelectedEmployee,
  selectEmployee,
  addBookmark,
  removeBookmark,
  clearBookmarks
} = employeeSlice.actions;

// Enhanced middleware to handle persistence failures
export const persistMiddleware = store => next => action => {
  const result = next(action);
  
  if (action.type.startsWith('employees/') && 
      !action.type.includes('persist') && 
      !action.type.includes('load')) {
    const state = store.getState();
    
    // Only persist if there are no pending persistence operations
    if (!state.employees.persistenceStatus.pending) {
      store.dispatch(persistEmployees());
    }
  }
  
  return result;
};

// Enhanced selectors
export const selectPersistenceStatus = state => state.employees.persistenceStatus;

export const selectHasUnsavedChanges = createSelector(
  [state => state.employees.version, state => state.employees.persistenceStatus],
  (version, persistenceStatus) => {
    if (persistenceStatus.pending) return true;
    if (!persistenceStatus.lastSaved) return true;
    return false;
  }
);

export default employeeSlice.reducer;