import { createTheme } from '@mui/material/styles';

const getThemeOptions = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
          },
          background: {
            default: '#f5f5f5',
            paper: '#ffffff',
          },
          text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.6)',
          },
        }
      : {
          primary: {
            main: '#64B5F6',  // Light blue for accents
            light: '#90CAF9',
            dark: '#42A5F5',
          },
          background: {
            default: '#0A1415', // Darker teal background
            paper: '#112123',   // Slightly lighter teal for surfaces
          },
          text: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.7)',
          },
        }),
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: mode === 'dark' ? '#6b6b6b #0A1415' : '#959595 #f5f5f5',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#959595',
            border: 'none',
          },
          '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
            borderRadius: 8,
            backgroundColor: mode === 'dark' ? '#0A1415' : '#f5f5f5',
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          ...(mode === 'dark' && {
            color: 'rgba(255, 255, 255, 0.7)',
            borderColor: 'rgba(255, 255, 255, 0.12)',
            '&.Mui-selected': {
              backgroundColor: 'rgba(100, 181, 246, 0.15)',
              color: '#64B5F6',
              '&:hover': {
                backgroundColor: 'rgba(100, 181, 246, 0.25)',
              },
            },
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
            '& .MuiSvgIcon-root': {
              color: '#64B5F6',
            },
          }),
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          ...(mode === 'dark' && {
            backgroundColor: 'rgba(33, 49, 51, 0.2)', // Very transparent dark teal
            backdropFilter: 'blur(10px)',  // Adds frosted glass effect
            backgroundImage: 'none',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }),
        },
      },
    },
    // For the container Box in GraphView.js and GridView.js
    MuiBox: {
      styleOverrides: {
        root: {
          ...(mode === 'dark' && {
            backgroundColor: 'transparent',
          }),
        },
      },
    },
  },
});

export const createAppTheme = (mode) => createTheme(getThemeOptions(mode));