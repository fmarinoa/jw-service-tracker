import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-options';

export async function withAuth() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    };
  }

  return { user, errorResponse: null };
}

interface HandlerOptions {
  requiresAuth?: boolean;
  responseHttpCode?: number;
}

export function handlerApiRequest(
  callback: (req: Request, context: { user?: any; params?: any; body?: any }) => Promise<Response | any>,
  options?: HandlerOptions
) {
  return async (req: Request, { params }: { params?: any } = {}) => {
    try {
      let user = null;
      if (options?.requiresAuth) {
        const auth = await withAuth();
        if (auth.errorResponse) return auth.errorResponse;
        user = auth.user;
      }

      let body = null;
      if (req.method !== 'GET' && req.method !== 'DELETE') {
        try {
          body = await req.json();
        } catch (e) {
          // Body might be empty or not JSON
          body = null;
        }
      }
      const resolvedParams = await params;
      const result = await callback(req, { user, params: resolvedParams, body });

      if (result instanceof Response) {
        return result;
      }

      return NextResponse.json(result, { status: options?.responseHttpCode || 200 });
    } catch (error: any) {
      console.error('API Error:', error);
      return NextResponse.json(
        { error: error.message || 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
}
