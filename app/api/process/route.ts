import { NextRequest, NextResponse } from 'next/server'
import { getEmailFromLinkedIn } from '@/services/linkedinService'

// Use require for xlsx as it works better in Next.js API routes
const XLSX = require('xlsx')

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const apifyToken = formData.get('apifyToken') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!apifyToken) {
      return NextResponse.json({ error: 'No Apify token provided' }, { status: 400 })
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Read the Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    // Convert to JSON for easier processing
    const data = XLSX.utils.sheet_to_json(worksheet)

    if (data.length === 0) {
      return NextResponse.json({ error: 'Excel file is empty' }, { status: 400 })
    }

    // Find the column name for LinkedIn URL
    const linkedinUrlColumn = Object.keys(data[0] as object).find(
      (key) => key.toLowerCase().includes('linkedin') && key.toLowerCase().includes('url')
    ) || Object.keys(data[0] as object).find(
      (key) => key.toLowerCase().includes('linkedin')
    )

    if (!linkedinUrlColumn) {
      return NextResponse.json(
        { error: 'Could not find LinkedIn URL column in Excel file' },
        { status: 400 }
      )
    }

    let successCount = 0
    let failedCount = 0

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any
      const linkedinUrl = row[linkedinUrlColumn]

      // Skip if no LinkedIn URL or if email already exists
      if (!linkedinUrl || row['Email']) {
        continue
      }

      try {
        const email = await getEmailFromLinkedIn(linkedinUrl, apifyToken)

        if (email) {
          row['Email'] = email
          successCount++
        } else {
          row['Email'] = ''
          failedCount++
        }

        // Add a small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Error processing ${linkedinUrl}:`, error)
        row['Email'] = ''
        failedCount++
      }
    }

    // Convert back to worksheet
    const newWorksheet = XLSX.utils.json_to_sheet(data)
    workbook.Sheets[sheetName] = newWorksheet

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Return the file with appropriate headers
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="processed_${file.name}"`,
        'X-Success-Count': successCount.toString(),
        'X-Failed-Count': failedCount.toString(),
        'X-Total-Count': data.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error processing file:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process file' },
      { status: 500 }
    )
  }
}

