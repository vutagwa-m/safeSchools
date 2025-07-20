import { 
  DataGrid, 
  GridToolbar,
  GridFilterPanel,
  GridFilterInput
} from '@mui/x-data-grid';
import { useAdmin } from '../../context/AdminContext';

const logColumns = [
  { field: 'timestamp', headerName: 'Time', width: 180 },
  { field: 'actionType', headerName: 'Action', width: 150 },
  { field: 'actorName', headerName: 'User', width: 180 },
  { field: 'reportId', headerName: 'Report ID', width: 150 },
  { field: 'details', headerName: 'Details', flex: 1 }
];

export default function SystemLogs() {
  const { systemLogs } = useAdmin();
  const [filterModel, setFilterModel] = useState({
    items: [{ field: 'actionType', operator: 'contains', value: '' }]
  });

  return (
    <Box sx={{ height: '70vh', width: '100%' }}>
      <DataGrid
        rows={systemLogs}
        columns={logColumns}
        components={{
          Toolbar: GridToolbar,
          FilterPanel: GridFilterPanel,
          FilterInput: GridFilterInput
        }}
        filterModel={filterModel}
        onFilterModelChange={(model) => setFilterModel(model)}
        componentsProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 }
          }
        }}
      />
    </Box>
  );
}