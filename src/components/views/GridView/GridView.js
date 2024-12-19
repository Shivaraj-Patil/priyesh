import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, 
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Snackbar,
  ListItemIcon,
  CircularProgress
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { selectAllEmployees, deleteEmployee } from '@store/slices/employeeSlice';
import EmployeeModal from '@components/shared/EmployeeModal';
import DeleteConfirmationDialog from '@components/shared/DeleteConfirmationDialog';
import ChangeManagerDialog from '@components/shared/ChangeManagerDialog';
import BookmarkDialog from '@components/shared/BookmarkDialog';
import styles from './GridView.module.css';
import ManageDesignations from '@components/shared/ManageDesignations';
import SettingsIcon from '@mui/icons-material/Settings';

const GridView = ({ onEmployeeClick }) => {
  const dispatch = useDispatch();
  const employees = useSelector(selectAllEmployees);
  const loading = useSelector(state => state.employees.loading);
  const initialized = useSelector(state => state.employees.initialized);
  
  // State management
  const [selectedRow, setSelectedRow] = useState(null);
  const [bookmarkDialogOpen, setBookmarkDialogOpen] = useState(false);
  const [manageDesignationsOpen, setManageDesignationsOpen] = useState(false);

  const [modalState, setModalState] = useState({
    open: false,
    mode: 'add',
    employeeData: null
  });
  
  const [deleteState, setDeleteState] = useState({
    open: false,
    employee: null,
    isDeleting: false
  });

  const [changeManagerState, setChangeManagerState] = useState({
    open: false,
    employee: null
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Helper functions
  const getManagerName = useCallback((managerId) => {
    if (!managerId) return '-';
    const manager = employees.find(emp => emp.id === managerId);
    return manager ? manager.name : '-';
  }, [employees]);

  // Bookmark handlers
  const handleBookmarkOpen = (selectedRow) => {
    if (!selectedRow) {
      setSuccessMessage('Please select an employee first');
      return;
    }
    setBookmarkDialogOpen(true);
  };

  // Handle row click
  const handleRowClick = (employee) => {
    setSelectedRow(employee);
    onEmployeeClick?.(employee.id);
  };

  const handleBookmarkClose = () => {
    setBookmarkDialogOpen(false);
  };

  const handleBookmarkSuccess = (message) => {
    setSuccessMessage(message);
    setBookmarkDialogOpen(false);
  };

  const handleBookmarkNavigation = (bookmarkState) => {
    if (bookmarkState.employeeId) {
      // Use the existing onEmployeeClick prop for navigation
      onEmployeeClick?.(bookmarkState.employeeId);
    }
  };
  
  // Modal handlers
  const handleOpenModal = (mode = 'add', employeeData = null) => {
    setModalState({
      open: true,
      mode,
      employeeData
    });
    handleMenuClose();
  };

  const handleCloseModal = () => {
    setModalState({
      open: false,
      mode: 'add',
      employeeData: null
    });
  };

  // Change Manager handlers
  const handleChangeManagerClick = () => {
    setChangeManagerState({
      open: true,
      employee: selectedEmployee
    });
    handleMenuClose();
  };

  const handleChangeManagerClose = () => {
    setChangeManagerState({
      open: false,
      employee: null
    });
  };

  const handleChangeManagerSuccess = (message) => {
    setSuccessMessage(message);
    handleChangeManagerClose();
  };

  // Delete handlers
  const handleDeleteClick = () => {
    setDeleteState({
      open: true,
      employee: selectedEmployee
    });
    handleMenuClose();
  };

  const handleDeleteCancel = () => {
    setDeleteState({
      open: false,
      employee: null
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteState(prev => ({ ...prev, isDeleting: true }));
      dispatch(deleteEmployee(deleteState.employee.id));
      setSuccessMessage(`Successfully deleted ${deleteState.employee.name}`);
      handleDeleteCancel();
      
      if (employees.length % rowsPerPage === 1 && page === Math.ceil(employees.length / rowsPerPage) - 1) {
        setPage(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete employee:', error);
    }
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Menu handlers
  const handleMenuClick = (event, employee) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedEmployee(employee);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEmployee(null);
  };

  // Loading state
  if (loading && !initialized) {
    return (
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // Empty state render
  if (initialized && employees.length === 0) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={() => handleOpenModal('add')}
            data-testid="add-employee-btn"
            startIcon={<PersonAddIcon />}
          >
            Add Employee
          </Button>
        </Box>
        <Box sx={{ 
          flex: 1,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center'
        }}>
          <Box data-testid="empty-state" sx={{ 
            textAlign: 'center', 
            p: 3,
            maxWidth: '400px'
          }}>
            <AccountTreeIcon 
              sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} 
            />
            <Typography data-testid="empty-state-message" variant="h6" color="text.secondary" gutterBottom>
              No Organization Structure Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start building your organization chart by adding your first employee.
            </Typography>
          </Box>
        </Box>
        <EmployeeModal
          open={modalState.open}
          onClose={handleCloseModal}
          mode={modalState.mode}
          employeeData={modalState.employeeData}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper className={styles.gridContainer}>
        {/* Action Bar */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={() => setManageDesignationsOpen(true)}
            startIcon={<SettingsIcon />}
          >
            Manage Designations
          </Button>
          <Button 
            variant="contained"
            onClick={() => handleOpenModal('add')}
            startIcon={<PersonAddIcon />}
            data-testid="add-employee-btn"
          >
            Add Employee
          </Button>
        </Box>

        {/* Table */}
        <TableContainer sx={{ flex: 1 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Designation</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Manager</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((employee) => (
                  <TableRow 
                    key={employee.id}
                    hover
                    selected={selectedRow?.id === employee.id}
                    className={styles.row}
                    onClick={() => handleRowClick(employee)}
                    sx={{ 
                      cursor: 'pointer',
                      '&.Mui-selected': {
                        backgroundColor: theme => theme.palette.action.selected,
                      },
                      '&.Mui-selected:hover': {
                        backgroundColor: theme => theme.palette.action.hover,
                      },
                    }}
                  >
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.designation}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.phone}</TableCell>
                    <TableCell>{getManagerName(employee.managerId)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click when clicking menu
                          handleMenuClick(e, employee);
                        }}
                        className={styles.iconButton}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={employees.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          className={styles.pagination}
        />
      </Paper>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            minWidth: '180px',
            boxShadow: (theme) => theme.shadows[3],
            backgroundColor: theme => theme.palette.mode === 'dark' 
              ? 'rgba(33, 49, 51, 0.2)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            '& .MuiMenuItem-root': {
              fontSize: '14px',
              padding: '8px 16px',
            }
          }
        }}
      >
        <MenuItem onClick={() => handleOpenModal('add-reportee', { manager: selectedEmployee })}>
          <ListItemIcon>
            <PersonAddIcon fontSize="small" />
          </ListItemIcon>
          Add Reportee
        </MenuItem>
        <MenuItem onClick={() => handleOpenModal('edit', selectedEmployee)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit Details
        </MenuItem>
        <MenuItem onClick={handleChangeManagerClick}>
          <ListItemIcon>
            <AccountTreeIcon fontSize="small" />
          </ListItemIcon>
          Change Reporting Line
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Delete Employee
        </MenuItem>
      </Menu>

      {/* Modals */}
      <BookmarkDialog
        open={bookmarkDialogOpen}
        onClose={handleBookmarkClose}
        currentView="grid"
        currentEmployeeId={selectedEmployee?.id}
        onSuccess={handleBookmarkSuccess}
        onNavigate={handleBookmarkNavigation}
      />

      <EmployeeModal
        open={modalState.open}
        onClose={handleCloseModal}
        mode={modalState.mode}
        employeeData={modalState.employeeData}
      />

      <DeleteConfirmationDialog
        open={deleteState.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        employee={deleteState.employee}
        isDeleting={deleteState.isDeleting}
      />

      <ChangeManagerDialog
        open={changeManagerState.open}
        onClose={handleChangeManagerClose}
        employee={changeManagerState.employee}
        onSuccess={handleChangeManagerSuccess}
      />

      <ManageDesignations
        open={manageDesignationsOpen}
        onClose={() => setManageDesignationsOpen(false)}
      />

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={() => setSuccessMessage('')} 
          severity="success"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GridView;