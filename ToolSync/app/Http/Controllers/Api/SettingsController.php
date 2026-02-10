<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AutoApprovalRule;
use App\Models\BusinessHour;
use App\Models\Holiday;
use App\Models\SystemSetting;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SettingsController extends Controller
{
    private const GENERAL_KEYS = [
        'max_borrowings',
        'max_duration',
        'default_duration',
        'reminder_days',
        'overdue_escalation_days',
        'reminder_email_before_due',
        'reminder_email_on_due',
        'reminder_email_daily_overdue',
        'reminder_escalate_to_admin',
    ];

    public function index(): JsonResponse
    {
        $general = SystemSetting::query()
            ->whereIn('key', self::GENERAL_KEYS)
            ->pluck('value', 'key')
            ->toArray();

        foreach (self::GENERAL_KEYS as $key) {
            if (! array_key_exists($key, $general)) {
                $general[$key] = $this->defaultGeneralValue($key);
            }
        }

        $businessHours = BusinessHour::query()->orderBy('day_of_week')->get()->map(function (BusinessHour $h) {
            return [
                'day_of_week' => $h->day_of_week,
                'enabled' => $h->enabled,
                'open' => substr($h->open_time, 0, 5),
                'close' => substr($h->close_time, 0, 5),
            ];
        })->toArray();

        if (empty($businessHours)) {
            $businessHours = $this->defaultBusinessHours();
        }

        $holidays = Holiday::query()->orderBy('date')->get()->map(fn (Holiday $h) => [
            'id' => $h->id,
            'name' => $h->name,
            'date' => $h->date->toDateString(),
        ])->toArray();

        $autoApprovalRules = AutoApprovalRule::all()->map(fn (AutoApprovalRule $r) => [
            'id' => $r->id,
            'name' => $r->name,
            'condition' => $r->condition,
            'enabled' => $r->enabled,
        ])->toArray();

        return response()->json([
            'data' => [
                'general' => $general,
                'business_hours' => $businessHours,
                'holidays' => $holidays,
                'auto_approval_rules' => $autoApprovalRules,
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'general' => ['sometimes', 'array'],
            'general.max_borrowings' => ['sometimes', 'integer', 'min:1', 'max:20'],
            'general.max_duration' => ['sometimes', 'integer', 'min:1', 'max:90'],
            'general.default_duration' => ['sometimes', 'integer', 'min:1'],
            'general.reminder_days' => ['sometimes', 'integer', 'min:1', 'max:7'],
            'general.overdue_escalation_days' => ['sometimes', 'integer', 'min:1', 'max:14'],
            'general.reminder_email_before_due' => ['sometimes', 'boolean'],
            'general.reminder_email_on_due' => ['sometimes', 'boolean'],
            'general.reminder_email_daily_overdue' => ['sometimes', 'boolean'],
            'general.reminder_escalate_to_admin' => ['sometimes', 'boolean'],
            'business_hours' => ['sometimes', 'array'],
            'business_hours.*.day_of_week' => ['required_with:business_hours', 'integer', 'min:0', 'max:6'],
            'business_hours.*.enabled' => ['sometimes', 'boolean'],
            'business_hours.*.open' => ['required_with:business_hours', 'string'],
            'business_hours.*.close' => ['required_with:business_hours', 'string'],
            'holidays' => ['sometimes', 'array'],
            'holidays.*.id' => ['sometimes', 'integer', 'exists:holidays,id'],
            'holidays.*.name' => ['required_with:holidays', 'string', 'max:150'],
            'holidays.*.date' => ['required_with:holidays', 'date'],
            'auto_approval_rules' => ['sometimes', 'array'],
            'auto_approval_rules.*.id' => ['sometimes', 'integer', 'exists:auto_approval_rules,id'],
            'auto_approval_rules.*.enabled' => ['sometimes', 'boolean'],
        ]);

        if (isset($validated['general']['default_duration'], $validated['general']['max_duration'])
            && (int) $validated['general']['default_duration'] > (int) $validated['general']['max_duration']) {
            return response()->json([
                'message' => 'Default borrowing duration cannot exceed max borrowing duration.',
                'errors' => [
                    'general.default_duration' => ['Default borrowing duration cannot exceed max borrowing duration.'],
                ],
            ], 422);
        }

        DB::transaction(function () use ($validated) {
            if (isset($validated['general'])) {
                foreach ($validated['general'] as $key => $value) {
                    if (in_array($key, self::GENERAL_KEYS, true)) {
                        SystemSetting::query()->updateOrInsert(
                            ['key' => $key],
                            ['value' => is_bool($value) ? ($value ? '1' : '0') : (string) $value, 'updated_at' => now()]
                        );
                    }
                }
            }

            if (isset($validated['business_hours'])) {
                foreach ($validated['business_hours'] as $row) {
                    BusinessHour::query()->updateOrInsert(
                        ['day_of_week' => $row['day_of_week']],
                        [
                            'enabled' => $row['enabled'] ?? true,
                            'open_time' => $row['open'],
                            'close_time' => $row['close'],
                            'updated_at' => now(),
                        ]
                    );
                }
            }

            if (isset($validated['holidays'])) {
                $ids = [];
                foreach ($validated['holidays'] as $row) {
                    $holiday = isset($row['id']) ? Holiday::find($row['id']) : new Holiday;
                    if (! $holiday) {
                        continue;
                    }
                    $holiday->name = $row['name'];
                    $holiday->date = $row['date'];
                    $holiday->save();
                    $ids[] = $holiday->id;
                }
                if (! empty($ids)) {
                    Holiday::query()->whereNotIn('id', $ids)->delete();
                } else {
                    Holiday::query()->delete();
                }
            }

            if (isset($validated['auto_approval_rules'])) {
                foreach ($validated['auto_approval_rules'] as $row) {
                    if (isset($row['id']) && array_key_exists('enabled', $row)) {
                        AutoApprovalRule::query()->where('id', $row['id'])->update(['enabled' => $row['enabled']]);
                    }
                }
            }
        });

        ActivityLogger::log(
            'settings.updated',
            null,
            null,
            'System settings updated.',
            array_keys($validated),
            $request->user()?->id
        );

        return response()->json(['message' => 'Settings updated.']);
    }

    private function defaultGeneralValue(string $key): string
    {
        return match ($key) {
            'max_borrowings' => '3',
            'max_duration' => '14',
            'default_duration' => '7',
            'reminder_days' => '2',
            'overdue_escalation_days' => '3',
            'reminder_email_before_due' => '1',
            'reminder_email_on_due' => '1',
            'reminder_email_daily_overdue' => '1',
            'reminder_escalate_to_admin' => '1',
            default => '0',
        };
    }

    private function defaultBusinessHours(): array
    {
        $days = [
            ['day_of_week' => 0, 'enabled' => false, 'open' => '09:00', 'close' => '13:00'],
            ['day_of_week' => 1, 'enabled' => true, 'open' => '08:00', 'close' => '17:00'],
            ['day_of_week' => 2, 'enabled' => true, 'open' => '08:00', 'close' => '17:00'],
            ['day_of_week' => 3, 'enabled' => true, 'open' => '08:00', 'close' => '17:00'],
            ['day_of_week' => 4, 'enabled' => true, 'open' => '08:00', 'close' => '17:00'],
            ['day_of_week' => 5, 'enabled' => true, 'open' => '08:00', 'close' => '17:00'],
            ['day_of_week' => 6, 'enabled' => false, 'open' => '09:00', 'close' => '13:00'],
        ];

        return $days;
    }
}
