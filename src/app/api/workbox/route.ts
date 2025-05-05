import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    // Get the workbox file path - look for the first workbox file in the public directory
    const publicDir = path.join(process.cwd(), 'public');
    const files = fs.readdirSync(publicDir);
    const workboxFile = files.find((file) => {
      return file.startsWith('workbox-');
    });

    if (!workboxFile) {
      throw new Error('Workbox file not found');
    }

    const filePath = path.join(publicDir, workboxFile);

    // Read the file
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Create response with appropriate headers
    const response = new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

    return response;
  } catch (error) {
    console.error('Error serving workbox script:', error);
    return new NextResponse('Workbox script not found', { status: 404 });
  }
}
