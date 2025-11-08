/**
 * Application constants
 * Centralized location for all magic strings and constant values
 */

/**
 * API Configuration Constants
 */
export const API_CONFIG = {
  /** Default request timeout in milliseconds */
  TIMEOUT: 30000,
  /** Token refresh retry attempts */
  REFRESH_RETRY_ATTEMPTS: 3,
} as const;

/**
 * Local Storage Keys
 * Centralized keys for localStorage access
 */
export const STORAGE_KEYS = {
  /** JWT access token */
  TOKEN: 'token',
  /** JWT refresh token */
  REFRESH_TOKEN: 'refreshToken',
  /** User object */
  USER: 'user',
  /** Sidebar state (open/closed) */
  SIDEBAR_STATE: 'sidebar_state',
  /** Theme preference (light/dark) */
  THEME: 'theme',
} as const;

/**
 * Route Paths
 * Application route constants
 */
export const ROUTES = {
  /** Public routes */
  LOGIN: '/login',

  /** Protected routes */
  HOME: '/home',
  DASHBOARD: '/dashboard',
  TIMESHEET: '/timesheet',
  CONTACT: '/contact',

  /** Admin routes */
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/user_management',
  ADMIN_PROJECTS: '/admin/projects',
  ADMIN_TASKS: '/admin/tasks',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_MONITORING: '/admin/monitoring',
  ADMIN_DATABASE: '/admin/database-maintenance',
  ADMIN_SETTINGS: '/admin/settings',
} as const;

/**
 * User Role Constants
 */
export const USER_ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  USER: 'User',
} as const;

/**
 * UI Constants
 */
export const UI_CONFIG = {
  /** Mobile breakpoint in pixels */
  MOBILE_BREAKPOINT: 768,
  /** Sidebar width when expanded */
  SIDEBAR_WIDTH: '16rem',
  /** Sidebar width on mobile */
  SIDEBAR_WIDTH_MOBILE: '18rem',
  /** Sidebar width when collapsed */
  SIDEBAR_WIDTH_ICON: '3rem',
  /** Default page size for pagination */
  DEFAULT_PAGE_SIZE: 10,
  /** Toast display duration in milliseconds */
  TOAST_DURATION: 3000,
} as const;

/**
 * Date Format Constants
 */
export const DATE_FORMATS = {
  /** Standard date format (YYYY-MM-DD) */
  STANDARD: 'yyyy-MM-dd',
  /** Display format (DD/MM/YYYY) */
  DISPLAY: 'dd/MM/yyyy',
  /** DateTime format */
  DATETIME: 'dd/MM/yyyy HH:mm',
  /** Time only format */
  TIME: 'HH:mm',
} as const;

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Validation Rules
 */
export const VALIDATION = {
  /** Minimum password length */
  MIN_PASSWORD_LENGTH: 8,
  /** Maximum password length */
  MAX_PASSWORD_LENGTH: 128,
  /** Minimum username length */
  MIN_USERNAME_LENGTH: 3,
  /** Maximum username length */
  MAX_USERNAME_LENGTH: 50,
  /** Email regex pattern */
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

/**
 * Project Status Constants
 */
export const PROJECT_STATUS = {
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold',
  CANCELLED: 'Cancelled',
} as const;

/**
 * Task Priority Constants
 */
export const TASK_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
} as const;

/**
 * Task Status Constants
 */
export const TASK_STATUS = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
  BLOCKED: 'Blocked',
} as const;

/**
 * Type exports for type-safe constant usage
 */
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type ProjectStatus = typeof PROJECT_STATUS[keyof typeof PROJECT_STATUS];
export type TaskPriority = typeof TASK_PRIORITY[keyof typeof TASK_PRIORITY];
export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];
export type RoutePath = typeof ROUTES[keyof typeof ROUTES];
