export default function RoleRestricted({ children, allowedRoles }) {
  const { user } = useAuth();
  
  if (!allowedRoles.includes(user?.role)) {
    return <Alert severity="error">Access Denied</Alert>;
  }

  return children;
}

// Usage:
<RoleRestricted allowedRoles={['admin', 'super-admin']}>
  <UserManagement />
</RoleRestricted>