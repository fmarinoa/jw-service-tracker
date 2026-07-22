import { BaseRepository, BaseRepositoryProps } from './BaseRepository';
import { ReleaseInfo } from '@/domain/ReleaseInfo';

export class HistoryReleasesRepository extends BaseRepository {
  constructor(props: BaseRepositoryProps) {
    super(props);
  }

  async create(release: ReleaseInfo): Promise<ReleaseInfo> {
    return this.handlerCollection(async (collection) => {
      const item = {
        ...this.cleanObject(release),
        createdAt: this.getTimestamp(),
      };
      const result = await collection.insertOne(item);
      return new ReleaseInfo({ ...item, id: result.insertedId.toString() });
    });
  }

  async findLast(): Promise<ReleaseInfo | null> {
    return this.handlerCollection(async (collection) => {
      const [result] = await collection
        .find()
        .sort({ createdAt: -1 })
        .limit(1)
        .toArray();
      if (!result) {
        return null;
      }
      return new ReleaseInfo(result as any);
    });
  }
}
