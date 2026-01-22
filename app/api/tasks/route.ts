import { NextResponse } from 'next/server';
import { getTasks, createTask, isNotionConfigured } from '@/lib/notion';

export async function GET() {
  if (!isNotionConfigured()) {
    return NextResponse.json(
      { success: false, error: 'Notion is not configured' },
      { status: 500 }
    );
  }

  try {
    const tasks = await getTasks();
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
    const body = await request.json();
    const task = await createTask(body);
    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('Error creating task in Notion:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
