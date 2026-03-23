import { Head, Link, useForm, usePage } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { useEffect, useState } from 'react';

import PasswordInput from '@/Components/PasswordInput';
//import socialite from '@routes/socialite';  change back to this when the socialite routes are added back in
import astraLogo from '../../assets/ASTRA_logo.png';  //remove when socialite routes are added back in
import loginBackground from '../../assets/login_background.png';
import welcomeImg from '../../assets/welcome_img.png';

const GoogleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
            d="M21.806 12.23c0-.79-.064-1.364-.2-1.96H12.18v3.575h5.53c-.112.888-.718 2.226-2.064 3.125l-.019.12 2.917 2.215.202.02c1.856-1.68 2.924-4.153 2.924-7.095Z"
            fill="#4285F4"
        />
        <path
            d="M12.18 21.877c2.71 0 4.983-.875 6.644-2.38l-3.1-2.355c-.829.565-1.941.959-3.543.959-2.654 0-4.908-1.706-5.713-4.07l-.116.01-3.033 2.3-.04.108c1.65 3.193 5.024 5.428 8.9 5.428Z"
            fill="#34A853"
        />
        <path
            d="M6.468 14.03a5.806 5.806 0 0 1-.337-1.93c0-.67.123-1.318.325-1.93l-.005-.129-3.072-2.337-.1.046A9.622 9.622 0 0 0 2.19 12.1c0 1.573.381 3.061 1.057 4.35l3.221-2.42Z"
            fill="#FBBC05"
        />
        <path
            d="M12.18 6.1c2.023 0 3.388.85 4.166 1.56l3.042-2.91C17.154 2.726 14.89 1.5 12.18 1.5c-3.877 0-7.25 2.235-8.9 5.428l3.177 2.42C7.272 7.806 9.526 6.1 12.18 6.1Z"
            fill="#EA4335"
        />
    </svg>
);

const FacebookIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
            d="M24 12a12 12 0 1 0-13.875 11.854v-8.385H7.078V12.23h3.047V9.75c0-3.007 1.792-4.668 4.533-4.668 1.313 0 2.687.234 2.687.234v2.953H15.83c-1.49 0-1.955.925-1.955 1.874v2.086h3.328l-.532 3.239h-2.796v8.385A12.003 12.003 0 0 0 24 12Z"
            fill="#1877F2"
        />
        <path
            d="M16.671 15.469l.532-3.239h-3.328v-2.086c0-.949.465-1.874 1.955-1.874h1.515V5.316s-1.374-.234-2.687-.234c-2.741 0-4.533 1.661-4.533 4.668v2.48H7.078v3.239h3.047v8.385a12.08 12.08 0 0 0 3.75 0v-8.385h2.796Z"
            fill="#fff"
        />
    </svg>
);

export default function Login() {
    const { canResetPassword, status, unverified_email } = usePage<{
        canResetPassword?: boolean;
        status?: string | null;
        unverified_email?: string | null;
    }>().props;
    const [showUnverifiedModal, setShowUnverifiedModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        if (unverified_email) {
            setShowUnverifiedModal(true);
        }
    }, [unverified_email]);

    const inputShellClass = (hasError?: string) =>
        [
            'h-14 w-full rounded-[15px] border-2 bg-white px-5 text-[15px] text-[#1B245D] outline-none transition',
            hasError
                ? 'border-rose-500 focus:border-rose-500 focus:ring-4 focus:ring-rose-200/70'
                : 'border-[#1D2867] focus:border-[#547792] focus:ring-4 focus:ring-[#547792]/18',
        ].join(' ');

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post('/login', {
            replace: true,
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Login">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div
                className="min-h-screen bg-[#202a67] lg:overflow-hidden"
                style={{
                    backgroundImage: `linear-gradient(180deg, rgba(135,173,224,0.16), rgba(9,31,95,0.1)), url(${loginBackground})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                }}
            >
                <div className="relative flex min-h-screen flex-col lg:flex-row">
                    <aside className="relative overflow-hidden px-6 pb-0 pt-6 text-white sm:px-8 sm:pt-8 lg:flex lg:min-h-screen lg:w-[34%] lg:flex-col lg:overflow-visible lg:px-6 xl:px-8">
                        <div className="relative z-10">
                            <img alt="Astra" src={astraLogo} className="h-12 w-auto sm:h-14" draggable={false} />
                        </div>

                        <div className="relative z-10 mt-10 max-w-[30rem] pb-40 sm:mt-14 sm:pb-48 lg:mt-16 lg:pb-[20rem]">
                            <h1 className="font-['Poppins'] text-[clamp(2.65rem,6.2vw,4.5rem)] font-black leading-[0.94] tracking-[-0.04em] text-[#B7D7F2] drop-shadow-[0_8px_12px_rgba(25,32,82,0.35)]">
                                <span className="block whitespace-nowrap">Borrow Smarter,</span>
                                <span className="block whitespace-nowrap">Work Faster.</span>
                            </h1>

                            <p className="mt-8 max-w-[22rem] font-['Poppins'] text-lg font-medium leading-8 tracking-[-0.03em] text-white/96 sm:text-[1.7rem] sm:leading-[2.35rem] lg:text-[1.15rem] lg:leading-8 xl:text-[1.3rem] xl:leading-9">
                                Jump back in, manage borrowings, and keep every request moving without the usual back-and-forth.
                            </p>
                        </div>

                        <div className="pointer-events-none absolute bottom-0 left-1/2 z-40 w-[92%] max-w-[44rem] -translate-x-1/2 lg:bottom-[-1.5rem] lg:left-[92%] lg:w-[150%] lg:max-w-none lg:-translate-x-1/2">
                            <img
                                src={welcomeImg}
                                alt="Office tools arranged for borrowing"
                                className="h-auto w-full object-contain drop-shadow-[0_22px_26px_rgba(17,33,82,0.28)]"
                                draggable={false}
                            />
                        </div>
                    </aside>

                    <section className="relative flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-8 xl:px-10">
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 z-0 bg-[linear-gradient(135deg,rgba(184,220,251,0.98)_0%,rgba(248,249,252,0.96)_56%,rgba(216,210,246,0.88)_100%)] lg:rounded-l-[2.8rem]"
                        />

                        <div
                            className="relative z-30 w-full max-w-[50rem] overflow-hidden rounded-[2.1rem] bg-white px-5 py-8 shadow-[16px_18px_0_rgba(31,44,122,0.42),30px_38px_46px_rgba(12,28,89,0.46)] sm:px-8 sm:py-10 lg:rounded-[2.5rem] lg:px-12 lg:py-12 xl:px-16 xl:py-14"
                            style={{
                                WebkitMaskImage:
                                    'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.18) 4%, rgba(0,0,0,0.58) 9%, rgba(0,0,0,0.9) 14%, #000 18%, #000 100%)',
                                maskImage:
                                    'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.18) 4%, rgba(0,0,0,0.58) 9%, rgba(0,0,0,0.9) 14%, #000 18%, #000 100%)',
                            }}
                        >
                            <div className="relative z-10">
                                <p className="text-center font-['Inter'] text-sm font-semibold uppercase tracking-[0.24em] text-[#6B86A6]">
                                    Welcome Back
                                </p>
                                <h1 className="mt-3 text-center font-['Poppins'] text-[2rem] font-bold tracking-[-0.04em] text-[#1B245D] sm:text-[2.25rem]">
                                    Login To Your Account
                                </h1>

                                {status && (
                                    <div className="mx-auto mt-6 max-w-[31rem] rounded-[1rem] border border-emerald-200 bg-emerald-50 px-4 py-3 font-['Inter'] text-sm font-medium text-emerald-700">
                                        {status}
                                    </div>
                                )}

                                <form className="mx-auto mt-8 max-w-[31rem] space-y-4 sm:mt-10 sm:space-y-5" onSubmit={submit}>
                                    <div className="relative">
                                        <label
                                            htmlFor="email"
                                            className="pointer-events-none absolute left-4 top-0 z-10 -translate-y-1/2 bg-white px-2 font-['Inter'] text-[0.98rem] font-medium text-[#66718A]"
                                        >
                                            Email
                                        </label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className={inputShellClass(errors.email)}
                                            required
                                        />
                                    </div>
                                    {errors.email && <p className="text-sm font-medium text-rose-600">{errors.email}</p>}

                                    <div className="relative">
                                        <label
                                            htmlFor="password"
                                            className="pointer-events-none absolute left-4 top-0 z-10 -translate-y-1/2 bg-white px-2 font-['Inter'] text-[0.98rem] font-medium text-[#66718A]"
                                        >
                                            Password
                                        </label>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            autoComplete="current-password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className={inputShellClass(errors.password)}
                                            required
                                        />
                                    </div>
                                    {errors.password && <p className="text-sm font-medium text-rose-600">{errors.password}</p>}

                                    <div className="flex flex-col gap-3 pt-1 text-[0.95rem] text-[#647089] sm:flex-row sm:items-center sm:justify-between">
                                        <label className="inline-flex items-center gap-3 font-['Inter'] font-medium">
                                            <input
                                                type="checkbox"
                                                name="remember"
                                                checked={data.remember}
                                                onChange={(e) => setData('remember', e.target.checked)}
                                                className="h-4 w-4 rounded border border-[#B9C6DA] text-[#5B7EA2] focus:ring-[#5B7EA2]/35"
                                            />
                                            <span>Remember me</span>
                                        </label>

                                        {canResetPassword && (
                                            <Link href="/forgot-password" className="font-['Inter'] font-semibold text-[#355E8B] hover:underline">
                                                Forgot password?
                                            </Link>
                                        )}
                                    </div>

                                    <div className="mt-6 flex justify-center">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="flex h-12 w-full max-w-[23.5rem] items-center justify-center rounded-[0.6rem] bg-[#5B7EA2] font-['Inter'] text-[1.05rem] font-semibold text-white shadow-[0_12px_24px_rgba(29,51,110,0.28)] transition hover:bg-[#527393] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5B7EA2]/25 disabled:cursor-not-allowed disabled:opacity-70"
                                        >
                                            {processing ? 'Logging in...' : 'Login'}
                                        </button>
                                    </div>

                                    <div className="pt-1 text-center font-['Inter'] text-[1rem] text-[#6F7485]">
                                        Need an account?{' '}
                                        <Link href="/register" className="font-semibold text-[#355E8B] hover:underline">
                                            Sign Up
                                        </Link>
                                    </div>

                                    <div className="flex items-center gap-5 pt-1">
                                        <div className="h-px flex-1 bg-[#B8C4DB]" />
                                        <span className="font-['Inter'] text-lg text-[#666A76]">or</span>
                                        <div className="h-px flex-1 bg-[#B8C4DB]" />
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                                        <a
                                            //href={socialite.redierct.url('facebook')} change back to this when the socialite routes are added back in
                                            href="/auth/facebook/redirect" //remove when socialite routes are added back in
                                            className="inline-flex h-[3.25rem] items-center justify-center gap-2.5 rounded-[0.9rem] border border-[#E7EBF3] bg-[#FAFBFD] px-3 font-['Inter'] text-[0.92rem] font-medium text-[#486C92] transition hover:border-[#C8D3E6] hover:bg-white"
                                        >
                                            <FacebookIcon />
                                            <span className="whitespace-nowrap">Continue with Facebook</span>
                                        </a>

                                        <a
                                            //href={socialite.redierct.url('google')}  change back to this when the socialite routes are added back in
                                            href="/auth/google/redirect"  //remove when socialite routes are added back in
                                            className="inline-flex h-[3.25rem] items-center justify-center gap-2.5 rounded-[0.9rem] border border-[#E7EBF3] bg-[#FAFBFD] px-3 font-['Inter'] text-[0.92rem] font-medium text-[#486C92] transition hover:border-[#C8D3E6] hover:bg-white"
                                        >
                                            <GoogleIcon />
                                            <span className="whitespace-nowrap">Continue with Google</span>
                                        </a>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </section>
                </div>

                {showUnverifiedModal && unverified_email && (
                    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#111936]/45 px-4">
                        <div className="w-full max-w-md rounded-[1.7rem] bg-white p-6 shadow-[0_24px_60px_rgba(22,34,79,0.28)] ring-1 ring-[#D6DCEF]">
                            <h3 className="font-['Poppins'] text-[1.45rem] font-bold tracking-[-0.03em] text-[#1B245D]">
                                Email Not Verified
                            </h3>
                            <p className="mt-3 font-['Inter'] text-sm leading-6 text-[#636B81]">
                                The email address <span className="font-semibold text-[#1B245D]">{unverified_email}</span> has not been verified yet.
                                Please use the verification link in your inbox before logging in.
                            </p>

                            <div className="mt-6 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowUnverifiedModal(false)}
                                    className="inline-flex h-11 items-center justify-center rounded-[0.8rem] border border-[#D5DBE8] px-4 font-['Inter'] text-sm font-semibold text-[#5A6072] transition hover:bg-[#F7F8FC]"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
