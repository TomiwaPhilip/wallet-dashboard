import { NextRequest, NextResponse } from 'next/server';
import { fetchWalletBalance } from '@/lib/actions/transactions/balance.action';

export async function GET(req: NextRequest) {
  try {

    const balance = await fetchWalletBalance();

    console.log(balance);

    return NextResponse.json({ balance });

  } catch (error) {
    
    return NextResponse.error();
  }
}
