import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, GlobalStyles } from '@mui/material';
import theme from './theme';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Proyectos from './pages/Proyectos';
import Materiales from './pages/Materiales';
import Asistencia from './pages/Asistencia';
import Nomina from './pages/Nomina';
import Login from './pages/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          '@keyframes fadeIn': {
            from: { opacity: 0 },
            to: { opacity: 1 },
          },
          '@keyframes slideUp': {
            from: { opacity: 0, transform: 'translateY(20px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
          '@keyframes slideDown': {
            from: { opacity: 0, transform: 'translateY(-20px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(10px)' },
          },
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.7 },
          },
          '@keyframes shimmer': {
            '0%': { backgroundPosition: '-1000px 0' },
            '100%': { backgroundPosition: '1000px 0' },
          },
          html: {
            scrollBehavior: 'smooth',
          },
          body: {
            background: 'linear-gradient(135deg, #f8f9ff 0%, #f3e7ff 100%)',
            minHeight: '100vh',
            animation: 'fadeIn 0.5s ease-in',
          },
          'input:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 1000px white inset !important',
          },
        }}
      />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="proyectos" element={<Proyectos />} />
            <Route path="materiales" element={<Materiales />} />
            <Route path="asistencia" element={<Asistencia />} />
            <Route path="nomina" element={<Nomina />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
