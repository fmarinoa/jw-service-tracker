import { PathcResponse, User } from '@jw-tracker/shared';

import { BaseService } from './baseApi';

export class UserApi extends BaseService {
  static async getProfile(): Promise<User> {
    return this.handleRequest<User>({
      path: '/user',
    });
  }

  static async updateSettings(data: {
    preacherType: string;
    monthlyGoal: number;
  }): Promise<PathcResponse> {
    return this.handleRequest<PathcResponse>({
      path: '/user',
      method: 'PATCH',
      body: data,
    });
  }
}
