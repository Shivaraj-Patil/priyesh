import React, { useState } from 'react';
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
  TextField,
  Box,
  Alert,
  Typography,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useDispatch, useSelector } from 'react-redux';
import {
  addDesignation,
  removeDesignation,
  updateDesignation,
  selectAllDesignations
} from '../../store/slices/designationSlice';

const ManageDesignations = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const designations = useSelector(selectAllDesignations);
  const [newDesignation, setNewDesignation] = useState('');
  const [editingDesignation, setEditingDesignation] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState('');

  const validateDesignation = (designation) => {
    if (!designation.trim()) {
      setError('Designation cannot be empty');
      return false;
    }
    if (designations.includes(designation.trim()) && designation.trim() !== editingDesignation) {
      setError('This designation already exists');
      return false;
    }
    setError('');
    return true;
  };

  const handleAdd = () => {
    if (validateDesignation(newDesignation)) {
      dispatch(addDesignation(newDesignation.trim()));
      setNewDesignation('');
    }
  };

  const handleStartEdit = (designation) => {
    setEditingDesignation(designation);
    setEditValue(designation);
    setError('');
  };

  const handleEdit = (oldDesignation) => {
    if (validateDesignation(editValue)) {
      dispatch(updateDesignation({
        oldDesignation,
        newDesignation: editValue.trim()
      }));
      setEditingDesignation(null);
      setEditValue('');
    }
  };

  const handleDelete = (designation) => {
    dispatch(removeDesignation(designation));
  };

  const handleKeyPress = (e, type, oldDesignation = null) => {
    if (e.key === 'Enter') {
      if (type === 'add') {
        handleAdd();
      } else if (type === 'edit' && oldDesignation) {
        handleEdit(oldDesignation);
      }
    } else if (e.key === 'Escape') {
      if (type === 'edit') {
        setEditingDesignation(null);
        setEditValue('');
        setError('');
      }
    }
  };

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
      <DialogTitle>Manage Designations</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Add, edit, or remove employee designations. Changes will affect all new and existing employees.
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              label="New Designation"
              value={newDesignation}
              onChange={(e) => setNewDesignation(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'add')}
              error={!!error && !editingDesignation}
              placeholder="Enter designation title"
              size="small"
            />
            <Button
              variant="contained"
              onClick={handleAdd}
              disabled={!newDesignation.trim()}
              startIcon={<AddIcon />}
            >
              Add
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />
        
        <List>
          {designations.map((designation) => (
            <ListItem
              key={designation}
              sx={{
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'action.hover',
                }
              }}
            >
              {editingDesignation === designation ? (
                <TextField
                  fullWidth
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'edit', designation)}
                  onBlur={() => handleEdit(designation)}
                  error={!!error}
                  helperText={error}
                  autoFocus
                  size="small"
                />
              ) : (
                <>
                  <ListItemText
                    primary={designation}
                    primaryTypographyProps={{
                      variant: 'body1'
                    }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      onClick={() => handleStartEdit(designation)}
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(designation)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </>
              )}
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageDesignations;