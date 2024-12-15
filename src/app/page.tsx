// src/app/page.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { useSocket } from '@/hooks/useSocket'

export default function ChatPage() {
    const [username, setUsername] = useState('')
    const [message, setMessage] = useState('')
    const [isJoined, setIsJoined] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const {
        connected,
        messages,
        users,
        typingUsers,
        sendMessage,
        joinChat,
        emitTyping,
        emitStopTyping
    } = useSocket()

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault()
        if (username.trim()) {
            joinChat(username)
            setIsJoined(true)
        }
    }

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault()
        if (message.trim()) {
            sendMessage(message)
            setMessage('')
            emitStopTyping()
        }
    }

    const handleTyping = () => {
        emitTyping()
    }

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    if (!isJoined) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <form onSubmit={handleJoin} className="bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-6">Join Chat</h2>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        className="w-full p-2 border rounded mb-4"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                        Join
                    </button>
                </form>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto p-4">
                <div className="grid grid-cols-4 gap-4">
                    {/* Users List */}
                    <div className="col-span-1 bg-black rounded-lg shadow p-4">
                        <h2 className="text-xl font-bold mb-4">Online Users</h2>
                        <div className="space-y-2">
                            {users.map((user) => (
                                <div
                                    key={user.userId}
                                    className="p-2 rounded"
                                >
                                    {user.username}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="col-span-3 bg-white rounded-lg shadow">
                        {/* Messages */}
                        <div className="h-[calc(100vh-200px)] overflow-y-auto p-4">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`mb-4 ${
                                        msg.username === username
                                            ? 'text-right'
                                            : 'text-left'
                                    }`}
                                >
                                    <div
                                        className={`inline-block p-3 rounded-lg ${
                                            msg.username === username
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-200'
                                        }`}
                                    >
                                        <p className="font-bold text-sm">
                                            {msg.username === username ? 'You' : msg.username}
                                        </p>
                                        <p>{msg.message}</p>
                                        <p className="text-xs opacity-75">
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Typing Indicator */}
                        <div className="h-6 px-4 text-sm text-gray-500 italic">
                            {typingUsers.length > 0 &&
                                `${typingUsers
                                    .map((user) => user.username)
                                    .join(', ')} ${
                                    typingUsers.length === 1 ? 'is' : 'are'
                                } typing...`}
                        </div>

                        {/* Message Input */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={handleTyping}
                                    placeholder="Type your message..."
                                    className="flex-1 p-2 border rounded"
                                />
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Send
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}