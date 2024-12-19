import employeeReducer, {
    addEmployee,
    updateEmployee,
    deleteEmployee,
    changeReportingLine,
    selectAllEmployees,
    selectEmployeeById
  } from '../../store/slices/employeeSlice';
  
  describe('Employee Slice', () => {
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
  
    describe('reducers', () => {
      it('should handle initial state', () => {
        expect(employeeReducer(undefined, { type: 'unknown' })).toEqual(initialState);
      });
  
      it('should handle addEmployee', () => {
        const newEmployee = {
          name: 'John Doe',
          designation: 'Manager',
          email: 'john@example.com',
          phone: '1234567890'
        };
  
        const state = employeeReducer(initialState, addEmployee(newEmployee));
        
        // Check if employee was added
        const employeeId = state.allIds[0];
        expect(state.byId[employeeId]).toBeDefined();
        expect(state.byId[employeeId].name).toBe('John Doe');
        expect(state.version).toBe(1);
        expect(state.byId[employeeId].directReports).toEqual([]);
      });
  
      it('should handle updateEmployee', () => {
        // First add an employee
        const state = employeeReducer(
          initialState,
          addEmployee({
            id: 'emp-1',
            name: 'John Doe',
            designation: 'Manager'
          })
        );
  
        // Then update the employee
        const updatedState = employeeReducer(
          state,
          updateEmployee({
            id: 'emp-1',
            name: 'John Smith',
            designation: 'Senior Manager'
          })
        );
  
        expect(updatedState.byId['emp-1'].name).toBe('John Smith');
        expect(updatedState.byId['emp-1'].designation).toBe('Senior Manager');
        expect(updatedState.version).toBeGreaterThan(state.version);
      });
  
      it('should handle deleteEmployee', () => {
        // Setup initial state with an employee
        const stateWithEmployee = employeeReducer(
          initialState,
          addEmployee({
            id: 'emp-1',
            name: 'John Doe',
            designation: 'Manager'
          })
        );
  
        // Delete the employee
        const finalState = employeeReducer(
          stateWithEmployee,
          deleteEmployee('emp-1')
        );
  
        expect(finalState.byId['emp-1']).toBeUndefined();
        expect(finalState.allIds).not.toContain('emp-1');
        expect(finalState.version).toBeGreaterThan(stateWithEmployee.version);
      });
  
      it('should handle changeReportingLine', () => {
        // Setup initial state with manager and employee
        let state = employeeReducer(
          initialState,
          addEmployee({
            id: 'manager-1',
            name: 'Manager One',
            designation: 'Senior Manager'
          })
        );
  
        state = employeeReducer(
          state,
          addEmployee({
            id: 'emp-1',
            name: 'Employee One',
            designation: 'Developer',
            managerId: null
          })
        );
  
        // Change reporting line
        const finalState = employeeReducer(
          state,
          changeReportingLine.fulfilled({
            employeeId: 'emp-1',
            newManagerId: 'manager-1',
            oldManagerId: null
          }, '')
        );
  
        expect(finalState.byId['emp-1'].managerId).toBe('manager-1');
        expect(finalState.byId['manager-1'].directReports).toContain('emp-1');
      });
    });
  
    describe('selectors', () => {
      it('should select all employees', () => {
        const state = {
          employees: {
            byId: {
              'emp-1': { id: 'emp-1', name: 'John' },
              'emp-2': { id: 'emp-2', name: 'Jane' }
            },
            allIds: ['emp-1', 'emp-2']
          }
        };
  
        const employees = selectAllEmployees(state);
        expect(employees).toHaveLength(2);
        expect(employees[0].name).toBe('John');
        expect(employees[1].name).toBe('Jane');
      });
  
      it('should select employee by id', () => {
        const state = {
          employees: {
            byId: {
              'emp-1': { id: 'emp-1', name: 'John' }
            },
            allIds: ['emp-1']
          }
        };
  
        const employee = selectEmployeeById(state, 'emp-1');
        expect(employee.name).toBe('John');
      });
    });
  });