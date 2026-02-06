import { Head, Link } from '@inertiajs/react';

import eqMark from '../../assets/figma/logo.png';
import waves from '../../assets/figma/signup/Group 45.png';
import cardBackground from '../../assets/figma/signup/Rectangle 1507.png';
import emailIcon from '../../assets/figma/signup/Group 8.png';
import passwordIcon from '../../assets/figma/signup/Vector.png';

export default function Login() {
    return (
        <>
            <Head title="Login">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900&family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div className="relative min-h-screen overflow-hidden bg-[#F9F7F4]">
                {/* Bottom-left waves illustration - hidden on mobile, visible on larger screens */}
                <div className="pointer-events-none absolute bottom-0 left-0 z-0 hidden w-[55vw] max-w-[750px] select-none md:block">
                    <img
                        src={waves}
                        alt=""
                        className="h-auto w-full object-contain object-bottom"
                        draggable={false}
                    />
                </div>

                {/* Top-right signup header (outside card) */}
                <header className="relative z-10 flex justify-end px-4 pt-4 sm:px-8 sm:pt-6 lg:px-30">
                    <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <span className="hidden text-xs font-medium tracking-[-0.02em] text-[#6B7280] sm:inline-block sm:text-sm">
                            Don&apos;t have an account?
                        </span>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center rounded-md bg-[#FAB95B] px-4 py-2 text-xs font-semibold tracking-[-0.02em] text-white shadow-sm ring-1 ring-black/5 hover:bg-[#f6ac3f] sm:px-6 sm:py-2.5 sm:text-sm"
                        >
                            Sign Up
                        </Link>
                    </div>
                </header>

                {/* Main layout */}
                <div className="relative z-10 flex min-h-[calc(100vh-72px)] items-center justify-center px-4 py-6 sm:px-8 lg:px-12">
                    <main className="relative w-full max-w-5xl">
                        {/* Card background from Figma */}
                        <div className="relative mx-auto w-full overflow-hidden rounded-[20px] sm:rounded-[28px]">
                            <img
                                src={cardBackground}
                                alt=""
                                className="block h-auto w-full max-h-[540px] object-cover object-center shadow-[0px_24px_60px_rgba(0,0,0,0.35)] sm:object-cover"
                                draggable={false}
                            />

                            {/* Content on top of card – matches Figma white blob layout */}
                            <div className="pointer-events-none absolute inset-0 flex flex-col px-4 py-4 sm:px-9 sm:py-6 lg:px-12 lg:py-7">
                                {/* Main login content aligned to the white area on the left */}
                                <div className="pointer-events-auto mt-1 flex flex-1 items-center justify-center sm:justify-start">
                                    <div className="w-full max-w-md pl-0 pr-0 sm:pl-2 sm:pr-4 md:pl-4 lg:pl-6">
                                        {/* Logo row inside card */}
                                        <div className="mb-5 flex items-center gap-2">
                                            <img
                                                src={eqMark}
                                                alt="EquipIT"
                                                className="h-7 w-auto sm:h-8"
                                                draggable={false}
                                            />
                                            <span className="font-['Poppins'] text-sm font-semibold tracking-[-0.04em] text-[#545F71]">
                                                EquipIT
                                            </span>
                                        </div>

                                        <h1 className="font-['Poppins'] text-2xl font-extralight leading-tight tracking-[-0.04em] text-[#060644] sm:text-3xl sm:text-[32px]">
                                            Welcome Back!
                                        </h1>

                                        <h2 className="mt-4 font-['Poppins'] text-lg font-black tracking-[-0.03em] text-[#060644] sm:mt-5 sm:text-[20px] sm:text-[22px]">
                                            Login
                                        </h2>

                                        <form className="mt-3 space-y-4">
                                            {/* Email */}
                                            <div>
                                                <label
                                                    htmlFor="email"
                                                    className="font-['Inter'] text-xs font-medium tracking-[-0.02em] text-[#545F71]"
                                                >
                                                    Email
                                                </label>
                                                <div className="mt-2 relative">
                                                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                                                        <img
                                                            src={emailIcon}
                                                            alt=""
                                                            className="h-4 w-4 object-contain"
                                                            draggable={false}
                                                        />
                                                    </span>
                                                    <input
                                                        id="email"
                                                        name="email"
                                                        type="email"
                                                        autoComplete="email"
                                                        className="w-full rounded-lg border border-[#060644] bg-[#F9F7F4] py-2.5 pl-9 pr-3 font-['Inter'] text-sm text-[#060644] outline-none shadow-[0px_4px_10px_rgba(0,0,0,0.08)] placeholder:text-[#9CA3AF] focus:border-[#547792] focus:ring-2 focus:ring-[#547792]/40"
                                                        placeholder="you@company.com"
                                                    />
                                                </div>
                                            </div>

                                            {/* Password */}
                                            <div>
                                                <label
                                                    htmlFor="password"
                                                    className="font-['Inter'] text-xs font-medium tracking-[-0.02em] text-[#545F71]"
                                                >
                                                    Password
                                                </label>
                                                <div className="mt-2 relative">
                                                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                                                        <img
                                                            src={passwordIcon}
                                                            alt=""
                                                            className="h-4 w-4 object-contain"
                                                            draggable={false}
                                                        />
                                                    </span>
                                                    <input
                                                        id="password"
                                                        name="password"
                                                        type="password"
                                                        autoComplete="current-password"
                                                        className="w-full rounded-lg border border-[#060644] bg-[#F9F7F4] py-2.5 pl-9 pr-3 font-['Inter'] text-sm text-[#060644] outline-none shadow-[0px_4px_10px_rgba(0,0,0,0.08)] placeholder:text-[#9CA3AF] focus:border-[#547792] focus:ring-2 focus:ring-[#547792]/40"
                                                        placeholder="Enter your password"
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-md bg-[#547792] font-['Inter'] text-sm font-semibold tracking-[-0.02em] text-white shadow-[0px_6px_16px_rgba(0,0,0,0.25)] hover:bg-[#4a6f86] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#547792]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                                            >
                                                Login
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
