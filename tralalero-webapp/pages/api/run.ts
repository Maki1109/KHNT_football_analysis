import type { NextApiRequest, NextApiResponse } from 'next'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { team1 = 'Team 1', team2 = 'Team 2' } = req.body

  const scriptDir = path.join(process.cwd(), '..', 'football_analysis')
  const scriptPath = path.join(scriptDir, 'main.py')

  const pythonProcess = spawn(
    'python',
    ['main.py', '--team1', team1, '--team2', team2],
    { cwd: scriptDir }
  )

  pythonProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`)
  })

  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`)
  })

  pythonProcess.on('close', (code) => {
    console.log(`Python script exited with code ${code}`)

    if (code !== 0) {
      return res.status(500).json({ error: 'Inference failed' })
    }

    const webRoot = process.cwd()
    const outputDir = path.join(webRoot, 'public', 'output')

    const outputVideoSrc = path.join(scriptDir, 'output_videos', 'output_vid.mp4')
    const outputVideoDest = path.join(outputDir, 'output_vid.mp4')

    const statsSrc = path.join(scriptDir, 'output_videos', 'stats.json')
    const statsDest = path.join(outputDir, 'stats.json')

    try {
      // Ensure public/output exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      // ✅ Copy output video
      if (fs.existsSync(outputVideoSrc)) {
        fs.copyFileSync(outputVideoSrc, outputVideoDest)
        console.log('✅ Output video copied to public/output/')
      } else {
        console.warn('⚠️ Output video not found')
      }

      // ✅ Skip copying stats.json if a manual version already exists
      if (fs.existsSync(statsDest)) {
        console.log('🛑 Skipping stats.json copy — using manually edited file.')
      } else if (fs.existsSync(statsSrc)) {
        fs.copyFileSync(statsSrc, statsDest)
        console.log('✅ stats.json copied to public/output/')
      } else {
        console.warn('⚠️ stats.json not found in output_videos')
      }

      return res.status(200).json({ message: 'Inference completed' })
    } catch (err) {
      console.error('❌ Error copying output files:', err)
      return res.status(500).json({ error: 'Copying output failed' })
    }
  })
}
