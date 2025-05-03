export enum ROLE {
  STUDENT = "STUDENT",
  TEACHER = "TEACHER",
  ADMIN = "ADMIN",
}

// Lowercase role constants for consistent matching in route guards
export const ROLES = {
  student: "STUDENT",
  teacher: "TEACHER",
  admin: "ADMIN",
};
