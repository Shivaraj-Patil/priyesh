import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography
} from '@mui/material';
import { addEmployee, updateEmployee, selectAllEmployees } from '@store/slices/employeeSlice';
import { selectAllDesignations } from '@store/slices/designationSlice';

const initialFormData = {
  name: '',
  designation: '',
  email: '',
  phone: '',
  managerId: ''
};

const initialErrors = {
  name: '',
  designation: '',
  email: '',
  phone: '',
  managerId: ''
};

const EmployeeModal = ({ open, onClose, mode = 'add', employeeData = null, onSuccess }) => {
  const dispatch = useDispatch();
  const allEmployees = useSelector(selectAllEmployees);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState(initialErrors);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Initialize form data based on mode and employeeData
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && employeeData) {
        // Edit mode - populate with existing data
        const { name, designation, email, phone, managerId } = employeeData;
        setFormData({ name, designation, email, phone, managerId: managerId || '' });
      } else if (mode === 'add-reportee' && employeeData?.manager) {
        // Add reportee mode - set manager and clear other fields
        setFormData({
          ...initialFormData,
          managerId: employeeData.manager.id
        });
      } else {
        // Regular add mode - clear all fields
        setFormData(initialFormData);
      }
      setErrors(initialErrors);
      setSubmitError('');
    }
  }, [open, mode, employeeData]);

  const validateForm = () => {
    const newErrors = { ...initialErrors };
    let isValid = true;

    // Name validation
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    // Designation validation
    if (!formData.designation?.trim()) {
      newErrors.designation = 'Designation is required';
      isValid = false;
    }

    // Email validation
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
      isValid = false;
    }

    // Phone validation
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
      isValid = false;
    }

    // Manager validation for regular add mode
    if (mode === 'add') {
      // Check if this is not the first employee
      const hasExistingEmployees = allEmployees.length > 0;
      if (hasExistingEmployees && !formData.managerId) {
        newErrors.managerId = 'Manager is required';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
  
    setIsSubmitting(true);
    setSubmitError('');
  
    try {
      if (mode === 'edit') {
        await dispatch(updateEmployee({
          id: employeeData.id,
          name: formData.name,
          designation: formData.designation,
          email: formData.email,
          phone: formData.phone
        }));
        onSuccess?.('Employee updated successfully');
      } else {
        const employeeData = {
          ...formData,
          managerId: formData.managerId || null
        };
        await dispatch(addEmployee(employeeData));
        onSuccess?.('Employee added successfully');
      }
      onClose();
    } catch (error) {
      console.error('Error saving employee:', error);
      setSubmitError('Failed to save employee. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get manager options (excluding current employee in edit mode)
  const getManagerOptions = () => {
    if (mode === 'add') {
      return allEmployees;
    }
    return allEmployees.filter(emp => emp.id !== employeeData?.id);
  };

  // Get dialog title based on mode
  const getDialogTitle = () => {
    switch (mode) {
      case 'edit':
        return 'Edit Employee Details';
      case 'add-reportee':
        return 'Add New Reportee';
      default:
        return 'Add New Employee';
    }
  };

  const DesignationSelect = ({ value, onChange, error, disabled }) => {
    const designations = useSelector(selectAllDesignations);
    
    return (
      <FormControl
        fullWidth
        margin="dense"
        error={!!error}
        disabled={disabled}
      >
        <InputLabel>Designation</InputLabel>
        <Select
          value={value}
          label="Designation"
          onChange={onChange}
        >
          {designations.map((designation) => (
            <MenuItem key={designation} value={designation}>
              {designation}
            </MenuItem>
          ))}
        </Select>
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>
    );
  };

  return (
    <Dialog
      data-testid="employee-modal"
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle data-testid="modal-title">
        {getDialogTitle()}
      </DialogTitle>
      <DialogContent>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}
        {mode === 'add-reportee' && employeeData?.manager && (
          <Box sx={{ mb: 2, mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Adding reportee under: {employeeData.manager.name} ({employeeData.manager.designation})
            </Typography>
          </Box>
        )}
        <Box sx={{ pt: 2 }}>
          <TextField
            autoFocus
            fullWidth
            label="Name"
            data-testid="employee-name-input"
            value={formData.name}
            onChange={handleChange('name')}
            error={!!errors.name}
            helperText={errors.name}
            margin="dense"
            disabled={isSubmitting}
          />
          <DesignationSelect
            value={formData.designation}
            onChange={handleChange('designation')}
            error={errors.designation}
            disabled={isSubmitting}
            data-testid="designation-select"
          />
          <TextField
            fullWidth
            label="Email"
            data-testid="employee-email-input"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            error={!!errors.email}
            helperText={errors.email}
            margin="dense"
            disabled={isSubmitting}
          />
          <TextField
            fullWidth
            label="Phone"
            data-testid="employee-phone-input"
            value={formData.phone}
            onChange={handleChange('phone')}
            error={!!errors.phone}
            helperText={errors.phone}
            margin="dense"
            disabled={isSubmitting}
          />
          {mode === 'add' && (
            <FormControl 
              fullWidth 
              margin="dense"
              error={!!errors.managerId}
              disabled={isSubmitting}
            >
              <InputLabel>Manager</InputLabel>
              <Select
                value={formData.managerId}
                label="Manager"
                onChange={handleChange('managerId')}
              >
                <MenuItem value="">
                  <em>No Manager</em>
                </MenuItem>
                {getManagerOptions().map((manager) => (
                  <MenuItem key={manager.id} value={manager.id}>
                    {manager.name} - {manager.designation}
                  </MenuItem>
                ))}
              </Select>
              {errors.managerId && (
                <FormHelperText>{errors.managerId}</FormHelperText>
              )}
            </FormControl>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose}
          disabled={isSubmitting}
          data-testid="modal-cancel-btn"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained" 
          color="primary"
          disabled={isSubmitting}
          data-testid="modal-submit-btn"
        >
          {isSubmitting 
            ? (mode === 'edit' ? 'Saving...' : 'Adding...') 
            : (mode === 'edit' ? 'Save Changes' : 'Add Employee')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeModal;