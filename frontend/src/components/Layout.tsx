import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Onboarding System
          </Typography>
          <Button
            color="inherit"
            component={Link}
            to="/"
            sx={{ mr: 2 }}
            variant={location.pathname === '/' ? 'outlined' : 'text'}
          >
            New Request
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/dashboard"
            variant={location.pathname === '/dashboard' ? 'outlined' : 'text'}
          >
            Dashboard
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
    </>
  );
};

export default Layout;

