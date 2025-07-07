// Base repository
export { BaseRepository } from './base-repository'
export type { PaginationOptions, PaginationResult } from './base-repository'

// User repository
export { UserRepository } from './user-repository'

// Admin repository
export { AdminRepository } from './admin-repository'
export type { AdminWithUser } from './admin-repository'

// Admin service (status-aware business logic)
export { AdminService } from '../services/admin-service'
export type {
    DashboardStats,
    DoctorApplication,
    UserOverview
} from '../services/admin-service'

