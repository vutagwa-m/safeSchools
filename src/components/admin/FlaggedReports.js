import React, { useState, useCallback } from 'react';
import {
  DataGrid,
  GridActionsCellItem,
  GridToolbar
} from '@mui/x-data-grid';
import {
  Chip,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Grid 
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  CalendarToday as DateIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useAdmin } from '../../contexts/AdminContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { format } from 'date-fns';

// ReportDialog component
const ReportDialog = ({ report, supportUsers, onClose, onReassign }) => {
  const [selectedSupport, setSelectedSupport] = useState(report.assignedTo || '');

  const handleLocalReassign = async () => {
    await onReassign(report.id, selectedSupport);
    onClose();
  };

  return (
    <Dialog open={!!report} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <WarningIcon color="error" sx={{ mr: 1 }} />
          <Typography variant="h6" component="span">
            Report Details - {report.category}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Basic Information
            </Typography>
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary="Reporter" secondary={report.reporterName || 'Anonymous'} />
              </ListItem>
              <Divider variant="inset" component="li" />
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <DateIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Report Date"
                  secondary={report.createdAt?.toDate() ? format(report.createdAt.toDate(), 'PPPpp') : 'N/A'}
                />
              </ListItem>
              <Divider variant="inset" component="li" />
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: report.severity === 'high' ? 'error.main' : 'warning.main' }}>
                    <WarningIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Severity"
                  secondary={
                    <Chip
                      label={report.severity}
                      color={report.severity === 'high' ? 'error' : 'warning'}
                      size="small"
                    />
                  }
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Report Details
            </Typography>
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography paragraph>
                {report.description || 'No description provided'}
              </Typography>
            </Box>

            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel id="support-select-label">Assigned To</InputLabel>
              <Select
                labelId="support-select-label"
                value={selectedSupport}
                label="Assigned To"
                onChange={(e) => setSelectedSupport(e.target.value)}
              >
                {supportUsers.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name || user.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleLocalReassign}
          variant="contained"
          color="primary"
          disabled={!selectedSupport}
        >
          Reassign
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// FlaggedReports component
export default function FlaggedReports() {
  const { flaggedReports, users } = useAdmin();
  const [selectedReport, setSelectedReport] = useState(null);

  const supportUsers = users.filter(u => u.role === 'support');

  // Function to resolve a report
  const resolveReport = useCallback(async (reportId) => {
    try {
      await updateDoc(doc(db, 'reports', reportId), {
        status: 'resolved',
        resolvedAt: new Date()
      });
    } catch (error) {
      console.error("Error resolving report:", error);
    }
  }, []); // Empty dependency array means this function is memoized and won't change on re-renders

  // Function to reassign a report
  const handleReassign = useCallback(async (reportId, newAssigneeId) => {
    try {
      await updateDoc(doc(db, 'reports', reportId), {
        assignedTo: newAssigneeId,
        status: 'reassigned', // Or 'assigned' if that's more appropriate
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error("Error reassigning report:", error);
    }
  }, []);

  const columns = [
    { field: 'id', headerName: 'ID', width: 120 },
    { field: 'category', headerName: 'Category', width: 150 },
    {
      field: 'severity',
      headerName: 'Severity',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'high' ? 'error' : 'warning'}
        />
      )
    },
    {
      field: 'createdAt',
      headerName: 'Reported',
      width: 150,
      valueGetter: (params) => params.row.createdAt?.toDate() ? format(params.row.createdAt.toDate(), 'MMM d, yyyy') : 'N/A'
    },
    {
      field: 'actions',
      type: 'actions',
      width: 200,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<VisibilityIcon />}
          label="View Details"
          onClick={() => setSelectedReport(params.row)}
        />,
        <GridActionsCellItem
          icon={<AssignmentIcon />}
          label="Reassign"
          onClick={() => setSelectedReport(params.row)}
          showInMenu
        />,
        <GridActionsCellItem
          icon={<CheckCircleIcon />}
          label="Mark Resolved"
          onClick={() => resolveReport(params.id)}
          showInMenu
        />
      ]
    }
  ];

  return (
    <Box sx={{ height: 600, p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Flagged Reports ({flaggedReports.length})
      </Typography>
      <DataGrid
        rows={flaggedReports}
        columns={columns}
        density="compact"
        slots={{
          toolbar: GridToolbar,
        }}
        pageSizeOptions={[10]} // Use pageSizeOptions instead of pageSize and rowsPerPageOptions
      />

      {selectedReport && (
        <ReportDialog
          report={selectedReport}
          supportUsers={supportUsers}
          onClose={() => setSelectedReport(null)}
          onReassign={handleReassign} // Pass the handleReassign from FlaggedReports
        />
      )}
    </Box>
  );
}