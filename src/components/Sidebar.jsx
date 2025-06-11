import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Warning as WarningIcon,
  Build as BuildIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  Report as ReportIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Reclamações', icon: <ReportIcon />, path: '/reclamacoes' },
  { text: 'Manutenções', icon: <BuildIcon />, path: '/manutencoes' },
  { text: 'Pagamentos', icon: <PaymentIcon />, path: '/pagamentos' },
  { text: 'Inadimplentes', icon: <MoneyIcon />, path: '/inadimplentes' },
  { text: 'Moradores', icon: <PeopleIcon />, path: '/moradores' },
  { text: 'Configurações', icon: <SettingsIcon />, path: '/configuracoes' },
];

function Sidebar({ condoName }) {
  const [open, setOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const user = auth.currentUser;

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const drawer = (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          bgcolor: 'background.default',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            padding: 2,
            justifyContent: open ? 'space-between' : 'center',
          }}
        >
          {open && (
            <Typography variant="h6" noWrap component="div">
              {condoName}
            </Typography>
          )}
          <IconButton onClick={handleDrawerToggle}>
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </Box>
        <Divider />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 2,
          }}
        >
          <Avatar
            sx={{
              width: open ? 64 : 40,
              height: open ? 64 : 40,
              mb: 1,
              bgcolor: theme.palette.primary.main,
            }}
          >
            {user?.displayName?.charAt(0) || 'U'}
          </Avatar>
          {open && (
            <Typography variant="subtitle1" noWrap>
              {user?.displayName}
            </Typography>
          )}
        </Box>
        <Divider />
        <List sx={{ flexGrow: 1 }}>
          {menuItems.map((item) => (
            <Tooltip
              key={item.text}
              title={open ? '' : item.text}
              placement="right"
            >
              <ListItem
                button
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    '&:hover': {
                      bgcolor: 'primary.light',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {open && <ListItemText primary={item.text} />}
              </ListItem>
            </Tooltip>
          ))}
        </List>
        <Divider />
        <List>
          <Tooltip title={open ? '' : 'Sair'} placement="right">
            <ListItem
              button
              onClick={handleLogout}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <LogoutIcon />
              </ListItemIcon>
              {open && <ListItemText primary="Sair" />}
            </ListItem>
          </Tooltip>
        </List>
      </Box>
    </>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { md: open ? drawerWidth : 73 },
        flexShrink: { md: 0 },
      }}
    >
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={open}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            '& .MuiDrawer-paper': {
              width: open ? drawerWidth : 73,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden',
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open={open}
        >
          {drawer}
        </Drawer>
      )}
    </Box>
  );
}

export default Sidebar;