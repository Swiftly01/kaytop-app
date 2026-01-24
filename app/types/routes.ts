export interface Routes {
  Auth: {
    LOGIN: string;
    FORGOT_PASSWORD: string;
    VERIFY_OTP: string;
    RESET_PASSWORD: string;
  };
  Bm: {
    Auth: {
      LOGIN: string;
      FORGOT_PASSWORD: string;
      VERIFY_OTP: string;
      RESET_PASSWORD: string;
    };
    DASHBOARD: string;
    CREDIT: string;
    CUSTOMERS: string;
    LOAN: string;
    REPORT: string;
    SETTING: string;
  };
  User: {
    Auth: {
      LOGIN: string;
      FORGOT_PASSWORD: string;
      VERIFY_OTP: string;
      RESET_PASSWORD: string;
    };
  };
}

export interface MenuItem {
  icon: string;
  label: string;
  link: string;
  exact?: boolean;
}
