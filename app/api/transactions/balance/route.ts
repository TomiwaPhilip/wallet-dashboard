import { NextRequest, NextResponse } from 'next/server';
import { fetchWalletBalance } from '@/server/actions/transactions/balance.action';
import { formatBigIntToFixed } from '@/components/shared/formatBigInt';

export async function GET(req: NextRequest) {
  try {
    const balance = await fetchWalletBalance();

    console.log(balance, "at the route");

    // Convert bigint to string before returning
    return NextResponse.json({ balance });

  } catch (error) {
    console.error('Error fetching balance:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
