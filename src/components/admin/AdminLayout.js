import { Outlet } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Warning as WarningIcon,
  ListAlt as ListAltIcon,
  CalendarToday as CalendarIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  BarChart as AnalyticsIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const drawerWidth = 240;

export default function AdminLayout() {
  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <List>
          {[
            { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
            { text: 'User Management', icon: <PeopleIcon />, path: '/admin/users' },
            { text: 'Flagged Reports', icon: <WarningIcon />, path: '/admin/flagged' },
            { text: 'Reports Overview', icon: <ListAltIcon />, path: '/admin/reports' },
            { text: 'Follow-ups', icon: <CalendarIcon />, path: '/admin/followups' },
            { text: 'System Logs', icon: <ListAltIcon />, path: '/admin/logs' },
            { text: 'Analytics', icon: <AnalyticsIcon />, path: '/admin/analytics' },
            { text: 'Notifications', icon: <NotificationsIcon />, path: '/admin/notifications' },
            { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
          ].map((item) => (
            <ListItem button key={item.text} component={Link} to={item.path}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}