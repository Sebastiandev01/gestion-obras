import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Container,
  InputAdornment,
} from '@mui/material';
import {
  Lock as LockIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { login } from '../store/slices/authSlice';
import api from '../services/api';

interface LocationState {
  from?: {
    pathname: string;
  };
}

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const from = (location.state as LocationState)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login/', {
        username,
        password,
      });

      const { access, refresh, user } = response.data;

      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch(login({ token: access }));
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Error de login:', err);

      if (err.response?.status === 401) {
        setError('Usuario o contraseña incorrectos');
      } else {
        setError('Error al iniciar sesión. Intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          top: '-100px',
          right: '-100px',
          animation: 'float 6s ease-in-out infinite',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '50%',
          bottom: '-50px',
          left: '-50px',
          animation: 'float 8s ease-in-out infinite reverse',
        },
        '@keyframes float': {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(20px)' },
          '100%': { transform: 'translateY(0px)' },
        },
      }}
    >
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Paper
            elevation={20}
            sx={{
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              animation: 'slideUp 0.8s ease-out',
              '@keyframes slideUp': {
                from: {
                  opacity: 0,
                  transform: 'translateY(30px)',
                },
                to: {
                  opacity: 1,
                  transform: 'translateY(0)',
                },
              },
            }}
          >
            {/* Logo/Icono Animado */}
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 2,
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.05)' },
                },
              }}
            >
              <PersonIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>

            <Typography 
              component="h1" 
              variant="h5" 
              sx={{
                fontWeight: 700,
                color: '#333',
                marginBottom: 1,
              }}
            >
              CONSTRUCTORA
            </Typography>
            <Typography 
              variant="body2" 
              sx={{
                color: '#999',
                marginBottom: 3,
              }}
            >
              Ingresa tu cuenta para continuar
            </Typography>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mt: 2, 
                  width: '100%',
                  animation: 'slideIn 0.5s ease-out',
                  '@keyframes slideIn': {
                    from: { transform: 'translateX(-20px)', opacity: 0 },
                    to: { transform: 'translateX(0)', opacity: 1 },
                  },
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Usuario"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: '#667eea', marginRight: 1 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputBase-input': {
                    transition: 'all 0.3s ease',
                  },
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Contraseña"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#667eea', marginRight: 1 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputBase-input': {
                    transition: 'all 0.3s ease',
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 4,
                  mb: 2,
                  padding: '12px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 32px rgba(102, 126, 234, 0.6)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  '&:disabled': {
                    opacity: 0.7,
                  },
                }}
                disabled={loading}
              >
                {loading ? '⏳ Iniciando sesión...' : '→ Ingresar'}
              </Button>
            </Box>

            <Typography 
              variant="caption" 
              sx={{
                color: '#bbb',
                textAlign: 'center',
                marginTop: 2,
              }}
            >
              Gestión de Obras © 2026
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
