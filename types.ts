export interface Project {
  id: string;
  projectName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  startDate: string; // ISO Date string
  endDate: string;   // ISO Date string
  managerEmail: string;
  status: 'On Track' | 'At Risk' | 'Completed' | 'Pending';
  progress: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface EmailTemplate {
  id: string;
  name: string;
  thumbnail?: string; // Optional now, as custom templates might not have icons
  subject: string;
  body: string;
  isCustom?: boolean;
}

export interface CallLogEntry {
  id: string;
  clientName: string;
  clientPhone: string;
  callerName: string;
  startTime: string; // ISO Date string
  endTime: string;   // ISO Date string
  durationSeconds: number;
  notes?: string;
}

export enum AppTab {
  DASHBOARD = 'dashboard',
  PROJECTS = 'projects',
  COMMUNICATION = 'communication',
  IMAGE_STUDIO = 'image_studio',
  ADMIN_DASHBOARD = 'admin_dashboard',
}

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}