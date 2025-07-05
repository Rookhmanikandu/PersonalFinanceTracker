import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// In-memory storage for development
let budgets: any[] = [];

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const budgetIndex = budgets.findIndex(b => b._id === params.id);
    
    if (budgetIndex === -1) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }
    
    const updateData = {
      ...budgets[budgetIndex],
      ...body,
      amount: parseFloat(body.amount),
      year: parseInt(body.year),
      updatedAt: new Date().toISOString(),
    };
    
    budgets[budgetIndex] = updateData;
    
    return NextResponse.json(updateData);
  } catch (error) {
    console.error('Error updating budget:', error);
    return NextResponse.json(
      { error: 'Failed to update budget' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const budgetIndex = budgets.findIndex(b => b._id === params.id);
    
    if (budgetIndex === -1) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }
    
    budgets.splice(budgetIndex, 1);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json(
      { error: 'Failed to delete budget' },
      { status: 500 }
    );
  }
}