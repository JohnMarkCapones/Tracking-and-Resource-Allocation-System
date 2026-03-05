import { Head, Link, useForm, usePage } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { useEffect, useState } from 'react';

import PasswordInput from '@/Components/PasswordInput';
import astraLogo from '../assets/ASTRA_logo.png';
import welcomeImg from '../assets/welcome_img.png';

export default function Welcome() {
    const { status, verification_email } = usePage<{ status?: string; verification_email?: string }>().props;
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const { data, setData, post, processing, errors, transform, setError, clearErrors, reset } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const { post: postVerificationNotification, processing: resendingVerification } = useForm({});

    const shouldShowVerificationModal = showVerificationModal;

    useEffect(() => {
        if (status === 'verification-link-sent') {
            setShowVerificationModal(true);
            const email = verification_email ?? data.email;
            console.log(
                '[EquipIT] Verification email sent successfully to:',
                email,
                '— Check your inbox (and spam folder).',
            );
        }
    }, [status, verification_email, data.email]);

    useEffect(() => {
        if (!shouldShowVerificationModal) {
            return;
        }

        const checkVerificationStatus = async () => {
            try {
                const response = await fetch('/api/registration/verification-status', {
                    method: 'GET',
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });

                if (!response.ok) {
                    return;
                }

                const body = (await response.json()) as { verified?: boolean };
                if (body.verified) {
                    window.location.href = '/dashboard';
                }
            } catch {
                // Ignore transient network errors while polling.
            }
        };

        void checkVerificationStatus();
        const intervalId = window.setInterval(() => {
            void checkVerificationStatus();
        }, 3000);

        return () => window.clearInterval(intervalId);
    }, [shouldShowVerificationModal]);

    const passwordChecks = {
        minLength: data.password.length >= 8,
        uppercase: /[A-Z]/.test(data.password),
        lowercase: /[a-z]/.test(data.password),
        number: /\d/.test(data.password),
        special: /[^A-Za-z0-9]/.test(data.password),
    };
    const characterTypeCount = [passwordChecks.uppercase, passwordChecks.lowercase, passwordChecks.number, passwordChecks.special].filter(
        Boolean,
    ).length;
    const strengthLevel = passwordChecks.minLength && characterTypeCount === 4 ? 'Strong' : passwordChecks.minLength && characterTypeCount >= 3 ? 'Medium' : 'Weak';
    const strengthBarClass =
        strengthLevel === 'Strong' ? 'w-full bg-green-600' : strengthLevel === 'Medium' ? 'w-4/5 bg-amber-500' : 'w-1/3 bg-red-500';
    const strengthTextClass =
        strengthLevel === 'Strong'
            ? 'text-green-700'
            : strengthLevel === 'Medium'
              ? 'text-amber-700'
              : 'text-red-600';
    const isAcceptablePassword = strengthLevel !== 'Weak';
    const nameError = (errors as Record<string, string | undefined>).name ?? errors.first_name ?? errors.last_name;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        clearErrors('password');
        if (!isAcceptablePassword) {
            setError('password', 'Weak password will not be accepted. Please improve your password.');
            return;
        }

        transform((d) => ({
            name: [d.first_name, d.last_name].map((s) => s.trim()).filter(Boolean).join(' ') || 'User',
            email: d.email,
            password: d.password,
            password_confirmation: d.password_confirmation,
        }));
        post('/register', {
            replace: true,
            onSuccess: () => {
                console.log('[EquipIT] Registration accepted. Verification email has been sent.');
            },
            onError: (errors) => {
                console.warn('[EquipIT] Registration had errors:', errors);
            },
        });
    };

    const resendVerificationEmail = () => {
        postVerificationNotification('/register/resend-verification', {
            preserveScroll: true,
            onSuccess: () => {
                setShowVerificationModal(true);
                console.log(
                    '[EquipIT] Verification email resent successfully to:',
                    verification_email ?? data.email,
                );
            },
            onError: (errors) => {
                console.warn('[EquipIT] Resend verification failed:', errors);
            },
        });
    };

    const closeVerificationModal = () => {
        setShowVerificationModal(false);
        reset();
        clearErrors();
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

            <div className="relative min-h-screen overflow-hidden bg-white">
                {/* AstrA Logo - Top Left */}
                <div className="absolute top-6 left-6 z-20 lg:top-8 lg:left-8">
                    <img alt="AstrA" src={astraLogo} className="h-16 w-auto" draggable={false} />
                </div>

                {/* Main container with grid layout */}
                <div className="grid min-h-screen grid-cols-1 lg:grid-cols-3">
                    {/* Left side - Dark blue background with heading and image */}
                    <div className="relative hidden flex-col items-center justify-start bg-gradient-to-b from-[#2D4A7B] to-[#3D5A9B] px-8 pt-32 lg:flex">
                        <div className="flex flex-col items-start justify-start text-left w-full">
                            <h1 className="font-['Poppins'] text-4xl leading-tight font-black tracking-[-0.02em] text-[#A7CFE8] xl:text-5xl">
                                Borrow Smarter.
                                <br />
                                Work Faster.
                            </h1>

                            <p className="mt-6 max-w-sm font-['Poppins'] text-base leading-7 font-medium tracking-[-0.02em] text-white">
                                Easily request, track, and return equipment in one simple system.
                            </p>
                        </div>

                        {/* Equipment image - extends into right side */}
                        <div className="absolute bottom-0 -right-16 w-full max-w-2xl">
                            <img 
                                src={welcomeImg} 
                                alt="Equipment display" 
                                className="h-auto w-full object-contain drop-shadow-lg"
                                draggable={false}
                            />
                        </div>
                    </div>

                    {/* Right side - Registration form */}
                    <div className="flex flex-col items-center justify-center bg-white px-4 py-8 sm:px-6 lg:col-span-2 lg:px-8">
                        {/* Registration form card */}
                        <div className="w-full max-w-md">
                            <h2 className="text-center font-['Poppins'] text-2xl font-semibold tracking-[-0.02em] text-[#060644]">
                                Create Your Account Now!
                            </h2>

                            <form className="mt-8 space-y-5" onSubmit={submit}>
                                {/* Name fields in one row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="font-['Inter'] text-xs font-semibold text-gray-700 uppercase tracking-wide" htmlFor="first_name">
                                            First Name
                                        </label>
                                        <input
                                            id="first_name"
                                            name="first_name"
                                            autoComplete="given-name"
                                            value={data.first_name}
                                            onChange={(e) => setData('first_name', e.target.value)}
                                            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-['Inter'] text-sm text-gray-800 placeholder-gray-400 outline-none transition-colors focus:border-[#2D4A7B] focus:ring-2 focus:ring-[#2D4A7B]/20"
                                            type="text"
                                            placeholder=""
                                        />
                                    </div>

                                    <div>
                                        <label className="font-['Inter'] text-xs font-semibold text-gray-700 uppercase tracking-wide" htmlFor="last_name">
                                            Last Name
                                        </label>
                                        <input
                                            id="last_name"
                                            name="last_name"
                                            autoComplete="family-name"
                                            value={data.last_name}
                                            onChange={(e) => setData('last_name', e.target.value)}
                                            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-['Inter'] text-sm text-gray-800 placeholder-gray-400 outline-none transition-colors focus:border-[#2D4A7B] focus:ring-2 focus:ring-[#2D4A7B]/20"
                                            type="text"
                                            placeholder=""
                                        />
                                    </div>
                                </div>
                                {nameError && <p className="text-xs text-red-600">{nameError}</p>}

                                {/* Email */}
                                <div>
                                    <label className="font-['Inter'] text-xs font-semibold text-gray-700 uppercase tracking-wide" htmlFor="email">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-['Inter'] text-sm text-gray-800 placeholder-gray-400 outline-none transition-colors focus:border-[#2D4A7B] focus:ring-2 focus:ring-[#2D4A7B]/20"
                                        type="email"
                                        placeholder=""
                                        required
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="font-['Inter'] text-xs font-semibold text-gray-700 uppercase tracking-wide" htmlFor="password">
                                        Password
                                    </label>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        autoComplete="new-password"
                                        value={data.password}
                                        onChange={(e) => {
                                            setData('password', e.target.value);
                                            clearErrors('password');
                                        }}
                                        className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-['Inter'] text-sm text-gray-800 placeholder-gray-400 outline-none transition-colors focus:border-[#2D4A7B] focus:ring-2 focus:ring-[#2D4A7B]/20"
                                        required
                                    />
                                    {errors.password && (
                                        <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                                    )}
                                    <div className="mt-3 rounded-lg bg-gray-50 p-3 text-xs leading-5 text-gray-700 border border-gray-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-medium text-gray-800">Password requirements: </p>
                                            {data.password.length > 0 && (
                                                <span className={`text-xs font-medium ${strengthTextClass}`}>Strength: {strengthLevel}</span>
                                            )}
                                        </div>
                                        {data.password.length > 0 && (
                                            <div className="mb-2 h-1.5 w-full rounded-full bg-gray-300">
                                                <div className={`h-1.5 rounded-full transition-all duration-200 ${strengthBarClass}`} />
                                            </div>
                                        )}
                                        <ul className="space-y-1">
                                            <li className={passwordChecks.minLength ? 'text-green-700' : 'text-gray-600'}>
                                                {passwordChecks.minLength ? '✓ ' : '○ '}At least 8 characters
                                            </li>
                                            <li className={passwordChecks.uppercase ? 'text-green-700' : 'text-gray-600'}>
                                                {passwordChecks.uppercase ? '✓ ' : '○ '}At least one uppercase letter (A-Z)
                                            </li>
                                            <li className={passwordChecks.lowercase ? 'text-green-700' : 'text-gray-600'}>
                                                {passwordChecks.lowercase ? '✓ ' : '○ '}At least one lowercase letter (a-z)
                                            </li>
                                            <li className={passwordChecks.number ? 'text-green-700' : 'text-gray-600'}>
                                                {passwordChecks.number ? '✓ ' : '○ '}At least one number (0-9)
                                            </li>
                                            <li className={passwordChecks.special ? 'text-green-700' : 'text-gray-600'}>
                                                {passwordChecks.special ? '✓ ' : '○ '}At least one special character (! @ # $ %)
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="font-['Inter'] text-xs font-semibold text-gray-700 uppercase tracking-wide" htmlFor="confirm_password">
                                        Confirm Password
                                    </label>
                                    <PasswordInput
                                        id="confirm_password"
                                        name="password_confirmation"
                                        autoComplete="new-password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-['Inter'] text-sm text-gray-800 placeholder-gray-400 outline-none transition-colors focus:border-[#2D4A7B] focus:ring-2 focus:ring-[#2D4A7B]/20"
                                        required
                                    />
                                    {errors.password_confirmation && (
                                        <p className="mt-1 text-xs text-red-600">{errors.password_confirmation}</p>
                                    )}
                                </div>

                                {/* Register button */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#4A6FA5] font-['Inter'] text-sm font-semibold text-white shadow-sm hover:bg-[#3D5A8F] transition-colors focus-visible:ring-2 focus-visible:ring-[#2D4A7B] focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Creating account…' : 'Register'}
                                </button>

                                {/* Divider */}
                                <div className="flex items-center gap-3 my-4">
                                    <div className="flex-1 border-t border-gray-300" />
                                    <span className="text-xs text-gray-500 font-medium">or</span>
                                    <div className="flex-1 border-t border-gray-300" />
                                </div>

                                {/* Social sign up buttons */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-['Inter'] text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                        </svg>
                                        <span>Facebook</span>
                                    </button>
                                    <button
                                        type="button"
                                        className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-['Inter'] text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                            <path fill="#34A853" d="M12 23c2.97 0 5.48-.98 7.31-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.74 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                            <path fill="#4285F4" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                        </svg>
                                        <span>Google</span>
                                    </button>
                                </div>
                            </form>

                            {/* Already have account login link */}
                            <div className="mt-8 flex items-center justify-center gap-2 font-['Inter'] text-sm text-gray-600">
                                <span>Already have an account?</span>
                                <Link
                                    href="/login"
                                    replace
                                    className="font-semibold text-[#2D4A7B] hover:underline"
                                >
                                    Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {shouldShowVerificationModal && (
                    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 px-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/10">
                            <h3 className="font-['Poppins'] text-xl font-black tracking-[-0.02em] text-[#2D4A7B]">
                                Verify Your Email
                            </h3>
                            <p className="mt-3 font-['Inter'] text-sm leading-6 text-gray-600">
                                We sent a verification link to{' '}
                                <span className="font-semibold text-[#2D4A7B]">{verification_email ?? data.email}</span>.
                                Please verify your account to continue to your dashboard.
                            </p>

                            <div className="mt-6 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeVerificationModal}
                                    className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 px-4 font-['Inter'] text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    onClick={resendVerificationEmail}
                                    disabled={resendingVerification}
                                    className="inline-flex h-10 items-center justify-center rounded-lg bg-[#4A6FA5] px-4 font-['Inter'] text-sm font-semibold text-white hover:bg-[#3D5A8F] transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {resendingVerification ? 'Resending...' : 'Resend Email'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
