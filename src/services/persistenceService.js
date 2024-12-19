const STORAGE_KEYS = {
    ORG_CHART: 'orgChart',
    BOOKMARKS: 'orgChartBookmarks',
    VERSION: 'orgChartVersion',
    LAST_MODIFIED: 'orgChartLastModified'
  };
  
  const CURRENT_VERSION = '1.0';
  const STORAGE_RETRY_LIMIT = 3;
  
  class PersistenceService {
    constructor() {
      this.retryCount = 0;
      this.initializeStorage();
    }
  
    initializeStorage() {
      try {
        const currentVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
        
        // Validate existing data structure
        if (currentVersion) {
          const data = this.loadData();
          if (data && !this.isValidDataStructure(data)) {
            console.warn('Invalid data structure detected, attempting recovery');
            this.attemptDataRecovery();
          }
        } else {
          // Migration for existing data
          const oldData = localStorage.getItem(STORAGE_KEYS.ORG_CHART);
          if (oldData) {
            this.migrateOldData(oldData);
          }
          localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
        }
      } catch (error) {
        console.error('Storage initialization failed:', error);
        this.handleStorageError(error);
      }
    }

    isValidDataStructure(data) {
      return data && 
        data.data && 
        typeof data.data === 'object' &&
        Array.isArray(data.data.allIds) &&
        typeof data.data.byId === 'object' &&
        typeof data.data.version === 'number';
    }

    attemptDataRecovery() {
      try {
        const rawData = localStorage.getItem(STORAGE_KEYS.ORG_CHART);
        if (!rawData) return;
  
        const parsedData = JSON.parse(rawData);
        
        // Attempt to reconstruct valid data structure
        const recoveredData = {
          data: {
            byId: {},
            allIds: [],
            version: 0
          },
          lastModified: Date.now(),
          version: CURRENT_VERSION
        };
  
        if (parsedData.data) {
          if (typeof parsedData.data.byId === 'object') {
            recoveredData.data.byId = parsedData.data.byId;
          }
          if (Array.isArray(parsedData.data.allIds)) {
            recoveredData.data.allIds = parsedData.data.allIds;
          }
          if (typeof parsedData.data.version === 'number') {
            recoveredData.data.version = parsedData.data.version;
          }
        }
  
        // Validate IDs match between byId and allIds
        recoveredData.data.allIds = Object.keys(recoveredData.data.byId);
        
        this.saveData(recoveredData.data);
        console.log('Data recovery successful');
      } catch (error) {
        console.error('Data recovery failed:', error);
        this.clearStorage();
      }
    }

    saveData(data) {
      try {
        if (!this.isValidDataStructure({ data })) {
          throw new Error('Invalid data structure');
        }
  
        const storageData = {
          data,
          lastModified: Date.now(),
          version: CURRENT_VERSION
        };
        
        const dataString = JSON.stringify(storageData);
        
        try {
          localStorage.setItem(STORAGE_KEYS.ORG_CHART, dataString);
          localStorage.setItem(STORAGE_KEYS.LAST_MODIFIED, Date.now().toString());
          this.retryCount = 0; // Reset retry count on successful save
          return true;
        } catch (error) {
          if (this.retryCount < STORAGE_RETRY_LIMIT) {
            this.retryCount++;
            this.handleStorageError(error);
            return this.saveData(data); // Retry save after cleanup
          }
          throw error;
        }
      } catch (error) {
        console.error('Save operation failed:', error);
        return false;
      }
    }
  
    loadData() {
      try {
        const storageData = localStorage.getItem(STORAGE_KEYS.ORG_CHART);
        if (!storageData) return null;
  
        const parsed = JSON.parse(storageData);
        
        // Additional validation for loaded data
        if (!this.isValidDataStructure(parsed)) {
          console.warn('Invalid data structure detected during load');
          return null;
        }
  
        const { data, lastModified, version } = parsed;
        
        // Version compatibility check
        if (version !== CURRENT_VERSION) {
          console.warn('Data version mismatch, migration may be needed');
          // Could add version-specific migrations here
        }
  
        return {
          data,
          lastModified,
          version
        };
      } catch (error) {
        console.error('Load operation failed:', error);
        this.handleStorageError(error);
        return null;
      }
    }
  
    saveBookmark(name, state) {
      try {
        const bookmarks = this.loadBookmarks();
        bookmarks[name] = {
          state,
          timestamp: Date.now()
        };
        
        localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
        return true;
      } catch (error) {
        console.error('Failed to save bookmark:', error);
        this.handleStorageError(error);
        return false;
      }
    }
  
    loadBookmarks() {
      try {
        const bookmarksData = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
        return bookmarksData ? JSON.parse(bookmarksData) : {};
      } catch (error) {
        console.error('Failed to load bookmarks:', error);
        this.handleStorageError(error);
        return {};
      }
    }
  
    deleteBookmark(name) {
      try {
        const bookmarks = this.loadBookmarks();
        delete bookmarks[name];
        localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
        return true;
      } catch (error) {
        console.error('Failed to delete bookmark:', error);
        this.handleStorageError(error);
        return false;
      }
    }
  
    clearStorage() {
      try {
        Object.values(STORAGE_KEYS).forEach(key => {
          localStorage.removeItem(key);
        });
        this.retryCount = 0;
      } catch (error) {
        console.error('Failed to clear storage:', error);
      }
    }

    // Enhanced error handling
    handleStorageError(error) {
      if (error.name === 'QuotaExceededError' || 
          error.code === 22 || 
          error.code === 1014) {
        // Try to free up space
        const keys = Object.keys(localStorage);
        const orgChartKeys = keys.filter(key => 
          key.startsWith('orgChart') || 
          key.startsWith('bookmark')
        );

        if (orgChartKeys.length > 0) {
          // Remove all except the most recent data
          orgChartKeys
            .sort((a, b) => {
              const timeA = localStorage.getItem(`${a}_modified`) || 0;
              const timeB = localStorage.getItem(`${b}_modified`) || 0;
              return timeB - timeA;
            })
            .slice(1) // Keep the most recent
            .forEach(key => localStorage.removeItem(key));
        }
      }
    }
  
    // Utility function to check storage availability
    isStorageAvailable() {
      try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch (e) {
        return false;
      }
    }
  }
  
  export const persistenceService = new PersistenceService();