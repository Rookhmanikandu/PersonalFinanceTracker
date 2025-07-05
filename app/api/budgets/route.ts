import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// In-memory storage for development
let budgets: any[] = [];
let nextId = 1;

export async function GET() {
  try {
    return NextResponse.json(budgets.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    }));
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const budget = {
      _id: nextId.toString(),
      ...body,
      amount: parseFloat(body.amount),
      year: parseInt(body.year),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    budgets.push(budget);
    nextId++;
    
    return NextResponse.json(budget);
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json(
      { error: 'Failed to create budget' },
      { status: 500 }
    );
  }
}