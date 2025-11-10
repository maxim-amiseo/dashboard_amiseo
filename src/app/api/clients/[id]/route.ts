import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { clientPayloadSchema } from '@/lib/schemas';
import { saveClient } from '@/lib/data';
import { getSessionUser } from '@/lib/auth';
import { ZodError } from 'zod';

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, { params }: RouteParams) {
  const { id } = await params;
  const client = await getClientById(id);

  if (!client) {
    return NextResponse.json({ message: 'Client introuvable.' }, { status: 404 });
  }

  return NextResponse.json(client);
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await getSessionUser();

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ message: 'Accès refusé.' }, { status: 403 });
    }

    const { id } = await params;
    const rawBody = await request.json();
    const payload = clientPayloadSchema.parse(rawBody);
    const targetId = id?.trim();
    if (!targetId) {
      return NextResponse.json({ message: 'Client ID manquant.' }, { status: 400 });
    }

    console.log('PUT /api/clients', { paramId: targetId, payloadId: payload.id });

    const updated = await saveClient({ ...payload, id: targetId });
    revalidatePath('/admin');
    revalidatePath('/dashboard');
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/clients error', error);

    if (error instanceof ZodError) {
      return NextResponse.json({ message: 'Payload invalide', issues: error.issues }, { status: 422 });
    }

    if (error instanceof Error) {
      const status = error.message.includes('introuvable') ? 404 : 400;
      return NextResponse.json({ message: error.message }, { status });
    }

    return NextResponse.json({ message: 'Erreur serveur inconnue' }, { status: 500 });
  }
}
