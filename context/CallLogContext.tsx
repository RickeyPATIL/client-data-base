import React, { createContext, useContext, useState, useEffect } from 'react';
import { CallLogEntry } from '../types';

interface CallLogContextType {
  logs: CallLogEntry[];
  addLog: (log: Omit<CallLogEntry, 'id'>) => void;
  clearLogs: () => void;
}

const CallLogContext = createContext<CallLogContextType | undefined>(undefined);

export const CallLogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<CallLogEntry[]>([]);

  // Load logs from local storage on mount
  useEffect(() => {
    const storedLogs = localStorage.getItem('projectflow_call_logs');
    if (storedLogs) {
      try {
        setLogs(JSON.parse(storedLogs));
      } catch (e) {
        console.error("Failed to parse call logs", e);
      }
    }
  }, []);

  const addLog = (entry: Omit<CallLogEntry, 'id'>) => {
    const newLog: CallLogEntry = {
      ...entry,
      id: `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    localStorage.setItem('projectflow_call_logs', JSON.stringify(updatedLogs));
  };

  const clearLogs = () => {
    setLogs([]);
    localStorage.removeItem('projectflow_call_logs');
  };

  return (
    <CallLogContext.Provider value={{ logs, addLog, clearLogs }}>
      {children}
    </CallLogContext.Provider>
  );
};

export const useCallLog = () => {
  const context = useContext(CallLogContext);
  if (context === undefined) {
    throw new Error('useCallLog must be used within a CallLogProvider');
  }
  return context;
};