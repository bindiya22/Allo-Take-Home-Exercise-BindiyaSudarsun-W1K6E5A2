// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//       <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={100}
//           height={20}
//           priority
//         />
//         <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
//           <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
//             To get started, edit the page.tsx file.
//           </h1>
//           <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
//             Looking for a starting point or more instructions? Head over to{" "}
//             <a
//               href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Templates
//             </a>{" "}
//             or the{" "}
//             <a
//               href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Learning
//             </a>{" "}
//             center.
//           </p>
//         </div>
//         <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
//           <a
//             className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={16}
//               height={16}
//             />
//             Deploy Now
//           </a>
//           <a
//             className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Documentation
//           </a>
//         </div>
//       </main>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";

type Product = {
  inventoryId: string;

  productId: string;
  productName: string;

  warehouseId: string;
  warehouseName: string;

  totalStock: number;
  reservedStock: number;
  availableStock: number;
};

export default function HomePage() {

  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(false);

  async function fetchProducts() {

    const response = await fetch("/api/products");

    const data = await response.json();

    setProducts(data);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function reserveProduct(
    productId: string,
    warehouseId: string
  ) {

    setLoading(true);

    const response = await fetch("/api/reservations", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        productId,
        warehouseId,
        quantity: 1,
      }),
    });

    const data = await response.json();

    setLoading(false);

    if (!response.ok) {

      alert(data.error);

      return;
    }

    window.location.href =
      `/reservation/${data.id}`;
  }

  return (
    <main className="p-10">

      <h1 className="text-3xl font-bold mb-8">
        Inventory Reservation System
      </h1>

      <div className="space-y-6">

        {products.map((item) => (

          <div
            key={item.inventoryId}
            className="border p-6 rounded-lg"
          >

            <h2 className="text-xl font-semibold">
              {item.productName}
            </h2>

            <p>
              Warehouse:
              {" "}
              {item.warehouseName}
            </p>

            <p>
              Available Stock:
              {" "}
              {item.availableStock}
            </p>

            <button
              onClick={() =>
                reserveProduct(
                  item.productId,
                  item.warehouseId
                )
              }
              disabled={
                loading ||
                item.availableStock <= 0
              }
              className="mt-4 bg-black text-white px-4 py-2 rounded"
            >
              Reserve
            </button>

          </div>
        ))}

      </div>

    </main>
  );
}