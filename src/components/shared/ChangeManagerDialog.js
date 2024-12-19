import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  selectAllEmployees, 
  selectDirectReports,
  changeReportingLine 
} from '@store/slices/employeeSlice';

const ChangeManagerDialog = ({ 
  open, 
  onClose, 
  employee, 
  onSuccess 
}) => {
  const dispatch = useDispatch();
  const allEmployees = useSelector(selectAllEmployees);
  const directReportees = useSelector(state => 
    employee ? selectDirectReports(state, employee.id) : []
  );
  
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && employee) {
      setSelectedManagerId(employee.managerId || '');
      setError('');
      setIsSubmitting(false);
    }
  }, [open, employee]);

  // Check for circular reference
  const checkCircularReference = (employeeId, newManagerId) => {
    const visited = new Set([employeeId]);
    let currentManagerId = newManagerId;

    while (currentManagerId) {
      if (visited.has(currentManagerId)) {
        return true;  // Circular reference found
      }
      visited.add(currentManagerId);
      const manager = allEmployees.find(emp => emp.id === currentManagerId);
      currentManagerId = manager?.managerId;
    }
    return false;  // No circular reference
  };

  // Get valid manager options
  const getValidManagerOptions = () => {
    if (!employee) return [];

    const getSubordinateIds = (empId) => {
      const subordinates = new Set();
      const check = (id) => {
        allEmployees.forEach(emp => {
          if (emp.managerId === id) {
            subordinates.add(emp.id);
            check(emp.id);
          }
        });
      };
      check(empId);
      return subordinates;
    };

    const excludeIds = getSubordinateIds(employee.id);
    excludeIds.add(employee.id);

    return allEmployees.filter(emp => !excludeIds.has(emp.id));
  };

  const handleChange = (event) => {
    setSelectedManagerId(event.target.value);
    setError('');
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError('');
      setIsSubmitting(false);
      onClose();
    }
  };

  const handleSubmit = async () => {
    // If no change in manager, just close the dialog
    if (selectedManagerId === employee.managerId) {
      handleClose();
      return;
    }

    // Check for circular reference
    if (checkCircularReference(employee.id, selectedManagerId)) {
      setError('This change would create a circular reporting relationship');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const resultAction = await dispatch(changeReportingLine({
        employeeId: employee.id,
        newManagerId: selectedManagerId || null
      })).unwrap();
      
      onSuccess?.(`Successfully updated reporting line for ${employee.name}`);
      handleClose();
    } catch (error) {
      console.error('Error updating reporting line:', error);
      setError(error.message || 'Failed to update reporting line. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!employee) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          backgroundImage: 'none'
        }
      }}
    >
      <DialogTitle sx={{ color: 'text.primary' }}>
        Change Reporting Line
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Typography variant="subtitle1" sx={{ color: 'text.primary' }} gutterBottom>
            Employee: {employee?.name} - {employee?.designation}
          </Typography>

          {!getValidManagerOptions().length && (
            <Alert 
              severity="info" 
              sx={{ mb: 2, mt: 1 }}
            >
              This is the root employee of the organization. The root employee cannot be assigned a manager to maintain hierarchy integrity.
            </Alert>
          )}
          
          {directReportees.length > 0 && (
            <Box sx={{ mt: 2, mb: 3 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }} gutterBottom>
                Direct Reportees (will be maintained):
              </Typography>
              <List dense>
                {directReportees.map(reportee => (
                  <ListItem key={reportee.id}>
                    <ListItemText 
                      primary={reportee.name}
                      secondary={reportee.designation}
                      primaryTypographyProps={{ color: 'text.primary' }}
                      secondaryTypographyProps={{ color: 'text.secondary' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <FormControl 
            fullWidth 
            margin="normal"
            error={!!error}
            disabled={isSubmitting}
          >
            <InputLabel id="new-manager-label">New Manager</InputLabel>
            <Select
              labelId="new-manager-label"
              value={selectedManagerId}
              label="New Manager"
              onChange={handleChange}
              data-testid="manager-select"
            >
              <MenuItem value="">
                <em>No Manager</em>
              </MenuItem>
              {getValidManagerOptions().map((manager) => (
                <MenuItem key={manager.id} value={manager.id}>
                  {manager.name} - {manager.designation}
                </MenuItem>
              ))}
            </Select>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>

          {employee.managerId && (
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 2,
                color: 'text.secondary'
              }}
            >
              Current Manager: {allEmployees.find(emp => emp.id === employee.managerId)?.name || 'None'}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained" 
          color="primary"
          disabled={isSubmitting}
          data-testid="save-manager"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangeManagerDialog;