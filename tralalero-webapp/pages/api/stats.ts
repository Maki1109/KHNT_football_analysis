import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const statsPath = path.join(process.cwd(), 'football_analysis', 'output_videos', 'stats.json')

  if (!fs.existsSync(statsPath)) {
    return res.status(404).json({ error: "Stats file not found" })
  }

  const data = fs.readFileSync(statsPath, 'utf-8')
  return res.status(200).json(JSON.parse(data))
}
