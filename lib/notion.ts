import { Client } from '@notionhq/client';
import { Task } from '@/types';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const databaseId = process.env.NOTION_DATABASE_ID!;

interface NotionPropertyBase {
  type: string;
}

interface NotionCheckboxProperty extends NotionPropertyBase {
  type: 'checkbox';
  checkbox: boolean;
}

interface NotionStatusProperty extends NotionPropertyBase {
  type: 'status';
  status?: { name: string };
}

type NotionBooleanProperty = NotionCheckboxProperty | NotionStatusProperty | NotionPropertyBase;

interface NotionPage {
  id: string;
  url: string;
  properties: {
    Name?: { title: Array<{ plain_text: string }> };
    Title?: { title: Array<{ plain_text: string }> };
    Task?: { title: Array<{ plain_text: string }> };
    Done?: NotionBooleanProperty;
    Completed?: NotionBooleanProperty;
    Status?: NotionBooleanProperty;
    'Due Date'?: { date?: { start: string } };
    Deadline?: { date?: { start: string } };
    Date?: { date?: { start: string } };
    Description?: { rich_text: Array<{ plain_text: string }> };
    Notes?: { rich_text: Array<{ plain_text: string }> };
  };
}

export function notionPageToTask(page: NotionPage): Task {
  const properties = page.properties;

  // Extract title
  let title = '';
  const titleProp = properties.Name || properties.Title || properties.Task;
  if (titleProp && titleProp.title && titleProp.title.length > 0) {
    title = titleProp.title[0].plain_text;
  }

  // Extract checkbox/completion status
  let completed = false;
  const checkboxProp = properties.Done || properties.Completed || properties.Status;
  if (checkboxProp) {
    if (checkboxProp.type === 'checkbox') {
      completed = (checkboxProp as NotionCheckboxProperty).checkbox;
    } else if (checkboxProp.type === 'status') {
      const statusProp = checkboxProp as NotionStatusProperty;
      if (statusProp.status) {
        completed = statusProp.status.name === 'Done' || statusProp.status.name === 'Completed';
      }
    }
  }

  // Extract deadline/due date
  let deadline: string | null = null;
  const dateProp = properties['Due Date'] || properties.Deadline || properties.Date;
  if (dateProp && dateProp.date && dateProp.date.start) {
    deadline = dateProp.date.start;
  }

  // Extract description
  let description = '';
  const descProp = properties.Description || properties.Notes;
  if (descProp && descProp.rich_text && descProp.rich_text.length > 0) {
    description = descProp.rich_text[0].plain_text;
  }

  return {
    id: page.id,
    text: title,
    completed,
    description,
    deadline,
    notionId: page.id,
    url: page.url,
  };
}

export async function getTasks(): Promise<Task[]> {
  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [
      {
        timestamp: 'created_time',
        direction: 'descending',
      },
    ],
  });

  return response.results.map((page) => notionPageToTask(page as unknown as NotionPage));
}

export async function createTask(task: Partial<Task>): Promise<Task> {
  const properties: Record<string, unknown> = {
    Name: {
      title: [
        {
          text: {
            content: task.text || '',
          },
        },
      ],
    },
  };

  if (task.completed !== undefined) {
    properties.Done = {
      checkbox: task.completed,
    };
  }

  if (task.description) {
    properties.Description = {
      rich_text: [
        {
          text: {
            content: task.description,
          },
        },
      ],
    };
  }

  if (task.deadline) {
    properties['Due Date'] = {
      date: {
        start: task.deadline,
      },
    };
  }

  const response = await notion.pages.create({
    parent: { database_id: databaseId },
    properties: properties as Parameters<typeof notion.pages.create>[0]['properties'],
  });

  return notionPageToTask(response as unknown as NotionPage);
}

export async function updateTask(id: string, task: Partial<Task>): Promise<Task> {
  const properties: Record<string, unknown> = {};

  if (task.text !== undefined) {
    properties.Name = {
      title: [
        {
          text: {
            content: task.text,
          },
        },
      ],
    };
  }

  if (task.completed !== undefined) {
    properties.Done = {
      checkbox: task.completed,
    };
  }

  if (task.description !== undefined) {
    properties.Description = {
      rich_text: [
        {
          text: {
            content: task.description,
          },
        },
      ],
    };
  }

  if (task.deadline !== undefined) {
    if (task.deadline) {
      properties['Due Date'] = {
        date: {
          start: task.deadline,
        },
      };
    } else {
      properties['Due Date'] = {
        date: null,
      };
    }
  }

  const response = await notion.pages.update({
    page_id: id,
    properties: properties as Parameters<typeof notion.pages.update>[0]['properties'],
  });

  return notionPageToTask(response as unknown as NotionPage);
}

export async function deleteTask(id: string): Promise<void> {
  await notion.pages.update({
    page_id: id,
    archived: true,
  });
}

export function isNotionConfigured(): boolean {
  return !!(process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID);
}
