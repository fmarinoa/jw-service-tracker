import { PatchResponse, UpdateUserRequestDto, User } from '@jw-tracker/shared';

import { BaseService } from './baseApi';

export class UserApi extends BaseService {
  static async getProfile(): Promise<User> {
    return this.handleRequest<User>({
      path: '/user',
    });
  }

  static async updateSettings(
    data: UpdateUserRequestDto,
  ): Promise<PatchResponse> {
    return this.handleRequest<PatchResponse>({
      path: '/user',
      method: 'PATCH',
      body: data,
    });
  }
}
