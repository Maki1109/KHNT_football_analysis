import { IncomingForm } from 'formidable'
import fs from 'fs'
import path from 'path'
import { NextApiRequest, NextApiResponse } from 'next'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = new IncomingForm({ keepExtensions: true })

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err)
      return res.status(500).json({ error: 'Error parsing form data' })
    }

    const videoFile = (files.video as any)?.[0] || (files.video as any)
    const tempPath = videoFile.filepath as string
    const targetPath = path.join(process.cwd(), '..', 'football_analysis', 'input_videos', 'input_vid.mp4')

    try {
      fs.copyFileSync(tempPath, targetPath)
      console.log(`Uploaded video saved to ${targetPath}`)
      return res.status(200).json({ message: 'Upload successful' })
    } catch (err) {
      console.error('File save error:', err)
      return res.status(500).json({ error: 'Saving file failed' })
    }
  })
}
