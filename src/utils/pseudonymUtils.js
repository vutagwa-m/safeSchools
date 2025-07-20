export const getDisplayData = (user, showRealData = false) => {
  if (showRealData && user.role === 'admin') {
    return {
      name: user.name || user.email,
      contact: user.phone || user.email
    };
  }
  return {
    name: user.pseudonym || `User-${user.uid.slice(0, 6)}`,
    contact: 'Hidden'
  };
};

const displayData = getDisplayData(user, adminSettings.showRealIdentifiers);