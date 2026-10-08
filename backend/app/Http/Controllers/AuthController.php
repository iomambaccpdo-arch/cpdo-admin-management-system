<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate([
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
            'remember' => ['sometimes', 'boolean'],
        ]);

        $user = User::query()
            ->where('email', $data['login'])
            ->orWhere('username', $data['login'])
            ->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid username or password.',
            ], 422);
        }

        $plain = Str::random(64);
        $remember = (bool) ($data['remember'] ?? false);

        $user->tokens()->create([
            'token' => hash('sha256', $plain),
            'expires_at' => $remember ? now()->addDays(30) : now()->addHours(12),
        ]);

        return response()->json([
            'token' => $plain,
            'user' => $this->payload($user),
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($this->payload($request->user()));
    }

    public function logout(Request $request)
    {
        $token = $request->attributes->get('api_token');
        $token?->delete();

        return response()->json(['message' => 'Signed out.']);
    }

    public function updatePassword(Request $request)
    {
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $user = $request->user();

        if (! Hash::check($data['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect.',
            ], 422);
        }

        $user->password = $data['password'];
        $user->save();

        return response()->json(['message' => 'Password updated.']);
    }

    public function forgot(Request $request)
    {
        $data = $request->validate([
            'login' => ['required', 'string'],
        ]);

        $user = User::query()
            ->where('email', $data['login'])
            ->orWhere('username', $data['login'])
            ->first();

        if (! $user) {
            return response()->json([
                'message' => 'No account matches that username or email.',
            ], 422);
        }

        $temporary = 'cpdo-'.Str::lower(Str::random(6));
        $user->password = $temporary;
        $user->save();

        return response()->json([
            'message' => 'Password reset on this LAN server. Sign in with the temporary password, then change it from Account.',
            'temporary_password' => $temporary,
        ]);
    }

    private function payload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
        ];
    }
}
