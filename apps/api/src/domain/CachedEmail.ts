export class CachedEmail {
  id: string;
  to: string;
  subject: string;
  html: string;
  createdAt: number;

  constructor(data: Partial<CachedEmail>) {
    Object.assign(this, data);
  }
}
