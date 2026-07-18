export interface OfflineMutation {
  id: string;
  type: 'CREATE_ENTRY' | 'UPDATE_ENTRY' | 'DELETE_ENTRY' | 'UPDATE_SETTINGS';
  tempId?: string;
  entryId?: string;
  payload: any;
}
