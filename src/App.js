import React, { useCallback, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import { createAppTheme } from './theme';
import { loadEmployees } from './store/slices/employeeSlice';
import { selectThemeMode } from './store/slices/themeSlice';

function App() {
  const dispatch = useDispatch();
  const themeMode = useSelector(selectThemeMode);
  const theme = React.useMemo(() => createAppTheme(themeMode), [themeMode]);
  
  const loadInitialData = useCallback(async () => {
    try {
      await dispatch(loadEmployees()).unwrap();
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  }, [dispatch]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Layout />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;