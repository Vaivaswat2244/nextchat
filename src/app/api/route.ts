// src/app/api/socket/route.ts
import { NextResponse } from 'next/server'
import SocketHandler from '@/lib/socket'

export async function GET(req: Request) {
    // @ts-ignore - Next.js types don't include socket
    await SocketHandler(req, {
        socket: {
            server: (await import('http')).Server
        }
    })
    
    return NextResponse.json({ success: true })
}