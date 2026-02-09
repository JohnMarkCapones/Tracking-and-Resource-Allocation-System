import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import type { FormEventHandler } from 'react';

import equipitLogo from '../assets/figma/logo.png';
import signupGroup72 from '../assets/figma/signup/Group 72.png';
import signupGroup77 from '../assets/figma/signup/Group 77.png';

type PasswordStrength = 'weak' | 'medium' | 'strong';

function getPasswordStrength(password: string): PasswordStrength {
    if (!password.length) return 'weak';
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const types = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    if (password.length >= 8 && types >= 3 && hasLower && hasUpper && (hasNumber || hasSpecial)) return 'strong';
    if (password.length >= 6 && types >= 2) return 'medium';
    return 'weak';
}

const PASSWORD_RULES = [
    { id: 'length', label: 'Minimum 8 characters in length', test: (p: string) => p.length >= 8 },
    { id: 'upper', label: 'At least one uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { id: 'lower', label: 'At least one lowercase letter', test: (p: string) => /[a-z]/.test(p) },
    { id: 'number', label: 'At least one number', test: (p: string) => /\d/.test(p) },
    { id: 'special', label: 'At least one special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function Welcome() {
    const { data, setData, post, processing, errors, transform } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const strength = useMemo(() => getPasswordStrength(data.password), [data.password]);
    const ruleResults = useMemo(
        () => PASSWORD_RULES.map((r) => ({ ...r, met: r.test(data.password) })),
        [data.password],
    );

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        transform((d) => ({
            name: [d.first_name, d.last_name].map((s) => s.trim()).filter(Boolean).join(' ') || 'User',
            email: d.email,
            password: d.password,
            password_confirmation: d.password_confirmation,
        }));
        post('/register');
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
                                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="font-['Inter'] text-sm font-medium text-[#444444]" htmlFor="password">
                                        Password
                                    </label>
                                    <div className="relative mt-2">
                                        <input
                                            id="password"
                                            name="password"
                                            autoComplete="new-password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="w-full rounded-xl bg-[#F9F7F4] px-4 py-3 pr-11 font-['Inter'] text-sm font-medium text-[#444444] ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-[#060644]"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((v) => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-[#545F71] hover:bg-black/5 hover:text-[#060644]"
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? (
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                </svg>
                                            ) : (
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {data.password.length > 0 && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <div className="flex flex-1 gap-0.5">
                                                <span
                                                    className={`h-1 flex-1 rounded-full ${
                                                        strength === 'weak' ? 'bg-red-400' : strength === 'medium' ? 'bg-amber-400' : 'bg-emerald-500'
                                                    }`}
                                                />
                                                <span
                                                    className={`h-1 flex-1 rounded-full ${
                                                        strength === 'medium' || strength === 'strong' ? (strength === 'strong' ? 'bg-emerald-500' : 'bg-amber-400') : 'bg-gray-200'
                                                    }`}
                                                />
                                                <span
                                                    className={`h-1 flex-1 rounded-full ${strength === 'strong' ? 'bg-emerald-500' : 'bg-gray-200'}`}
                                                />
                                            </div>
                                            <span
                                                className={`text-[11px] font-semibold ${
                                                    strength === 'weak' ? 'text-red-600' : strength === 'medium' ? 'text-amber-600' : 'text-emerald-600'
                                                }`}
                                            >
                                                {strength.charAt(0).toUpperCase() + strength.slice(1)}
                                            </span>
                                        </div>
                                    )}
                                    <p className="mt-2 text-[11px] font-medium text-[#444444]">Password requirements:</p>
                                    <ul className="mt-1 space-y-1">
                                        {ruleResults.map((r) => (
                                            <li key={r.id} className="flex items-center gap-2 text-[11px] text-[#444444]">
                                                {r.met ? (
                                                    <span className="text-emerald-600" aria-hidden>✓</span>
                                                ) : (
                                                    <span className="text-gray-300" aria-hidden>○</span>
                                                )}
                                                <span className={r.met ? 'text-[#333]' : ''}>{r.label}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="font-['Inter'] text-sm font-medium text-[#444444]" htmlFor="confirm_password">
                                        Confirm Password
                                    </label>
                                    <div className="relative mt-2">
                                        <input
                                            id="confirm_password"
                                            name="password_confirmation"
                                            autoComplete="new-password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            className="w-full rounded-xl bg-[#F9F7F4] px-4 py-3 pr-11 font-['Inter'] text-sm font-medium text-[#444444] ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-[#060644]"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword((v) => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-[#545F71] hover:bg-black/5 hover:text-[#060644]"
                                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showConfirmPassword ? (
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                </svg>
                                            ) : (
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {errors.password_confirmation && (
                                        <p className="mt-1 text-xs text-red-600">{errors.password_confirmation}</p>
                                    )}
                                </div>

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
