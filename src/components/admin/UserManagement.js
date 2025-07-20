import { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, Chip, Menu, MenuItem, Typography } from '@mui/material';
import { useAdmin } from '../../contexts/AdminContext';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config'

const roles = ['student', 'support', 'admin'];
const handleSuspend = async (userId, shouldSuspend) => {
  await updateDoc(doc(db, 'users', userId), {
    status: shouldSuspend ? 'suspended' : 'active'
  });
};

export default function UserManagement() {
  const { users } = useAdmin();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleRoleChange = async (newRole) => {
    await updateDoc(doc(db, 'users', selectedUser.id), { role: newRole });
    setAnchorEl(null);
  };

  const columns = [
    { field: 'pseudonym', headerName: 'Pseudonym', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { 
      field: 'role', 
      headerName: 'Role', 
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={
            params.value === 'admin' ? 'primary' : 
            params.value === 'support' ? 'secondary' : 'default'
          }
        />
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value || 'active'} 
          color={params.value === 'suspended' ? 'error' : 'success'}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <>
          <Button
            onClick={(e) => {
              setSelectedUser(params.row);
              setAnchorEl(e.currentTarget);
            }}
          >
            Change Role
          </Button>
          <Button
            onClick={() => handleSuspend(params.row.id, params.row.status !== 'suspended')}
            color={params.row.status === 'suspended' ? 'success' : 'error'}
          >
            {params.row.status === 'suspended' ? 'Activate' : 'Suspend'}
          </Button>
        </>
      ),
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Typography variant="h4" gutterBottom>User Management</Typography>
      <DataGrid
        rows={users}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10]}
        checkboxSelection={false}
      />
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {roles.map((role) => (
          <MenuItem key={role} onClick={() => handleRoleChange(role)}>
            Set as {role}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}