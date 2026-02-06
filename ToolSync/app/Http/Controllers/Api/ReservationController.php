<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Tool;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $reservations = Reservation::query()
            ->with('tool')
            ->where('user_id', $user?->id)
            ->orderByDesc('start_date')
            ->get()
            ->map(function (Reservation $reservation): array {
                /** @var Tool $tool */
                $tool = $reservation->tool;

                return [
                    'id' => $reservation->id,
                    'toolName' => $tool->name,
                    'toolId' => 'TL-'.$tool->id,
                    'startDate' => $reservation->start_date->toDateString(),
                    'endDate' => $reservation->end_date->toDateString(),
                    'status' => strtolower($reservation->status),
                    'recurring' => (bool) $reservation->recurring,
                    'recurrencePattern' => $reservation->recurrence_pattern,
                ];
            });

        return response()->json([
            'data' => $reservations,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'tool_id' => ['required', 'integer', 'exists:tools,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'recurring' => ['sometimes', 'boolean'],
            'recurrence_pattern' => ['sometimes', 'nullable', 'string', 'max:50'],
        ]);

        $reservation = Reservation::create([
            'tool_id' => (int) $validated['tool_id'],
            'user_id' => $user?->id,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'status' => 'UPCOMING',
            'recurring' => (int) ($validated['recurring'] ?? 0),
            'recurrence_pattern' => $validated['recurrence_pattern'] ?? null,
        ]);

        return response()->json([
            'message' => 'Reservation created successfully.',
            'data' => $reservation,
        ], 201);
    }

    public function update(Request $request, Reservation $reservation): JsonResponse
    {
        $user = $request->user();

        if ($reservation->user_id !== $user?->id) {
            return response()->json([
                'message' => 'You are not allowed to modify this reservation.',
            ], 403);
        }

        $validated = $request->validate([
            'status' => ['sometimes', 'in:UPCOMING,ACTIVE,COMPLETED,CANCELLED'],
        ]);

        $reservation->update($validated);

        return response()->json([
            'message' => 'Reservation updated successfully.',
            'data' => $reservation,
        ]);
    }
}

