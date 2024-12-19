import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Button, Breadcrumbs, Link, Typography, Snackbar, Alert } from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import GraphView from './views/GraphView';
import GridView from './views/GridView';
import BookmarkDialog from './shared/BookmarkDialog';
import { 
  selectEmployeeById, 
  selectOrganizationHierarchy,
  selectEmployeeHierarchy,
  selectEmployeeAsync,
  clearSelectedEmployee 
} from '../store/slices/employeeSlice';

const OrgChart = ({ view }) => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [bookmarkDialogOpen, setBookmarkDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Get current employee and their hierarchy
  const currentEmployee = useSelector(state => 
    employeeId ? selectEmployeeById(state, employeeId) : null
  );
  
  const hierarchyData = useSelector(state =>
    employeeId ? selectEmployeeHierarchy(state, employeeId) : selectOrganizationHierarchy(state)
  );

  // Load employee data when URL changes
  useEffect(() => {
    if (employeeId) {
      dispatch(selectEmployeeAsync(employeeId))
        .unwrap()
        .catch(error => {
          setErrorMessage('Failed to load employee data');
          console.error('Error loading employee:', error);
          navigate('/org-chart');
        });
    } else {
      dispatch(clearSelectedEmployee());
    }
  }, [employeeId, dispatch, navigate]);

  // Handle employee selection
  const handleEmployeeSelect = (id) => {
    navigate(`/org-chart/employee/${id}`);
  };

  // Handle reset view
  const handleResetView = () => {
    navigate('/org-chart');
  };

  // Handle bookmark
  const handleBookmark = async (bookmarkName) => {
  };

  // Get breadcrumb trail
  const getBreadcrumbTrail = () => {
    if (!currentEmployee) return [];
    
    const trail = [];
    let current = currentEmployee;
    
    while (current) {
      trail.unshift(current);
      current = useSelector(state => 
        current.managerId ? selectEmployeeById(state, current.managerId) : null
      );
    }
    
    return trail;
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%',
      p: 3
    }}>
      {/* Header with breadcrumbs and actions */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2
      }}>
        <Breadcrumbs>
          <Link
            component="button"
            variant="body1"
            onClick={handleResetView}
            sx={{ textDecoration: 'none' }}
          >
            Organization
          </Link>
          {getBreadcrumbTrail().map((emp, index) => {
            const isLast = index === getBreadcrumbTrail().length - 1;
            return isLast ? (
              <Typography key={emp.id} color="text.primary">
                {emp.name}
              </Typography>
            ) : (
              <Link
                key={emp.id}
                component="button"
                variant="body1"
                onClick={() => handleEmployeeSelect(emp.id)}
                sx={{ textDecoration: 'none' }}
              >
                {emp.name}
              </Link>
            );
          })}
        </Breadcrumbs>

        <Button
          startIcon={<BookmarkIcon />}
          onClick={() => setBookmarkDialogOpen(true)}
          variant="outlined"
        >
          Bookmark View
        </Button>
      </Box>

      {/* Main content */}
      <Box sx={{ flexGrow: 1, position: 'relative' }} data-testid={view === 'graph' ? 'graph-view-container' : 'grid-view-container'}>
        {view === 'graph' ? (
          <GraphView
            data={hierarchyData}
            selectedEmployee={currentEmployee}
            onEmployeeSelect={handleEmployeeSelect}
            onResetView={handleResetView}
          />
        ) : (
          <GridView
            data={hierarchyData}
            onEmployeeSelect={handleEmployeeSelect}
          />
        )}
      </Box>

      {/* Dialogs and notifications */}
      <BookmarkDialog
        open={bookmarkDialogOpen}
        onClose={() => setBookmarkDialogOpen(false)}
        onSave={handleBookmark}
        currentEmployee={currentEmployee}
      />

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

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={() => setErrorMessage('')} 
          severity="error"
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrgChart;