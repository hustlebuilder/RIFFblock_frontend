"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Pause, Rewind, FastForward } from "lucide-react"
import WalletConnect from "@/components/wallet-connect"
import { userApi, nftApi } from "@/lib/api-client"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

interface MostTippedProfile {
  name: string
  image: string
  riffTips: number
  topRiff: string
  walletAddress: string
}

interface RiffNFT {
  name: string
  artist: string
  image: string
  audioFile: string
  stakedAmount: number
  duration: number
}

export default function StudioHero() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackMode, setPlaybackMode] = useState<"newest" | "random">("newest")
  const [featuredArtist, setFeaturedArtist] = useState<MostTippedProfile | null>(null)
  const [topRiffNFT, setTopRiffNFT] = useState<RiffNFT | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRiffLoading, setIsRiffLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio()
    
    // Add event listeners
    audioRef.current.addEventListener('timeupdate', () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime)
      }
    })

    audioRef.current.addEventListener('loadedmetadata', () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration)
      }
    })

    audioRef.current.addEventListener('ended', () => {
      setIsPlaying(false)
      setCurrentTime(0)
    })

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  // Fetch most tipped profile
  useEffect(() => {
    async function fetchMostTippedProfile() {
      try {
        const response = await userApi.getMostTippedProfile()
        setFeaturedArtist(response)
      } catch (error) {
        console.error("Error fetching most tipped profile:", error)
        // Fallback to default featured artist if API fails
        setFeaturedArtist({
          name: "SYNTHWAVE_92",
          image: "/placeholder.svg",
          riffTips: 24350,
          topRiff: "Neon Cascade",
          walletAddress: "",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMostTippedProfile()
  }, [])

  // Fetch riff based on playback mode
  useEffect(() => {
    async function fetchRiff() {
      setIsRiffLoading(true)
      try {
        const response = await (playbackMode === "newest" 
          ? nftApi.getLatestRiff() 
          : nftApi.getRandomRiff())
        setTopRiffNFT(response)
        
        // If we have an audio file and the audio element is ready
        if (response.audioFile && audioRef.current) {
          audioRef.current.src = response.audioFile
          // Reset playback state
          setIsPlaying(false)
          setCurrentTime(0)
        }
      } catch (error) {
        console.error(`Error fetching ${playbackMode} riff:`, error)
        setTopRiffNFT({
          name: "Quantum Pulse",
          artist: "CyberSoul",
          image: "/nft.png",
          audioFile: "/wave-pattern.png",
          stakedAmount: 156000,
          duration: 180
        })
      } finally {
        setIsRiffLoading(false)
      }
    }

    fetchRiff()
  }, [playbackMode])

  // Handle play/pause
  const togglePlay = () => {
    if (!audioRef.current || !topRiffNFT?.audioFile) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error)
        toast({
          title: "Error",
          description: "Failed to play audio. Please try again.",
          variant: "destructive",
        })
      })
    }
    setIsPlaying(!isPlaying)
  }

  // Format time display (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Skip forward by 5 seconds
  const handleSkipForward = () => {
    if (!audioRef.current) return
    const newTime = Math.min(audioRef.current.currentTime + 5, duration)
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  // Skip backward by 5 seconds
  const handleSkipBackward = () => {
    if (!audioRef.current) return
    const newTime = Math.max(audioRef.current.currentTime - 5, 0)
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  // Handle seeking in the progress bar
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const newTime = percentage * duration
    
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  return (
    <div className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Studio background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero.jpeg"
          alt="Professional music studio"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Dark overlay for better visibility of overlaid content */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
      </div>

      <div className="container relative z-10 px-4 md:px-6 py-10">
        <div className="flex flex-col items-center">
          {/* ICO banner */}
          {/* <div className="inline-block px-4 py-2 rounded-full bg-violet-500/30 text-violet-300 text-sm font-medium backdrop-blur-md mb-8 border border-violet-500/20">
            ICO LIVE NOW • 30% BONUS ENDS IN 3 DAYS
          </div> */}

          {/* Monitors overlay - positioned to align with the actual monitors in the image */}
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-2">
            {/* Left monitor - Featured Artist */}
            <div className="relative bg-black/70 backdrop-blur-md rounded-lg border border-zinc-800/50 overflow-hidden shadow-2xl shadow-violet-900/20">
              <div className="absolute top-0 left-0 right-0 bg-zinc-900/80 px-4 py-2 flex items-center justify-between border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-zinc-400">FEATURED ARTIST • MOST RIFF TIPS</span>
                </div>
              </div>

              {/* Artist content */}
              <div className="pt-10 pb-4 px-4 aspect-video">
                {featuredArtist && featuredArtist.walletAddress ? (
                  <Link href={`/profile/${featuredArtist.walletAddress}`} className="block relative w-full h-full rounded-lg overflow-hidden group">
                    {/* Artist image */}
                    <Image
                      src={featuredArtist?.image || "/placeholder.svg"}
                      alt={featuredArtist?.name || "Featured Artist"}
                      fill
                      className="object-cover"
                    />

                    {/* Artist info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                      <div className="flex justify-between items-end">
                        <div>
                          <h3 className="text-2xl font-bold">{featuredArtist?.name || "Loading..."}</h3>
                          <p className="text-violet-300">{featuredArtist?.topRiff || "Loading..."}</p>
                        </div>
                        <div className="bg-violet-500/20 backdrop-blur-sm px-3 py-1 rounded-full">
                          <span className="text-violet-300 font-medium">
                            {featuredArtist?.riffTips.toLocaleString() || "0"} RIFF
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Monitor screen effect */}
                    <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_30px_rgba(0,0,0,0.7)] rounded-lg"></div>
                    <div className="absolute inset-0 pointer-events-none bg-blue-500/5 mix-blend-overlay"></div>
                  </Link>
                ) : (
                  // Fallback or loading state if no featured artist or wallet address
                  <div className="relative w-full h-full rounded-lg overflow-hidden flex items-center justify-center bg-zinc-900">
                     <span className="text-zinc-500">Loading Featured Artist...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right monitor - Rifflords NFT */}
            <div className="relative bg-black/70 backdrop-blur-md rounded-lg border border-zinc-800/50 overflow-hidden shadow-2xl shadow-blue-900/20">
              <div className="absolute top-0 left-0 right-0 bg-zinc-900/80 px-4 py-2 flex items-center justify-between border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-zinc-400">RIFFLORDS • MOST RIFF STAKED</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-zinc-800/80 rounded-full p-0.5">
                    <button
                      onClick={() => setPlaybackMode("newest")}
                      className={`px-2 py-0.5 text-xs rounded-full transition-all ${playbackMode === "newest" ? "bg-blue-500/30 text-blue-300" : "text-zinc-400 hover:text-zinc-300"}`}
                    >
                      Newest
                    </button>
                    <button
                      onClick={() => setPlaybackMode("random")}
                      className={`px-2 py-0.5 text-xs rounded-full transition-all ${playbackMode === "random" ? "bg-indigo-500/30 text-red-300" : "text-zinc-400 hover:text-zinc-300"}`}
                    >
                      Random
                    </button>
                  </div>
                  <div className="px-2 py-0.5 bg-blue-500/20 rounded text-xs text-blue-300">NFT</div>
                </div>
              </div>

              {/* NFT content */}
              <div className="pt-10 pb-4 px-4 aspect-video">
                <div className="relative w-full h-full rounded-lg overflow-hidden bg-black">
                  {/* NFT background */}
                  <Image
                    src={topRiffNFT?.image || "/placeholder.svg"}
                    alt={topRiffNFT?.name || "Riff NFT"}
                    fill
                    className="object-cover opacity-60"
                  />

                  {/* Waveform overlay that responds to play/pause */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-3/5 relative overflow-hidden">
                      <motion.div
                        className="absolute inset-0 flex items-center"
                        style={{ width: "200%" }}
                        animate={{
                          x: isPlaying ? [0, -1000] : [0, 0],
                        }}
                        transition={{
                          repeat: Number.POSITIVE_INFINITY,
                          duration: 20,
                          ease: "linear",
                        }}
                      >
                        <Image
                          src={"/wave-pattern.png"}
                          alt="Audio waveform"
                          width={1000}
                          height={300}
                          className="object-contain"
                        />
                        <Image
                          src={"/wave-pattern.png"}
                          alt="Audio waveform"
                          width={1000}
                          height={300}
                          className="object-contain"
                        />
                      </motion.div>
                    </div>
                  </div>

                  {/* NFT info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                    <div className="flex justify-between items-end">
                      <div>
                        <h3 className="text-2xl font-bold">{topRiffNFT?.name || "Loading..."}</h3>
                        <div className="flex items-center gap-2">
                          <p className="text-blue-300">by {topRiffNFT?.artist || "Loading..."}</p>
                          <span className="text-xs text-zinc-500">
                            {playbackMode === "newest" ? "• Latest Upload" : "• Random Selection"}
                          </span>
                        </div>
                      </div>
                      <div className="bg-blue-500/20 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-blue-300 font-medium">
                          {topRiffNFT?.stakedAmount.toLocaleString() || "0"} RIFF
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Monitor screen effect */}
                  <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_30px_rgba(0,0,0,0.7)] rounded-lg"></div>
                  <div className="absolute inset-0 pointer-events-none bg-blue-500/5 mix-blend-overlay"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Mixing console visualization */}
          <div className="mt-8 w-full max-w-5xl">
            <div className="relative h-16 bg-zinc-900/70 backdrop-blur-md rounded-lg border border-zinc-800/50 overflow-hidden">
              {/* Media controls */}
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 flex items-center gap-2">
                {/* Skip backward button */}
                <button
                  className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                  onClick={handleSkipBackward}
                  aria-label="Skip backward 10 seconds"
                >
                  <Rewind size={14} />
                </button>
                {/* Play/Pause button */}
                <button
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 flex items-center justify-center transition-colors shadow-lg shadow-violet-900/30"
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                </button>
                {/* Skip forward button */}
                <button
                  className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                  onClick={handleSkipForward}
                  aria-label="Skip forward 10 seconds"
                >
                  <FastForward size={14} />
                </button>
              </div>

              {/* Fader visualization */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 px-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className="w-1 bg-zinc-700 rounded-full"
                      style={{
                        height: `${8 + Math.sin(i * 0.8) * 6}px`,
                      }}
                    ></div>
                    <div
                      className={`w-2 h-4 rounded-sm ${i % 3 === 0 ? "bg-red-500/70" : i % 3 === 1 ? "bg-blue-500/70" : "bg-violet-500/70"}`}
                    ></div>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="absolute bottom-2 left-36 right-4">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1 ml-8">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <div 
                  className="h-1 bg-zinc-800/50 backdrop-blur-sm rounded-full overflow-hidden cursor-pointer"
                  onClick={handleSeek}
                >
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA section */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-violet-600/90 to-blue-500/90 hover:from-violet-700/90 hover:to-blue-600/90 text-lg shadow-lg shadow-violet-500/20 backdrop-blur-md"
            >
              Buy RIFF Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <WalletConnect size="lg" className="text-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
