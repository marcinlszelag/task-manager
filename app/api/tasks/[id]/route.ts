import { NextResponse } from 'next/server';
import { updateTask, deleteTask, isNotionConfigured } from '@/lib/notion';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isNotionConfigured()) {
    return NextResponse.json(
      { success: false, error: 'Notion is not configured' },
      { status: 500 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const task = await updateTask(id, body);
    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('Error updating task in Notion:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isNotionConfigured()) {
    return NextResponse.json(
      { success: false, error: 'Notion is not configured' },
      { status: 500 }
    );
  }

  try {
    const { id } = await params;
    await deleteTask(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task in Notion:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
