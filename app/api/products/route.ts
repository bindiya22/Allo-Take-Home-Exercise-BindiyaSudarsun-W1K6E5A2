import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {

  await prisma.$transaction(async (tx:any) => {

    const expiredReservations =
      await tx.reservation.findMany({
        where: {
          status: "PENDING",
          expiresAt: {
            lt: new Date(),
          },
        },
      });

    for (const reservation of expiredReservations) {

      await tx.inventory.updateMany({
        where: {
          productId: reservation.productId,
          warehouseId: reservation.warehouseId,
        },

        data: {
          reservedStock: {
            decrement: reservation.quantity,
          },
        },
      });

      await tx.reservation.update({
        where: {
          id: reservation.id,
        },

        data: {
          status: "RELEASED",
        },
      });
    }
  });

  const inventories = await prisma.inventory.findMany({
    include: {
      product: true,
      warehouse: true,
    },
  });

  const formatted = inventories.map((item: any) => ({
    inventoryId: item.id,

    productId: item.product.id,
    productName: item.product.name,

    warehouseId: item.warehouse.id,
    warehouseName: item.warehouse.name,

    totalStock: item.totalStock,
    reservedStock: item.reservedStock,

    availableStock:
      item.totalStock - item.reservedStock,
  }));

  return NextResponse.json(formatted);
}