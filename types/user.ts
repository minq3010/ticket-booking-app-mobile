import { ApiResponse } from "./api";

export enum UserRole {
  Attendee = "attendee",
  Manager = "manager",
}

export type AuthResponse = ApiResponse<{ token: string; user: User }>;

export type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  createdAt: string;
};
