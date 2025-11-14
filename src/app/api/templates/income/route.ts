import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-household-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing household ID' },
        { status: 400 }
      );
    }
    
    const templates = await prisma.template.findMany({
      where: {
        userId,
        type: "income",
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
      { error: 'Failed to fetch income templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-household-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing household ID' },
        { status: 400 }
      );
    }
    
    const data = await request.json();

    // Validate accountId if provided
    let validAccountId: string | undefined;
    if (data.accountId && data.accountId.trim()) {
      const account = await prisma.account.findFirst({
        where: {
          id: data.accountId,
          userId,
        },
      });
      
      if (account) {
        validAccountId = data.accountId;
      }
    }

    // Build the data object
    const createData: any = {
      type: "income",
      userId,
      name: data.name,
      description: data.description,
      grossAmount: data.grossAmount,
      federalTaxes: data.federalTaxes,
      stateTaxes: data.stateTaxes,
      socialSecurity: data.socialSecurity,
      medicare: data.medicare,
      preDeductions: data.preDeductions,
      postDeductions: data.postDeductions,
      tags: data.tags ? JSON.stringify(data.tags) : null,
      notes: data.notes,
      isFavorite: data.isFavorite || false,
    };

    // Only add accountId if it's valid
    if (validAccountId) {
      createData.accountId = validAccountId;
    }

    const template = await prisma.template.create({
      data: createData,
      include: {
        account: true,
      },
    });

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Template creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create income template' },
      { status: 500 }
    )
  }
}
