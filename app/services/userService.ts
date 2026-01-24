import apiClient from "@/lib/apiClient";
import { apiBaseUrl } from "@/lib/config";
import { AxiosError } from "axios";
import {
  UploadAvatarResponse,
} from "../types/settings";
import { CustomerDataResponse } from "../types/customer";

export class UserService {
  /* ===================== CUSTOMER / USER ===================== */

  static async getStates(): Promise<string[]> {
    try {
      const response = await apiClient.get(`${apiBaseUrl}/users/states`);
      return response.data;
    } catch (error) {
      throw error as AxiosError;
    }
  }

  static async getBranches(): Promise<string[]> {
    try {
      const response = await apiClient.get(`${apiBaseUrl}/users/branches`);
      return response.data;
    } catch (error) {
      throw error as AxiosError;
    }
  }

  /* ===================== ADMIN ===================== */

  static async createCustomer(formData: FormData): Promise<CustomerDataResponse> {
    try {
      const response = await apiClient.post(
        `${apiBaseUrl}/admin/users/customer-details`,
        formData
      );
      return response.data;
    } catch (error) {
      throw error as AxiosError;
    }
  }

  static async updateCustomerBasicInfo(
    userId: number,
    payload: { firstName: string; lastName: string }
  ): Promise<CustomerDataResponse> {
    try {
      const response = await apiClient.patch(
        `${apiBaseUrl}/admin/users/${userId}`,
        payload
      );
      return response.data;
    } catch (error) {
      throw error as AxiosError;
    }
  }

  static async updateGuarantorDetails(
    userId: number,
    formData: FormData
  ): Promise<CustomerDataResponse> {
    try {
      const response = await apiClient.put(
        `${apiBaseUrl}/admin/users/${userId}/guarantor-details`,
        formData
      );
      return response.data;
    } catch (error) {
      throw error as AxiosError;
    }
  }

  static async updateIdVerification(
    userId: number,
    formData: FormData
  ): Promise<CustomerDataResponse> {
    try {
      const response = await apiClient.put(
        `${apiBaseUrl}/admin/users/${userId}/id-verification`,
        formData
      );
      return response.data;
    } catch (error) {
      throw error as AxiosError;
    }
  }

  static async updateVerificationStatus(
    userId: number,
    status: "verified" | "rejected" | "pending"
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.patch(
        `${apiBaseUrl}/admin/users/${userId}/verification-status`,
        { verificationStatus: status }
      );
      return response.data;
    } catch (error) {
      throw error as AxiosError;
    }
  }

  static async updateCustomerProfilePicture(
    userId: number,
    formData: FormData
  ): Promise<UploadAvatarResponse> {
    try {
      const response = await apiClient.put(
        `${apiBaseUrl}/admin/users/${userId}/profile-picture`,
        formData
      );
      return response.data;
    } catch (error) {
      throw error as AxiosError;
    }
  }

   static async updateCustomer(
    userId: number,
    payload: { firstName: string; lastName: string }
  ): Promise<CustomerDataResponse> {
    try {
      const response = await apiClient.patch(
        `${apiBaseUrl}/admin/users/${userId}`,
        payload
      );
      return response.data;
    } catch (error) {
      throw error as AxiosError;
    }
  }

  static async deleteCustomer(
    userId: number
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete(
        `${apiBaseUrl}/admin/users/${userId}`
      );
      return response.data;
    } catch (error) {
      throw error as AxiosError;
    }
  }
}
