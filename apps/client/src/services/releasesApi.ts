import { CheckUpdateResponse } from '@jw-tracker/shared';
import Constants from 'expo-constants';

import { BaseService } from './baseApi';

export class ReleasesApi extends BaseService {
  static async checkUpdate(version?: string): Promise<CheckUpdateResponse> {
    const currentVersion = version || Constants.expoConfig?.version || '0.0.1';

    return this.handleRequest<CheckUpdateResponse>({
      path: '/releases/check',
      queryParams: { version: currentVersion },
    });
  }
}
