<x-guest-layout>
    <form method="POST" action="{{ route('register') }}" class="space-y-5">
        @csrf

        <!-- Name -->
        <div class="relative group">
            <label for="name" class="block text-sm font-bold text-slate-700 mb-2">
                Full Name <span id="name-status" class="text-rose-500">*</span>
            </label>
            <div class="relative">
                <input id="name" 
                    class="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none pr-10" 
                    type="text" 
                    name="name" 
                    value="{{ old('name') }}" 
                    placeholder="Juan Dela Cruz"
                    required 
                    autofocus 
                    autocomplete="name" />
                <div id="name-check" class="hidden absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-brand-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                </div>
            </div>
            <x-input-error :messages="$errors->get('name')" class="mt-2" />
        </div>

        <!-- Email Address -->
        <div class="relative group">
            <label for="email" class="block text-sm font-bold text-slate-700 mb-2">
                Gmail Address <span id="email-status" class="text-rose-500">*</span>
            </label>
            <div class="relative">
                <input id="email" 
                    class="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none pr-10" 
                    type="email" 
                    name="email" 
                    value="{{ old('email') }}" 
                    placeholder="yourname@gmail.com"
                    required 
                    autocomplete="username" />
                <div id="email-check" class="hidden absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-brand-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                </div>
            </div>
            <p id="email-hint" class="mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Only @gmail.com is allowed</p>
            <p id="email-error" class="hidden mt-1 text-xs text-rose-500 font-bold">Please enter a valid @gmail.com address</p>
            <x-input-error :messages="$errors->get('email')" class="mt-2" />
        </div>

        <!-- Contact Number -->
        <div class="relative group">
            <label for="contact_number" class="block text-sm font-bold text-slate-700 mb-2">
                Contact Number <span id="contact_number-status" class="text-rose-500">*</span>
            </label>
            <div class="relative">
                <input id="contact_number" 
                    class="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none pr-10" 
                    type="text" 
                    name="contact_number" 
                    value="{{ old('contact_number') }}" 
                    placeholder="09XXXXXXXXX"
                    maxlength="11"
                    required />
                <div id="contact_number-check" class="hidden absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-brand-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                </div>
            </div>
            <p id="contact-error" class="hidden mt-1 text-xs text-rose-500 font-bold">Must start with 09 and be 11 digits</p>
            <x-input-error :messages="$errors->get('contact_number')" class="mt-2" />
        </div>

        <!-- Password -->
        <div class="relative group">
            <label for="password" class="block text-sm font-bold text-slate-700 mb-2">
                Password <span id="password-status" class="text-rose-500">*</span>
            </label>
            <div class="relative">
                <input id="password" 
                    class="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none pr-10"
                    type="password"
                    name="password"
                    placeholder="Min. 8 characters"
                    required 
                    autocomplete="new-password" />
                <div id="password-check" class="hidden absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-brand-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                </div>
            </div>
            <x-input-error :messages="$errors->get('password')" class="mt-2" />
        </div>

        <!-- Confirm Password -->
        <div class="relative group">
            <label for="password_confirmation" class="block text-sm font-bold text-slate-700 mb-2">
                Confirm Password <span id="password_confirmation-status" class="text-rose-500">*</span>
            </label>
            <div class="relative">
                <input id="password_confirmation" 
                    class="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none pr-10"
                    type="password"
                    name="password_confirmation" 
                    placeholder="Re-type password"
                    required 
                    autocomplete="new-password" />
                <div id="password_confirmation-check" class="hidden absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-brand-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                </div>
            </div>
            <p id="password-match-error" class="hidden mt-1 text-xs text-rose-500 font-bold">Passwords do not match</p>
            <x-input-error :messages="$errors->get('password_confirmation')" class="mt-2" />
        </div>

        <script>
            document.addEventListener('DOMContentLoaded', function() {
                const fields = {
                    name: (val) => val.length >= 2 && val.length <= 100,
                    email: (val) => val.toLowerCase().endsWith('@gmail.com') && val.length > 10,
                    contact_number: (val) => /^09\d{9}$/.test(val),
                    password: (val) => val.length >= 8,
                    password_confirmation: (val) => val === document.getElementById('password').value && val.length >= 8
                };

                // Contact Number: Only allow numbers
                document.getElementById('contact_number').addEventListener('keypress', function(e) {
                    if (e.which < 48 || e.which > 57) e.preventDefault();
                });

                Object.keys(fields).forEach(id => {
                    const input = document.getElementById(id);
                    const check = document.getElementById(id + '-check');
                    const status = document.getElementById(id + '-status');

                    const validate = () => {
                        const val = input.value;
                        const isValid = fields[id](val);

                        // Visual feedback for all fields
                        if (isValid) {
                            check.classList.remove('hidden');
                            status.classList.add('hidden');
                            input.classList.add('border-brand-500');
                            input.classList.remove('border-rose-500', 'border-slate-200');
                        } else {
                            check.classList.add('hidden');
                            status.classList.remove('hidden');
                            input.classList.remove('border-brand-500');
                            if (val.length > 0) {
                                input.classList.add('border-rose-500');
                            }
                        }

                        // Specific error messages
                        if (id === 'email') {
                            const error = document.getElementById('email-error');
                            const hint = document.getElementById('email-hint');
                            if (val.length > 0 && !val.toLowerCase().endsWith('@gmail.com')) {
                                error.classList.remove('hidden');
                                hint.classList.add('hidden');
                            } else {
                                error.classList.add('hidden');
                                hint.classList.remove('hidden');
                            }
                        }

                        if (id === 'contact_number') {
                            const error = document.getElementById('contact-error');
                            if (val.length > 0 && !/^09\d{9}$/.test(val)) {
                                error.classList.remove('hidden');
                            } else {
                                error.classList.add('hidden');
                            }
                        }

                        if (id === 'password_confirmation') {
                            const error = document.getElementById('password-match-error');
                            if (val.length > 0 && val !== document.getElementById('password').value) {
                                error.classList.remove('hidden');
                            } else {
                                error.classList.add('hidden');
                            }
                        }
                    };

                    input.addEventListener('input', validate);
                    if (input.value) validate();
                });

                document.getElementById('password').addEventListener('input', () => {
                    const confirmInput = document.getElementById('password_confirmation');
                    if (confirmInput.value) {
                        const event = new Event('input');
                        confirmInput.dispatchEvent(event);
                    }
                });
            });
        </script>

        <div class="pt-2">
            <button type="submit" class="w-full bg-brand-600 hover:bg-brand-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-100 transition-all hover:-translate-y-1 active:scale-[0.98]">
                Create Customer Account
            </button>
        </div>

        <div class="pt-4 text-center">
            <p class="text-sm font-medium text-slate-500">
                Already registered? 
                <a href="{{ route('login') }}" class="font-bold text-brand-600 hover:text-brand-700 transition-colors">Sign In instead</a>
            </p>
        </div>
    </form>
</x-guest-layout>
