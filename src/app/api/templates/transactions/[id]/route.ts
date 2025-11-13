import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    // If updating usage, increment and update lastUsedAt
    const updateData: any = {};
    
    if (data.name) updateData.name = data.name;
    if (data.description) updateData.description = data.description;
    if (typeof data.amount !== 'undefined') updateData.amount = data.amount;
    if (data.method) updateData.method = data.method;
    if (data.accountId) updateData.accountId = data.accountId;
    if (typeof data.tags !== 'undefined') updateData.tags = data.tags;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (typeof data.isFavorite !== 'undefined') updateData.isFavorite = data.isFavorite;
    
    // Usage tracking
    if (typeof data.usageCount !== 'undefined') {
      // Fetch current to increment
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

    return NextResponse.json(template)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    )
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

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    )
  }
}
