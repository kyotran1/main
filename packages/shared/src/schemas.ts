import { z } from 'zod';
import type { AgentRole, DepartmentId, TaskStatus } from './domain.js';
import { AGENT_ROLES, DEPARTMENT_IDS, TASK_STATUSES } from './workflow.js';

export const taskPrioritySchema = z.enum(['high', 'medium', 'low']);
export const taskStatusSchema = z.enum(TASK_STATUSES as unknown as [TaskStatus, ...TaskStatus[]]);
export const agentRoleSchema = z.enum(AGENT_ROLES as unknown as [AgentRole, ...AgentRole[]]);
export const departmentIdSchema = z.enum(DEPARTMENT_IDS as unknown as [DepartmentId, ...DepartmentId[]]);

export const createCeoRequestSchema = z.object({
  text: z.string().trim().min(3).max(4000),
  priority: taskPrioritySchema.optional(),
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(2).max(300),
  description: z.string().trim().max(5000).optional(),
  assigneeId: z.string().optional(),
  priority: taskPrioritySchema.optional(),
  dueAt: z.string().optional(),
  projectId: z.string().optional(),
  departmentId: departmentIdSchema.optional(),
});

export const updateTaskSchema = z.object({
  status: taskStatusSchema.optional(),
  assigneeId: z.string().nullable().optional(),
  priority: taskPrioritySchema.optional(),
  progress: z.number().min(0).max(100).optional(),
  focus: z.boolean().optional(),
  dueAt: z.string().nullable().optional(),
});

export const decideApprovalSchema = z.object({
  note: z.string().trim().max(2000).optional(),
});

export const sendAgentMessageSchema = z.object({
  text: z.string().trim().min(1).max(4000),
});

export const updateSettingsSchema = z.object({
  executionMode: z.enum(['local', 'cloud', 'hybrid']).optional(),
  ownerName: z.string().trim().min(1).max(120).optional(),
  companyName: z.string().trim().min(1).max(120).optional(),
});
