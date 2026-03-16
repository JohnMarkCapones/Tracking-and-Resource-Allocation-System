import { Head, Link, useForm, usePage } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { useEffect, useState } from 'react';

import PasswordInput from '@/Components/PasswordInput';
import astraLogo from '../../assets/ASTRA_logo.png';
import emailIcon from '../../assets/figma/signup/Group 8.png';
import passwordIcon from '../../assets/figma/signup/Vector.png';
import loginBackground from '../../assets/login_background.png';
import welcomeImg from '../../assets/welcome_img.png';

export default function Login() {
    const { unverified_email } = usePage<{ unverified_email?: string | null }>().props;
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
                    href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900&family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div className="flex min-h-screen">
                {/* Left side - Promotional content */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                    {/* Background image */}
                    <div className="absolute inset-0">
                        <img
                            src={loginBackground}
                            alt=""
                            className="h-full w-full object-cover"
                            draggable={false}
                        />
                    </div>
                    <div className="flex flex-col justify-between p-12 text-white relative z-10 w-full">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <img
                                src={astraLogo}
                                alt="ASTRA"
                                className="h-16 w-auto"
                                draggable={false}
                            />
                        </div>

                        {/* Main content */}
                        <div className="space-y-6">
                            <div>
                                <h1 className="font-['Poppins'] text-4xl leading-tight font-black tracking-[-0.02em] text-[#A7CFE8] xl:text-5xl">
                                    Borrow Smarter.<br />Work Faster.
                                </h1>
                                <p className="mt-6 max-w-sm font-['Poppins'] text-base leading-7 font-medium tracking-[-0.02em] text-white">
                                    Easily request, track, and return equipment in<br />one simple system.
                                </p>
                            </div>

                            {/* Equipment illustration */}
                            <div className="relative mt-12">
                                <img
                                    src={welcomeImg}
                                    alt="Equipment desk with laptop, printer, camera and other office tools"
                                    className="w-full h-auto object-contain"
                                    draggable={false}
                                />
                            </div>
                        </div>

                        <div className="h-8"></div>
                    </div>
                </div>

                {/* Right side - Login form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
                    <div className="w-full max-w-md">
                        {/* Mobile logo */}
                        <div className="mb-8 flex items-center gap-2 lg:hidden">
                            <img
                                src={astraLogo}
                                alt="ASTRA"
                                className="h-16 w-auto"
                                draggable={false}
                            />
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h1 className="font-['Poppins'] text-4xl font-bold text-[#060644]">
                                    Welcome Back!
                                </h1>
                            </div>

                            <div>
                                <h2 className="font-['Poppins'] text-2xl font-bold text-[#060644]">
                                    Login
                                </h2>
                            </div>

                            <form className="space-y-5" onSubmit={submit}>
                                {/* Email */}
                                <div>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                                            <img
                                                src={emailIcon}
                                                alt=""
                                                className="h-4 w-4 object-contain opacity-50"
                                                draggable={false}
                                            />
                                        </span>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            autoComplete="email"
                                            className="w-full rounded-lg border-2 border-[#060644] bg-white py-3 pl-10 pr-4 font-['Inter'] text-base text-[#060644] outline-none placeholder:text-[#9CA3AF] focus:border-[#4A5A7F] focus:ring-2 focus:ring-[#4A5A7F]/20"
                                            placeholder="Email"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1 font-['Inter'] text-xs text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                {/* Password */}
                                <div>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center">
                                            <img
                                                src={passwordIcon}
                                                alt=""
                                                className="h-4 w-4 object-contain opacity-50"
                                                draggable={false}
                                            />
                                        </span>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            autoComplete="current-password"
                                            className="w-full rounded-lg border-2 border-[#060644] bg-white py-3 pl-10 font-['Inter'] text-base text-[#060644] outline-none placeholder:text-[#9CA3AF] focus:border-[#4A5A7F] focus:ring-2 focus:ring-[#4A5A7F]/20"
                                            placeholder="Password"
                                        />
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1 font-['Inter'] text-xs text-red-600">{errors.password}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#4A6B8A] font-['Inter'] text-base font-semibold text-white hover:bg-[#3f5a75] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A6B8A]/60 focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                                >
                                    {processing ? 'Logging in...' : 'Login'}
                                </button>
                            </form>

                            {/* Sign up link */}
                            <div className="text-center">
                                <span className="font-['Inter'] text-sm text-[#6B7280]">
                                    Don&apos;t have an account?{' '}
                                </span>
                                <Link
                                    href="/"
                                    className="font-['Inter'] text-sm font-semibold text-[#4A6B8A] hover:text-[#3f5a75] hover:underline"
                                >
                                    Sign up
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Unverified email modal */}
                {showUnverifiedModal && unverified_email && (
                    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 px-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/10">
                            <h3 className="font-['Poppins'] text-xl font-black tracking-[-0.02em] text-[#060644]">
                                Email not verified
                            </h3>
                            <p className="mt-3 font-['Inter'] text-sm leading-6 text-[#545F71]">
                                The email address{' '}
                                <span className="font-semibold text-[#060644]">{unverified_email}</span> has not been
                                verified. Please check your inbox for the verification link and verify your account
                                before logging in.
                            </p>
                            <div className="mt-6 flex items-center justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowUnverifiedModal(false)}
                                    className="inline-flex h-10 items-center justify-center rounded-lg bg-[#547792] px-4 font-['Inter'] text-sm font-semibold text-white hover:bg-[#4c6f87] focus:outline-none focus:ring-2 focus:ring-[#547792] focus:ring-offset-2"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}