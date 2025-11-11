import apiClient from '../client';

// Interfaces
export interface UserRequest {
  id: string;
  name: string;
  email: string;
  requestType: string;
  title: string;
  description: string;
  justification: string;
  priority: string;
  status: string;
  adminResponse?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt?: string;
  isDeleted: boolean;
}

// DTOs
export interface CreateUserRequestDto {
  name: string;
  email: string;
  requestType: string;
  title: string;
  description: string;
  justification: string;
  priority: string;
}

export interface UpdateRequestStatusDto {
  status: string;
  adminResponse?: string;
  reviewedBy?: string;
}

// API Service
class RequestsService {
  private readonly baseUrl = '/requests';

  async createRequest(dto: CreateUserRequestDto): Promise<UserRequest> {
    const response = await apiClient.post<UserRequest>(this.baseUrl, dto);
    return response.data;
  }

  async getAllRequests(): Promise<UserRequest[]> {
    const response = await apiClient.get<UserRequest[]>(this.baseUrl);
    return response.data;
  }

  async getRequestById(id: string): Promise<UserRequest> {
    const response = await apiClient.get<UserRequest>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getRequestsByStatus(status: string): Promise<UserRequest[]> {
    const response = await apiClient.get<UserRequest[]>(`${this.baseUrl}/status/${status}`);
    return response.data;
  }

  async getRequestsByEmail(email: string): Promise<UserRequest[]> {
    const response = await apiClient.get<UserRequest[]>(`${this.baseUrl}/email/${encodeURIComponent(email)}`);
    return response.data;
  }

  async updateRequestStatus(id: string, dto: UpdateRequestStatusDto): Promise<UserRequest> {
    const response = await apiClient.patch<UserRequest>(`${this.baseUrl}/${id}/status`, dto);
    return response.data;
  }

  async deleteRequest(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }
}

export const requestsService = new RequestsService();
