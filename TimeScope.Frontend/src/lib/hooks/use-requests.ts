import { useState, useEffect } from 'react';
import { requestsService, UserRequest, CreateUserRequestDto, UpdateRequestStatusDto } from '../api/services/requests.service';

export function useRequests() {
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await requestsService.getAllRequests();
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestsByStatus = async (status: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await requestsService.getRequestsByStatus(status);
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const createRequest = async (dto: CreateUserRequestDto) => {
    setLoading(true);
    setError(null);
    try {
      const newRequest = await requestsService.createRequest(dto);
      setRequests((prev) => [...prev, newRequest]);
      return newRequest;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create request');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (id: string, dto: UpdateRequestStatusDto) => {
    setLoading(true);
    setError(null);
    try {
      const updatedRequest = await requestsService.updateRequestStatus(id, dto);
      setRequests((prev) =>
        prev.map((req) => (req.id === id ? updatedRequest : req))
      );
      return updatedRequest;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update request');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRequest = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await requestsService.deleteRequest(id);
      setRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete request');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRequests();
  }, []);

  return {
    requests,
    loading,
    error,
    fetchAllRequests,
    fetchRequestsByStatus,
    createRequest,
    updateRequestStatus,
    deleteRequest,
  };
}
