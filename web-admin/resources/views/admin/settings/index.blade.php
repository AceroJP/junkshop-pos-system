<x-admin-layout>
    <div class="max-w-4xl space-y-8">
        <!-- Header -->
        <div>
            <h2 class="text-3xl font-black text-slate-900 uppercase tracking-tight">System Settings</h2>
            <p class="text-slate-500 font-medium">Configure global parameters and payment information.</p>
        </div>

        @if (session('status'))
            <div class="bg-brand-50 border border-brand-200 text-brand-700 px-6 py-4 rounded-2xl font-bold flex items-center gap-3">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                {{ session('status') }}
            </div>
        @endif

        <form action="{{ route('admin.settings.update') }}" method="POST" class="space-y-6">
            @csrf
            
            <!-- Payment Settings -->
            <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div class="px-8 py-6 border-b border-slate-50 bg-slate-50/50">
                    <h3 class="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                        <svg class="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        Payment Configuration
                    </h3>
                </div>
                <div class="p-8 space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="text-sm font-black text-slate-700 uppercase tracking-wider">GCash Number</label>
                            <input type="text" name="gcash_number" value="{{ old('gcash_number', $settings['gcash_number'] ?? '') }}" 
                                class="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all font-bold text-slate-900"
                                placeholder="09123456789">
                            @error('gcash_number') <p class="text-rose-500 text-xs font-bold">{{ $message }}</p> @enderror
                        </div>
                        <div class="space-y-2">
                            <label class="text-sm font-black text-slate-700 uppercase tracking-wider">License Price (₱)</label>
                            <input type="number" step="0.01" name="license_price" value="{{ old('license_price', $settings['license_price'] ?? '') }}" 
                                class="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all font-bold text-slate-900"
                                placeholder="1500.00">
                            @error('license_price') <p class="text-rose-500 text-xs font-bold">{{ $message }}</p> @enderror
                        </div>
                        <div class="space-y-2">
                            <label class="text-sm font-black text-slate-700 uppercase tracking-wider">License Key Prefix</label>
                            <input type="text" name="license_prefix" value="{{ old('license_prefix', $settings['license_prefix'] ?? '') }}" 
                                class="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all font-bold text-slate-900"
                                placeholder="JUNK">
                            @error('license_prefix') <p class="text-rose-500 text-xs font-bold">{{ $message }}</p> @enderror
                        </div>
                    </div>
                </div>
            </div>

            <!-- Application Settings -->
            <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div class="px-8 py-6 border-b border-slate-50 bg-slate-50/50">
                    <h3 class="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                        <svg class="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        System Info
                    </h3>
                </div>
                <div class="p-8 space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="text-sm font-black text-slate-700 uppercase tracking-wider">Support Email</label>
                            <input type="email" name="support_email" value="{{ old('support_email', $settings['support_email'] ?? '') }}" 
                                class="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all font-bold text-slate-900"
                                placeholder="support@junkshop.com">
                            @error('support_email') <p class="text-rose-500 text-xs font-bold">{{ $message }}</p> @enderror
                        </div>
                        <div class="space-y-2">
                            <label class="text-sm font-black text-slate-700 uppercase tracking-wider">App Version</label>
                            <input type="text" name="app_version" value="{{ old('app_version', $settings['app_version'] ?? '') }}" 
                                class="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all font-bold text-slate-900"
                                placeholder="v1.0.0">
                            @error('app_version') <p class="text-rose-500 text-xs font-bold">{{ $message }}</p> @enderror
                        </div>
                    </div>
                    <div class="space-y-2">
                        <label class="text-sm font-black text-slate-700 uppercase tracking-wider">Installer Download Link (Direct Link to .exe)</label>
                        <input type="text" name="installer_download_link" value="{{ old('installer_download_link', $settings['installer_download_link'] ?? '') }}" 
                            class="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all font-bold text-slate-900"
                            placeholder="https://example.com/downloads/junkshop-pos.exe">
                        @error('installer_download_link') <p class="text-rose-500 text-xs font-bold">{{ $message }}</p> @enderror
                    </div>
                </div>
            </div>

            <div class="flex justify-end">
                <button type="submit" class="px-10 py-4 bg-brand-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-brand-700 transition-all shadow-xl shadow-brand-100 active:scale-95">
                    Save Changes
                </button>
            </div>
        </form>
    </div>
</x-admin-layout>
