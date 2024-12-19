import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  ToggleButtonGroup, 
  ToggleButton,
  useTheme
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import GridViewIcon from '@mui/icons-material/GridView';
import ThemeToggle from './shared/ThemeToggle';
import OrgChart from './OrgChart';

const Layout = () => {
  const theme = useTheme();
  
  // Initialize view state from localStorage
  const [view, setView] = useState(() => {
    try {
      return localStorage.getItem('orgChartView') || 'graph';
    } catch (error) {
      console.error('Failed to load view preference:', error);
      return 'graph';
    }
  });

  // Persist view state
  useEffect(() => {
    try {
      localStorage.setItem('orgChartView', view);
    } catch (error) {
      console.error('Failed to save view preference:', error);
    }
  }, [view]);

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  return (
    <Box 
      data-testid="app-root"
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        bgcolor: 'background.default',
        color: 'text.primary'
      }}
    >
      <AppBar
        data-testid="app-header"
        position="static" 
        color="inherit"
        elevation={1}
        sx={{ bgcolor: 'background.paper' }}
      >
        <Toolbar>
          <Typography 
            data-testid="app-title"
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <AccountTreeIcon color="primary" />
            Hierarchical Organization Chart
          </Typography>
          
          <ToggleButtonGroup
            data-testid="view-toggle-group"
            value={view}
            exclusive
            onChange={handleViewChange}
            aria-label="view selector"
            sx={{
              mr: 2,
              '& .MuiToggleButton-root': {
                px: 2,
                py: 1,
                color: 'text.primary',
                borderColor: 'divider',
                '&.Mui-selected': {
                  bgcolor: theme.palette.mode === 'dark' 
                    ? 'rgba(144, 202, 249, 0.15)' 
                    : 'rgba(25, 118, 210, 0.08)',
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark'
                      ? 'rgba(144, 202, 249, 0.25)'
                      : 'rgba(25, 118, 210, 0.12)',
                  },
                },
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.04)',
                },
              },
            }}
          >
            <ToggleButton value="graph" data-testid="graph-view-btn" aria-label="graph view">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountTreeIcon /> Graph View
              </Box>
            </ToggleButton>
            <ToggleButton value="grid" data-testid="grid-view-btn" aria-label="grid view">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GridViewIcon /> Grid View
              </Box>
            </ToggleButton>
          </ToggleButtonGroup>
          
          <ThemeToggle />
        </Toolbar>
      </AppBar>

      <Box 
        sx={{ 
          flexGrow: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default'
        }}
        data-testid="main-content"
      >
        <Routes>
          <Route index element={<Navigate to="/org-chart" replace />} />
          <Route 
            path="/org-chart/*" 
            element={
              <OrgChart 
                view={view}
                setView={setView}
              />
            } 
          />
          <Route path="*" element={<Navigate to="/org-chart" replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default Layout;