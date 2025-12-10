export interface LoginData {
  email: string;
  password: string;
}

// export interface LoginResponse {
//    token: string;
//   user: {
//     id: number;
//     name: string;
//     email: string;
//   }
// }

export interface LoginResponse {
  access_token: string;
  role: string
 
}

//Generic response type
export interface ApiResponse<T> {
  message: string;
  data: T;

}



export interface BackendValidationErrors {
  [field: string]: string[] | string;
}

export interface ValidationErrorResponse {
  message?: string;
  errors?: BackendValidationErrors;
}