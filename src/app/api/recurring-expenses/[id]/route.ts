import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/db';
import { recurringExpenseUpdateSchema } from '@/lib/validation';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const householdId = request.headers.get('x-household-id')
    
    if (!householdId) {
      return NextResponse.json(
        { error: 'Missing household ID' },
        { status: 400 }
      )
    }

    const { id } = params;
    const body = await request.json();

    // Verify ownership
    const expense = await prisma.recurringExpense.findUnique({
      where: { id },
    });

    if (!expense || expense.userId !== householdId) {
      return NextResponse.json(
        { error: "Recurring expense not found" },
        { status: 404 }
      );
    }

    // Validate input
    const validation = recurringExpenseUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error },
        { status: 400 }
      );
    }

    const updated = await prisma.recurringExpense.update({
      where: { id },
      data: validation.data,
      include: { account: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating recurring expense:", error);
    return NextResponse.json(
      { error: "Failed to update recurring expense" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const householdId = request.headers.get('x-household-id')
    
    if (!householdId) {
      return NextResponse.json(
        { error: 'Missing household ID' },
        { status: 400 }
      )
    }

    const { id } = params;

    // Verify ownership
    const expense = await prisma.recurringExpense.findUnique({
      where: { id },
    });

    if (!expense || expense.userId !== householdId) {
      return NextResponse.json(
        { error: "Recurring expense not found" },
        { status: 404 }
      );
    }

    await prisma.recurringExpense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting recurring expense:", error);
    return NextResponse.json(
      { error: "Failed to delete recurring expense" },
      { status: 500 }
    );
  }
}
