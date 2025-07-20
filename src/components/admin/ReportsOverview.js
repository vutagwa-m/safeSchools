import { useState } from 'react';
import { 
  DataGrid,
  GridToolbar
} from '@mui/x-data-grid';
import { 
  Box, 
  Button, 
  Chip, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent,
  DialogActions,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper
} from '@mui/material';
import {
  Person as PersonIcon,
  CalendarToday as DateIcon,
  Description as DescriptionIcon,
  Warning as WarningIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useAdmin } from '../../contexts/AdminContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { format } from 'date-fns';

const ReportDetailsModal = ({ report, onClose, supportUsers }) => {
  const [selectedSupport, setSelectedSupport] = useState(report.assignedTo || '');
  const [adminNotes, setAdminNotes] = useState(report.adminNotes || '');

  const handleSaveNotes = async () => {
    try {
      await updateDoc(doc(db, 'reports', report.id), {
        adminNotes: adminNotes
      });
      onClose();
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

  const handleReassign = async () => {
    try {
      await updateDoc(doc(db, 'reports', report.id), {
        assignedTo: selectedSupport,
        status: 'in-progress'
      });
      onClose();
    } catch (error) {
      console.error("Error reassigning report:", error);
    }
  };

  return (
    <Dialog open={!!report} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <WarningIcon color="warning" sx={{ mr: 1 }} />
          <Typography variant="h6" component="span">
            Report Details - {report.category}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Basic Information Section */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Basic Information
            </Typography>
            <List dense>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Reporter" 
                  secondary={report.reporterName || 'Anonymous'} 
                />
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
                  secondary={format(report.createdAt?.toDate(), 'PPPpp')} 
                />
              </ListItem>
              <Divider variant="inset" component="li" />
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ 
                    bgcolor: report.severity === 'high' ? 'error.main' : 'warning.main'
                  }}>
                    <WarningIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Status" 
                  secondary={
                    <Chip 
                      label={report.status} 
                      color={
                        report.status === 'resolved' ? 'success' :
                        report.status === 'escalated' ? 'error' : 'warning'
                      }
                      size="small"
                    />
                  } 
                />
              </ListItem>
            </List>
          </Paper>

          {/* Report Content Section */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Report Content
            </Typography>
            <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 1 }}>
              <Typography paragraph>
                {report.description || 'No description provided'}
              </Typography>
            </Box>
          </Paper>

          {/* Admin Actions Section */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Admin Actions
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="support-select-label">Reassign To</InputLabel>
              <Select
                labelId="support-select-label"
                value={selectedSupport}
                label="Reassign To"
                onChange={(e) => setSelectedSupport(e.target.value)}
              >
                {supportUsers.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name || user.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Admin Notes"
              multiline
              rows={4}
              fullWidth
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add any notes or follow-up instructions..."
            />
          </Paper>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSaveNotes}
          variant="contained"
          color="primary"
        >
          Save Notes
        </Button>
        <Button 
          onClick={handleReassign}
          variant="contained"
          color="secondary"
          disabled={!selectedSupport}
        >
          Reassign
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function ReportsOverview() {
  const { reports, users } = useAdmin();
  const [selectedReport, setSelectedReport] = useState(null);

  const supportUsers = users.filter(u => u.role === 'support');

  const columns = [
    { field: 'id', headerName: 'Report ID', width: 200 },
    { field: 'category', headerName: 'Category', width: 150 },
    { 
      field: 'createdAt', 
      headerName: 'Date', 
      width: 150,
      valueGetter: (params) => format(params.row.createdAt?.toDate(), 'MMM d, yyyy')
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={
            params.value === 'escalated' ? 'error' : 
            params.value === 'resolved' ? 'success' : 'warning'
          }
        />
      )
    },
    { 
      field: 'assignedTo', 
      headerName: 'Assigned To', 
      width: 150,
      valueGetter: (params) => {
        const user = supportUsers.find(u => u.id === params.row.assignedTo);
        return user?.name || user?.email || 'Unassigned';
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 300,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            onClick={() => setSelectedReport(params.row)}
            startIcon={<DescriptionIcon />}
          >
            Details
          </Button>
          <Button 
            variant="outlined" 
            color="secondary"
            onClick={() => setSelectedReport(params.row)}
            startIcon={<AssignmentIcon />}
          >
            Reassign
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: '80vh', width: '100%', p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        All Reports ({reports.length})
      </Typography>
      <DataGrid
        rows={reports}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10]}
        components={{
          Toolbar: GridToolbar,
        }}
        sx={{
          '& .MuiDataGrid-cell': {
            borderBottom: 'none',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        }}
      />
      
      {selectedReport && (
        <ReportDetailsModal 
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          supportUsers={supportUsers}
        />
      )}
    </Box>
  );
}