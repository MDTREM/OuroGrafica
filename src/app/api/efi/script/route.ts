import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const v = searchParams.get('v');
    const accountId = process.env.NEXT_PUBLIC_EFI_ACCOUNT_ID;

    if (!accountId || accountId.includes("INSERIR")) {
        return NextResponse.json({ error: 'Account ID not configured' }, { status: 500 });
    }

    // Target URL for the Efí payment token script
    // We forward the 'v' parameter (version buster) if present
    const targetUrl = `https://payment-token.efi.com.br/payment-token/${accountId}/protect${v ? `?v=${v}` : ''}`;

    try {
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                // Forward the actual referer or origin so Efí can validate the domain
                'Referer': request.headers.get('referer') || request.headers.get('origin') || 'https://ourografica.site',
            }
        });

        if (!response.ok) {
            console.error(`Efí script fetch failed: ${response.status} ${response.statusText} for URL: ${targetUrl}`);
            return NextResponse.json({ error: 'Failed to fetch external script', details: response.statusText }, { status: response.status });
        }

        const scriptContent = await response.text();

        return new NextResponse(scriptContent, {
            headers: {
                'Content-Type': 'application/javascript',
                'Cache-Control': 'no-store, max-age=0',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error('Error proxying Efí script:', error);
        return NextResponse.json({ error: 'Internal Proxy Error', details: String(error) }, { status: 500 });
    }
}
