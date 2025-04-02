import { NextResponse } from 'next/server';

export interface ProjectModule {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// This is a mock database - replace with your actual database
const modules: ProjectModule[] = [
  {
    id: '1',
    name: 'Project Brief',
    description: 'Project overview document',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Design Assets',
    description: 'Logos and brand guidelines',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Contract',
    description: 'Signed agreement document',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Timeline',
    description: 'Project milestones and deadlines',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Requirements',
    description: 'Technical specifications',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function GET() {
  return NextResponse.json(modules);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newModule: ProjectModule = {
      id: Math.random().toString(36).substr(2, 9),
      name: body.name,
      description: body.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    modules.push(newModule);
    return NextResponse.json(newModule, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create module' }, { status: 500 });
  }
}
