import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Box,
  Typography,
  Tooltip
} from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import DeleteIcon from '@mui/icons-material/Delete';
import { 
  selectBookmarkedEmployees,
  loadBookmarks,
  toggleBookmark
} from '../../store/slices/bookmarkSlice';
import { selectAllEmployees } from '../../store/slices/employeeSlice';

const BookmarkDialog = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const bookmarkedEmployees = useSelector(selectBookmarkedEmployees);
  const allEmployees = useSelector(selectAllEmployees);

  // Load bookmarks when dialog opens
  useEffect(() => {
    if (open) {
      dispatch(loadBookmarks());
    }
  }, [open, dispatch]);

  const handleBookmarkClick = (employeeId) => {
    navigate(`/org-chart/employee/${employeeId}`);
    onClose();
  };

  const handleDeleteBookmark = (e, employeeId) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    dispatch(toggleBookmark(employeeId));
  };

  // Get sorted bookmarks with employee details
  const getBookmarkedEmployeesWithDetails = () => {
    return Object.entries(bookmarkedEmployees)
      .map(([employeeId, bookmark]) => {
        const employee = allEmployees.find(emp => emp.id === employeeId);
        return {
          ...employee,
          timestamp: bookmark.timestamp
        };
      })
      .filter(bookmark => bookmark.name) // Only include if employee still exists
      .sort((a, b) => b.timestamp - a.timestamp);
  };

  const bookmarkedList = getBookmarkedEmployeesWithDetails();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          backgroundImage: 'none'
        }
      }}
    >
      <DialogTitle sx={{ color: 'text.primary' }}>Bookmarked Employees</DialogTitle>
      <DialogContent>
        {bookmarkedList.length > 0 ? (
          <List sx={{ width: '100%' }}>
            {bookmarkedList.map((employee) => (
              <ListItem
                key={employee.id}
                button
                onClick={() => handleBookmarkClick(employee.id)}
                sx={{
                  '&:hover': {
                    bgcolor: theme => 
                      theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.04)'
                  },
                  position: 'relative',
                  pr: 8 // Add padding for delete button
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
                      {employee.name}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                      >
                        {employee.designation}
                      </Typography>
                      <br />
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                      >
                        {employee.email}
                      </Typography>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <Tooltip title="Remove Bookmark">
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={(e) => handleDeleteBookmark(e, employee.id)}
                      sx={{
                        color: 'text.secondary',
                        '&:hover': {
                          color: 'error.main'
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        ) : (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              p: 3 
            }}
          >
            <BookmarkIcon 
              sx={{ 
                fontSize: 48, 
                mb: 2,
                color: 'text.secondary'
              }} 
            />
            <Typography color="text.secondary">
              No bookmarked employees
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookmarkDialog;