import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// In-memory storage for development
let transactions: any[] = [];
let nextId = 1;

export async function GET() {
  try {
    return NextResponse.json(transactions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const transaction = {
      _id: nextId.toString(),
      ...body,
      amount: parseFloat(body.amount),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    transactions.push(transaction);
    nextId++;
    
    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}