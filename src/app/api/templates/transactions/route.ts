import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";

export async function GET(request: NextRequest) {
  try {
    // In a real app, get userId from session
    const userId = "user_1";
    
    const templates = await prisma.template.findMany({
      where: {
        userId,
        type: "transaction",
      },
      orderBy: [
        { isFavorite: "desc" },
        { usageCount: "desc" },
        { createdAt: "desc" },
      ],
      include: {
        account: true,
      },
    });

    return NextResponse.json(templates)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = "user_1";
    const data = await request.json();

    const template = await prisma.template.create({
      data: {
        type: "transaction",
        userId,
        name: data.name,
        description: data.description,
        amount: data.amount,
        method: data.method,
        accountId: data.accountId,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        notes: data.notes,
        isFavorite: data.isFavorite || false,
      },
      include: {
        account: true,
      },
    });

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}
