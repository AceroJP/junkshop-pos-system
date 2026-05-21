<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        $users = User::withCount(['payments', 'licenses'])
            ->latest()
            ->paginate(10);

        return view('admin.users.index', compact('users'));
    }

    public function toggleStatus(User $user)
    {
        if ($user->isSuperAdmin()) {
            return back()->with('error', 'Cannot deactivate a Super Admin.');
        }

        $user->update([
            'is_active' => !$user->is_active
        ]);

        $status = $user->is_active ? 'activated' : 'deactivated';
        return back()->with('status', "User account has been $status.");
    }
}
