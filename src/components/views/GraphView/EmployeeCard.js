import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  useTheme,
  Tooltip
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import EmailIcon from '@mui/icons-material/Mail';
import PhoneIcon from '@mui/icons-material/Phone';

import { deleteEmployee } from '../../../store/slices/employeeSlice';
import { 
  toggleBookmark,
  selectIsEmployeeBookmarked 
} from '../../../store/slices/bookmarkSlice';
import EmployeeModal from '../../shared/EmployeeModal';
import DeleteConfirmationDialog from '../../shared/DeleteConfirmationDialog';
import ChangeManagerDialog from '../../shared/ChangeManagerDialog';
import styles from './GraphView.module.css';

const EmployeeCard = ({
  employee,
  isSelected,
  isParentOfSelected,
  isChildOfSelected,
  onSelect,
  disabled
}) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // Get bookmark state for this employee
  const isBookmarked = useSelector(state => 
    selectIsEmployeeBookmarked(state, employee.id)
  );

  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  // Modal states
  const [modalState, setModalState] = useState({
    type: null,
    open: false
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [changeManagerOpen, setChangeManagerOpen] = useState(false);

  const handleBookmarkToggle = (event) => {
    event.stopPropagation();
    dispatch(toggleBookmark(employee.id));
  };

  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddReportee = () => {
    setModalState({
      type: 'add-reportee',
      open: true
    });
    handleMenuClose();
  };

  const handleEdit = () => {
    setModalState({
      type: 'edit',
      open: true
    });
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleChangeManager = () => {
    setChangeManagerOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteEmployee(employee.id));
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete employee:', error);
    }
  };

  // Get card style based on selection state
  const getCardStyle = () => {
    const baseStyle = {
      backgroundColor: isDarkMode ? 'rgba(33, 49, 51, 0.8)' : 'rgba(255, 255, 255, 0.9)',
      padding: '16px',
      borderRadius: '8px',
      height: '100%',
      boxShadow: isDarkMode
        ? '0 0 20px rgba(0, 0, 0, 0.3)'
        : '0 0 20px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(8px)',
      transition: 'all 0.2s ease',
      cursor: disabled ? 'default' : 'pointer',
      border: '2px solid transparent'
    };

    if (isSelected) {
      return {
        ...baseStyle,
        backgroundColor: isDarkMode 
          ? 'rgba(144, 202, 249, 0.2)' 
          : 'rgba(25, 118, 210, 0.1)',
        border: `2px solid ${isDarkMode ? '#90caf9' : '#1976d2'}`,
        transform: 'scale(1.02)'
      };
    }

    if (isParentOfSelected) {
      return {
        ...baseStyle,
        backgroundColor: isDarkMode 
          ? 'rgba(144, 202, 249, 0.1)' 
          : 'rgba(25, 118, 210, 0.05)',
        border: `2px solid ${isDarkMode ? 'rgba(144, 202, 249, 0.5)' : 'rgba(25, 118, 210, 0.5)'}`
      };
    }

    return baseStyle;
  };

  // Get text colors based on theme
  const textColorPrimary = isDarkMode ? '#ffffff' : 'rgba(0, 0, 0, 0.87)';
  const textColorSecondary = isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)';

  return (
    <>
      <Box
        data-testid="employee-card"
        onClick={disabled ? undefined : onSelect}
        sx={getCardStyle()}
      >
        {/* Header with Avatar and Menu */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <div className={styles.avatar} data-testid="employee-avatar">
              {employee.name.charAt(0)}
            </div>
            <div>
              <div data-testid="employee-name" style={{ fontSize: '16px', fontWeight: 500, color: textColorPrimary }}>
                {employee.name}
              </div>
              <div data-testid="employee-designation" style={{ fontSize: '14px', color: textColorSecondary, marginTop: '4px' }}>
                {employee.designation}
              </div>
            </div>
          </Box>
          <Box>
            <Tooltip title={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}>
              <IconButton
                data-testid="bookmark-button"
                size="small"
                onClick={handleBookmarkToggle}
                disabled={disabled}
                sx={{
                  color: isBookmarked ? theme.palette.primary.main : textColorSecondary,
                  padding: '4px',
                  '&:hover': {
                    backgroundColor: isDarkMode
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
              </IconButton>
            </Tooltip>
            <IconButton
              data-testid="menu-button"
              size="small"
              onClick={handleMenuClick}
              disabled={disabled}
              sx={{
                color: textColorSecondary,
                padding: '4px',
                '&:hover': {
                  backgroundColor: isDarkMode
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Contact Info */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <div 
          data-testid="employee-email"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: textColorSecondary,
            fontSize: '14px'
          }}>
            <EmailIcon fontSize="small" />
            <span>{employee.email}</span>
          </div>
          <div 
          data-testid="employee-phone"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: textColorSecondary,
            fontSize: '14px'
          }}>
            <PhoneIcon fontSize="small" />
            <span>{employee.phone}</span>
          </div>
        </Box>
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        data-testid="employee-menu"
        PaperProps={{
          sx: {
            backgroundColor: isDarkMode
              ? 'rgba(33, 49, 51, 0.2)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            boxShadow: theme.shadows[4],
            '& .MuiMenuItem-root': {
              color: textColorPrimary,
              fontSize: '14px',
              padding: '8px 16px',
              '&:hover': {
                backgroundColor: isDarkMode
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.04)',
              },
            },
          },
        }}
      >
        <MenuItem onClick={handleAddReportee} data-testid="add-reportee">
          <ListItemIcon>
            <PersonAddIcon fontSize="small" />
          </ListItemIcon>
          Add Reportee
        </MenuItem>
        <MenuItem onClick={handleEdit} data-testid="edit-employee">
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit Details
        </MenuItem>
        <MenuItem onClick={handleChangeManager} data-testid="change-manager">
          <ListItemIcon>
            <AccountTreeIcon fontSize="small" />
          </ListItemIcon>
          Change Reporting Line
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} data-testid="delete-employee">
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Delete Employee
        </MenuItem>
      </Menu>

      {/* Modals */}
      <EmployeeModal
        open={modalState.open}
        onClose={() => setModalState({ type: null, open: false })}
        mode={modalState.type}
        employeeData={modalState.type === 'add-reportee' 
          ? { manager: employee }
          : employee
        }
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        employee={employee}
      />

      <ChangeManagerDialog
        open={changeManagerOpen}
        onClose={() => setChangeManagerOpen(false)}
        employee={employee}
      />
    </>
  );
};

export default EmployeeCard;