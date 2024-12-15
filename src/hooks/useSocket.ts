// src/hooks/useSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'


interface Message {
    userId: string
    username: string
    message: string
    timestamp: string
}

interface User {
    userId: string
    username: string
}

export const useSocket = () => {
    const [messages, setMessages] = useState<Message[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [typingUsers, setTypingUsers] = useState<User[]>([])
    const socketRef = useRef<Socket | null>(null)
    const [connected, setConnected] = useState(false)

    useEffect(() => {
        // Create socket connection
        socketRef.current = io({
            path: '/api/socket',
        })

        // Set up event listeners
        socketRef.current.on('connect', () => {
            console.log('Connected to socket server')
            setConnected(true)
        })

        socketRef.current.on('disconnect', () => {
            console.log('Disconnected from socket server')
            setConnected(false)
        })

        socketRef.current.on('message', (message: Message) => {
            setMessages(prev => [...prev, message])
        })

        socketRef.current.on('user joined', (user: User) => {
            setUsers(prev => [...prev, user])
        })

        socketRef.current.on('user left', (user: User) => {
            setUsers(prev => prev.filter(u => u.userId !== user.userId))
        })

        socketRef.current.on('user typing', (user: User) => {
            setTypingUsers(prev => [...prev, user])
        })

        socketRef.current.on('user stop typing', (user: { userId: string }) => {
            setTypingUsers(prev => prev.filter(u => u.userId !== user.userId))
        })

        return () => {
            socketRef.current?.disconnect()
        }
    }, [])

    const sendMessage = useCallback((message: string) => {
        if (socketRef.current) {
            socketRef.current.emit('message', message)
        }
    }, [])

    const joinChat = useCallback((username: string) => {
        if (socketRef.current) {
            socketRef.current.emit('join', username)
        }
    }, [])

    const emitTyping = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.emit('typing')
        }
    }, [])

    const emitStopTyping = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.emit('stop typing')
        }
    }, [])

    return {
        connected,
        messages,
        users,
        typingUsers,
        sendMessage,
        joinChat,
        emitTyping,
        emitStopTyping,
    }
}