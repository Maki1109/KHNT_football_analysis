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

    const outputSrc = path.join(scriptDir, 'output_videos', 'output_vid.mp4')
    const outputDest = path.join(process.cwd(), 'public', 'output', 'output_vid.mp4')

    try {
      fs.copyFileSync(outputSrc, outputDest)
      return res.status(200).json({ message: 'Inference completed' })
    } catch (err) {
      console.error('Error copying output video:', err)
      return res.status(500).json({ error: 'Copying output failed' })
    }
  })
}
