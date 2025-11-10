// Export tous les services pour un import facile
export { authApiService, tokenStorage } from './auth.service';
export { tasksService } from './tasks.service';
export { usersService } from './users.service';
export { timeEntriesService } from './timeentries.service';
export { projectsService } from './projects.service';
export { databaseMaintenanceService } from './database-maintenance.service';
export { reportsService } from './reports.service';
export { settingsService } from './settings.service';
export { monitoringService } from './monitoring.service';
export { administrationService } from './administration.service';

// Export des types
export type { User as AuthUser, LoginCredentials, LoginResponse } from './auth.service';
export type { CreateTaskDto, UpdateTaskDto } from './tasks.service';
export type { User, CreateUserDto, UpdateUserDto } from './users.service';
export type { TimeEntry, CreateTimeEntryDto, UpdateTimeEntryDto } from './timeentries.service';
export type {
  Project, Group, Theme,
  CreateProjectDto, UpdateProjectDto,
  CreateGroupDto, UpdateGroupDto,
  CreateThemeDto, UpdateThemeDto
} from './projects.service';
export type {
  DatabaseStats, DatabaseInfo,
  DatabaseHealth, DatabaseHealthInfo,
  OptimizationResult
} from './database-maintenance.service';
export type {
  AuditLog, CreateAuditLogDto,
  ReportStatistics, ActivitySummary, UserActivity
} from './reports.service';
export type {
  AppSetting, CreateSettingDto, UpdateSettingDto
} from './settings.service';
export type {
  SystemMetrics, SystemInfo, HealthStatus, HealthCheck,
  LogEntry, LogsResponse, GarbageCollectionResult
} from './monitoring.service';
export type {
  DatabasesSummary, DatabaseSummary,
  ConnectionTestResult, ConnectionTest,
  CleanupResult, DatabaseCleanupResult,
  UsageStatistics, ExportResult
} from './administration.service';
