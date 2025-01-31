import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function CarDetail({ params }) {
  const { id } = params;

  // 1️⃣ Fetch Car Data from Supabase
  const { data: car, error } = await supabase
    .from("car_ads")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !car) {
    return <div className="text-center text-gray-600 py-10">Car not found.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* HEADER */}
      <header className="bg-white shadow-md py-6 text-center text-3xl font-bold text-gray-900">
        🚗 Semantic Car Search
      </header>

      {/* CONTAINER */}
      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* 🔹 BREADCRUMB NAVIGATION */}
        <nav className="text-sm text-gray-600 mb-6">
          <Link href="/" className="text-blue-500 hover:underline">Home</Link> &gt; 
          <span className="text-gray-600"> {car.title}</span>
        </nav>

        {/* 🔹 IMAGE */}
        <div className="rounded-lg overflow-hidden shadow-lg border border-gray-300">
          <img
            src={car.image_url || "https://via.placeholder.com/800x600"}
            alt={car.title}
            className="w-full h-96 object-cover"
          />
        </div>

        {/* 🔹 TITLE */}
        <h1 className="text-5xl font-bold text-gray-900 mt-6">{car.title}</h1>

        {/* 🔹 PRICE & KEY METRICS */}
        <div className="bg-white p-6 mt-4 rounded-lg shadow-md">
          <div className="text-4xl font-bold text-red-600 bg-red-100 px-4 py-2 rounded-md inline-block">
            {car.price.toLocaleString()} NOK
          </div>
          <div className="grid grid-cols-3 gap-6 mt-6 text-center">
            <MetricBox icon="📅" label="Year" value={car.year} />
            <MetricBox icon="🛣️" label="Mileage" value={`${car.mileage.toLocaleString()} km`} />
            <MetricBox icon="🚗" label="Model Year" value={car.year} />
          </div>
        </div>

        {/* 🔹 DESCRIPTION */}
        <div className="bg-white p-6 mt-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Car Description</h2>
          <p className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: car.description || "No description available." }}></p>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-gray-100 text-center py-6 text-gray-600 text-sm border-t">
        &copy; {new Date().getFullYear()} Semantic Car Search. All rights reserved.
      </footer>
    </div>
  );
}


// 📌 Reusable Metric Box Component (Better Readability)
function MetricBox({ icon, label, value }) {
  return (
    <div className="border p-5 rounded-lg bg-white flex flex-col items-center shadow-md">
      <div className="text-2xl">{icon}</div>
      <p className="text-md text-gray-800 font-bold">{label}</p>
      <p className="text-lg font-extrabold text-gray-900">{value}</p>
    </div>
  );
}
