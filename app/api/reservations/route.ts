// import { prisma } from "@/lib/prisma";
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {

//   try {

//     const body = await req.json();

//     const {
//       productId,
//       warehouseId,
//       quantity,
//     } = body;

//     const result = await prisma.$transaction(async (tx: any) => {

//       const inventory = await tx.inventory.findFirst({
//         where: {
//           productId,
//           warehouseId,
//         },
//       });

//       if (!inventory) {
//         throw new Error("Inventory not found");
//       }

//       const availableStock =
//         inventory.totalStock - inventory.reservedStock;

//       if (availableStock < quantity) {

//         return NextResponse.json(
//           {
//             error: "Not enough stock available",
//           },
//           {
//             status: 409,
//           }
//         );
//       }

//       await tx.inventory.update({
//         where: {
//           id: inventory.id,
//         },
//         data: {
//           reservedStock: {
//             increment: quantity,
//           },
//         },
//       });

//       const expiresAt = new Date(
//         Date.now() + 10 * 60 * 1000
//       );

//       const reservation = await tx.reservation.create({
//         data: {
//           productId,
//           warehouseId,
//           quantity,
//           expiresAt,
//         },
//       });

//       return NextResponse.json(reservation);

//     });

//     return result;

//   } catch (error) {

//     console.log(error);

//     return NextResponse.json(
//       {
//         error: "Something went wrong",
//       },
//       {
//         status: 500,
//       }
//     );
//   }
// }
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

  try {

    const body = await req.json();

    const {
      productId,
      warehouseId,
      quantity,
    } = body;

    const result = await prisma.$transaction(async (tx:any) => {

      const inventoryRows: any[] = await tx.$queryRaw`
        SELECT *
        FROM "Inventory"
        WHERE "productId" = ${productId}
        AND "warehouseId" = ${warehouseId}
        FOR UPDATE
      `;

      const inventory = inventoryRows[0];

      if (!inventory) {

        return NextResponse.json(
          {
            error: "Inventory not found",
          },
          {
            status: 404,
          }
        );
      }

      const availableStock =
        inventory.totalStock - inventory.reservedStock;

      if (availableStock < quantity) {

        return NextResponse.json(
          {
            error: "Not enough stock available",
          },
          {
            status: 409,
          }
        );
      }

      await tx.inventory.update({
        where: {
          id: inventory.id,
        },
        data: {
          reservedStock: {
            increment: quantity,
          },
        },
      });

      const expiresAt = new Date(
        Date.now() + 10 * 60 * 1000
      );

      const reservation =
        await tx.reservation.create({
          data: {
            productId,
            warehouseId,
            quantity,
            expiresAt,
          },
        });

      return NextResponse.json(reservation);

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