import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('personal_finance');
    const budgets = await db.collection('budgets')
      .find({})
      .sort({ year: -1, month: -1 })
      .toArray();
    
    return NextResponse.json(budgets);
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
    const client = await clientPromise;
    const db = client.db('personal_finance');
    
    const budget = {
      ...body,
      amount: parseFloat(body.amount),
      year: parseInt(body.year),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const result = await db.collection('budgets').insertOne(budget);
    const newBudget = await db.collection('budgets').findOne({ _id: result.insertedId });
    
    return NextResponse.json(newBudget);
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json(
      { error: 'Failed to create budget' },
      { status: 500 }
    );
  }
}