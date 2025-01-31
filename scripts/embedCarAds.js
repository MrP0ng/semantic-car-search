// scripts/embedCarAds.js

import 'dotenv/config';               // Loads environment variables from .env
import fetch from 'node-fetch';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// 1. Initialize OpenAI and Supabase clients
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// 2. Helper function to fetch an ad by ID
async function fetchCarAd(adId) {
    const res = await fetch(`https://adview-provider.svc.prod.finn.no/adview/${adId}`);
    if (!res.ok) {
        throw new Error(`Failed to fetch adId ${adId}, status: ${res.status}`);
    }
    return res.json(); // returns the JSON body
}

// 3. Main function to fetch ads, embed, and store in Supabase
export async function embedAndStoreAds(adIds) {
    for (const adId of adIds) {
        try {
            // Fetch the car ad JSON
            const data = await fetchCarAd(adId);
            const ad = data.ad;
            if (!ad) {
                console.log(`No 'ad' field found for adId: ${adId}. Skipping.`);
                continue;
            }

            const title = ad.title ?? "";
            const image_url = ad.images[0]?.uri ?? "";
            const description = ad.description_unsafe ?? "";
            const priceNok = ad.price?.main ?? "";
            const year = ad.year ?? "";
            const mileage = ad.mileage ?? "";
            const fuelType = ad.engine?.fuel?.value ?? "";
            const engineEffect = ad.engine?.effect ?? "";
            const engineVolume = ad.engine?.volume ?? "";
            const transmission = ad.transmission?.value ?? "";
            const wheelDrive = ad.wheel_drive?.value ?? "";
            const bodyType = ad.body_type?.value ?? "";
            const extColor = ad.exterior_color?.value ?? "";
            const extColorDesc = ad.exterior_color_description ?? "";
            const intColor = ad.interior_color ?? "";
            const locationCity = ad.location?.postalPlace ?? "";
            const locationCountry = ad.location?.countryName ?? "";
            const make = ad.model_and_make?.parent?.value ?? "";
            const model = ad.model_and_make?.value ?? "";
            const variant = ad.model_spec ?? "";
            const hasKnownDamages = ad.damages?.has_known_damages ? "Has known damages" : "No known damages";
            const serviceHistory = ad.service_plan_followed ? "Yes" : "No";

            //             const textToEmbed = `
            // Title: ${title}
            // Description: ${description}
            // Year: ${year}
            // Price (NOK): ${priceNok}
            // Mileage: ${mileage}
            // Fuel Type: ${fuelType}
            // Engine: ${engineEffect} HP, ${engineVolume}L
            // Transmission: ${transmission}
            // Wheel Drive: ${wheelDrive}
            // Body Type: ${bodyType}
            // Exterior Color: ${extColor} (${extColorDesc})
            // Interior Color: ${intColor}
            // Location: ${locationCity}, ${locationCountry}
            // Make & Model: ${make} ${model} ${variant}
            // Damages: ${hasKnownDamages}
            // Service History Followed: ${serviceHistory}
            // `.trim();

            const textToEmbed = `
Title: ${title}
Description: ${description}
Year: ${year} (The car was manufactured in ${year}, making it a ${new Date().getFullYear() - year}-year-old car.)
Price (NOK): ${priceNok} (The car is priced at ${priceNok} NOK.)
Mileage: ${mileage} (The car has been driven for ${mileage} kilometers.)
Fuel Type: ${fuelType}
Engine: ${engineEffect} HP, ${engineVolume}L
Transmission: ${transmission}
Wheel Drive: ${wheelDrive} (the car is ${wheelDrive} wheel drive.)
Body Type: ${bodyType}
Exterior Color: ${extColor} (${extColorDesc}) (The exterior of the car is painted in ${extColor} color.)
Interior Color: ${intColor} (The interior of the car is ${intColor} in color.)
Location: ${locationCity}, ${locationCountry} (The car is located in ${locationCity}, ${locationCountry}.)
Make & Model: ${make} ${model} ${variant}
Damages: ${hasKnownDamages}
Service History Followed: ${serviceHistory}
`.trim();


            // Generate an embedding using the new OpenAI client usage
            // model: "text-embedding-3-small" as per your example
            const embeddingResponse = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: textToEmbed,
                encoding_format: "float",
            });

            if (!embeddingResponse.data || !Array.isArray(embeddingResponse.data) || embeddingResponse.data.length === 0) {
                console.error("No embedding returned. Full response:", embeddingResponse);
                continue; // or throw an error
            }

            // embeddingResponse.data has a structure { data: [{ embedding: [ ... ] }] }
            const embedding = embeddingResponse.data[0].embedding;

            console.log('embedding: ', embedding);

            const yearVal = parseInt(year, 10) || null;     // or 2017, e.g.
            const priceVal = parseInt(priceNok, 10) || null; // or 1107000, e.g.
            const mileageVal = parseInt(mileage, 10) || null; // or 44500, e.g.

            const { error } = await supabase
                .from('car_ads')
                .insert({
                    id: adId,
                    title,
                    year: yearVal,
                    price: priceVal,
                    mileage: mileageVal,
                    image_url,
                    description,
                    embedding
                });


            if (error) {
                console.error(`Supabase insert error for adId ${adId}:`, error.message);
            } else {
                console.log(`Inserted ad: ${adId}`);
            }

        } catch (err) {
            console.error(`Error processing adId ${adId}:`, err.message);
        }
    }
}

// 4. Example usage (CLI invocation):
(async () => {
    // You can customize this list with more IDs
    const adIds = [
        390304879,384606036,391245810,377147039,384453428,385740332,391230921,390348470,390363743,390444818,384757762,384766182,390868793,391258630,390416509,390938047,390174675,390254773,391277026,390837255,391319056,390641528,390072240,391268382,390893795,391056026,391201861,390300784,377969800,391198432
    ];
    await embedAndStoreAds(adIds);
    console.log('Done embedding and storing ads!');
})();
