import {
  LoginRequestDto,
  LoginResponseDto,
  LogoutRequestDto,
  LogoutResponseDto,
  RefreshRequestDto,
  RefreshResponseDto,
  UserDto,
} from "@jw-tracker/shared";
import { BaseService } from "./baseApi";
import { Platform } from "react-native";

export class AuthApi extends BaseService {
  static async login(data: LoginRequestDto): Promise<LoginResponseDto> {
    return this.handleRequest<LoginResponseDto>({
      path: "/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        ...data,
        platform: Platform.OS === "web" ? "web" : Platform.OS,
        deviceName: `${Platform.OS} device`,
  }})
    }
  

  static async register(data: any): Promise<any> {
    return this.handleRequest<any>({
      path: "/auth/register",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: data,
    });
  }

  static async refresh(refreshToken: string): Promise<RefreshResponseDto> {
    return this.handleRequest<RefreshResponseDto>({
      path: "/auth/refresh",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { refreshToken } as RefreshRequestDto,
    
    })
  }

  static async logout(refreshToken: string): Promise<LogoutResponseDto> {
    return this.handleRequest<LogoutResponseDto>({
      path: "/auth/logout",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { refreshToken } as LogoutRequestDto,
    });
  }
}
