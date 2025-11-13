import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";
import { recurringExpenseSchema } from "@/src/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const householdId = request.headers.get('x-household-id')
    
    if (!householdId) {
      return NextResponse.json(
        { error: 'Missing household ID' },
        { status: 400 }
      )
    }

    const expenses = await prisma.recurringExpense.findMany({
      where: { userId: householdId },
      include: { account: true },
      orderBy: { nextDueDate: "asc" },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Error fetching recurring expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch recurring expenses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const householdId = request.headers.get('x-household-id')
    
    if (!householdId) {
      return NextResponse.json(
        { error: 'Missing household ID' },
        { status: 400 }
      )
    }

    const body = await request.json();

    // Validate input
    const validation = recurringExpenseSchema.safeParse(body);
    if (!validation.success) {
      console.error('Validation error:', validation.error.errors);
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { accountId, description, amount, frequency, dueDay, notes } =
      validation.data;

    // Calculate next due date based on frequency and dueDay
    const nextDueDate = calculateNextDueDate(frequency, dueDay);

    const expense = await prisma.recurringExpense.create({
      data: {
        userId: householdId,
        accountId: accountId || null,
        description,
        amount,
        frequency,
        dueDay: dueDay || null,
        nextDueDate,
        notes: notes || null,
      },
      include: { account: true },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("Error creating recurring expense:", error);
    return NextResponse.json(
      { error: "Failed to create recurring expense" },
      { status: 500 }
    );
  }
}

/**
 * Calculate next due date based on frequency and optional day of month
 */
function calculateNextDueDate(frequency: string, dueDay?: number | null): Date {
  const now = new Date();
  const nextDate = new Date(now);

  switch (frequency) {
    case "daily":
      nextDate.setDate(nextDate.getDate() + 1);
      break;

    case "weekly":
      nextDate.setDate(nextDate.getDate() + 7);
      break;

    case "monthly":
      if (dueDay) {
        nextDate.setDate(dueDay);
        // If the due day has already passed this month, move to next month
        if (nextDate <= now) {
          nextDate.setMonth(nextDate.getMonth() + 1);
          nextDate.setDate(dueDay);
        }
      } else {
        // Default to same day next month
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      break;

    case "yearly":
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;

    default:
      // Default to monthly
      nextDate.setMonth(nextDate.getMonth() + 1);
  }

  return nextDate;
}
