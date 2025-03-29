import { ROLE } from "./roles";

export interface User {
  firstName: string; // Am schimbat String la string (lowercase) - standardul TypeScript
  lastName: string;
  email: string;
  password: string;
  role: ROLE;
}

export interface UserTeam {
  name: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status?: string;
  avatar?: string | null;
  department?: string | null;
  roles: string[];
}
