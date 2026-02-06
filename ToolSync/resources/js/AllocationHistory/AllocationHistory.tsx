import { Head, Link } from '@inertiajs/react';

import equipitLogo from '../pages/Auth/assets/brand/equipit-logo.png';

export default function AllocationHistory() {
    const userName = 'User';
    const userEmail = 'admin@organisation.com';

    return (
        <>
            <Head title="Tool Management">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div className="flex min-h-screen bg-[#F5F5F7] text-[#111827]">
                {/* Sidebar */}
                <aside className="flex w-64 flex-col bg-[#0B1020] text-white shadow-xl">
                    {/* Logo and brand */}
                    <div className="flex items-center gap-3 border-b border-white/5 px-6 pt-6 pb-5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                            <img src={equipitLogo} alt="EquipIT" className="h-6 w-auto object-contain" draggable={false} />
                        </div>
                        <span className="font-['Poppins'] text-lg font-semibold tracking-[-0.04em]">EquipIT</span>
                    </div>

                    {/* Navigation */}
                    <nav className="mt-4 flex-1 space-y-1 px-3 font-['Inter'] text-sm">
                        <Link
                            href="#"
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                        >
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-white/5 text-xs">DB</span>
                            <span>Dashboard</span>
                        </Link>

                        <Link href="#" className="flex items-center gap-3 rounded-lg bg-white px-3 py-2.5 text-[#111827] shadow-sm">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#FACC15]/10 text-[11px] font-semibold text-[#92400E]">
                                TM
                            </span>
                            <span>Tools Management</span>
                        </Link>

                        <Link
                            href="#"
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                        >
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-white/5 text-xs">AH</span>
                            <span>Allocation History</span>
                        </Link>
                    </nav>

                    {/* User info + logout */}
                    <div className="mt-auto border-t border-white/5 px-4 py-4 font-['Inter'] text-xs text-gray-300">
                        <div className="mb-3">
                            <p className="text-[11px] tracking-[0.16em] text-gray-400 uppercase">Logged in as</p>
                            <p className="mt-1 text-sm font-medium text-white">{userName}</p>
                            <p className="text-[11px] text-gray-400">{userEmail}</p>
                        </div>

                        <button
                            type="button"
                            className="inline-flex w-full items-center justify-center rounded-md bg-[#F97373]/10 px-3 py-2 text-xs font-semibold text-[#FCA5A5] ring-1 ring-[#F97373]/40 transition-colors hover:bg-[#F97373]/20"
                        >
                            Logout
                        </button>
                    </div>
                </aside>

                {/* Main content */}
                <main className="flex-1 px-8 py-6">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="font-['Poppins'] text-2xl font-semibold tracking-[-0.03em] text-[#111827]">Tool Management</h1>
                            <p className="mt-1 font-['Inter'] text-xs text-[#6B7280]">Add, edit, or remove tools from inventory</p>
                        </div>

                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-md bg-[#FBBF24] px-4 py-2 font-['Inter'] text-xs font-semibold text-[#111827] shadow-sm hover:bg-[#F59E0B] focus-visible:ring-2 focus-visible:ring-[#FBBF24]/60 focus-visible:outline-none"
                        >
                            <span className="text-lg leading-none">+</span>
                            <span>Add Tool</span>
                        </button>
                    </div>

                    {/* Table */}
                    <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100 text-left">
                                <thead className="bg-[#F9FAFB] font-['Inter'] text-[11px] tracking-[0.16em] text-[#6B7280] uppercase">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">
                                            Tool Name
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Tool ID
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Category
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 font-['Inter'] text-sm">
                                    {[
                                        {
                                            name: 'HP LaserJet Pro M404dn',
                                            id: 'PR-00002',
                                            category: 'Printer',
                                            status: 'Available',
                                            statusColor: 'bg-[#DEF7EC] text-[#03543F]',
                                        },
                                        {
                                            name: 'Epson EB-X51 XGA 3LCD',
                                            id: 'PJ-00006',
                                            category: 'Projector',
                                            status: 'Borrowed',
                                            statusColor: 'bg-[#FEF3C7] text-[#92400E]',
                                        },
                                        {
                                            name: 'Deli Projector Screen',
                                            id: 'PJS-00180',
                                            category: 'Projectors Screen',
                                            status: 'User Maintenance',
                                            statusColor: 'bg-[#E0E7FF] text-[#3730A3]',
                                        },
                                        {
                                            name: 'Acer Aspire Lite 14 AL14-31P-36BE Pure Silver',
                                            id: 'LP-00010',
                                            category: 'Laptop',
                                            status: 'Borrowed',
                                            statusColor: 'bg-[#FEF3C7] text-[#92400E]',
                                        },
                                        {
                                            name: 'Kodak PIXPRO FZ55',
                                            id: 'CA-00104',
                                            category: 'Camera',
                                            status: 'Available',
                                            statusColor: 'bg-[#DEF7EC] text-[#03543F]',
                                        },
                                        {
                                            name: 'Logitech Signature K650',
                                            id: 'KD-00066',
                                            category: 'Keyboard',
                                            status: 'Available',
                                            statusColor: 'bg-[#DEF7EC] text-[#03543F]',
                                        },
                                        {
                                            name: 'Logitech H150 Stereo headset',
                                            id: 'HT-00002',
                                            category: 'Headset',
                                            status: 'User Maintenance',
                                            statusColor: 'bg-[#E0E7FF] text-[#3730A3]',
                                        },
                                        {
                                            name: 'Razer Viper V3 Pro',
                                            id: 'MF-00011',
                                            category: 'Mouse',
                                            status: 'Available',
                                            statusColor: 'bg-[#DEF7EC] text-[#03543F]',
                                        },
                                    ].map((tool) => (
                                        <tr key={tool.id} className="hover:bg-[#F9FAFB]">
                                            <td className="px-6 py-4 whitespace-nowrap text-[#111827]">{tool.name}</td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-[#4B5563]">{tool.id}</td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-[#4B5563]">{tool.category}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${tool.statusColor}`}
                                                >
                                                    {tool.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-xs whitespace-nowrap">
                                                <button
                                                    type="button"
                                                    className="rounded-md border border-gray-200 px-3 py-1 text-[11px] font-medium text-[#4B5563] hover:bg-gray-50"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
