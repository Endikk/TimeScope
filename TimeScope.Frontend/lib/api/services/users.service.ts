import axiosInstance from '../axios.config';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: 'Admin' | 'Manager' | 'Employee';
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  avatar?: string;
  role: 'Admin' | 'Manager' | 'Employee';
}

export interface UpdateUserDto extends Partial<Omit<CreateUserDto, 'password'>> {
  id: string;
  password?: string;
}

class UsersService {
  private readonly endpoint = '/users';

  /**
   * Récupérer tous les utilisateurs
   */
  async getAllUsers(): Promise<User[]> {
    const response = await axiosInstance.get<User[]>(this.endpoint);
    return response.data;
  }

  /**
   * Récupérer un utilisateur par ID
   */
  async getUserById(id: string): Promise<User> {
    const response = await axiosInstance.get<User>(`${this.endpoint}/${id}`);
    return response.data;
  }

  /**
   * Créer un nouvel utilisateur
   */
  async createUser(user: CreateUserDto): Promise<User> {
    const response = await axiosInstance.post<User>(this.endpoint, user);
    return response.data;
  }

  /**
   * Mettre à jour un utilisateur
   */
  async updateUser(id: string, user: UpdateUserDto): Promise<void> {
    await axiosInstance.put(`${this.endpoint}/${id}`, { ...user, id });
  }

  /**
   * Supprimer un utilisateur
   */
  async deleteUser(id: string): Promise<void> {
    await axiosInstance.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Obtenir le profil de l'utilisateur connecté
   */
  async getCurrentUser(): Promise<User> {
    const response = await axiosInstance.get<User>(`${this.endpoint}/me`);
    return response.data;
  }
}

export const usersService = new UsersService();
