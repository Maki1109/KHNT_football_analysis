"use client"

import type React from "react"
import { useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import axios from "axios"

export default function Component() {
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null)
  const [processedVideo, setProcessedVideo] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [team1, setTeam1] = useState("")
  const [team2, setTeam2] = useState("")
  const router = useRouter()

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('video', file)

    try {
      await axios.post('/api/upload', formData)
      const url = URL.createObjectURL(file)
      setUploadedVideo(url)
    } catch (err) {
      console.error('Upload error', err)
    }
  }

  const handleRunInference = async () => {
    setProcessing(true)
    try {
      await axios.post('/api/run', { team1, team2 })
      setProcessedVideo(`/output/output_vid.mp4?t=${Date.now()}`)
    } catch (err) {
      console.error('Inference error', err)
    } finally {
      setProcessing(false)
    }
  }

  const handleAnalyseStats = () => {
    router.push("/stats")
  }

  return (
    <div className="min-h-screen bg-[#061016] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 bg-[#0c2f11]">
        <div className="flex items-center gap-2">
          <img src="/football.png" alt="Football" className="w-8 h-8" />
          <span className="text-xl font-semibold text-white">Tralalero</span>
        </div>
        <nav className="flex gap-8">
          <span className="text-[#2ae65c] font-medium cursor-pointer">LIVE INFERENCE</span>
          <Link href="/stats" className="text-[#2ae65c] font-medium hover:text-[#0c601c] transition-colors">
            STATS ANALYSIS
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <div className="flex gap-8 p-8 h-[calc(100vh-88px)]">
        {/* Left Sidebar */}
        <Card className="w-64 bg-[#1a2023] border-none">
          <CardContent className="p-6 space-y-8">
            {/* Upload Button */}
            <div className="relative">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="video-upload"
              />
              <Button className="w-full bg-[#2ae65c] hover:bg-[#0c601c] text-black font-medium py-3 rounded-lg">
                <Upload className="w-4 h-4 mr-2" />
                Upload video
              </Button>
            </div>

            {/* Demo Video */}
            <div className="space-y-3">
              <div className="border-2 border-white rounded-lg h-32 flex items-center justify-center bg-[#2f3a42] overflow-hidden">
                {uploadedVideo ? (
                  <video src={uploadedVideo} className="w-full h-full object-cover rounded-lg" controls />
                ) : (
                  <span className="text-white font-medium">Demo video</span>
                )}
              </div>
            </div>

            {/* Select Team */}
            <div className="space-y-8">
              <h3 className="text-white font-medium text-xl text-center">Select team</h3>
              <div className="space-y-10">
                <div>
                  <label className="text-white text-sm mb-2 block">Team 1</label>
                  <input
                    type="text"
                    placeholder="Enter team name"
                    value={team1}
                    onChange={(e) => setTeam1(e.target.value)}
                    className="w-full bg-[#2f3a42] border-none text-white px-3 py-2 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2ae65c]"
                  />
                </div>
                <div>
                  <label className="text-white text-sm mb-2 block">Team 2</label>
                  <input
                    type="text"
                    placeholder="Enter team name"
                    value={team2}
                    onChange={(e) => setTeam2(e.target.value)}
                    className="w-full bg-[#2f3a42] border-none text-white px-3 py-2 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2ae65c]"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Video Area */}
        <div className="flex-1 flex flex-col">
          <Card className="flex-1 bg-[#1a2023] border-none">
            <CardContent className="p-6 h-full flex flex-col">
              <div className="border-2 border-white rounded-lg flex-1 flex items-center justify-center bg-[#2f3a42] mb-6 overflow-hidden">
                {processing ? (
                  <div className="text-white text-lg animate-pulse">Running inference...</div>
                ) : processedVideo ? (
                  <video 
                    src={processedVideo} controls className="w-full max-w-[1072px] h-auto max-h-[603px] rounded object-contain" />
                ) : (
                  <span className="text-white font-medium text-xl">Processed video</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <Button
                  onClick={handleRunInference}
                  className="bg-[#2ae65c] hover:bg-[#0c601c] text-black font-medium py-3 px-6 rounded-lg"
                  disabled={processing}
                >
                  {processing ? "Processing..." : "Run inference"}
                </Button>
                <Button
                  onClick={handleAnalyseStats}
                  className="bg-[#2ae65c] hover:bg-[#0c601c] text-black font-medium py-3 px-6 rounded-lg"
                >
                  Analyse stats
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
