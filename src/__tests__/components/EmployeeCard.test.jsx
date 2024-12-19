// src/__tests__/components/EmployeeCard.test.jsx
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material';
import configureStore from 'redux-mock-store';
import EmployeeCard from '../../components/views/GraphView/EmployeeCard';

const mockStore = configureStore([]);

describe('EmployeeCard', () => {
  const theme = createTheme();
  let store;
  
  const employee = {
    id: 'emp-1',
    name: 'John Doe',
    designation: 'Senior Developer',
    email: 'john@example.com',
    phone: '123-456-7890'
  };

  beforeEach(() => {
    store = mockStore({
      bookmarks: {
        bookmarkedEmployees: {}
      }
    });
    store.dispatch = jest.fn();
  });

  const renderEmployeeCard = (props = {}) => {
    return render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <EmployeeCard 
            employee={employee}
            isSelected={false}
            isParentOfSelected={false}
            isChildOfSelected={false}
            onSelect={() => {}}
            {...props}
          />
        </ThemeProvider>
      </Provider>
    );
  };

  it('renders employee information correctly', () => {
    renderEmployeeCard();

    expect(screen.getByText(employee.name)).toBeInTheDocument();
    expect(screen.getByText(employee.designation)).toBeInTheDocument();
    expect(screen.getByText(employee.email)).toBeInTheDocument();
    expect(screen.getByText(employee.phone)).toBeInTheDocument();
  });

  it('handles selection when clicked', () => {
    const onSelect = jest.fn();
    renderEmployeeCard({ onSelect });

    fireEvent.click(screen.getByText(employee.name));
    expect(onSelect).toHaveBeenCalled();
  });

  it('shows context menu with correct options', () => {
    renderEmployeeCard();
    
    // Open menu
    const menuButton = screen.getByTestId('menu-button');
    fireEvent.click(menuButton);

    // Check menu options
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems).toHaveLength(4); // Add Reportee, Edit, Change Manager, Delete

    const menuTexts = menuItems.map(item => within(item).getByText(/.*/).textContent);
    expect(menuTexts).toContain('Add Reportee');
    expect(menuTexts).toContain('Edit Details');
    expect(menuTexts).toContain('Change Reporting Line');
    expect(menuTexts).toContain('Delete Employee');
  });

  it('applies correct styles when selected', () => {
    renderEmployeeCard({ isSelected: true });
    
    const card = screen.getByTestId('employee-card');
    expect(card).toHaveStyle({
      transform: 'scale(1.02)'
    });
  });

  it('handles bookmark toggle', () => {
    renderEmployeeCard();
    
    const bookmarkButton = screen.getByTestId('bookmark-button');
    fireEvent.click(bookmarkButton);
    
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining('bookmarks/toggleBookmark')
      })
    );
  });

  // Test error states
  it('shows error state when operations fail', async () => {
    store = mockStore({
      bookmarks: {
        bookmarkedEmployees: {}
      },
      employees: {
        error: 'Failed to update employee'
      }
    });

    renderEmployeeCard();
    
    const menuButton = screen.getByTestId('menu-button');
    fireEvent.click(menuButton);
    
    const editButton = screen.getByText('Edit Details');
    fireEvent.click(editButton);
    
    expect(screen.getByText('Failed to update employee')).toBeInTheDocument();
  });
});