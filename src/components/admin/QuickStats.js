import { 
  Card, 
  CardContent, 
  Typography, 
  Stack, 
  Box, 
  Grid 
} from '@mui/material';
import { useAdmin } from '../../contexts/AdminContext';
import {
  People as PeopleIcon,
  Warning as WarningIcon,
  PriorityHigh as PriorityHighIcon,
  SupportAgent as SupportAgentIcon
} from '@mui/icons-material';


export default function QuickStats() {
  const { users, reports } = useAdmin();

  const stats = [
    { 
      title: 'Total Users', 
      value: users.length,
      icon: <PeopleIcon fontSize="large" />,
      color: '#4CAF50'
    },
    { 
      title: 'Active Reports', 
      value: reports.filter(r => r.status !== 'resolved').length,
      icon: <WarningIcon fontSize="large" />,
      color: '#FF9800' // Orange
    },
    { 
      title: 'Flagged Cases', 
      value: reports.filter(r => r.severity === 'high').length,
      icon: <PriorityHighIcon fontSize="large" />,
      color: '#F44336' // Red
    },
    { 
      title: 'Support Staff', 
      value: users.filter(u => u.role === 'support').length,
      icon: <SupportAgentIcon fontSize="large" />,
      color: '#2196F3' // Blue
    }
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card 
            elevation={3}
            sx={{ 
              height: '100%',
              borderLeft: `4px solid ${stat.color}`,
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ 
                  color: stat.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: `${stat.color}20` // 20% opacity
                }}>
                  {stat.icon}
                </Box>
                <Box>
                  <Typography 
                    variant="subtitle2" 
                    color="text.secondary"
                    sx={{ fontWeight: 'medium' }}
                  >
                    {stat.title}
                  </Typography>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: stat.color
                    }}
                  >
                    {stat.value}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}