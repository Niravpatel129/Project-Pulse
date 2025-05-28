import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title');
    const invoiceNumber = searchParams.get('invoiceNumber');
    const customerName = searchParams.get('customerName');

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            padding: '40px 80px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <h1
              style={{
                fontSize: '60px',
                fontWeight: 'bold',
                color: '#000',
                marginBottom: '20px',
              }}
            >
              {title || 'Invoice'}
            </h1>
            {invoiceNumber && (
              <p
                style={{
                  fontSize: '32px',
                  color: '#666',
                  marginBottom: '10px',
                }}
              >
                Invoice #{invoiceNumber}
              </p>
            )}
            {customerName && (
              <p
                style={{
                  fontSize: '32px',
                  color: '#666',
                }}
              >
                For: {customerName}
              </p>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
