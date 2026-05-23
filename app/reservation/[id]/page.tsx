"use client";

import { useEffect, useState } from "react";

type Reservation = {
  id: string;

  status: string;

  quantity: number;

  expiresAt: string;

  product: {
    name: string;
  };

  warehouse: {
    name: string;
  };
};

export default function ReservationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const [reservation, setReservation] =
    useState<Reservation | null>(null);

  const [timeLeft, setTimeLeft] =
    useState("");

  async function fetchReservation() {

    const { id } = await params;

    const response = await fetch(
      `/api/reservations/${id}`
    );

    const data = await response.json();

    setReservation(data);
  }

  useEffect(() => {
    fetchReservation();
  }, []);

  useEffect(() => {

    if (!reservation) return;

    const interval = setInterval(() => {

      const now = new Date().getTime();

      const expiry =
        new Date(
          reservation.expiresAt
        ).getTime();

      const difference = expiry - now;

      if (difference <= 0) {

        setTimeLeft("Expired");

        clearInterval(interval);

        return;
      }

      const minutes =
        Math.floor(difference / 1000 / 60);

      const seconds =
        Math.floor((difference / 1000) % 60);

      setTimeLeft(
        `${minutes}m ${seconds}s`
      );

    }, 1000);

    return () => clearInterval(interval);

  }, [reservation]);

  async function confirmPurchase() {

    if (!reservation) return;

    const response = await fetch(
      `/api/reservations/${reservation.id}/confirm`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

    if (!response.ok) {

      alert(data.error);

      return;
    }

    alert("Purchase confirmed!");
    window.location.href = "/";
    //fetchReservation();
  }

  async function cancelReservation() {

    if (!reservation) return;

    const response = await fetch(
      `/api/reservations/${reservation.id}/release`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

    if (!response.ok) {

      alert(data.error);

      return;
    }

    alert("Reservation cancelled!");
    window.location.href = "/";
    //fetchReservation();
  }

  if (!reservation) {

    return (
      <main className="p-10">
        Loading...
      </main>
    );
  }

  return (
    <main className="p-10">

      <h1 className="text-3xl font-bold mb-8">
        Reservation Checkout
      </h1>

      <div className="border p-6 rounded-lg max-w-xl">

        <h2 className="text-xl font-semibold">
          {reservation.product.name}
        </h2>

        <p className="mt-2">
          Warehouse:
          {" "}
          {reservation.warehouse.name}
        </p>

        <p>
          Quantity:
          {" "}
          {reservation.quantity}
        </p>

        <p>
          Status:
          {" "}
          {reservation.status}
        </p>

        <p className="text-red-600 font-semibold mt-4">
          Expires In:
          {" "}
          {timeLeft}
        </p>

        <div className="flex gap-4 mt-6">

          <button
            onClick={confirmPurchase}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Confirm Purchase
          </button>

          <button
            onClick={cancelReservation}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>

        </div>

      </div>

    </main>
  );
}