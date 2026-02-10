<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PendingRegistrationVerification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly string $verificationUrl,
        private readonly string $email,
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
            ->subject('Verify your ToolSync account')
            ->view('emails.verify-email', [
                'url' => $this->verificationUrl,
                'email' => $this->email,
            ]);
    }
}
