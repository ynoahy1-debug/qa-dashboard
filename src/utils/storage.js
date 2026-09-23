import { INITIAL_CALLS, INITIAL_USERS, INITIAL_BATCHES } from './mockData';

const STORAGE_KEYS = {
  CALLS: 'qa_dashboard_calls_v1',
  CURRENT_USER: 'qa_dashboard_current_user_v1',
  USERS: 'qa_dashboard_users_v1',
  BATCHES: 'qa_dashboard_batches_v1',
};

export const getStoredCalls = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CALLS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.CALLS, JSON.stringify(INITIAL_CALLS));
      return INITIAL_CALLS;
    }
    const parsed = JSON.parse(data);
    // Ensure all calls have a batchId (fallback to default batch if missing)
    return parsed.map((c) => ({ ...c, batchId: c.batchId || 'batch_101' }));
  } catch (err) {
    console.error('Error loading stored calls:', err);
    return INITIAL_CALLS;
  }
};

export const saveCallsToStorage = (calls) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CALLS, JSON.stringify(calls));
    window.dispatchEvent(new Event('storage_calls_updated'));
  } catch (err) {
    console.error('Error saving calls:', err);
  }
};

export const getStoredBatches = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BATCHES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(INITIAL_BATCHES));
      return INITIAL_BATCHES;
    }
    return JSON.parse(data);
  } catch (err) {
    return INITIAL_BATCHES;
  }
};

export const saveBatchesToStorage = (batches) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(batches));
    window.dispatchEvent(new Event('storage_batches_updated'));
  } catch (err) {
    console.error('Error saving batches:', err);
  }
};

export const getStoredUsers = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    const parsed = JSON.parse(data);
    const sanitized = parsed.map((u) => {
      const matchInit = INITIAL_USERS.find((iu) => iu.id === u.id || iu.code === u.code);
      return {
        ...u,
        username: u.username || matchInit?.username || u.id,
        password: u.password || matchInit?.password || '123456',
      };
    });
    if (!sanitized.some((u) => u.username === 'admin' || u.role === 'admin')) {
      sanitized.unshift(INITIAL_USERS[0]);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(sanitized));
    return sanitized;
  } catch (err) {
    return INITIAL_USERS;
  }
};

export const saveUsersToStorage = (users) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    window.dispatchEvent(new Event('storage_users_updated'));
  } catch (err) {
    console.error('Error saving users:', err);
  }
};

export const getStoredCurrentUser = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!data) {
      const defaultUser = INITIAL_USERS[1];
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultUser));
      return defaultUser;
    }
    return JSON.parse(data);
  } catch (err) {
    return INITIAL_USERS[1];
  }
};

export const saveCurrentUser = (user) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } catch (err) {
    console.error('Error saving user:', err);
  }
};

export const resetToDefaultData = () => {
  localStorage.setItem(STORAGE_KEYS.CALLS, JSON.stringify(INITIAL_CALLS));
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(INITIAL_BATCHES));
  window.dispatchEvent(new Event('storage_calls_updated'));
  window.dispatchEvent(new Event('storage_users_updated'));
  window.dispatchEvent(new Event('storage_batches_updated'));
  return INITIAL_CALLS;
};
