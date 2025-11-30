import apiClient from '../client';
import { User, roleNumberToString } from '@/types/user';

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'Admin' | 'Manager' | 'Employee';
  phoneNumber?: string;
  jobTitle?: string;
  department?: string;
  hireDate?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  isActive?: boolean;
  phoneNumber?: string;
  jobTitle?: string;
  department?: string;
  hireDate?: string;
}

interface ApiUserResponse {
  id?: string;
  Id?: string;
  firstName?: string;
  FirstName?: string;
  lastName?: string;
  LastName?: string;
  email?: string;
  Email?: string;
  role?: number;
  Role?: number;
  isActive?: boolean;
  IsActive?: boolean;
  phoneNumber?: string;
  PhoneNumber?: string;
  jobTitle?: string;
  JobTitle?: string;
  department?: string;
  Department?: string;
  hireDate?: string;
  HireDate?: string;
  avatar?: string;
  Avatar?: string;
  banner?: string;
  Banner?: string;
}

class UsersService {
  private readonly endpoint = '/users';

  /**
   * Helper to normalize user data from API
   */
  private normalizeUser(data: ApiUserResponse): User {
    return {
      id: (data.id || data.Id) ?? '',
      firstName: (data.firstName || data.FirstName) ?? '',
      lastName: (data.lastName || data.LastName) ?? '',
      email: (data.email || data.Email) ?? '',
      role: roleNumberToString((data.role ?? data.Role) ?? 0),
      isActive: data.isActive ?? data.IsActive ?? true,
      phoneNumber: data.phoneNumber || data.PhoneNumber,
      jobTitle: data.jobTitle || data.JobTitle,
      department: data.department || data.Department,
      hireDate: data.hireDate || data.HireDate,
      avatar: data.avatar || data.Avatar,
      banner: data.banner || data.Banner
    };
  }

  /**
   * Récupérer tous les utilisateurs
   */
  async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get<ApiUserResponse[]>(this.endpoint);
    return response.data.map(this.normalizeUser);
  }

  /**
   * Récupérer un utilisateur par ID
   */
  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get<ApiUserResponse>(`${this.endpoint}/${id}`);
    return this.normalizeUser(response.data);
  }

  /**
   * Créer un nouvel utilisateur
   */
  async createUser(user: CreateUserDto): Promise<User> {
    const response = await apiClient.post<ApiUserResponse>(this.endpoint, user);
    return this.normalizeUser(response.data);
  }

  /**
   * Mettre à jour un utilisateur
   */
  async updateUser(id: string, user: UpdateUserDto): Promise<void> {
    await apiClient.put(`${this.endpoint}/${id}`, user);
  }

  /**
   * Supprimer un utilisateur
   */
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Obtenir le profil de l'utilisateur connecté
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiUserResponse>(`${this.endpoint}/me`);
    return this.normalizeUser(response.data);
  }
}

export const usersService = new UsersService();
