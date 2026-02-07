<?php

namespace App\Services;

use App\Models\AutoApprovalRule;
use App\Models\Tool;
use App\Models\User;

class AutoApprovalEvaluator
{
    /**
     * Check if the given user/context matches any enabled auto-approval rule.
     * Used to allow bypassing max_borrowings or other limits for admins/short-term.
     *
     * @param  array{user_id: int, borrow_date: string, expected_return_date: string, tool_id: int}  $context
     */
    public function passesAnyRule(User $user, array $context): bool
    {
        $rules = AutoApprovalRule::query()->where('enabled', true)->get();
        if ($rules->isEmpty()) {
            return false;
        }

        $borrowDate = isset($context['borrow_date']) ? \Carbon\Carbon::parse($context['borrow_date']) : null;
        $expectedReturn = isset($context['expected_return_date']) ? \Carbon\Carbon::parse($context['expected_return_date']) : null;
        $durationDays = ($borrowDate && $expectedReturn) ? $borrowDate->diffInDays($expectedReturn) + 1 : 0;
        $tool = isset($context['tool_id']) ? Tool::query()->with('category')->find($context['tool_id']) : null;

        foreach ($rules as $rule) {
            if ($this->ruleMatches($rule, $user, $durationDays, $tool)) {
                return true;
            }
        }

        return false;
    }

    private function ruleMatches(AutoApprovalRule $rule, User $user, int $durationDays, ?Tool $tool): bool
    {
        $condition = strtolower($rule->condition);

        if (str_contains($condition, 'admin') && str_contains($condition, 'role')) {
            return $user->role === 'ADMIN';
        }

        if (str_contains($condition, 'duration') && str_contains($condition, '3')) {
            return $durationDays <= 3;
        }

        if (str_contains($condition, 'consumables') && $tool?->category) {
            return strtolower($tool->category->name ?? '') === 'consumables';
        }

        return false;
    }
}
