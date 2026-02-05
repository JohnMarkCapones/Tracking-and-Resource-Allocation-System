import { Head, Link } from '@inertiajs/react';

import equipitLogo from '../assets/figma/logo.png';
import signupGroup44 from '../assets/figma/signup/Group 44.png';

export default function Welcome() {
    return (
        <>
            <Head title="Landing">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div className="relative min-h-screen overflow-hidden bg-[#F9F7F4]">
                {/* Background artwork */}
                <div className="pointer-events-none absolute inset-y-0 left-0 z-0 w-[62vw] max-w-[790px] select-none">
                    <img alt="" src={signupGroup44} className="h-full w-full object-contain object-left" draggable={false} />
                </div>

                {/* Standard website header */}
                <header className="relative z-10 flex w-full items-center justify-end gap-4 pl-4 pr-5 py-6 sm:pl-8 sm:pr-9 lg:pl-8 lg:pr-8">
                    <div className="flex items-center gap-3 font-['Inter'] text-sm leading-5 tracking-[-0.02em] text-[#545F71]">
                        <span className="hidden sm:inline">Already have an account?</span>
                        <Link
                            href="/profile/login"
                            className="inline-flex h-9 items-center justify-center rounded-lg bg-[#FAB95B] px-6 font-semibold text-[#ffffff] shadow-sm ring-1 ring-black/5"
                        >
                            Login
                        </Link>
                    </div>
                </header>

                {/* Content */}
                <main className="relative z-10 mx-auto grid w-full max-w-screen-2xl grid-cols-1 items-center gap-12 pb-14 pl-4 pr-0 pt-6 sm:pl-6 sm:pr-0 lg:grid-cols-2 lg:gap-16 lg:pb-20 lg:pl-8 lg:pr-0">
                    <section className="text-center lg:text-left">
                        <div className="mb-6 flex items-center justify-center gap-3 lg:justify-start">
                            <img alt="EquipIT" src={equipitLogo} className="h-7 w-auto" draggable={false} />
                            <div className="font-['Poppins'] text-lg font-extrabold tracking-[-0.02em] text-[#060644] sm:text-xl">
                                EquipIT
                            </div>
                        </div>

                        <h1 className="font-['Poppins'] text-4xl font-black leading-tight tracking-[-0.02em] text-[#060644] drop-shadow-[0px_4px_4px_rgba(0,0,0,0.18)] sm:text-5xl lg:text-6xl">
                            Borrow Smarter.
                            <br/>
                            Work Faster.
                        </h1>

                        <p className="mx-auto mt-6 max-w-md font-['Poppins'] text-base font-medium leading-6 tracking-[-0.02em] text-[#5D5D5D] sm:text-lg lg:mx-0">
                            Easily request, track, and return equipment in<br/> one simple system.
                        </p>
                    </section>

                    {/* Right column group (aligned with Login on the right) */}
                    <section className="w-full max-w-lg justify-self-end">
                        <div className="rounded-[28px] bg-white p-6 shadow-[0px_18px_45px_rgba(0,0,0,0.18)] ring-1 ring-black/5 sm:p-8">
                            <h2 className="text-center font-['Poppins'] text-2xl font-black tracking-[-0.02em] text-[#060644]">
                                Create Your Account Now!
                            </h2>

                            <form className="mt-7 space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="font-['Inter'] text-sm font-medium text-[#444444]" htmlFor="first_name">
                                            First Name
                                        </label>
                                        <input
                                            id="first_name"
                                            name="first_name"
                                            autoComplete="given-name"
                                            className="mt-2 w-full rounded-xl bg-[#F9F7F4] px-4 py-3 font-['Inter'] text-sm font-medium text-[#444444] outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-[#060644]"
                                            type="text"
                                        />
                                    </div>

                                    <div>
                                        <label className="font-['Inter'] text-sm font-medium text-[#444444]" htmlFor="last_name">
                                            Last Name
                                        </label>
                                        <input
                                            id="last_name"
                                            name="last_name"
                                            autoComplete="family-name"
                                            className="mt-2 w-full rounded-xl bg-[#F9F7F4] px-4 py-3 font-['Inter'] text-sm font-medium text-[#444444] outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-[#060644]"
                                            type="text"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="font-['Inter'] text-sm font-medium text-[#444444]" htmlFor="email">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        autoComplete="email"
                                        className="mt-2 w-full rounded-xl bg-[#F9F7F4] px-4 py-3 font-['Inter'] text-sm font-medium text-[#444444] outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-[#060644]"
                                        type="email"
                                    />
                                </div>

                                <div>
                                    <label className="font-['Inter'] text-sm font-medium text-[#444444]" htmlFor="password">
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        name="password"
                                        autoComplete="new-password"
                                        className="mt-2 w-full rounded-xl bg-[#F9F7F4] px-4 py-3 font-['Inter'] text-sm font-medium text-[#444444] outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-[#060644]"
                                        type="password"
                                    />
                                </div>

                                <div>
                                    <label className="font-['Inter'] text-sm font-medium text-[#444444]" htmlFor="confirm_password">
                                        Confirm Password
                                    </label>
                                    <input
                                        id="confirm_password"
                                        name="confirm_password"
                                        autoComplete="new-password"
                                        className="mt-2 w-full rounded-xl bg-[#F9F7F4] px-4 py-3 font-['Inter'] text-sm font-medium text-[#444444] outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-[#060644]"
                                        type="password"
                                    />
                                </div>

                                <p className="text-[11px] leading-4 text-[#444444]">
                                    Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one
                                    special character.
                                </p>

                                <button
                                    type="button"
                                    className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#547792] font-['Inter'] text-sm font-semibold text-white shadow-sm hover:bg-[#4c6f87] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#060644] focus-visible:ring-offset-2"
                                >
                                    Register
                                </button>
                            </form>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
