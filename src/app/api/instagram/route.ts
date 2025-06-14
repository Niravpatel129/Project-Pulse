import { NextResponse } from 'next/server';

const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID;
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  if (!INSTAGRAM_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: 'Instagram access token is not configured' },
      { status: 500 },
    );
  }

  try {
    // First, get the user's ID from their username
    const userResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${INSTAGRAM_ACCESS_TOKEN}`,
    );

    if (!userResponse.ok) {
      throw new Error('Failed to fetch Instagram user data');
    }

    const userData = await userResponse.json();

    // Then, get their media
    const mediaResponse = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${INSTAGRAM_ACCESS_TOKEN}`,
    );

    if (!mediaResponse.ok) {
      throw new Error('Failed to fetch Instagram media');
    }

    const mediaData = await mediaResponse.json();

    return NextResponse.json(mediaData.data);
  } catch (error) {
    console.error('Error fetching Instagram data:', error);
    return NextResponse.json({ error: 'Failed to fetch Instagram data' }, { status: 500 });
  }
}
