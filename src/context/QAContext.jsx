import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getStoredCalls,
  saveCallsToStorage,
  getStoredCurrentUser,
  saveCurrentUser,
  getStoredUsers,
  saveUsersToStorage,
  getStoredBatches,
  saveBatchesToStorage,
  resetToDefaultData,
} from '../utils/storage';
import { parseExcelFile } from '../utils/excelHelper';
import {
  supabase,
  isSupabaseConfigured,
  formatCallFromDB,
  formatCallToDB,
} from '../utils/supabaseClient';

const QAContext = createContext();

export const QAProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const storedAuth = localStorage.getItem('qa_is_authenticated_v1');
    return storedAuth === 'true' ? getStoredCurrentUser() : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('qa_is_authenticated_v1') === 'true';
  });

  const [users, setUsers] = useState(getStoredUsers());
  const [batches, setBatches] = useState(getStoredBatches());
  const [calls, setCalls] = useState(getStoredCalls());
  const [isLoadingSupabase, setIsLoadingSupabase] = useState(isSupabaseConfigured);
  
  // Navigation & Filtering state
  const [activeTab, setActiveTab] = useState('calls');
  const [selectedBatchId, setSelectedBatchId] = useState('all'); // 'all' | batchId
  const [filterDuration, setFilterDuration] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMatching, setFilterMatching] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Evaluation Modal
  const [selectedCall, setSelectedCall] = useState(null);

  // Fetch initial data from Supabase if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const fetchSupabaseData = async () => {
      try {
        setIsLoadingSupabase(true);
        const { data: dbBatches } = await supabase.from('batches').select('*').order('created_at', { ascending: false });
        const { data: dbUsers } = await supabase.from('users').select('*');
        const { data: dbCalls } = await supabase.from('calls').select('*');

        if (dbBatches && dbBatches.length > 0) {
          const formattedBatches = dbBatches.map((b) => ({
            id: b.id,
            name: b.name,
            fileName: b.file_name,
            uploadedAt: b.uploaded_at,
            uploadedBy: b.uploaded_by,
            isVisible: b.is_visible,
            totalCallsCount: b.total_calls_count,
          }));
          setBatches(formattedBatches);
          saveBatchesToStorage(formattedBatches);
        }

        if (dbUsers && dbUsers.length > 0) {
          const formattedUsers = dbUsers.map((u) => ({
            id: u.id,
            name: u.name,
            username: u.username,
            password: u.password,
            role: u.role,
            code: u.code,
            avatar: u.avatar,
          }));
          setUsers(formattedUsers);
          saveUsersToStorage(formattedUsers);
        }

        if (dbCalls && dbCalls.length > 0) {
          const formattedCalls = dbCalls.map(formatCallFromDB);
          setCalls(formattedCalls);
          saveCallsToStorage(formattedCalls);
        }
      } catch (err) {
        console.error('Supabase fetch error:', err);
      } finally {
        setIsLoadingSupabase(false);
      }
    };

    fetchSupabaseData();

    // Setup Supabase Realtime Subscription for calls & batches
    const callsSubscription = supabase
      .channel('public:calls')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'calls' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const updatedCall = formatCallFromDB(payload.new);
          setCalls((prev) => {
            const idx = prev.findIndex((c) => c.id === updatedCall.id);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = updatedCall;
              return copy;
            }
            return [...prev, updatedCall];
          });
        } else if (payload.eventType === 'DELETE') {
          setCalls((prev) => prev.filter((c) => c.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(callsSubscription);
    };
  }, []);

  // Sync state across window tabs (for local fallback)
  useEffect(() => {
    const handleStorageUpdate = () => {
      if (!isSupabaseConfigured) {
        setCalls(getStoredCalls());
        setUsers(getStoredUsers());
        setBatches(getStoredBatches());
      }
    };

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('storage_calls_updated', handleStorageUpdate);
    window.addEventListener('storage_users_updated', handleStorageUpdate);
    window.addEventListener('storage_batches_updated', handleStorageUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('storage_calls_updated', handleStorageUpdate);
      window.removeEventListener('storage_users_updated', handleStorageUpdate);
      window.removeEventListener('storage_batches_updated', handleStorageUpdate);
    };
  }, []);

  const updateCalls = (newCalls) => {
    setCalls(newCalls);
    saveCallsToStorage(newCalls);
  };

  const updateBatches = (newBatches) => {
    setBatches(newBatches);
    saveBatchesToStorage(newBatches);
  };

  const loginUser = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    saveCurrentUser(user);
    localStorage.setItem('qa_is_authenticated_v1', 'true');
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('qa_is_authenticated_v1');
    setSelectedCall(null);
    setActiveTab('calls');
  };

  // Add new employee account
  const createEmployeeAccount = async (userData) => {
    const newUser = {
      id: `usr_${Date.now()}`,
      username: userData.username,
      password: userData.password,
      name: userData.name,
      role: 'qa_auditor',
      avatar: userData.avatar || '👨‍💼',
      code: userData.code || `QA-${Math.floor(100 + Math.random() * 900)}`,
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveUsersToStorage(updatedUsers);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('users').insert({
          id: newUser.id,
          name: newUser.name,
          username: newUser.username,
          password: newUser.password,
          role: newUser.role,
          code: newUser.code,
          avatar: newUser.avatar,
        });
      } catch (e) {
        console.error('Supabase insert user error:', e);
      }
    }

    return newUser;
  };

  // Create new Excel Batch & Import Calls
  const createBatchAndImport = async (file, customBatchName) => {
    const batchId = `batch_${Date.now()}`;
    const batchName = customBatchName?.trim() || file.name.replace(/\.[^/.]+$/, "") || `Call Batch ${batches.length + 1}`;
    
    const nowStr = new Date().toISOString().slice(0, 10) + ' ' + new Date().toLocaleTimeString('en-US');
    const parsedCalls = await parseExcelFile(file, batchId);

    const newBatch = {
      id: batchId,
      name: batchName,
      fileName: file.name,
      uploadedAt: nowStr,
      uploadedBy: currentUser?.name || 'admin',
      isVisible: true,
      totalCallsCount: parsedCalls.length,
    };

    const updatedBatches = [...batches, newBatch];
    const updatedCalls = [...calls, ...parsedCalls];

    updateBatches(updatedBatches);
    updateCalls(updatedCalls);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('batches').insert({
          id: newBatch.id,
          name: newBatch.name,
          file_name: newBatch.fileName,
          uploaded_at: newBatch.uploadedAt,
          uploaded_by: newBatch.uploadedBy,
          is_visible: newBatch.isVisible,
          total_calls_count: newBatch.totalCallsCount,
        });

        const dbCallsPayload = parsedCalls.map(formatCallToDB);
        await supabase.from('calls').insert(dbCallsPayload);
      } catch (e) {
        console.error('Supabase batch import error:', e);
      }
    }

    return { batch: newBatch, count: parsedCalls.length };
  };

  // Toggle Batch Visibility for Employees (Admin only)
  const toggleBatchVisibility = async (batchId) => {
    const targetBatch = batches.find((b) => b.id === batchId);
    const newVis = targetBatch ? !targetBatch.isVisible : true;

    const updatedBatches = batches.map((b) => {
      if (b.id === batchId) {
        return { ...b, isVisible: newVis };
      }
      return b;
    });
    updateBatches(updatedBatches);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('batches').update({ is_visible: newVis }).eq('id', batchId);
      } catch (e) {
        console.error('Supabase update batch error:', e);
      }
    }
  };

  // Delete a Batch & its associated calls
  const deleteBatch = async (batchId) => {
    const updatedBatches = batches.filter((b) => b.id !== batchId);
    const updatedCalls = calls.filter((c) => c.batchId !== batchId);
    updateBatches(updatedBatches);
    updateCalls(updatedCalls);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('batches').delete().eq('id', batchId);
      } catch (e) {
        console.error('Supabase delete batch error:', e);
      }
    }
  };

  // Lock a call
  const lockCall = async (callId) => {
    if (!currentUser) return { success: false, message: 'Please log in first!' };
    const targetCall = calls.find((c) => c.id === callId);
    if (!targetCall) return { success: false, message: 'Call not found' };

    if (
      targetCall.status === 'locked' &&
      targetCall.lockedBy &&
      targetCall.lockedBy.userId !== currentUser.id &&
      currentUser.role !== 'admin'
    ) {
      return {
        success: false,
        message: `Call is currently locked by auditor (${targetCall.lockedBy.userName}). You cannot audit it right now!`,
      };
    }

    const nowStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const lockInfo = {
      userId: currentUser.id,
      userName: currentUser.name,
      lockedAt: nowStr,
    };

    const updatedCalls = calls.map((c) => {
      if (c.id === callId) {
        return {
          ...c,
          status: c.status === 'completed' ? 'completed' : 'locked',
          lockedBy: lockInfo,
        };
      }
      return c;
    });

    updateCalls(updatedCalls);
    const updatedCall = updatedCalls.find((c) => c.id === callId);
    setSelectedCall(updatedCall);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('calls').update({
          status: targetCall.status === 'completed' ? 'completed' : 'locked',
          locked_by_user_id: currentUser.id,
          locked_by_user_name: currentUser.name,
          locked_at: nowStr,
        }).eq('id', callId);
      } catch (e) {
        console.error('Supabase lock call error:', e);
      }
    }

    return { success: true };
  };

  // Unlock call
  const unlockCall = async (callId) => {
    const updatedCalls = calls.map((c) => {
      if (c.id === callId) {
        if (c.status === 'completed') return c;
        return {
          ...c,
          status: 'unlocked',
          lockedBy: null,
        };
      }
      return c;
    });
    updateCalls(updatedCalls);
    if (selectedCall?.id === callId) {
      setSelectedCall(null);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('calls').update({
          status: 'unlocked',
          locked_by_user_id: null,
          locked_by_user_name: null,
          locked_at: null,
        }).eq('id', callId);
      } catch (e) {
        console.error('Supabase unlock call error:', e);
      }
    }
  };

  // Save QA Evaluation
  const saveEvaluation = async (callId, evalData) => {
    if (!currentUser) return;
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 10) + ' ' + now.toLocaleTimeString('en-US');

    const evalPayload = {
      status: 'completed',
      lockedBy: null,
      matching: evalData.matching,
      policy: evalData.policy,
      description: evalData.description,
      qa_answer: evalData.qa_answer !== null ? Number(evalData.qa_answer) : null,
      qa_skills: evalData.qa_skills !== null ? Number(evalData.qa_skills) : null,
      qa_diagnosis: evalData.qa_diagnosis !== null ? Number(evalData.qa_diagnosis) : null,
      qa_solve: evalData.qa_solve !== null ? Number(evalData.qa_solve) : null,
      qa_inquiries: evalData.qa_inquiries !== null ? Number(evalData.qa_inquiries) : null,
      qa_case: evalData.qa_case !== null ? Number(evalData.qa_case) : null,
      final_score: evalData.final_score !== null ? Number(evalData.final_score) : null,
      evaluatedBy: {
        userId: currentUser.id,
        userName: currentUser.name,
      },
      evaluatedAt: formattedDate,
    };

    const updatedCalls = calls.map((c) => {
      if (c.id === callId) {
        return {
          ...c,
          ...evalPayload,
        };
      }
      return c;
    });

    updateCalls(updatedCalls);
    setSelectedCall(null);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('calls').update({
          status: 'completed',
          locked_by_user_id: null,
          locked_by_user_name: null,
          locked_at: null,
          matching: evalData.matching,
          policy: evalData.policy,
          description: evalData.description,
          qa_answer: evalData.qa_answer !== null ? Number(evalData.qa_answer) : null,
          qa_skills: evalData.qa_skills !== null ? Number(evalData.qa_skills) : null,
          qa_diagnosis: evalData.qa_diagnosis !== null ? Number(evalData.qa_diagnosis) : null,
          qa_solve: evalData.qa_solve !== null ? Number(evalData.qa_solve) : null,
          qa_inquiries: evalData.qa_inquiries !== null ? Number(evalData.qa_inquiries) : null,
          qa_case: evalData.qa_case !== null ? Number(evalData.qa_case) : null,
          final_score: evalData.final_score !== null ? Number(evalData.final_score) : null,
          evaluated_by_user_id: currentUser.id,
          evaluated_by_user_name: currentUser.name,
          evaluated_at: formattedDate,
        }).eq('id', callId);
      } catch (e) {
        console.error('Supabase save evaluation error:', e);
      }
    }
  };

  const handleResetData = () => {
    const defaultCalls = resetToDefaultData();
    setCalls(defaultCalls);
    setUsers(getStoredUsers());
    setBatches(getStoredBatches());
    setSelectedCall(null);
  };

  const parseDurationInMinutes = (durStr) => {
    if (!durStr) return 0;
    const parts = String(durStr).split(':');
    if (parts.length === 2) {
      return parseInt(parts[0], 10) + parseInt(parts[1], 10) / 60;
    }
    const num = parseFloat(durStr);
    return isNaN(num) ? 0 : num;
  };

  // Filtered Calls list (with batch & role visibility rules)
  const filteredCalls = calls.filter((call) => {
    // Check batch visibility for employees vs admin
    const parentBatch = batches.find((b) => b.id === call.batchId);
    const isAdmin = currentUser?.role === 'admin';

    // If regular employee, batch MUST be visible
    if (!isAdmin && parentBatch && !parentBatch.isVisible) {
      return false;
    }

    // Selected batch filter
    if (selectedBatchId !== 'all' && call.batchId !== selectedBatchId) {
      return false;
    }

    // Duration filter
    const durMins = parseDurationInMinutes(call.duration_minutes);
    if (filterDuration === '0-3' && !(durMins >= 0 && durMins <= 3)) return false;
    if (filterDuration === '4-7' && !(durMins > 3 && durMins <= 7)) return false;
    if (filterDuration === '7-10' && !(durMins > 7 && durMins <= 10)) return false;
    if (filterDuration === '10-14' && !(durMins > 10 && durMins <= 14)) return false;
    if (filterDuration === '>14' && !(durMins > 14)) return false;

    // Status & Matching filter
    if (filterStatus !== 'all' && call.status !== filterStatus) return false;
    if (filterMatching !== 'all' && call.matching !== filterMatching) return false;

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchNum = String(call.call_number).toLowerCase().includes(q);
      const matchAgent = String(call.agent_name).toLowerCase().includes(q);
      const matchGroup = String(call.group_name).toLowerCase().includes(q);
      if (!matchNum && !matchAgent && !matchGroup) return false;
    }

    return true;
  });

  return (
    <QAContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        users,
        batches,
        calls,
        filteredCalls,
        activeTab,
        setActiveTab,
        selectedBatchId,
        setSelectedBatchId,
        filterDuration,
        setFilterDuration,
        filterStatus,
        setFilterStatus,
        filterMatching,
        setFilterMatching,
        searchQuery,
        setSearchQuery,
        selectedCall,
        setSelectedCall,
        loginUser,
        logoutUser,
        createEmployeeAccount,
        createBatchAndImport,
        toggleBatchVisibility,
        deleteBatch,
        lockCall,
        unlockCall,
        saveEvaluation,
        handleResetData,
      }}
    >
      {children}
    </QAContext.Provider>
  );
};

export const useQA = () => {
  const context = useContext(QAContext);
  if (!context) throw new Error('useQA must be used within QAProvider');
  return context;
};
