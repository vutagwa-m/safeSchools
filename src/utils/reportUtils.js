export const logReportAction = async (action) => {
  await addDoc(collection(db, 'logs'), {
    ...action,
    timestamp: new Date(),
    actor: auth.currentUser.uid
  });
};

// Shared with support dashboard
export const updateReportStatus = async (reportId, newStatus) => {
  await updateDoc(doc(db, 'reports', reportId), { status: newStatus });
  await logReportAction({
    type: 'status_change',
    reportId,
    newStatus,
    previousStatus
  });
};