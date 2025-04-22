// Create a global object to track import progress that components can access
export const importProgress = {
  progress: 0,
  status: '',
  isImporting: false,
  tableId: null,
  // Force import state to true until explicitly finished
  updateProgress: (progress: number, status: string, newTableId = null) => {
    console.log(`Import progress: ${progress}%, status: ${status}`);
    importProgress.progress = progress;
    importProgress.status = status;
    // Always keep importing true during the import process
    importProgress.isImporting = true;

    if (newTableId) {
      importProgress.tableId = newTableId;
    }

    // Use this approach to ensure UI updates
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('import-progress-update'));
    }, 0);
  },
  // Explicitly set importing to false - only used when canceling
  finishImport: () => {
    console.log('Finishing import, isImporting set to false');
    importProgress.isImporting = false;
    importProgress.progress = 0;
    importProgress.status = '';
    window.dispatchEvent(new CustomEvent('import-progress-update'));
  },
  // Navigate to new table without closing dialog first
  navigateToTable: () => {
    if (importProgress.tableId) {
      console.log('Navigating to new table:', importProgress.tableId);
      // Keep dialog open during navigation
      window.location.href = `/database/${importProgress.tableId}`;
    }
  },
};
