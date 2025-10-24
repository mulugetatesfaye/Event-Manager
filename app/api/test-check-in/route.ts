import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  console.log('🧪 TEST ENDPOINT CALLED')
  
  try {
    const body = await req.json()
    console.log('📝 Received body:', body)
    
    return NextResponse.json({
      success: true,
      message: 'Endpoint is working!',
      received: body,
    })
  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}