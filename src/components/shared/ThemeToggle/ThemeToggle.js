import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconButton, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { toggleTheme, selectThemeMode } from '../../../store/slices/themeSlice';

const ThemeToggle = () => {
  const dispatch = useDispatch();
  const themeMode = useSelector(selectThemeMode);

  return (
    <Tooltip title={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}>
      <IconButton
        data-testid="theme-toggle"
        aria-label="toggle theme"
        onClick={() => dispatch(toggleTheme())}
        color="inherit"
        size="large"
        sx={{
          transition: 'transform 0.3s ease-in-out',
          '&:hover': { transform: 'rotate(180deg)' },
        }}
      >
        {themeMode === 'light' ? <DarkModeIcon data-testid="theme-toggle-icon"/> : <LightModeIcon data-testid="theme-toggle-icon"/>}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;