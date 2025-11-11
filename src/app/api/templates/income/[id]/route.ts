import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    const updateData: any = {};
    
    if (data.name) updateData.name = data.name;
    if (data.description) updateData.description = data.description;
    if (typeof data.grossAmount !== 'undefined') updateData.grossAmount = data.grossAmount;
    if (typeof data.federalTaxes !== 'undefined') updateData.federalTaxes = data.federalTaxes;
    if (typeof data.stateTaxes !== 'undefined') updateData.stateTaxes = data.stateTaxes;
    if (typeof data.socialSecurity !== 'undefined') updateData.socialSecurity = data.socialSecurity;
    if (typeof data.medicare !== 'undefined') updateData.medicare = data.medicare;
    if (typeof data.preDeductions !== 'undefined') updateData.preDeductions = data.preDeductions;
    if (typeof data.postDeductions !== 'undefined') updateData.postDeductions = data.postDeductions;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (typeof data.isFavorite !== 'undefined') updateData.isFavorite = data.isFavorite;
    
    // Usage tracking
    if (typeof data.usageCount !== 'undefined') {
      const current = await prisma.template.findUnique({
        where: { id: params.id },
        select: { usageCount: true }
      });
      updateData.usageCount = (current?.usageCount || 0) + (data.usageCount || 0);
      updateData.lastUsedAt = new Date();
    }

    const template = await prisma.template.update({
      where: {
        id: params.id,
      },
      data: updateData,
      include: {
        account: true,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error updating income template:", error);
    return NextResponse.json(
      { error: "Failed to update income template" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.template.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting income template:", error);
    return NextResponse.json(
      { error: "Failed to delete income template" },
      { status: 500 }
    );
  }
}
