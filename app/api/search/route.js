import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabase } from '@/lib/supabase'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request) {
  try {
    const { query } = await request.json()
    console.log("🔎 User Query:", query)

    // 1️⃣ Generate OpenAI Embedding (Semantic Search)
    const embeddingPromise = openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });

    // 2️⃣ Perform Keyword Search (Traditional Search)
    const keywordSearchPromise = supabase
      .from('car_ads')
      .select('id, title, price, mileage, year,image_url')
      .or(`title.ilike.%${query}%`)  // Searches title & description

    // 3️⃣ Run Both Searches in Parallel
    const [embeddingResponse, keywordSearchResults] = await Promise.all([
      embeddingPromise,
      keywordSearchPromise
    ]);

    // Extract embedding from OpenAI response
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // 4️⃣ Perform Supabase Vector Search (Semantic Search)
    const { data: semanticResults, error: semanticError } = await supabase.rpc('match_car_ads', {
      query_embedding: queryEmbedding,
      match_count: 8,
    });

    if (semanticError) {
      console.error("🚨 Supabase Vector Search Error:", semanticError);
      return NextResponse.json({ error: semanticError.message }, { status: 400 });
    }

    // 5️⃣ Extract Keyword Search Results
    const { data: keywordResults, error: keywordError } = keywordSearchResults;
    
    if (keywordError) {
      console.error("🚨 Supabase Keyword Search Error:", keywordError);
      return NextResponse.json({ error: keywordError.message }, { status: 400 });
    }

    console.log("✅ Semantic Search Results:", JSON.stringify(semanticResults, null, 2));
    console.log("✅ Keyword Search Results:", JSON.stringify(keywordResults, null, 2));

    // 6️⃣ Return Both Results
    return NextResponse.json({
      semanticResults,
      keywordResults
    });

  } catch (err) {
    console.error("❌ Server Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
