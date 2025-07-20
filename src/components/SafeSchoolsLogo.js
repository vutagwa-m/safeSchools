import React from 'react';
import { Box, Typography } from '@mui/material';

export const SafeSchoolsLogo = () => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 'bold', 
          color: 'white',
          backgroundColor: '#4CAF50', // Green
          px: 1,
          borderRadius: '4px 0 0 4px'
        }}
      >
        Safe
      </Typography>
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 'bold', 
          color: 'white',
          backgroundColor: '#FF9800', // Orange
          px: 1,
          borderRadius: '0 4px 4px 0'
        }}
      >
        Schools
      </Typography>
    </Box>
  );
};