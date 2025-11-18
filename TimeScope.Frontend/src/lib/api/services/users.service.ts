import apiClient from '../client';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: number | 'Admin' | 'Manager' | 'Employee';
  isActive: boolean;
  phoneNumber?: string;
  jobTitle?: string;
  department?: string;
  hireDate?: string;
  // Internal fields - not exposed in API responses
  // createdAt, updatedAt, isDeleted are managed server-side
}

// Helper function to convert role number to string
export const roleNumberToString = (role: number | string): 'Admin' | 'Manager' | 'Employee' => {
  if (typeof role === 'string') {
    return role as 'Admin' | 'Manager' | 'Employee';
  }
  switch (role) {
    case 0: return 'Admin';
    case 1: return 'Manager';
    case 2: return 'Employee';
    default: return 'Employee';
  }
};

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

class UsersService {
  private readonly endpoint = '/users';

  /**
   * Récupérer tous les utilisateurs
   */
  async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get<User[]>(this.endpoint);
    return response.data;
  }

  /**
   * Récupérer un utilisateur par ID
   */
  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get<User>(`${this.endpoint}/${id}`);
    return response.data;
  }

  /**
   * Créer un nouvel utilisateur
   */
  async createUser(user: CreateUserDto): Promise<User> {
    const response = await apiClient.post<User>(this.endpoint, user);
    return response.data;
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
    const response = await apiClient.get<User>(`${this.endpoint}/me`);
    return response.data;
  }
}

export const usersService = new UsersService();
