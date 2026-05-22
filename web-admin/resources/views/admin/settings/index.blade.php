<x-admin-layout>
    <div class="space-y-8 max-w-5xl mx-auto pb-20">
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

        <form action="{{ route('admin.settings.update') }}" method="POST" enctype="multipart/form-data" class="space-y-8">
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
                        <label class="text-sm font-black text-slate-700 uppercase tracking-wider">Installer Download Link (External Fallback)</label>
                        <input type="text" name="installer_download_link" value="{{ old('installer_download_link', $settings['installer_download_link'] ?? '') }}" 
                            class="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all font-bold text-slate-900"
                            placeholder="https://example.com/downloads/junkshop-pos.exe">
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                            * Note: If you upload any <span class="text-brand-600">.exe</span> file to <span class="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600 italic">storage/app/public/installers/</span>, the system will serve that file directly instead of this link.
                        </p>
                        @error('installer_download_link') <p class="text-rose-500 text-xs font-bold">{{ $message }}</p> @enderror
                    </div>
                </div>
            </div>

            <!-- Landing Page Showcase Settings -->
            <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div class="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                    <h3 class="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                        <svg class="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        Product Showcase (Landing Page)
                    </h3>
                    <button type="button" onclick="addShowcaseItem()" class="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" /></svg>
                        Add New Card
                    </button>
                </div>
                <div class="p-8 space-y-6" id="showcase-container">
                    @php
                        $showcaseItems = json_decode($settings['showcase_items'] ?? '[]', true);
                        if (empty($showcaseItems)) {
                            $showcaseItems = [
                                ['title' => 'Sales / POS Screen', 'desc' => 'Easy transaction with weight-based pricing.'],
                                ['title' => 'Inventory Management', 'desc' => 'Manage junk items with images and pricing.'],
                                ['title' => 'Reports & Analytics', 'desc' => 'Detailed reports to track your business growth.']
                            ];
                        }
                    @endphp

                    @foreach($showcaseItems as $index => $item)
                        <div class="showcase-item grid grid-cols-1 md:grid-cols-12 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                            <button type="button" onclick="this.closest('.showcase-item').remove()" class="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                            <div class="md:col-span-3 space-y-4">
                                <div>
                                    <span class="text-xs font-black text-brand-600 uppercase tracking-[0.2em] mb-1 block">Showcase Card</span>
                                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Display on landing page</p>
                                </div>
                                
                                <!-- Image Preview/Upload -->
                                <div class="space-y-2">
                                    <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Showcase Image</label>
                                    <div class="relative aspect-video bg-white rounded-xl border-2 border-dashed border-slate-200 overflow-hidden group/img flex items-center justify-center">
                                        <div class="preview-container w-full h-full flex items-center justify-center">
                                            @if(isset($item['image_path']))
                                                <img src="{{ asset($item['image_path']) }}" class="w-full h-full object-cover">
                                            @else
                                                <div class="flex flex-col items-center justify-center text-slate-300">
                                                    <svg class="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                    <span class="text-[8px] font-black uppercase">No Image</span>
                                                </div>
                                            @endif
                                        </div>
                                        <div class="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                            <label class="cursor-pointer bg-white text-slate-900 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                                Change
                                                <input type="file" name="showcase_items[{{ $index }}][image]" class="hidden" accept="image/*" onchange="previewImage(this)">
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="md:col-span-9 space-y-4 pr-8">
                                <div class="space-y-1">
                                    <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Title</label>
                                    <input type="text" name="showcase_items[{{ $index }}][title]" value="{{ $item['title'] }}" 
                                        class="w-full bg-white border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-brand-500 transition-all font-bold text-slate-900 text-sm">
                                </div>
                                <div class="space-y-1">
                                    <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</label>
                                    <textarea name="showcase_items[{{ $index }}][desc]" rows="2" 
                                        class="w-full bg-white border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-brand-500 transition-all font-bold text-slate-900 text-sm">{{ $item['desc'] }}</textarea>
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>

            <script>
                function previewImage(input) {
                    const container = input.closest('.showcase-item').querySelector('.preview-container');
                    if (input.files && input.files[0]) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            container.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover">`;
                        }
                        reader.readAsDataURL(input.files[0]);
                    }
                }

                function addShowcaseItem() {
                    const container = document.getElementById('showcase-container');
                    const index = container.querySelectorAll('.showcase-item').length;
                    
                    const html = `
                        <div class="showcase-item grid grid-cols-1 md:grid-cols-12 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 relative group animate-in zoom-in duration-300">
                            <button type="button" onclick="this.closest('.showcase-item').remove()" class="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                            <div class="md:col-span-3 space-y-4">
                                <div>
                                    <span class="text-xs font-black text-brand-600 uppercase tracking-[0.2em] mb-1 block">New Card</span>
                                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Display on landing page</p>
                                </div>
                                
                                <div class="space-y-2">
                                    <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Showcase Image</label>
                                    <div class="relative aspect-video bg-white rounded-xl border-2 border-dashed border-slate-200 overflow-hidden group/img flex items-center justify-center">
                                        <div class="preview-container w-full h-full flex items-center justify-center">
                                            <div class="flex flex-col items-center justify-center text-slate-300">
                                                <svg class="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                <span class="text-[8px] font-black uppercase">No Image</span>
                                            </div>
                                        </div>
                                        <div class="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                            <label class="cursor-pointer bg-white text-slate-900 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                                Upload
                                                <input type="file" name="showcase_items[${index}][image]" class="hidden" accept="image/*" onchange="previewImage(this)">
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="md:col-span-9 space-y-4 pr-8">
                                <div class="space-y-1">
                                    <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Title</label>
                                    <input type="text" name="showcase_items[${index}][title]" placeholder="Enter title..." 
                                        class="w-full bg-white border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-brand-500 transition-all font-bold text-slate-900 text-sm">
                                </div>
                                <div class="space-y-1">
                                    <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</label>
                                    <textarea name="showcase_items[${index}][desc]" rows="2" placeholder="Enter description..."
                                        class="w-full bg-white border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-brand-500 transition-all font-bold text-slate-900 text-sm"></textarea>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    container.insertAdjacentHTML('beforeend', html);
                }
            </script>

            <div class="flex justify-end">
                <button type="submit" class="px-10 py-4 bg-brand-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-brand-700 transition-all shadow-xl shadow-brand-100 active:scale-95">
                    Save Changes
                </button>
            </div>
        </form>
    </div>
</x-admin-layout>
