import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  const warehouse1 = await prisma.warehouse.create({
    data: {
      name: "Chennai Warehouse",
      location: "Chennai",
    },
  });

  const warehouse2 = await prisma.warehouse.create({
    data: {
      name: "Bangalore Warehouse",
      location: "Bangalore",
    },
  });

  const product1 = await prisma.product.create({
    data: {
      name: "Gaming Keyboard",
      description: "Mechanical keyboard",
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: "Wireless Mouse",
      description: "Bluetooth mouse",
    },
  });

  await prisma.inventory.createMany({
    data: [
      {
        productId: product1.id,
        warehouseId: warehouse1.id,
        totalStock: 5,
      },
      {
        productId: product1.id,
        warehouseId: warehouse2.id,
        totalStock: 3,
      },
      {
        productId: product2.id,
        warehouseId: warehouse1.id,
        totalStock: 10,
      },
    ],
  });

  console.log("Seeded successfully");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });