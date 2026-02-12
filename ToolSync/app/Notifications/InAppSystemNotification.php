<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class InAppSystemNotification extends Notification
{
    use Queueable;

    /**
     * @param  array<string, mixed>  $extra
     */
    public function __construct(
        private readonly string $kind,
        private readonly string $title,
        private readonly string $message,
        private readonly ?string $href = null,
        private readonly array $extra = []
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return array_merge([
            'kind' => $this->kind,
            'title' => $this->title,
            'message' => $this->message,
            'href' => $this->href,
        ], $this->extra);
    }
}
