// src/components/admin/FollowUpCalendar.js
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  IconButton,
  Chip,
  Divider
} from '@mui/material';
import { 
  ChevronLeft, 
  ChevronRight,
  Event as EventIcon,
  CheckCircle,
  Warning,
  Error
} from '@mui/icons-material';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { SafeSchoolsLogo } from '../SafeSchoolsLogo'; // Custom logo component

// Mock follow-up data - replace with real data from your backend
const mockFollowUps = [
  { id: 1, date: new Date(2023, 5, 15), student: 'Student A', type: 'check-in', status: 'completed' },
  { id: 2, date: new Date(2023, 5, 18), student: 'Student B', type: 'counseling', status: 'pending' },
  { id: 3, date: new Date(2023, 5, 20), student: 'Student C', type: 'emergency', status: 'missed' },
  { id: 4, date: new Date(2023, 6, 2), student: 'Student D', type: 'check-in', status: 'pending' },
];

export default function FollowUpCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const getFollowUpsForDate = (date) => {
    return mockFollowUps.filter(followUp => isSameDay(followUp.date, date));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle sx={{ color: '#4CAF50' }} />; // Green
      case 'pending':
        return <Warning sx={{ color: '#FF9800' }} />; // Orange
      case 'missed':
        return <Error sx={{ color: '#F44336' }} />; // Red
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with SafeSchools logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SafeSchoolsLogo />
        <Typography variant="h4" sx={{ ml: 2, fontWeight: 'bold' }}>
          Follow Up Calendar
        </Typography>
      </Box>

      {/* Month Navigation */}
      <Paper elevation={3} sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <IconButton onClick={handlePrevMonth}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {format(currentMonth, 'MMMM yyyy')}
          </Typography>
          <IconButton onClick={handleNextMonth}>
            <ChevronRight />
          </IconButton>
        </Box>
      </Paper>

      {/* Calendar Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Typography key={day} align="center" sx={{ fontWeight: 'bold', p: 1 }}>
            {day}
          </Typography>
        ))}

        {daysInMonth.map(day => {
          const dayFollowUps = getFollowUpsForDate(day);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <Paper
              key={day.toString()}
              elevation={isSelected ? 6 : 2}
              onClick={() => setSelectedDate(day)}
              sx={{
                p: 1,
                minHeight: 100,
                cursor: 'pointer',
                backgroundColor: isSelected ? '#e3f2fd' : 'white',
                opacity: isCurrentMonth ? 1 : 0.5,
                border: isSelected ? '2px solid #2196F3' : 'none'
              }}
            >
              <Typography align="right">{format(day, 'd')}</Typography>
              <Box sx={{ mt: 1 }}>
                {dayFollowUps.map(followUp => (
                  <Chip
                    key={followUp.id}
                    icon={getStatusIcon(followUp.status)}
                    label={`${followUp.student} - ${followUp.type}`}
                    size="small"
                    sx={{
                      mb: 0.5,
                      width: '100%',
                      justifyContent: 'flex-start',
                      backgroundColor: 
                        followUp.status === 'completed' ? '#E8F5E9' :
                        followUp.status === 'pending' ? '#FFF3E0' : '#FFEBEE'
                    }}
                  />
                ))}
              </Box>
            </Paper>
          );
        })}
      </Box>

      {/* Selected Date Details */}
      <Paper elevation={3} sx={{ mt: 3, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Details for {format(selectedDate, 'MMMM d, yyyy')}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {getFollowUpsForDate(selectedDate).length > 0 ? (
          getFollowUpsForDate(selectedDate).map(followUp => (
            <Box key={followUp.id} sx={{ mb: 2, p: 1, backgroundColor: '#fafafa', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {getStatusIcon(followUp.status)}
                <Typography variant="subtitle1" sx={{ ml: 1 }}>
                  {followUp.student}
                </Typography>
              </Box>
              <Typography variant="body2">Type: {followUp.type}</Typography>
              <Typography variant="body2" sx={{ 
                color: 
                  followUp.status === 'completed' ? '#4CAF50' :
                  followUp.status === 'pending' ? '#FF9800' : '#F44336',
                fontWeight: 'bold'
              }}>
                Status: {followUp.status}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography>No follow-ups scheduled for this day</Typography>
        )}
      </Paper>
    </Box>
  );
}