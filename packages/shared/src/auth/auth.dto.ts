export interface UserDto {
  id: string;
  name: string;
  phone: string;
}

export interface LoginRequestDto {
  phone: string;
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshRequestDto {
  refreshToken: string;
}

export interface RefreshResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LogoutRequestDto {
  refreshToken: string;
}

export interface LogoutResponseDto {
  ok: boolean;
}
