// common/response/response.interface.ts
export interface ApiResponseType<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: any;
  }
  