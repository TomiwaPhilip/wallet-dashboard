import { NextRequest, NextResponse } from 'next/server';
import { getTransactionHistory } from '@/server/actions/transactions/history.action';

export async function GET(req: NextRequest) {
  try {

    const history = await getTransactionHistory();

    console.log(history);

    return NextResponse.json({ history });

  } catch (error) {
    
    return NextResponse.error();
  }
}
