"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface MatchStats {
  team1: {
    name: string
    ballPossession: number
    goals: number
    totalShots: number
    passes: {
      totalPasses: number
      passAccuracy: number
      crosses: number
      longPasses: number
      backPasses: number
    }
    players: Array<{
      name: string
      position: string
      longestDistance: number
      highestSpeed: number
      avgDistance: number
      avgSpeed: number
    }>
  }
  team2: {
    name: string
    ballPossession: number
    goals: number
    totalShots: number
    passes: {
      totalPasses: number
      passAccuracy: number
      crosses: number
      longPasses: number
      backPasses: number
    }
    players: Array<{
      name: string
      position: string
      longestDistance: number
      highestSpeed: number
      avgDistance: number
      avgSpeed: number
    }>
  }
  ballDirectoriesMap?: string // URL or path to ball directories map image
}

// Default fallback data
const defaultStats: MatchStats = {
  team1: {
    name: "Team 1",
    ballPossession: 45,
    goals: 2,
    totalShots: 12,
    passes: {
      totalPasses: 320,
      passAccuracy: 87,
      crosses: 15,
      longPasses: 45,
      backPasses: 78,
    },
    players: [
      {
        name: "John Smith",
        position: "GK",
        longestDistance: 2.1,
        highestSpeed: 18.5,
        avgDistance: 1.2,
        avgSpeed: 8.3,
      },
      {
        name: "Mike Johnson",
        position: "CB",
        longestDistance: 8.7,
        highestSpeed: 24.2,
        avgDistance: 5.4,
        avgSpeed: 12.1,
      },
      {
        name: "David Wilson",
        position: "CM",
        longestDistance: 11.2,
        highestSpeed: 28.7,
        avgDistance: 7.8,
        avgSpeed: 15.4,
      },
      {
        name: "Alex Brown",
        position: "LW",
        longestDistance: 12.5,
        highestSpeed: 31.2,
        avgDistance: 8.9,
        avgSpeed: 17.8,
      },
      {
        name: "Chris Davis",
        position: "ST",
        longestDistance: 10.8,
        highestSpeed: 29.4,
        avgDistance: 7.6,
        avgSpeed: 16.2,
      },
    ],
  },
  team2: {
    name: "Team 2",
    ballPossession: 55,
    goals: 1,
    totalShots: 10,
    passes: {
      totalPasses: 420,
      passAccuracy: 91,
      crosses: 12,
      longPasses: 38,
      backPasses: 92,
    },
    players: [
      {
        name: "Robert Garcia",
        position: "GK",
        longestDistance: 1.8,
        highestSpeed: 16.3,
        avgDistance: 1.0,
        avgSpeed: 7.8,
      },
      {
        name: "James Martinez",
        position: "CB",
        longestDistance: 9.2,
        highestSpeed: 25.1,
        avgDistance: 6.1,
        avgSpeed: 13.2,
      },
      {
        name: "Carlos Rodriguez",
        position: "CM",
        longestDistance: 12.8,
        highestSpeed: 30.5,
        avgDistance: 8.7,
        avgSpeed: 16.8,
      },
      {
        name: "Luis Hernandez",
        position: "RW",
        longestDistance: 13.1,
        highestSpeed: 32.8,
        avgDistance: 9.2,
        avgSpeed: 18.5,
      },
      {
        name: "Diego Lopez",
        position: "ST",
        longestDistance: 11.5,
        highestSpeed: 30.1,
        avgDistance: 8.1,
        avgSpeed: 17.1,
      },
    ],
  },
}

export default function Component() {
  const [isVisible, setIsVisible] = useState(false)
  const [stats, setStats] = useState<MatchStats>(defaultStats)
  const [isLoading, setIsLoading] = useState(true)
  const [dataSource, setDataSource] = useState<string>("default")

  // Function to calculate percentage for progress bars
  const calculatePercentage = (value1: number, value2: number, isTeam1: boolean) => {
    const total = value1 + value2
    if (total === 0) return 0
    const percentage = isTeam1 ? (value1 / total) * 100 : (value2 / total) * 100
    return Math.round(percentage)
  }

  // Function to load stats from JSON file
  const loadStatsFromFile = async () => {
  try {
  const res = await fetch('/api/stats')
  if (res.ok) {
    const jsonData = await res.json()
    setStats(jsonData)
    setDataSource("stats.json")
    console.log("Loaded stats from API")
    return true
  }
} catch (err) {
  console.error("Failed to load /api/stats:", err)
}

    const jsonFiles = ["stats.json", "match_stats.json", "output_stats.json", "results.json"]

    for (const fileName of jsonFiles) {
      try {
        const response = await fetch(`/output/${fileName}?t=${Date.now()}`)
        if (response.ok) {
          const jsonData = await response.json()

          // Validate the JSON structure
          if (jsonData.team1 && jsonData.team2) {
            setStats(jsonData)
            setDataSource(fileName)
            console.log(`Loaded stats from: /output/${fileName}`)
            return true
          }
        }
      } catch (error) {
        console.log(`Could not load /output/${fileName}:`, error)
      }
    }

    // Also try to load team names from localStorage if available
    const savedTeam1 = localStorage.getItem("team1Name")
    const savedTeam2 = localStorage.getItem("team2Name")

    if (savedTeam1 || savedTeam2) {
      setStats((prevStats) => ({
        ...prevStats,
        team1: { ...prevStats.team1, name: savedTeam1 || prevStats.team1.name },
        team2: { ...prevStats.team2, name: savedTeam2 || prevStats.team2.name },
      }))
    }

    console.log("No valid stats file found in /output folder, using default data")
    setDataSource("default")
    return false
  }

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true)
      await loadStatsFromFile()
      setIsLoading(false)

      // Trigger animations after data is loaded
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 100)

      return () => clearTimeout(timer)
    }

    initializeData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#061016] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2ae65c]"></div>
          <div className="text-white text-lg">Loading match statistics...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#061016] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 bg-[#0c2f11] sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <img src="/football.png" alt="Football" className="w-8 h-8" />
          <span className="text-xl font-semibold text-white">Tralalero</span>
        </div>
        <nav className="flex gap-8">
          <Link href="/" className="text-[#2ae65c] font-medium tracking-wide hover:text-[#0c601c] transition-colors">
            LIVE INFERENCE
          </Link>
          <span className="text-[#2ae65c] font-medium tracking-wide cursor-pointer">STATS ANALYSIS</span>
        </nav>
      </header>

      {/* Main Content */}
      <main className="px-8 py-12 space-y-8 flex flex-col items-center">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl font-medium text-left mb-4 text-white animate-fade-in">Match Statistics</h1>
        </div>

        {/* Match Statistics Card */}
        <div className="bg-[#1a2023] rounded-lg p-8 w-full max-w-4xl animate-slide-up">
          {/* Teams Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-medium text-white animate-fade-in-delay-1">{stats.team1.name}</h2>
            <h2 className="text-xl font-medium text-white animate-fade-in-delay-1">{stats.team2.name}</h2>
          </div>

          {/* Ball Possession */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="bg-[#46c252] text-black px-4 py-1 rounded-full text-sm font-semibold animate-bounce-in-delay-2">
                {stats.team1.ballPossession}%
              </div>
              <div className="text-center flex-1">
                <span className="text-white font-medium animate-fade-in-delay-2">Ball possession</span>
              </div>
              <div className="bg-[#7a84ff] text-white px-4 py-1 rounded-full text-sm font-semibold animate-bounce-in-delay-2">
                {stats.team2.ballPossession}%
              </div>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden bg-[#2a2a2a]">
              <div
                className="bg-[#46c252] transition-all duration-1000 ease-out delay-500 ml-auto"
                style={{ width: isVisible ? `${stats.team1.ballPossession}%` : "0%" }}
              ></div>
              <div
                className="bg-[#7a84ff] transition-all duration-1000 ease-out delay-700"
                style={{ width: isVisible ? `${stats.team2.ballPossession}%` : "0%" }}
              ></div>
            </div>
          </div>

          {/* Total Shots */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-white font-medium animate-fade-in-delay-4">{stats.team1.totalShots}</span>
              <span className="text-white font-medium animate-fade-in-delay-4">Total shots</span>
              <span className="text-white font-medium animate-fade-in-delay-4">{stats.team2.totalShots}</span>
            </div>
            <div className="flex gap-4">
              <div className="flex-1 bg-[#2a2a2a] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#46c252] h-full transition-all duration-800 ease-out delay-1200 ml-auto"
                  style={{
                    width: isVisible
                      ? `${calculatePercentage(stats.team1.totalShots, stats.team2.totalShots, true)}%`
                      : "0%",
                  }}
                ></div>
              </div>
              <div className="flex-1 bg-[#2a2a2a] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#7a84ff] h-full transition-all duration-800 ease-out delay-1300"
                  style={{
                    width: isVisible
                      ? `${calculatePercentage(stats.team1.totalShots, stats.team2.totalShots, false)}%`
                      : "0%",
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Passes Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-white mb-8 animate-fade-in-delay-5">Passes</h3>

            {/* Total Passes */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-white font-medium animate-fade-in-delay-6">{stats.team1.passes.totalPasses}</span>
                <span className="text-white font-medium animate-fade-in-delay-6">Total passes</span>
                <span className="text-white font-medium animate-fade-in-delay-6">{stats.team2.passes.totalPasses}</span>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 bg-[#2a2a2a] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#46c252] h-full transition-all duration-800 ease-out delay-1400 ml-auto"
                    style={{
                      width: isVisible
                        ? `${calculatePercentage(stats.team1.passes.totalPasses, stats.team2.passes.totalPasses, true)}%`
                        : "0%",
                    }}
                  ></div>
                </div>
                <div className="flex-1 bg-[#2a2a2a] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#7a84ff] h-full transition-all duration-800 ease-out delay-1500"
                    style={{
                      width: isVisible
                        ? `${calculatePercentage(stats.team1.passes.totalPasses, stats.team2.passes.totalPasses, false)}%`
                        : "0%",
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Pass Accuracy */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-white font-medium animate-fade-in-delay-7">
                  {stats.team1.passes.passAccuracy}%
                </span>
                <span className="text-white font-medium animate-fade-in-delay-7">Pass accuracy</span>
                <span className="text-white font-medium animate-fade-in-delay-7">
                  {stats.team2.passes.passAccuracy}%
                </span>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 bg-[#2a2a2a] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#46c252] h-full transition-all duration-800 ease-out delay-1600 ml-auto"
                    style={{
                      width: isVisible
                        ? `${calculatePercentage(stats.team1.passes.passAccuracy, stats.team2.passes.passAccuracy, true)}%`
                        : "0%",
                    }}
                  ></div>
                </div>
                <div className="flex-1 bg-[#2a2a2a] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#7a84ff] h-full transition-all duration-800 ease-out delay-1700"
                    style={{
                      width: isVisible
                        ? `${calculatePercentage(stats.team1.passes.passAccuracy, stats.team2.passes.passAccuracy, false)}%`
                        : "0%",
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Crosses */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-white font-medium animate-fade-in-delay-8">{stats.team1.passes.crosses}</span>
                <span className="text-white font-medium animate-fade-in-delay-8">Crosses</span>
                <span className="text-white font-medium animate-fade-in-delay-8">{stats.team2.passes.crosses}</span>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 bg-[#2a2a2a] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#46c252] h-full transition-all duration-800 ease-out delay-1800 ml-auto"
                    style={{
                      width: isVisible
                        ? `${calculatePercentage(stats.team1.passes.crosses, stats.team2.passes.crosses, true)}%`
                        : "0%",
                    }}
                  ></div>
                </div>
                <div className="flex-1 bg-[#2a2a2a] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#7a84ff] h-full transition-all duration-800 ease-out delay-1900"
                    style={{
                      width: isVisible
                        ? `${calculatePercentage(stats.team1.passes.crosses, stats.team2.passes.crosses, false)}%`
                        : "0%",
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Long Passes */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-white font-medium animate-fade-in-delay-9">{stats.team1.passes.longPasses}</span>
                <span className="text-white font-medium animate-fade-in-delay-9">Long passes</span>
                <span className="text-white font-medium animate-fade-in-delay-9">{stats.team2.passes.longPasses}</span>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 bg-[#2a2a2a] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#46c252] h-full transition-all duration-800 ease-out delay-2000 ml-auto"
                    style={{
                      width: isVisible
                        ? `${calculatePercentage(stats.team1.passes.longPasses, stats.team2.passes.longPasses, true)}%`
                        : "0%",
                    }}
                  ></div>
                </div>
                <div className="flex-1 bg-[#2a2a2a] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#7a84ff] h-full transition-all duration-800 ease-out delay-2100"
                    style={{
                      width: isVisible
                        ? `${calculatePercentage(stats.team1.passes.longPasses, stats.team2.passes.longPasses, false)}%`
                        : "0%",
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Back Passes */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-white font-medium animate-fade-in-delay-10">{stats.team1.passes.backPasses}</span>
                <span className="text-white font-medium animate-fade-in-delay-10">Back passes</span>
                <span className="text-white font-medium animate-fade-in-delay-10">{stats.team2.passes.backPasses}</span>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 bg-[#2a2a2a] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#46c252] h-full transition-all duration-800 ease-out delay-2200 ml-auto"
                    style={{
                      width: isVisible
                        ? `${calculatePercentage(stats.team1.passes.backPasses, stats.team2.passes.backPasses, true)}%`
                        : "0%",
                    }}
                  ></div>
                </div>
                <div className="flex-1 bg-[#2a2a2a] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#7a84ff] h-full transition-all duration-800 ease-out delay-2300"
                    style={{
                      width: isVisible
                        ? `${calculatePercentage(stats.team1.passes.backPasses, stats.team2.passes.backPasses, false)}%`
                        : "0%",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Player Statistics */}
        <div className="bg-[#1a2023] rounded-lg p-8 w-full max-w-4xl animate-slide-up-delay-13">
          <h3 className="text-xl font-medium text-white mb-6 animate-fade-in-delay-13">Player stats</h3>

          {/* Teams Header */}
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-xl font-medium text-white animate-fade-in-delay-14">{stats.team1.name}</h4>
            <h4 className="text-xl font-medium text-white animate-fade-in-delay-14">{stats.team2.name}</h4>
          </div>

          {/* Players with Longest Distance */}
          <div className="mb-8">
            {(() => {
              const team1Best = stats.team1.players.reduce((prev, current) =>
                prev.longestDistance > current.longestDistance ? prev : current,
              )
              const team2Best = stats.team2.players.reduce((prev, current) =>
                prev.longestDistance > current.longestDistance ? prev : current,
              )

              return (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-center">
                      <div className="bg-[#46c252] text-black px-4 py-1 rounded-full text-sm font-semibold animate-bounce-in-delay-15">
                        {team1Best.longestDistance} km
                      </div>
                    </div>
                    <div className="text-center flex-1">
                      <span className="text-white font-medium animate-fade-in-delay-15">Longest distance run</span>
                    </div>
                    <div className="text-center">
                      <div className="bg-[#7a84ff] text-white px-4 py-1 rounded-full text-sm font-semibold animate-bounce-in-delay-15">
                        {team2Best.longestDistance} km
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 bg-[#2a2a2a] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#46c252] h-full transition-all duration-800 ease-out delay-2600 ml-auto"
                        style={{
                          width: isVisible
                            ? `${calculatePercentage(team1Best.longestDistance, team2Best.longestDistance, true)}%`
                            : "0%",
                        }}
                      ></div>
                    </div>
                    <div className="flex-1 bg-[#2a2a2a] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#7a84ff] h-full transition-all duration-800 ease-out delay-2700"
                        style={{
                          width: isVisible
                            ? `${calculatePercentage(team1Best.longestDistance, team2Best.longestDistance, false)}%`
                            : "0%",
                        }}
                      ></div>
                    </div>
                  </div>
                </>
              )
            })()}
          </div>

          {/* Players with Highest Speed */}
          <div className="mb-8">
            {(() => {
              const team1Fastest = stats.team1.players.reduce((prev, current) =>
                prev.highestSpeed > current.highestSpeed ? prev : current,
              )
              const team2Fastest = stats.team2.players.reduce((prev, current) =>
                prev.highestSpeed > current.highestSpeed ? prev : current,
              )

              return (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-center">
                      <div className="bg-[#46c252] text-black px-4 py-1 rounded-full text-sm font-semibold animate-bounce-in-delay-16">
                        {team1Fastest.highestSpeed} km/h
                      </div>
                    </div>
                    <div className="text-center flex-1">
                      <span className="text-white font-medium animate-fade-in-delay-16">Highest speed achieved</span>
                    </div>
                    <div className="text-center">
                      <div className="bg-[#7a84ff] text-white px-4 py-1 rounded-full text-sm font-semibold animate-bounce-in-delay-16">
                        {team2Fastest.highestSpeed} km/h
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 bg-[#2a2a2a] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#46c252] h-full transition-all duration-800 ease-out delay-2800 ml-auto"
                        style={{
                          width: isVisible
                            ? `${calculatePercentage(team1Fastest.highestSpeed, team2Fastest.highestSpeed, true)}%`
                            : "0%",
                        }}
                      ></div>
                    </div>
                    <div className="flex-1 bg-[#2a2a2a] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#7a84ff] h-full transition-all duration-800 ease-out delay-2900"
                        style={{
                          width: isVisible
                            ? `${calculatePercentage(team1Fastest.highestSpeed, team2Fastest.highestSpeed, false)}%`
                            : "0%",
                        }}
                      ></div>
                    </div>
                  </div>
                </>
              )
            })()}
          </div>

          {/* Average Distance Run */}
          <div className="mb-8">
            {(() => {
              const team1AvgDistance =
                stats.team1.players.reduce((sum, player) => sum + player.avgDistance, 0) / stats.team1.players.length
              const team2AvgDistance =
                stats.team2.players.reduce((sum, player) => sum + player.avgDistance, 0) / stats.team2.players.length

              return (
                <>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-white font-medium animate-fade-in-delay-17">
                      {team1AvgDistance.toFixed(1)} km
                    </span>
                    <span className="text-white font-medium animate-fade-in-delay-17">Average distance run</span>
                    <span className="text-white font-medium animate-fade-in-delay-17">
                      {team2AvgDistance.toFixed(1)} km
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 bg-[#2a2a2a] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#46c252] h-full transition-all duration-800 ease-out delay-3000 ml-auto"
                        style={{
                          width: isVisible ? `${calculatePercentage(team1AvgDistance, team2AvgDistance, true)}%` : "0%",
                        }}
                      ></div>
                    </div>
                    <div className="flex-1 bg-[#2a2a2a] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#7a84ff] h-full transition-all duration-800 ease-out delay-3100"
                        style={{
                          width: isVisible
                            ? `${calculatePercentage(team1AvgDistance, team2AvgDistance, false)}%`
                            : "0%",
                        }}
                      ></div>
                    </div>
                  </div>
                </>
              )
            })()}
          </div>

          {/* Average Players Speed */}
          <div>
            {(() => {
              const team1AvgSpeed =
                stats.team1.players.reduce((sum, player) => sum + player.avgSpeed, 0) / stats.team1.players.length
              const team2AvgSpeed =
                stats.team2.players.reduce((sum, player) => sum + player.avgSpeed, 0) / stats.team2.players.length

              return (
                <>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-white font-medium animate-fade-in-delay-18">
                      {team1AvgSpeed.toFixed(1)} km/h
                    </span>
                    <span className="text-white font-medium animate-fade-in-delay-18">Average players speed</span>
                    <span className="text-white font-medium animate-fade-in-delay-18">
                      {team2AvgSpeed.toFixed(1)} km/h
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 bg-[#2a2a2a] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#46c252] h-full transition-all duration-800 ease-out delay-3200 ml-auto"
                        style={{
                          width: isVisible ? `${calculatePercentage(team1AvgSpeed, team2AvgSpeed, true)}%` : "0%",
                        }}
                      ></div>
                    </div>
                    <div className="flex-1 bg-[#2a2a2a] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#7a84ff] h-full transition-all duration-800 ease-out delay-3300"
                        style={{
                          width: isVisible ? `${calculatePercentage(team1AvgSpeed, team2AvgSpeed, false)}%` : "0%",
                        }}
                      ></div>
                    </div>
                  </div>
                </>
              )
            })()}
          </div>
        </div>

        {/* Footer spacing */}
        <div className="h-16"></div>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }

        .animate-fade-in { animation: fadeIn 0.6s ease-out; }
        .animate-fade-in-delay-1 { animation: fadeIn 0.6s ease-out 0.2s both; }
        .animate-fade-in-delay-2 { animation: fadeIn 0.6s ease-out 0.4s both; }
        .animate-fade-in-delay-3 { animation: fadeIn 0.6s ease-out 0.6s both; }
        .animate-fade-in-delay-4 { animation: fadeIn 0.6s ease-out 0.8s both; }
        .animate-fade-in-delay-5 { animation: fadeIn 0.6s ease-out 1.0s both; }
        .animate-fade-in-delay-6 { animation: fadeIn 0.6s ease-out 1.2s both; }
        .animate-fade-in-delay-7 { animation: fadeIn 0.6s ease-out 1.4s both; }
        .animate-fade-in-delay-8 { animation: fadeIn 0.6s ease-out 1.6s both; }
        .animate-fade-in-delay-9 { animation: fadeIn 0.6s ease-out 1.8s both; }
        .animate-fade-in-delay-10 { animation: fadeIn 0.6s ease-out 2.0s both; }
        .animate-fade-in-delay-11 { animation: fadeIn 0.6s ease-out 2.2s both; }
        .animate-fade-in-delay-12 { animation: fadeIn 0.6s ease-out 2.4s both; }
        .animate-fade-in-delay-13 { animation: fadeIn 0.6s ease-out 2.6s both; }
        .animate-fade-in-delay-14 { animation: fadeIn 0.6s ease-out 2.8s both; }
        .animate-fade-in-delay-15 { animation: fadeIn 0.6s ease-out 3.0s both; }
        .animate-fade-in-delay-16 { animation: fadeIn 0.6s ease-out 3.2s both; }
        .animate-fade-in-delay-17 { animation: fadeIn 0.6s ease-out 3.4s both; }
        .animate-fade-in-delay-18 { animation: fadeIn 0.6s ease-out 3.6s both; }

        .animate-slide-up { animation: slideUp 0.8s ease-out 0.1s both; }
        .animate-slide-up-delay-11 { animation: slideUp 0.8s ease-out 2.2s both; }
        .animate-slide-up-delay-12 { animation: slideUp 0.8s ease-out 2.4s both; }
        .animate-slide-up-delay-13 { animation: slideUp 0.8s ease-out 2.6s both; }

        .animate-slide-in-left-delay-1 { animation: slideInLeft 0.5s ease-out 3.0s both; }
        .animate-slide-in-left-delay-2 { animation: slideInLeft 0.5s ease-out 3.1s both; }
        .animate-slide-in-left-delay-3 { animation: slideInLeft 0.5s ease-out 3.2s both; }
        .animate-slide-in-left-delay-4 { animation: slideInLeft 0.5s ease-out 3.3s both; }
        .animate-slide-in-left-delay-5 { animation: slideInLeft 0.5s ease-out 3.4s both; }
        .animate-slide-in-left-delay-6 { animation: slideInLeft 0.5s ease-out 3.5s both; }

        .animate-bounce-in-delay-2 { animation: bounceIn 0.8s ease-out 0.4s both; }
        .animate-bounce-in-delay-15 { animation: bounceIn 0.8s ease-out 3.0s both; }
        .animate-bounce-in-delay-16 { animation: bounceIn 0.8s ease-out 3.2s both; }
      `}</style>
    </div>
  )
}
