import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!process.env.REVALIDATE_SECRET || token !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  // Revalidate all ISR pages
  revalidatePath('/', 'layout')

  return NextResponse.json({ revalidated: true, timestamp: new Date().toISOString() })
}
