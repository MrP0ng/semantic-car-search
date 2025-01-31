"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// ✅ Create client-side Supabase instance
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function CarModal({ carId, onClose }) {
  const [car, setCar] = useState(null);

  useEffect(() => {
    async function fetchCar() {
      const { data, error } = await supabase
        .from("car_ads")
        .select("*")
        .eq("id", carId)
        .single();

      if (error) {
        console.error("Supabase error:", error);
      } else {
        setCar(data);
      }
    }

    fetchCar();
  }, [carId]);

  if (!car) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      onClick={onClose} // ✅ Clicking outside modal closes it
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full relative"
        onClick={(e) => e.stopPropagation()} // ✅ Prevents modal from closing when clicking inside
      >

        {/* IMAGE */}
        <div className="mb-2 rounded-lg overflow-hidden shadow-md">
          <img
            src={car.image_url || "https://via.placeholder.com/800x600"}
            className="w-full h-72 object-cover rounded-lg"
            alt={car.title}
          />
        </div>

        {/* CAR TITLE */}
        <h2 className="text-4xl mt-4 font-bold text-gray-900">{car.title}</h2>


        {/* KEY METRICS - NOW INCLUDING PRICE */}
        <div className="flex justify-around bg-gray-100 p-4 mt-6 rounded-lg shadow-sm">
          <MetricBox icon="💰" label="" value={car.price ? `${car.price.toLocaleString()} kr` : "Not available"} />
          <MetricBox icon="📅" label="" value={car.year || "Unknown"} />
          <MetricBox icon="🛣️" label="" value={car.mileage ? `${car.mileage.toLocaleString()} km` : "N/A"} />
        </div>

        {/* DESCRIPTION */}
        <div className="bg-gray-100 p-4 rounded-lg mt-6 max-h-40 overflow-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
          <p className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: car.description || "No description available." }}></p>
        </div>
      </div>
    </div>
  );
}

// 📌 Key Metrics Box (Now Includes Price)
function MetricBox({ icon, label, value }) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-2xl">{icon}</span>
      <p className="text-md text-gray-800 font-bold">{label}</p>
      <p className="text-lg font-extrabold text-gray-900">{value}</p>
    </div>
  );
}
