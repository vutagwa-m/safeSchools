import React from 'react';
import { 
  Box, 
  CssBaseline, 
  Divider, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  AppBar, 
  Toolbar, 
  Typography,
  Avatar,
  Chip,
  Paper,
  Button
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assignment as ReportsIcon,
  Warning as FlaggedIcon,
  ListAlt as LogsIcon,
  CalendarToday as CalendarIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  School as SchoolIcon,
  Book as BookIcon,
  LibraryBooks as LibraryIcon
} from '@mui/icons-material';
import { green, orange, red } from '@mui/material/colors';
import { Link } from 'react-router-dom';

const drawerWidth = 240;

const AdminDashboardLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          width: `calc(100% - ${drawerWidth}px)`, 
          ml: `${drawerWidth}px`,
          bgcolor: 'white',
          color: green[800],
          boxShadow: 'none',
          borderBottom: `1px solid ${green[100]}`
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <SchoolIcon sx={{ mr: 1, color: orange[500] }} />
            <Typography variant="h6" noWrap component="div">
              Safe<strong style={{ color: orange[500] }}>Schools</strong> Admin
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: green[500] }}>A</Avatar>
        </Toolbar>
      </AppBar>
      
      {/* Sidebar */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: green[800],
            color: 'white'
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LibraryIcon sx={{ mr: 1, color: orange[500] }} />
            <Typography variant="h6">Academia</Typography>
          </Box>
        </Toolbar>
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
        
        <List>
          {[
            { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
            { text: 'User Management', icon: <PeopleIcon />, path: '/admin/users' },
            { text: 'Reports', icon: <ReportsIcon />, path: '/admin/reports' },
            { text: 'Flagged Cases', icon: <FlaggedIcon />, path: '/admin/flagged' },
            { text: 'System Logs', icon: <LogsIcon />, path: '/admin/logs' },
            { text: 'Academic Calendar', icon: <CalendarIcon />, path: '/admin/calendar' },
            { text: 'Course Materials', icon: <BookIcon />, path: '/admin/materials' },
          ].map((item) => (
            <ListItem 
              button 
              key={item.text} 
              component={Link} 
              to={item.path}
              sx={{
                '&:hover': {
                  bgcolor: green[700]
                },
                '&.active': {
                  bgcolor: orange[500],
                  '& .MuiListItemIcon-root': {
                    color: 'white'
                  }
                }
              }}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
        
        <List>
          {[
            { text: 'Notifications', icon: <NotificationsIcon />, path: '/admin/notifications' },
            { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
          ].map((item) => (
            <ListItem 
              button 
              key={item.text} 
              component={Link} 
              to={item.path}
              sx={{
                '&:hover': {
                  bgcolor: green[700]
                }
              }}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          bgcolor: '#f9f9f9',
          p: 3,
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        
        {/* Dashboard Overview */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ mb: 2, color: green[800] }}>
            Academic Administration Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Chip 
              label="Academic Year 2023-2024" 
              sx={{ bgcolor: orange[100], color: orange[800] }} 
            />
            <Chip 
              label="Term: Spring" 
              sx={{ bgcolor: green[100], color: green[800] }} 
            />
          </Box>
        </Box>
        
        {/* Quick Stats */}
        <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
          <Paper sx={{ p: 3, flex: 1, borderLeft: `4px solid ${green[500]}` }}>
            <Typography variant="h6" sx={{ mb: 1, color: green[800] }}>
              Total Students
            </Typography>
            <Typography variant="h3" sx={{ color: green[500] }}>
              1,245
            </Typography>
          </Paper>
          <Paper sx={{ p: 3, flex: 1, borderLeft: `4px solid ${orange[500]}` }}>
            <Typography variant="h6" sx={{ mb: 1, color: orange[800] }}>
              Active Reports
            </Typography>
            <Typography variant="h3" sx={{ color: orange[500] }}>
              24
            </Typography>
          </Paper>
          <Paper sx={{ p: 3, flex: 1, borderLeft: `4px solid ${red[500]}` }}>
            <Typography variant="h6" sx={{ mb: 1, color: red[800] }}>
              Urgent Cases
            </Typography>
            <Typography variant="h3" sx={{ color: red[500] }}>
              5
            </Typography>
          </Paper>
        </Box>
        
        {/* Recent Activity Section */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2
          }}>
            <Typography variant="h5" sx={{ color: green[800] }}>
              Recent Activity
            </Typography>
            <Button 
              variant="contained"
              sx={{
                bgcolor: orange[500],
                '&:hover': { bgcolor: green[600] }
              }}
            >
              View All
            </Button>
          </Box>
          {children} {/* This will render your RecentActivity component */}
        </Paper>
        
        {/* Quick Actions */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 2, color: green[800] }}>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<PeopleIcon />}
              sx={{
                bgcolor: orange[500],
                '&:hover': { bgcolor: green[600] }
              }}
            >
              Add User
            </Button>
            <Button
              variant="contained"
              startIcon={<BookIcon />}
              sx={{
                bgcolor: orange[500],
                '&:hover': { bgcolor: green[600] }
              }}
            >
              Upload Materials
            </Button>
            <Button
              variant="contained"
              startIcon={<CalendarIcon />}
              sx={{
                bgcolor: orange[500],
                '&:hover': { bgcolor: green[600] }
              }}
            >
              Schedule Event
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default AdminDashboardLayout;