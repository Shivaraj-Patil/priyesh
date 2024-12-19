import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

const DeleteConfirmationDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  employee,
  isDeleting 
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningIcon color="warning" />
        Confirm Delete
      </DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete employee "{employee?.name}"?
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography color="error" variant="body2">
            This action cannot be undone.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose}
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button 
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={isDeleting}
          data-testid="confirm-delete"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;