import { Paper, Typography } from '@mui/material';

export default function MetricCard({ title, value }) {
  return (
    <Paper elevation={3} sx={{ p: 2, textAlign: 'center', flex: 1 }}>
      <Typography variant="subtitle1">{title}</Typography>
      <Typography variant="h4">{value}</Typography>
    </Paper>
  );
}