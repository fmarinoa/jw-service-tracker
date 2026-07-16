import { Platform } from "react-native";
import { AuthTokenStorage } from "../storage/authTokens";
import { EntriesResponse, Entry, User } from "@jw-tracker/shared";

const API_URL = Platform.select({
  ios: "http://localhost:3000",
  android: "http://10.0.2.2:3000",
  default: "http://localhost:3000",
});


export class EntriesApi {
  private static async getHeaders(): Promise<HeadersInit> {
    const token = await AuthTokenStorage.getAccessToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  static async getEntries(page: number, monthOffset: number): Promise<EntriesResponse> {
    const headers = await this.getHeaders();
    const response = await fetch(
      `${API_URL}/entries?page=${page}&limit=10&monthOffset=${monthOffset}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to fetch entries");
    }

    return response.json();
  }

  static async createEntry(data: {
    preachingDate: number;
    hours: number;
    minutes: number;
    type: string;
    notes?: string;
  }): Promise<Entry> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_URL}/entries`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to create entry");
    }

    return response.json();
  }

  static async updateEntry(
    id: string,
    data: {
      preachingDate: number;
      hours: number;
      minutes: number;
      type: string;
      notes?: string;
    }
  ): Promise<void> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_URL}/entries/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to update entry");
    }
  }

  static async deleteEntry(id: string): Promise<void> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_URL}/entries/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to delete entry");
    }
  }

  static async updateUserSettings(data: {
    preacherType: string;
    monthlyGoal: number;
  }): Promise<User> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_URL}/user`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to update settings");
    }

    return response.json();
  }
}
