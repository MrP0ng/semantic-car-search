import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    console.log("🚀 Fetching 12 random cars...");

    // Call the SQL function get_random_cars()
    const { data, error } = await supabase.rpc("get_random_cars");

    if (error) {
      console.error("🚨 Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("✅ Random Cars Fetched:", data);
    return NextResponse.json({ data });

  } catch (err) {
    console.error("❌ Server Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
