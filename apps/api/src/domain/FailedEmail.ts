export class FailedEmail {
  id: string;
  to: string;
  subject: string;
  html: string;
  error: string;
  createdAt: number;

  constructor(data: Partial<FailedEmail>) {
    Object.assign(this, data);
  }
}
