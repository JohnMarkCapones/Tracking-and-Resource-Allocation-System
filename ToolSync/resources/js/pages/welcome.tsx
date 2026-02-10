import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';

import equipitLogo from '../assets/figma/logo.png';
import signupGroup72 from '../assets/figma/signup/Group 72.png';
import signupGroup77 from '../assets/figma/signup/Group 77.png';

export default function Welcome() {
    const { data, setData, post, processing, errors, transform } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        transform((d) => ({
            name: [d.first_name, d.last_name].map((s) => s.trim()).filter(Boolean).join(' ') || 'User',
            email: d.email,
            password: d.password,
            password_confirmation: d.password_confirmation,
        }));
        post('/register', { replace: true });
    };

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
                {/* Bottom-left waves illustration - Group 77 (back layer) - hidden on mobile, visible on larger screens */}
                <div className="pointer-events-none absolute bottom-0 left-0 z-0 hidden w-[55vw] max-w-[650px] select-none md:block">
                    <img src={signupGroup77} alt="" className="h-auto w-full object-contain object-bottom" draggable={false} />
                </div>

                {/* Background artwork - Group 72 (front layer) - hidden on mobile, visible on larger screens */}
                <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] hidden w-[40vw] max-w-[500px] select-none md:block">
                    <img alt="" src={signupGroup72} className="h-auto w-full object-contain object-left" draggable={false} />
                </div>

                {/* Standard website header */}
                <header className="relative z-10 flex w-full items-center justify-end gap-4 py-6 pr-5 pl-4 sm:pr-9 sm:pl-8 lg:pr-8 lg:pl-8">
                    <div className="flex items-center gap-3 font-['Inter'] text-sm leading-5 tracking-[-0.02em] text-[#545F71]">
                        <span className="hidden sm:inline">Already have an account?</span>
                        <Link
                            href="/profile/login"
                            replace
                            className="inline-flex h-9 items-center justify-center rounded-lg bg-[#FAB95B] px-6 font-semibold text-[#ffffff] shadow-sm ring-1 ring-black/5"
                        >
                            Login
                        </Link>
                    </div>
                </header>

                {/* Content */}
                <main className="relative z-10 mx-auto grid w-full max-w-screen-2xl grid-cols-1 items-center gap-8 pt-6 pr-4 pb-14 pl-4 sm:gap-12 sm:pr-6 sm:pl-6 lg:grid-cols-2 lg:gap-16 lg:pr-8 lg:pb-20 lg:pl-8">
                    <section className="text-center lg:text-left">
                        <div className="mb-6 flex items-center justify-center gap-3 lg:justify-start">
                            <img alt="EquipIT" src={equipitLogo} className="h-7 w-auto" draggable={false} />
                            <div className="font-['Poppins'] text-lg font-extrabold tracking-[-0.02em] text-[#060644] sm:text-xl">EquipIT</div>
                        </div>

                        <h1 className="font-['Poppins'] text-3xl leading-tight font-black tracking-[-0.02em] text-[#060644] drop-shadow-[0px_4px_4px_rgba(0,0,0,0.18)] sm:text-4xl sm:text-5xl lg:text-6xl">
                            Borrow Smarter.
                            <br />
                            Work Faster.
                        </h1>

                        <p className="mx-auto mt-4 max-w-md font-['Poppins'] text-sm leading-6 font-medium tracking-[-0.02em] text-[#5D5D5D] sm:mt-6 sm:text-base sm:text-lg lg:mx-0">
                            Easily request, track, and return equipment in
                            <br className="hidden sm:inline" /> <span className="block text-center lg:text-center">one simple system.</span>
                        </p>
                    </section>

                    {/* Right column group (aligned with Login on the right) */}
                    <section className="w-full max-w-lg justify-self-center lg:justify-self-end">
                        <div className="rounded-[20px] bg-white p-5 shadow-[0px_18px_45px_rgba(0,0,0,0.18)] ring-1 ring-black/5 sm:rounded-[28px] sm:p-6 lg:p-8">
                            <h2 className="text-center font-['Poppins'] text-xl font-black tracking-[-0.02em] text-[#060644] sm:text-2xl">
                                Create Your Account Now!
                            </h2>

                            <form className="mt-7 space-y-4" onSubmit={submit}>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="font-['Inter'] text-sm font-medium text-[#444444]" htmlFor="first_name">
                                            First Name
                                        </label>
                                        <input
                                            id="first_name"
                                            name="first_name"
                                            autoComplete="given-name"
                                            value={data.first_name}
                                            onChange={(e) => setData('first_name', e.target.value)}
                                            className="mt-2 w-full rounded-xl bg-[#F9F7F4] px-4 py-3 font-['Inter'] text-sm font-medium text-[#444444] ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-[#060644]"
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
                                            value={data.last_name}
                                            onChange={(e) => setData('last_name', e.target.value)}
                                            className="mt-2 w-full rounded-xl bg-[#F9F7F4] px-4 py-3 font-['Inter'] text-sm font-medium text-[#444444] ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-[#060644]"
                                            type="text"
                                        />
                                    </div>
                                </div>
                                {((errors as Record<string, string | undefined>)['name'] ?? errors.first_name ?? errors.last_name) && (
                                    <p className="text-xs text-red-600">
                                        {(errors as Record<string, string | undefined>)['name'] ?? errors.first_name ?? errors.last_name}
                                    </p>
                                )}

                                <div>
                                    <label className="font-['Inter'] text-sm font-medium text-[#444444]" htmlFor="email">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="mt-2 w-full rounded-xl bg-[#F9F7F4] px-4 py-3 font-['Inter'] text-sm font-medium text-[#444444] ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-[#060644]"
                                        type="email"
                                        required
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="font-['Inter'] text-sm font-medium text-[#444444]" htmlFor="password">
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        name="password"
                                        autoComplete="new-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="mt-2 w-full rounded-xl bg-[#F9F7F4] px-4 py-3 font-['Inter'] text-sm font-medium text-[#444444] ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-[#060644]"
                                        type="password"
                                        required
                                    />
                                    {errors.password && (
                                        <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="font-['Inter'] text-sm font-medium text-[#444444]" htmlFor="confirm_password">
                                        Confirm Password
                                    </label>
                                    <input
                                        id="confirm_password"
                                        name="password_confirmation"
                                        autoComplete="new-password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="mt-2 w-full rounded-xl bg-[#F9F7F4] px-4 py-3 font-['Inter'] text-sm font-medium text-[#444444] ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-[#060644]"
                                        type="password"
                                        required
                                    />
                                    {errors.password_confirmation && (
                                        <p className="mt-1 text-xs text-red-600">{errors.password_confirmation}</p>
                                    )}
                                </div>

                                <p className="text-[11px] leading-4 text-[#444444]">
                                    Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one
                                    number, and one special character.
                                </p>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#547792] font-['Inter'] text-sm font-semibold text-white shadow-sm hover:bg-[#4c6f87] focus-visible:ring-2 focus-visible:ring-[#060644] focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Creating account…' : 'Register'}
                                </button>
                            </form>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
