import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";

export async function GET(request: NextRequest) {
  try {
    const userId = "user_1";
    
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

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching income templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch income templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = "user_1";
    const data = await request.json();

    const template = await prisma.template.create({
      data: {
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
        notes: data.notes,
        isFavorite: data.isFavorite || false,
      },
      include: {
        account: true,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Error creating income template:", error);
    return NextResponse.json(
      { error: "Failed to create income template" },
      { status: 500 }
    );
  }
}
