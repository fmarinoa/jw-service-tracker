import { existsSync, readFileSync } from 'node:fs';

import { join } from 'path';

import { User } from './User';

// __dirname points at dist/ under the webpack bundle (single file) but at
// dist/domain/ in the unbundled dev build, so try both known layouts.
function templatesDir(): string {
  const candidates = [
    join(__dirname, 'templates'),
    join(__dirname, '../templates'),
  ];
  const found = candidates.find(existsSync);
  if (!found) {
    throw new Error(
      `Templates directory not found. Tried: ${candidates.join(', ')}`,
    );
  }
  return found;
}

function renderTemplate(
  fileName: string,
  placeholders: Record<string, string>,
): string {
  const raw = readFileSync(join(templatesDir(), fileName), 'utf-8');
  return raw.replace(/{{(\w+)}}/g, (_, key: string) => placeholders[key] ?? '');
}

export class EmailMessage {
  to: string;
  subject: string;
  html: string;

  constructor(data: Partial<EmailMessage>) {
    Object.assign(this, data);
  }

  static buildUserApprovedMessage(user: User): EmailMessage {
    if (!user.email) {
      throw new Error(
        `User with ID ${user.id} has no email. Cannot build approval email message.`,
      );
    }
    return new EmailMessage({
      to: user.email,
      subject: 'Tu cuenta fue aprobada',
      html: renderTemplate('user-approved.html.template', {
        name: user.name,
      }),
    });
  }
}
