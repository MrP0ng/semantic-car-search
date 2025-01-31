"use client"
import { useState, useEffect } from "react"
import SectionHeader from "./components/SectionHeader"
import CarModal from "./components/CarModal"

export default function Home() {
  const [query, setQuery] = useState("")
  const [semanticResults, setSemanticResults] = useState([])
  const [keywordResults, setKeywordResults] = useState([])
  const [randomCars, setRandomCars] = useState([]) 
  const [loading, setLoading] = useState(false)
  const [selectedCarId, setSelectedCarId] = useState(null)

  useEffect(() => {
    async function fetchRandomCars() {
      const res = await fetch("/api/random-cars")
      const { data } = await res.json()
      setRandomCars(data)
    }
    fetchRandomCars()
  }, [])

  async function handleSearch(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })

      const { semanticResults, keywordResults } = await res.json()
      setSemanticResults(semanticResults || [])
      setKeywordResults(keywordResults || [])
    } catch (err) {
      console.error("Search failed:", err)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* HEADER */}
      <header className="bg-white shadow-md py-6 text-center text-3xl font-bold text-gray-900">
        🚗 Semantic Car Search
      </header>

      {/* HERO SECTION */}
      <section
        className="relative h-80 bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1524064047572-3d34d10e7142?q=80&w=3355&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')"
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <form
          onSubmit={handleSearch}
          className="relative w-full max-w-2xl flex bg-white shadow-lg rounded-full p-3"
        >
          <input
            type="text"
            placeholder="Search for a car..."
            className="flex-1 px-5 py-4 rounded-l-full text-lg text-gray-900 focus:outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-full text-lg font-medium"
          >
            Search
          </button>
        </form>
      </section>

      {/* RESULTS OR RANDOM CARS */}
      <main className="flex-1 container mx-auto px-6 py-8">
        {loading && (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-red-500"></div>
          </div>
        )}

        {!loading && semanticResults.length === 0 && keywordResults.length === 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
              {randomCars.map((car) => (
                <CarCard key={car.id} car={car} onClick={() => setSelectedCarId(car.id)} />
              ))}
            </div>
          </>
        )}

        {!loading && (
          <>
            {/* SEMANTIC RESULTS */}
            {semanticResults.length > 0 && (
              <>
                <SectionHeader title={`🔍 Semantic Search Results (${semanticResults.length})`} />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {semanticResults.map((car) => (
                    <CarCard key={car.id} car={car} onClick={() => setSelectedCarId(car.id)} />
                  ))}
                </div>
              </>
            )}

            {/* KEYWORD SEARCH RESULTS */}
            {keywordResults.length > 0 && (
              <>
                <SectionHeader title={`🔎 Keyword Search Results (${keywordResults.length})`} />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {keywordResults.map((car) => (
                    <CarCard key={car.id} car={car} onClick={() => setSelectedCarId(car.id)} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-100 text-center py-6 text-gray-600 text-sm border-t">
        &copy; {new Date().getFullYear()} Semantic Car Search. All rights reserved.
      </footer>

      {/* MODAL FOR CAR DETAILS */}
      {selectedCarId && <CarModal carId={selectedCarId} onClose={() => setSelectedCarId(null)} />}
    </div>
  )
}

// 🏎 CarCard Component (Now Clickable)
function CarCard({ car, onClick }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-shadow"
    >
      <img
        src={car.image_url || "https://via.placeholder.com/300"}
        alt={car.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900">{car.title}</h3>
        <p className="text-gray-600">{car.year} • {car.mileage?.toLocaleString()} km</p>
        <p className="text-red-500 font-semibold text-lg">{car.price?.toLocaleString()} NOK</p>
      </div>
    </div>
  )
}