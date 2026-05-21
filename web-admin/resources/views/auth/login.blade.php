<x-guest-layout>
    <!-- Session Status -->
    <x-auth-session-status class="mb-6" :status="session('status')" />

    <form method="POST" action="{{ route('login') }}" class="space-y-6">
        @csrf

        <!-- Email Address -->
        <div>
            <label for="email" class="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
            <input id="email" 
                class="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none" 
                type="email" 
                name="email" 
                :value="old('email')" 
                placeholder="name@company.com"
                required 
                autofocus 
                autocomplete="username" />
            <x-input-error :messages="$errors->get('email')" class="mt-2" />
        </div>

        <!-- Password -->
        <div>
            <div class="flex items-center justify-between mb-2">
                <label for="password" class="block text-sm font-bold text-slate-700">Password</label>
                @if (Route::has('password.request'))
                    <a class="text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors" href="{{ route('password.request') }}">
                        Forgot password?
                    </a>
                @endif
            </div>

            <input id="password" 
                class="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none"
                type="password"
                name="password"
                placeholder="••••••••"
                required 
                autocomplete="current-password" />

            <x-input-error :messages="$errors->get('password')" class="mt-2" />
        </div>

        <!-- Remember Me -->
        <div class="flex items-center">
            <label for="remember_me" class="relative flex items-center cursor-pointer">
                <input id="remember_me" type="checkbox" class="w-5 h-5 rounded-lg border-slate-300 text-brand-600 shadow-sm focus:ring-brand-500 transition-all cursor-pointer" name="remember">
                <span class="ms-3 text-sm font-bold text-slate-600">Keep me signed in</span>
            </label>
        </div>

        <div>
            <button type="submit" class="w-full bg-brand-600 hover:bg-brand-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-100 transition-all hover:-translate-y-1 active:scale-[0.98]">
                Sign In to Dashboard
            </button>
        </div>

        <div class="pt-4 text-center">
            <p class="text-sm font-medium text-slate-500">
                Don't have an account? 
                <a href="{{ route('register') }}" class="font-bold text-brand-600 hover:text-brand-700 transition-colors">Create one now</a>
            </p>
        </div>
    </form>
</x-guest-layout>
