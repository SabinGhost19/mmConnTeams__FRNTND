import { ROLE } from "./roles";

export interface User {
  firstName: string; // Am schimbat String la string (lowercase) - standardul TypeScript
  lastName: string;
  email: string;
  password: string;
  role: ROLE;
}

export interface UserTeam {
  id: number;
  name: string;
  email: string;
  avatar: string;
  status: "online" | "offline" | "busy" | "away";
  role: string;
  department: string;
}
