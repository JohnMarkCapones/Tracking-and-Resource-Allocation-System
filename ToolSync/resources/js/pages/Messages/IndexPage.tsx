import { Head } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { Breadcrumb } from '@/Components/Breadcrumb';
import AppLayout from '@/Layouts/AppLayout';

type Message = {
    id: number;
    sender: string;
    senderRole: 'user' | 'admin';
    content: string;
    timestamp: string;
    read: boolean;
};

type Thread = {
    id: number;
    subject: string;
    toolName?: string;
    toolId?: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    messages: Message[];
};

const MOCK_THREADS: Thread[] = [
    {
        id: 1,
        subject: 'MacBook Pro 14" Request',
        toolName: 'MacBook Pro 14"',
        toolId: 'LP-0001',
        lastMessage: 'Your request has been approved. You can pick it up from Room 204.',
        lastMessageTime: '10 min ago',
        unreadCount: 1,
        messages: [
            {
                id: 1,
                sender: 'You',
                senderRole: 'user',
                content: 'Hi, I need the MacBook Pro for my presentation next week. Is it available?',
                timestamp: '2:30 PM',
                read: true,
            },
            {
                id: 2,
                sender: 'Admin',
                senderRole: 'admin',
                content: 'Let me check the schedule. When exactly do you need it?',
                timestamp: '2:45 PM',
                read: true,
            },
            { id: 3, sender: 'You', senderRole: 'user', content: 'From Monday to Wednesday next week.', timestamp: '2:50 PM', read: true },
            {
                id: 4,
                sender: 'Admin',
                senderRole: 'admin',
                content: 'Your request has been approved. You can pick it up from Room 204.',
                timestamp: '3:15 PM',
                read: false,
            },
        ],
    },
    {
        id: 2,
        subject: 'Damaged Equipment Report',
        toolName: 'Canon EOS R6',
        toolId: 'CM-0001',
        lastMessage: "Thank you for reporting. We'll schedule maintenance.",
        lastMessageTime: 'Yesterday',
        unreadCount: 0,
        messages: [
            {
                id: 1,
                sender: 'You',
                senderRole: 'user',
                content: 'The lens cap seems to be cracked on the Canon camera.',
                timestamp: 'Yesterday',
                read: true,
            },
            {
                id: 2,
                sender: 'Admin',
                senderRole: 'admin',
                content: "Thank you for reporting. We'll schedule maintenance.",
                timestamp: 'Yesterday',
                read: true,
            },
        ],
    },
    {
        id: 3,
        subject: 'General Inquiry',
        lastMessage: "We'll be getting new 3D printers next month.",
        lastMessageTime: '3 days ago',
        unreadCount: 0,
        messages: [
            {
                id: 1,
                sender: 'You',
                senderRole: 'user',
                content: 'Are there any plans to add more 3D printers to the catalog?',
                timestamp: '3 days ago',
                read: true,
            },
            {
                id: 2,
                sender: 'Admin',
                senderRole: 'admin',
                content: "We'll be getting new 3D printers next month.",
                timestamp: '3 days ago',
                read: true,
            },
        ],
    },
];

export default function IndexPage() {
    const [threads] = useState(MOCK_THREADS);
    const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedThread]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        setNewMessage('');
    };

    return (
        <AppLayout
            activeRoute="dashboard"
            header={
                <>
                    <Breadcrumb className="mb-2">
                        <Breadcrumb.Home />
                        <Breadcrumb.Item isCurrent>Messages</Breadcrumb.Item>
                    </Breadcrumb>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Messages</h1>
                </>
            }
        >
            <Head title="Messages" />

            <div className="flex h-[calc(100vh-220px)] overflow-hidden rounded-3xl bg-white shadow-sm dark:bg-gray-800">
                {/* Thread List */}
                <div className={`w-full border-r border-gray-200 md:w-80 dark:border-gray-700 ${selectedThread ? 'hidden md:block' : ''}`}>
                    <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Conversations</h2>
                            <button type="button" className="rounded-full bg-blue-600 p-1.5 text-white hover:bg-blue-700">
                                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="overflow-y-auto" style={{ height: 'calc(100% - 65px)' }}>
                        {threads.map((thread) => (
                            <button
                                key={thread.id}
                                type="button"
                                onClick={() => setSelectedThread(thread)}
                                className={`w-full border-b border-gray-100 p-4 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 ${
                                    selectedThread?.id === thread.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">{thread.subject}</p>
                                        {thread.toolName && (
                                            <p className="text-[10px] text-blue-600 dark:text-blue-400">
                                                {thread.toolName} ({thread.toolId})
                                            </p>
                                        )}
                                        <p className="mt-1 truncate text-[11px] text-gray-500 dark:text-gray-400">{thread.lastMessage}</p>
                                    </div>
                                    <div className="ml-2 flex flex-col items-end">
                                        <span className="text-[10px] text-gray-400 dark:text-gray-500">{thread.lastMessageTime}</span>
                                        {thread.unreadCount > 0 && (
                                            <span className="mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                                                {thread.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Message Area */}
                <div className={`flex flex-1 flex-col ${!selectedThread ? 'hidden md:flex' : ''}`}>
                    {selectedThread ? (
                        <>
                            {/* Thread Header */}
                            <div className="flex items-center gap-3 border-b border-gray-200 p-4 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setSelectedThread(null)}
                                    className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 md:hidden dark:hover:bg-gray-700"
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none">
                                        <path
                                            d="M12 4L6 10L12 16"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedThread.subject}</p>
                                    {selectedThread.toolName && (
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                            {selectedThread.toolName} · {selectedThread.toolId}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="space-y-4">
                                    {selectedThread.messages.map((message) => (
                                        <div key={message.id} className={`flex ${message.senderRole === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div
                                                className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                                                    message.senderRole === 'user'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                                                }`}
                                            >
                                                <p className="text-xs">{message.content}</p>
                                                <p
                                                    className={`mt-1 text-right text-[9px] ${
                                                        message.senderRole === 'user' ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'
                                                    }`}
                                                >
                                                    {message.timestamp}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSend} className="border-t border-gray-200 p-4 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-xs focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                    <button
                                        type="submit"
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
                                    >
                                        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                                            <path
                                                d="M14 2L7 9M14 2L10 14L7 9M14 2L2 6L7 9"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex flex-1 items-center justify-center">
                            <div className="text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" viewBox="0 0 48 48" fill="none">
                                    <path
                                        d="M8 8H40C42.2 8 44 9.8 44 12V36C44 38.2 42.2 40 40 40H12L4 48V12C4 9.8 5.8 8 8 8Z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">Select a conversation</p>
                                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Choose a thread from the left to start chatting</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
