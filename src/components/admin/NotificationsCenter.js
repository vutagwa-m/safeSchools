import { useState } from 'react';
import { Button, TextField, Box, Typography, List, ListItem } from '@mui/material';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function NotificationsCenter() {
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [sentNotifications, setSentNotifications] = useState([]);

  const sendNotification = async () => {
    await addDoc(collection(db, 'notifications'), {
      message,
      target,
      createdAt: new Date(),
      readBy: []
    });
    setSentNotifications(prev => [...prev, { message, target, date: new Date() }]);
    setMessage('');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Send Notification</Typography>
      <TextField
        label="Notification Message"
        multiline
        rows={4}
        fullWidth
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Box sx={{ my: 2 }}>
        <Button 
          onClick={() => setTarget('all')} 
          variant={target === 'all' ? 'contained' : 'outlined'}
        >
          All Users
        </Button>
        <Button 
          onClick={() => setTarget('students')} 
          variant={target === 'students' ? 'contained' : 'outlined'}
          sx={{ mx: 2 }}
        >
          Students Only
        </Button>
        <Button 
          onClick={() => setTarget('support')} 
          variant={target === 'support' ? 'contained' : 'outlined'}
        >
          Support Only
        </Button>
      </Box>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={sendNotification}
        disabled={!message}
      >
        Send Notification
      </Button>

      <Typography variant="h5" sx={{ mt: 4 }}>Recent Notifications</Typography>
      <List>
        {sentNotifications.map((notif, index) => (
          <ListItem key={index}>
            <Box>
              <Typography><strong>To:</strong> {notif.target}</Typography>
              <Typography>{notif.message}</Typography>
              <Typography variant="caption">
                {notif.date.toLocaleString()}
              </Typography>
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}