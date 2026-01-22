import { NextResponse } from 'next/server';
import { getTasks, createTask, isNotionConfigured } from '@/lib/notion';

export async function GET(request: Request) {
  if (!isNotionConfigured()) {
    return NextResponse.json(
      { success: false, error: 'Notion is not configured' },
      { status: 500 }
    );
  }

  try {
    // Get user email from header for filtering
    const userEmail = request.headers.get('x-user-email') || undefined;

    const tasks = await getTasks(userEmail);
    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    console.error('Error fetching tasks from Notion:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!isNotionConfigured()) {
    return NextResponse.json(
      { success: false, error: 'Notion is not configured' },
      { status: 500 }
    );
  }

  try {
    // Get user email from header
    const userEmail = request.headers.get('x-user-email') || undefined;

    const body = await request.json();
    const task = await createTask(body, userEmail);
    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('Error creating task in Notion:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
