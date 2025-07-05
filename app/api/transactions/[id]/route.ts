import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// In-memory storage for development
let transactions: any[] = [];

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const transactionIndex = transactions.findIndex(t => t._id === params.id);
    
    if (transactionIndex === -1) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    const updateData = {
      ...transactions[transactionIndex],
      ...body,
      amount: parseFloat(body.amount),
      updatedAt: new Date().toISOString(),
    };
    
    transactions[transactionIndex] = updateData;
    
    return NextResponse.json(updateData);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transactionIndex = transactions.findIndex(t => t._id === params.id);
    
    if (transactionIndex === -1) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    transactions.splice(transactionIndex, 1);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}