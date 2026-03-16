<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PendingRegistrationVerification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly string $verificationCode,
        private readonly string $email,
        private readonly int $expiresInMinutes,
    ) {
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your Astra verification code')
            ->view('emails.pending-registration-otp', [
                'verificationCode' => $this->verificationCode,
                'email' => $this->email,
                'expiresInMinutes' => $this->expiresInMinutes,
                'registerUrl' => route('register'),
            ]);
    }

    public function verificationCode(): string
    {
        return $this->verificationCode;
    }
}
