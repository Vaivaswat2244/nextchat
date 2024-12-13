// src/lib/socket.ts
import { Server as NetServer } from 'http'
import { NextApiRequest } from 'next'
import { Server as ServerIO } from 'socket.io'
import { NextApiResponse } from 'next'

export type NextApiResponseServerIO = NextApiResponse & {
    socket: {
        server: NetServer & {
            io: ServerIO
        }
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
    if (!res.socket.server.io) {
        console.log('New Socket.io server...')
        const httpServer: NetServer = res.socket.server as any
        const io = new ServerIO(httpServer, {
            path: '/api/socket',
            addTrailingSlash: false,
        })
        
        // Socket.IO event handlers
        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id)

            socket.on('join', (username: string) => {
                socket.data.username = username
                io.emit('user joined', {
                    userId: socket.id,
                    username
                })
            })

            socket.on('message', (message: string) => {
                io.emit('message', {
                    userId: socket.id,
                    username: socket.data.username,
                    message,
                    timestamp: new Date().toISOString()
                })
            })

            socket.on('typing', () => {
                socket.broadcast.emit('user typing', {
                    userId: socket.id,
                    username: socket.data.username
                })
            })

            socket.on('stop typing', () => {
                socket.broadcast.emit('user stop typing', {
                    userId: socket.id
                })
            })

            socket.on('disconnect', () => {
                io.emit('user left', {
                    userId: socket.id,
                    username: socket.data.username
                })
                console.log('Client disconnected:', socket.id)
            })
        })

        res.socket.server.io = io
    }
    res.end()
}

export default SocketHandler