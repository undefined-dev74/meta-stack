export const USER_TYPE = {
  SUPER_ADMIN: "super_admin",
  EMPLOYEE: "employee",
} as const;

export type USER_TYPE = (typeof USER_TYPE)[keyof typeof USER_TYPE];
