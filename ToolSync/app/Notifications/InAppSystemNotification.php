<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class InAppSystemNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly string $kind,
        private readonly string $title,
        private readonly string $message,
        private readonly ?string $href = null
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, string|null>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'kind' => $this->kind,
            'title' => $this->title,
            'message' => $this->message,
            'href' => $this->href,
        ];
    }
}
