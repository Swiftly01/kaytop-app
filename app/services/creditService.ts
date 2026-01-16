import apiClient from "@/lib/apiClient";
import { apiBaseUrl } from "@/lib/config";
import { unifiedUserService } from "@/lib/services/unifiedUser";
import { AxiosError } from "axios";
import {
  CreditOfficerListResponse,
  CreditOfficerLoanCollectionResponse,
  CreditOfficerLoanDisbursedResponse,
  CreditOfficerProfileResponse,
  CreditOfficerProfile,
} from "../types/creditOfficer";

interface QueryParamsProps {
  creditOfficerId?: number;
  page: number;
  limit: number;
}

export class CreditService {
  static async getCreditOfficers({
    page,
    limit,
  }: QueryParamsProps): Promise<CreditOfficerListResponse> {
    try {
      const response = await apiClient.get(
        `${apiBaseUrl}/admin/staff/my-staff`,
        {
          params: {
            page,
            limit,
          },
        }
      );

      //console.log(response);
      return response.data;
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      console.log("Error fetching credit officers", err.response?.data);
      throw err;
    }
  }

  static async getStaffById(
    officerId: number
  ): Promise<CreditOfficerProfileResponse> {
    try {
      // Use unifiedUserService which applies DataTransformers
      const user = await unifiedUserService.getUserById(officerId.toString());
      // Type assertion: The backend may return additional fields beyond the User type
      return {
        data: user as any as CreditOfficerProfile,
      };
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      console.log("Error fetching user by id", err.response?.data);
      throw err;
    }
  }

  static async getLoanDisbursedByCreditOfficer({
    creditOfficerId,
    page,
    limit,
  }: QueryParamsProps): Promise<CreditOfficerLoanDisbursedResponse> {
    try {
      const response = await apiClient.get(
        `${apiBaseUrl}/loans/officer/${creditOfficerId}/disbursed-loans`,
        {
          params: {
            page,
            limit,
          },
        }
      );
      //   console.log(response);
      return {
        data: response.data.data,
        meta: response.data.data.meta ?? null,
      };
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      console.log(
        "Error fetching loan disbursed by credit officer",
        err.response?.data
      );
      throw err;
    }
  }

  static async getLoanCollectionForCreditOfficer({
    creditOfficerId,
    page,
    limit,
  }: QueryParamsProps): Promise<CreditOfficerLoanCollectionResponse> {
    try {
      const response = await apiClient.get(
        `${apiBaseUrl}/loans/officer/${creditOfficerId}/collections`,
        {
          params: {
            page,
            limit,
          },
        }
      );
      //console.log(response);
      return {
        data: response.data.data,
      };
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      console.log(
        "Error fetching loan collection for credit officer",
        err.response?.data
      );
      throw err;
    }
  }
}
