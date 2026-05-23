import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  try {

    const { id } = await params;

    const result = await prisma.$transaction(async (tx:any) => {

      const reservation = await tx.reservation.findUnique({
        where: {
          id,
        },
      });

      if (!reservation) {

        return NextResponse.json(
          {
            error: "Reservation not found",
          },
          {
            status: 404,
          }
        );
      }

      if (reservation.status !== "PENDING") {

        return NextResponse.json(
          {
            error: "Reservation already processed",
          },
          {
            status: 400,
          }
        );
      }

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

      const updatedReservation =
        await tx.reservation.update({
          where: {
            id,
          },
          data: {
            status: "RELEASED",
          },
        });

      return NextResponse.json(updatedReservation);

    });

    return result;

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}