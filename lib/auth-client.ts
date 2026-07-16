import {
  LoginRequestDto,
  LoginResponseDto,
  LogoutRequestDto,
  LogoutResponseDto,
  RefreshRequestDto,
  RefreshResponseDto,
  UserMeDto,
} from "@jw-tracker/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export class AuthClient {
  static async login(data: LoginRequestDto): Promise<LoginResponseDto> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, platform: "web" }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to log in");
    }

    return response.json();
  }

  static async refresh(refreshToken: string): Promise<RefreshResponseDto> {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken } as RefreshRequestDto),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to refresh token");
    }

    return response.json();
  }

  static async logout(refreshToken: string): Promise<LogoutResponseDto> {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken } as LogoutRequestDto),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to log out");
    }

    return response.json();
  }

  static async me(accessToken: string): Promise<UserMeDto> {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to get current user info");
    }

    return response.json();
  }
}
