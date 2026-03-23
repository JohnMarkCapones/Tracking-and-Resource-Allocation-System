import { Head, Link, useForm, usePage } from '@inertiajs/react';
import type { FormEvent, FormEventHandler, ReactNode } from 'react';
import { useEffect, useState } from 'react';

import PasswordInput from '@/Components/PasswordInput';
//import socialite from '@routes/socialite';  change back to this when the socialite routes are added back in
import astraLogo from '../assets/ASTRA_logo.png';  //remove when socialite routes are added back in
import loginBackground from '../assets/login_background.png';
import welcomeImg from '../assets/welcome_img.png';

type VerificationModalState = 'closed' | 'entry' | 'incorrect' | 'expired' | 'success';

type VerificationApiBody = {
    state?: 'expired' | 'incorrect' | 'resent' | 'verified' | 'send_failed';
    message?: string;
    redirect?: string;
    email?: string;
    errors?: Record<string, string[]>;
};

type WelcomePageProps = {
    has_pending_registration?: boolean;
    status?: string;
    verification_email?: string;
    errors?: Record<string, string | string[]>;
};

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


const ShieldAlertIcon = () => (
    <svg className="h-11 w-11" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path
            d="M24 6l12 4.5v10.05c0 8.55-5.085 16.29-12 19.95-6.915-3.66-12-11.4-12-19.95V10.5L24 6Z"
            stroke="#F4A73F"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path d="M24 16v9" stroke="#F4A73F" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="24" cy="31" r="2.25" fill="#F4A73F" />
    </svg>
);

const ErrorCrossIcon = () => (
    <svg className="h-11 w-11" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M16 16l16 16" stroke="#F24C4C" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M32 16L16 32" stroke="#F24C4C" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
);

const SuccessCheckIcon = () => (
    <svg className="h-11 w-11" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M15 24.5l6.75 6.75L33 18" stroke="#0D8A25" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const MailCodeIcon = () => (
    <svg className="h-11 w-11" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="8" y="12" width="32" height="24" rx="6" stroke="#5B7EA2" strokeWidth="3.5" />
        <path d="M12 18l12 9 12-9" stroke="#5B7EA2" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const VerificationModalShell = ({ title, children }: { title: string; children: ReactNode }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111936]/55 px-4">
        <div className="w-full max-w-[35rem] overflow-hidden rounded-[1.7rem] bg-white shadow-[0_28px_70px_rgba(12,27,76,0.38)]">
            <div className="bg-[linear-gradient(90deg,#242A70_0%,#9AA6D3_100%)] px-7 py-5 sm:px-8 sm:py-6">
                <h3 className="font-['Poppins'] text-[1.95rem] font-bold tracking-[-0.04em] text-white sm:text-[2.05rem]">{title}</h3>
            </div>
            <div className="px-7 py-8 sm:px-9 sm:py-10">{children}</div>
        </div>
    </div>
);

const StatusBadge = ({ toneClass, children }: { toneClass: string; children: ReactNode }) => (
    <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full ${toneClass}`}>{children}</div>
);

export default function Welcome() {
    const { has_pending_registration, status, verification_email, errors: pageErrors } = usePage<WelcomePageProps>().props;

    const [verificationModalState, setVerificationModalState] = useState<VerificationModalState>('closed');
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationCodeError, setVerificationCodeError] = useState<string | null>(null);
    const [verificationNotice, setVerificationNotice] = useState<string | null>(null);
    const [verificationRedirect, setVerificationRedirect] = useState('/dashboard');
    const [verifyingCode, setVerifyingCode] = useState(false);
    const [resendingVerification, setResendingVerification] = useState(false);
    const { data, setData, post, processing, errors, transform, setError, clearErrors } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        if (!pageErrors || Object.keys(pageErrors).length === 0) return;

        const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
        const emailErr = pick(pageErrors.email);
        const nameErr = pick(pageErrors.name);
        const passwordErr = pick(pageErrors.password);
        if (emailErr) setError('email', emailErr);
        if (nameErr) setError('first_name', nameErr);
        if (passwordErr) setError('password', passwordErr);

        const saved = sessionStorage.getItem('register_form_draft');
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as { first_name?: string; last_name?: string; email?: string };
                setData((prev) => ({
                    ...prev,
                    first_name: parsed.first_name ?? prev.first_name,
                    last_name: parsed.last_name ?? prev.last_name,
                    email: parsed.email ?? prev.email,
                    password: '',
                    password_confirmation: '',
                }));
            } catch {
                // ignore malformed storage
            }
            sessionStorage.removeItem('register_form_draft');
        }
    }, [pageErrors]);

    const [nameErrors, setNameErrors] = useState<{ first_name?: string; last_name?: string }>({});

    const handleNameChange = (field: 'first_name' | 'last_name', value: string) => {
        if (/\d/.test(value)) {
            setNameErrors((prev) => ({ ...prev, [field]: 'Name must not contain numbers.' }));
        } else {
            setNameErrors((prev) => ({ ...prev, [field]: undefined }));
        }
        setData(field, value);
    };

    useEffect(() => {
        if (status === 'verification-code-sent' || status === 'verification-code-resent') {
            setVerificationModalState('entry');
            setVerificationCode('');
            setVerificationCodeError(null);
            setVerificationNotice(
                status === 'verification-code-resent'
                    ? 'A fresh 6-digit verification code was sent to your email.'
                    : 'We sent a 6-digit verification code to your email.',
            );
        } else if (status === 'verification-code-send-failed') {
            setVerificationModalState('entry');
            setVerificationCode('');
            setVerificationCodeError(null);
            setVerificationNotice("We couldn't send the verification email. Please use the \"Resend code\" button to try again.");
        }
    }, [status]);

    useEffect(() => {
        if (has_pending_registration) {
            setVerificationModalState((current) => (current === 'closed' ? 'entry' : current));
            setVerificationNotice((current) => current ?? 'Enter the code from your inbox to finish creating your account.');
        }
    }, [has_pending_registration]);

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
    const strengthLevel =
        passwordChecks.minLength && characterTypeCount === 4 ? 'Strong' : passwordChecks.minLength && characterTypeCount >= 3 ? 'Medium' : 'Weak';
    const strengthTextClass =
        strengthLevel === 'Strong' ? 'text-emerald-700' : strengthLevel === 'Medium' ? 'text-amber-700' : 'text-rose-700';
    const isAcceptablePassword = strengthLevel !== 'Weak';
    const nameError = (errors as Record<string, string | undefined>).name ?? errors.first_name ?? errors.last_name;
    const verificationEmail = verification_email ?? data.email;
    const modalButtonClass =
        "flex h-[3.1rem] w-full items-center justify-center rounded-[0.95rem] bg-[#5B7EA2] font-['Inter'] text-[1.02rem] font-semibold text-white shadow-[0_12px_24px_rgba(29,51,110,0.24)] transition hover:bg-[#527393] disabled:cursor-not-allowed disabled:opacity-70";

    const inputShellClass = (hasError?: string) =>
        [
            'h-14 w-full rounded-[15px] border-2 bg-white px-5 text-[15px] text-[#1B245D] outline-none transition',
            hasError ? 'border-rose-500 focus:border-rose-500 focus:ring-4 focus:ring-rose-200/70' : 'border-[#1D2867] focus:border-[#547792] focus:ring-4 focus:ring-[#547792]/18',
        ].join(' ');

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        clearErrors('password');
        clearErrors('password_confirmation');

        if (/\d/.test(data.first_name) || /\d/.test(data.last_name)) {
            if (/\d/.test(data.first_name)) setNameErrors((prev) => ({ ...prev, first_name: 'Name must not contain numbers.' }));
            if (/\d/.test(data.last_name)) setNameErrors((prev) => ({ ...prev, last_name: 'Name must not contain numbers.' }));
            return;
        }

        if (!isAcceptablePassword) {
            setError('password', 'Weak password will not be accepted. Please improve your password.');
            return;
        }

        if (data.password !== data.password_confirmation) {
            setError('password_confirmation', 'Passwords do not match. Please make sure both fields are identical.');
            return;
        }

        transform((current) => ({
            name: [current.first_name, current.last_name]
                .map((part) => part.trim())
                .filter(Boolean)
                .join(' ') || 'User',
            email: current.email,
            password: current.password,
            password_confirmation: current.password_confirmation,
        }));

        sessionStorage.setItem(
            'register_form_draft',
            JSON.stringify({ first_name: data.first_name, last_name: data.last_name, email: data.email }),
        );

        post('/register', {
            replace: true,
            preserveState: 'errors',
            onSuccess: () => {
                sessionStorage.removeItem('register_form_draft');
                setVerificationModalState('entry');
                setVerificationCode('');
                setVerificationCodeError(null);
            },
            onError: () => {
                setData((prev) => ({ ...prev, password: '', password_confirmation: '' }));
            },
        });
    };

    const postRegistrationJson = async (url: string, payload: Record<string, string>) => {
        const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
            body: JSON.stringify(payload),
        });

        const body = (await response.json().catch(() => null)) as VerificationApiBody | null;

        return { body, response };
    };

    const resendVerificationCode = async () => {
        setResendingVerification(true);
        setVerificationCode('');
        setVerificationCodeError(null);

        try {
            const { body, response } = await postRegistrationJson('/register/resend-verification', {});

            if (response.ok && body?.state === 'resent') {
                setVerificationModalState('entry');
                setVerificationNotice(body.message ?? 'A new verification code has been sent to your email.');
                return;
            }

            if (body?.state === 'expired') {
                setVerificationModalState('expired');
                return;
            }

            if (body?.state === 'send_failed') {
                setVerificationCodeError(body.message ?? 'We could not send the verification email. Please try again shortly.');
                return;
            }

            setVerificationCodeError(body?.message ?? 'Unable to resend the verification code right now.');
        } catch {
            setVerificationCodeError('Unable to resend the verification code right now.');
        } finally {
            setResendingVerification(false);
        }
    };

    const submitVerificationCode = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!/^\d{6}$/.test(verificationCode)) {
            setVerificationCodeError('Enter the 6-digit code from your email.');
            return;
        }

        setVerifyingCode(true);
        setVerificationCodeError(null);

        try {
            const { body, response } = await postRegistrationJson('/register/verify-otp', {
                code: verificationCode,
            });

            if (response.ok && body?.state === 'verified') {
                setVerificationRedirect(body.redirect ?? '/dashboard');
                setVerificationModalState('success');
                setVerificationCode('');
                return;
            }

            if (body?.state === 'incorrect') {
                setVerificationCode('');
                setVerificationModalState('incorrect');
                return;
            }

            if (body?.state === 'expired') {
                setVerificationModalState('expired');
                return;
            }

            const validationError = body?.errors?.code?.[0];
            setVerificationCodeError(validationError ?? body?.message ?? 'We could not verify that code right now.');
        } catch {
            setVerificationCodeError('We could not verify that code right now.');
        } finally {
            setVerifyingCode(false);
        }
    };

    const closeVerificationModal = () => {
        setVerificationModalState('closed');
        setVerificationCode('');
        setVerificationCodeError(null);
        setVerificationNotice(null);

        const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
        fetch('/register/cancel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
        }).catch(() => {});
    };

    const retryVerification = () => {
        if (verificationModalState === 'expired') {
            void resendVerificationCode();
            return;
        }

        setVerificationModalState('entry');
        setVerificationCode('');
        setVerificationCodeError(null);
    };

    const continueToDashboard = () => {
        window.location.href = verificationRedirect;
    };

    return (
        <>
            <Head title="Create Account">
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
                                Easily request, track, and return equipment in one simple system.
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
                            className="relative z-30 w-full max-w-[52rem] overflow-hidden rounded-[2.1rem] bg-white px-5 py-8 shadow-[16px_18px_0_rgba(31,44,122,0.42),30px_38px_46px_rgba(12,28,89,0.46)] sm:px-8 sm:py-10 lg:rounded-[2.5rem] lg:px-12 lg:py-12 xl:px-16 xl:py-14"
                            style={{
                                WebkitMaskImage:
                                    'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.18) 4%, rgba(0,0,0,0.58) 9%, rgba(0,0,0,0.9) 14%, #000 18%, #000 100%)',
                                maskImage:
                                    'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.18) 4%, rgba(0,0,0,0.58) 9%, rgba(0,0,0,0.9) 14%, #000 18%, #000 100%)',
                            }}
                        >
                            <div className="relative z-10">
                                <h2 className="text-center font-['Poppins'] text-[2rem] font-bold tracking-[-0.04em] text-[#1B245D] sm:text-[2.25rem]">
                                    Create Your Account Now!
                                </h2>

                                <form className="mx-auto mt-8 max-w-[33rem] space-y-4 sm:mt-10 sm:space-y-5" onSubmit={submit}>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="relative">
                                            <label
                                                htmlFor="first_name"
                                                className="pointer-events-none absolute left-4 top-0 z-10 -translate-y-1/2 bg-white px-2 font-['Inter'] text-[0.98rem] font-medium text-[#66718A]"
                                            >
                                                First Name
                                            </label>
                                            <input
                                                id="first_name"
                                                name="first_name"
                                                type="text"
                                                autoComplete="given-name"
                                                value={data.first_name}
                                                onChange={(e) => handleNameChange('first_name', e.target.value)}
                                                className={inputShellClass(nameError ?? nameErrors.first_name)}
                                                required
                                            />
                                        </div>

                                        <div className="relative">
                                            <label
                                                htmlFor="last_name"
                                                className="pointer-events-none absolute left-4 top-0 z-10 -translate-y-1/2 bg-white px-2 font-['Inter'] text-[0.98rem] font-medium text-[#66718A]"
                                            >
                                                Last Name
                                            </label>
                                            <input
                                                id="last_name"
                                                name="last_name"
                                                type="text"
                                                autoComplete="family-name"
                                                value={data.last_name}
                                                onChange={(e) => handleNameChange('last_name', e.target.value)}
                                                className={inputShellClass(nameError ?? nameErrors.last_name)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    {(nameError ?? nameErrors.first_name ?? nameErrors.last_name) && (
                                        <p className="text-sm font-medium text-rose-600">
                                            {nameError ?? nameErrors.first_name ?? nameErrors.last_name}
                                        </p>
                                    )}

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
                                            onChange={(e) => {
                                                setData('email', e.target.value);
                                                clearErrors('email');
                                            }}
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
                                            autoComplete="new-password"
                                            value={data.password}
                                            onChange={(e) => {
                                                setData('password', e.target.value);
                                                clearErrors('password');
                                            }}
                                            className={inputShellClass(errors.password)}
                                            required
                                        />
                                    </div>
                                    {errors.password && <p className="text-sm font-medium text-rose-600">{errors.password}</p>}

                                    <div className="relative">
                                        <label
                                            htmlFor="password_confirmation"
                                            className="pointer-events-none absolute left-4 top-0 z-10 -translate-y-1/2 bg-white px-2 font-['Inter'] text-[0.98rem] font-medium text-[#66718A]"
                                        >
                                            Confirm Password
                                        </label>
                                        <PasswordInput
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            autoComplete="new-password"
                                            value={data.password_confirmation}
                                            onChange={(e) => {
                                                setData('password_confirmation', e.target.value);
                                                clearErrors('password_confirmation');
                                                clearErrors('password');
                                            }}
                                            className={inputShellClass(errors.password_confirmation)}
                                            required
                                        />
                                    </div>
                                    {errors.password_confirmation && (
                                        <p className="text-sm font-medium text-rose-600">{errors.password_confirmation}</p>
                                    )}

                                    <div className="space-y-1.5 px-1">
                                        <p className="font-['Inter'] text-[0.78rem] leading-5 text-[#74747E] sm:text-[0.82rem]">
                                            Password must use at least 8 characters and any 3 of these 4 types:
                                            uppercase, lowercase, number, and special character.
                                        </p>
                                        {data.password.length > 0 && (
                                            <p className={`font-['Inter'] text-[0.78rem] font-semibold ${strengthTextClass}`}>
                                                Password strength: {strengthLevel}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-6 flex justify-center">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="flex h-12 w-full max-w-[23.5rem] items-center justify-center rounded-[0.6rem] bg-[#5B7EA2] font-['Inter'] text-[1.05rem] font-semibold text-white shadow-[0_12px_24px_rgba(29,51,110,0.28)] transition hover:bg-[#527393] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5B7EA2]/25 disabled:cursor-not-allowed disabled:opacity-70"
                                        >
                                            {processing ? 'Creating account...' : 'Register'}
                                        </button>
                                    </div>

                                    <div className="pt-1 text-center font-['Inter'] text-[1rem] text-[#6F7485]">
                                        Already have an account?{' '}
                                        <Link href="/login" replace className="font-semibold text-[#355E8B] hover:underline">
                                            Login
                                        </Link>
                                    </div>

                                    <div className="flex items-center gap-5 pt-1">
                                        <div className="h-px flex-1 bg-[#B8C4DB]" />
                                        <span className="font-['Inter'] text-lg text-[#666A76]">or</span>
                                        <div className="h-px flex-1 bg-[#B8C4DB]" />
                                    </div>

<<<<<<< HEAD
                                    <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                                        <a
                                            //href={socialite.redierct.url('facebook')} change back to this when the socialite routes are added back in
                                            href="/auth/facebook/redirect" //remove when socialite routes are added back in
                                            className="inline-flex h-[3.25rem] items-center justify-center gap-3 rounded-[0.9rem] border border-[#E7EBF3] bg-[#FAFBFD] px-4 font-['Inter'] text-[1rem] font-medium text-[#486C92] transition hover:border-[#C8D3E6] hover:bg-white"
                                        >
                                            <FacebookIcon />
                                            <span>Sign up with Facebook</span>
                                        </a>

                                        <a
                                            //href={socialite.redierct.url('google')}  change back to this when the socialite routes are added back in
                                            href="/auth/google/redirect"  //remove when socialite routes are added back in
                                            className="inline-flex h-[3.25rem] items-center justify-center gap-3 rounded-[0.9rem] border border-[#E7EBF3] bg-[#FAFBFD] px-4 font-['Inter'] text-[1rem] font-medium text-[#486C92] transition hover:border-[#C8D3E6] hover:bg-white"
=======
                                    <div className="flex justify-center pt-1">
                                        <a
                                            href={socialite.redirect.url('google')}
                                            className="inline-flex h-[3.25rem] w-full max-w-[23.5rem] items-center justify-center gap-3 rounded-[0.9rem] border border-[#E7EBF3] bg-[#FAFBFD] px-4 font-['Inter'] text-[1rem] font-medium text-[#486C92] transition hover:border-[#C8D3E6] hover:bg-white"
>>>>>>> 30468704e08f9b8053615714f831e82720ba7a27
                                        >
                                            <GoogleIcon />
                                            <span>Sign up with Google</span>
                                        </a>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </section>
                </div>

                {verificationModalState === 'entry' && (
                    <VerificationModalShell title="Verify Your Email">
                        <div className="text-center">
                            <StatusBadge toneClass="bg-[#E8F1FB]">
                                <MailCodeIcon />
                            </StatusBadge>

                            <h4 className="mt-7 font-['Poppins'] text-[2rem] font-semibold tracking-[-0.04em] text-[#1B245D]">Enter Your OTP</h4>
                            <p className="mx-auto mt-3 max-w-[24rem] font-['Inter'] text-[1.05rem] leading-8 text-[#666A76]">
                                Enter the 6-digit verification code sent to{' '}
                                <span className="font-semibold text-[#1B245D]">{verificationEmail || 'your email'}</span>.
                            </p>

                            <form className="mt-7" onSubmit={submitVerificationCode}>
                                <input
                                    value={verificationCode}
                                    onChange={(e) => {
                                        setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                                        setVerificationCodeError(null);
                                    }}
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={6}
                                    className="mx-auto block h-16 w-full max-w-[20rem] rounded-[1rem] border-2 border-[#1D2867] bg-white px-6 text-center font-['Inter'] text-[1.65rem] font-semibold tracking-[0.38em] text-[#1B245D] outline-none transition focus:border-[#547792] focus:ring-4 focus:ring-[#547792]/18"
                                    placeholder="000000"
                                />

                                <p className="mt-4 font-['Inter'] text-[0.95rem] text-[#757B8D]">The code expires soon. Request a new one if needed.</p>
                                {verificationNotice && <p className="mt-2 font-['Inter'] text-[0.95rem] text-[#486C92]">{verificationNotice}</p>}
                                {verificationCodeError && <p className="mt-2 font-['Inter'] text-[0.95rem] font-semibold text-rose-600">{verificationCodeError}</p>}

                                <div className="mt-7 flex items-center justify-between gap-4 text-[0.98rem]">
                                    <button
                                        type="button"
                                        onClick={closeVerificationModal}
                                        className="font-['Inter'] font-semibold text-[#6E7487] transition hover:text-[#1B245D]"
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => void resendVerificationCode()}
                                        disabled={resendingVerification}
                                        className="font-['Inter'] font-semibold text-[#486C92] transition hover:text-[#1B245D] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {resendingVerification ? 'Sending...' : 'Resend code'}
                                    </button>
                                </div>

                                <div className="mt-7">
                                    <button type="submit" disabled={verifyingCode} className={modalButtonClass}>
                                        {verifyingCode ? 'Verifying...' : 'Verify'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </VerificationModalShell>
                )}

                {verificationModalState === 'expired' && (
                    <VerificationModalShell title="Verification Failed!">
                        <div className="text-center">
                            <StatusBadge toneClass="bg-[#FFF5B8]">
                                <ShieldAlertIcon />
                            </StatusBadge>

                            <h4 className="mt-7 font-['Poppins'] text-[2rem] font-semibold tracking-[-0.04em] text-[#1B245D]">Expired OTP</h4>
                            <p className="mt-3 font-['Inter'] text-[1.05rem] leading-8 text-[#666A76]">This verification code has expired.</p>

                            <div className="mt-8">
                                <button type="button" onClick={retryVerification} disabled={resendingVerification} className={modalButtonClass}>
                                    {resendingVerification ? 'Sending...' : 'Retry'}
                                </button>
                            </div>
                        </div>
                    </VerificationModalShell>
                )}

                {verificationModalState === 'incorrect' && (
                    <VerificationModalShell title="Verification Failed!">
                        <div className="text-center">
                            <StatusBadge toneClass="bg-[#FFD0D5]">
                                <ErrorCrossIcon />
                            </StatusBadge>

                            <h4 className="mt-7 font-['Poppins'] text-[2rem] font-semibold tracking-[-0.04em] text-[#1B245D]">Incorrect OTP</h4>
                            <p className="mx-auto mt-3 max-w-[24rem] font-['Inter'] text-[1.05rem] leading-8 text-[#666A76]">
                                The code you entered is incorrect. Please try again.
                            </p>

                            <div className="mt-8">
                                <button type="button" onClick={retryVerification} className={modalButtonClass}>
                                    Retry
                                </button>
                            </div>
                        </div>
                    </VerificationModalShell>
                )}

                {verificationModalState === 'success' && (
                    <VerificationModalShell title="Verification Successful!">
                        <div className="text-center">
                            <StatusBadge toneClass="bg-[#C9F0D0]">
                                <SuccessCheckIcon />
                            </StatusBadge>

                            <h4 className="mt-7 font-['Poppins'] text-[2rem] font-semibold tracking-[-0.04em] text-[#1B245D]">Email Verified!</h4>
                            <p className="mt-3 font-['Inter'] text-[1.05rem] leading-8 text-[#666A76]">Your email was successfully verified.</p>

                            <div className="mt-8">
                                <button type="button" onClick={continueToDashboard} className={modalButtonClass}>
                                    Continue
                                </button>
                            </div>
                        </div>
                    </VerificationModalShell>
                )}
            </div>
        </>
    );
}
