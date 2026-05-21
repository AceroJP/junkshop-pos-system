<x-customer-layout>
    <div class="space-y-8">
        <!-- Header Section -->
        <div>
            <h2 class="text-3xl font-black text-slate-900 uppercase tracking-tight">Welcome back, {{ Auth::user()->name }}!</h2>
            <p class="text-slate-500 font-medium tracking-tight">Manage your POS license and track your business growth from here.</p>
        </div>

        @if(session('status'))
            <div class="bg-brand-50 border border-brand-200 text-brand-700 px-6 py-4 rounded-2xl font-bold flex items-center gap-3 animate-fade-in">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                {{ session('status') }}
            </div>
        @endif

        {{-- Rejection Alert --}}
        @if($latestRejectedPayment)
            <div class="bg-rose-50 border-2 border-rose-200 text-rose-800 px-8 py-6 rounded-[2rem] shadow-sm animate-fade-in">
                <div class="flex items-start gap-4">
                    <div class="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 shrink-0">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </div>
                    <div>
                        <h4 class="text-lg font-black uppercase tracking-tight mb-1">Payment Rejected</h4>
                        <p class="font-bold text-rose-700 mb-2">Reason: <span class="text-rose-900 italic">"{{ $latestRejectedPayment->rejection_reason }}"</span></p>
                        <p class="text-sm font-medium text-rose-600/80">Please check the details and try submitting again. If you believe this is an error, please contact support.</p>
                    </div>
                </div>
            </div>
        @endif

        {{-- 1. Active License Section --}}
        @if($activeLicense)
            <div class="bg-white overflow-hidden shadow-sm rounded-[2.5rem] border-2 {{ $activeLicense->status === 'active' ? 'border-brand-500' : 'border-amber-400' }} relative">
                <div class="absolute top-0 right-0 px-6 py-2 {{ $activeLicense->status === 'active' ? 'bg-brand-500' : 'bg-amber-400' }} text-white text-[10px] font-black uppercase tracking-widest rounded-bl-2xl">
                    {{ $activeLicense->status === 'active' ? 'Active License' : 'Pending Activation' }}
                </div>
                <div class="p-10">
                    <div class="flex items-center justify-between flex-wrap gap-8">
                        <div class="space-y-4">
                            <div>
                                <h3 class="text-2xl font-black text-slate-900 tracking-tight uppercase">Desktop POS License</h3>
                                <p class="text-slate-500 font-medium">
                                    @if($activeLicense->status === 'active')
                                        Activated on {{ $activeLicense->activated_at ? $activeLicense->activated_at->format('M d, Y') : 'Unknown' }}
                                    @else
                                        Issued on {{ $activeLicense->created_at->format('M d, Y') }} — Ready for activation
                                    @endif
                                </p>
                            </div>
                            <div class="bg-brand-50 border border-brand-100 px-6 py-4 rounded-2xl flex items-center gap-4 group">
                                <span id="license-key" class="text-2xl font-black text-brand-700 tracking-[0.2em]">{{ $activeLicense->license_key }}</span>
                                <button onclick="copyLicense()" class="p-2.5 bg-white text-brand-600 rounded-xl shadow-sm border border-brand-100 hover:scale-110 transition-all active:scale-95" title="Copy Key">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                                </button>
                            </div>
                            @if($activeLicense->status === 'inactive')
                                <p class="text-xs font-bold text-amber-600 italic">* Use this key in the desktop app to activate your system.</p>
                            @endif
                        </div>
                        <div class="flex flex-col gap-3">
                            <a href="{{ route('customer.download') }}" class="inline-flex items-center justify-center gap-3 bg-brand-600 hover:bg-brand-700 text-white font-black px-10 py-5 rounded-2xl shadow-xl shadow-brand-100 transition-all hover:-translate-y-1">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                Download Installer
                            </a>
                            <p class="text-[10px] text-center text-slate-400 font-black uppercase tracking-widest">Windows 10/11 Required</p>
                        </div>
                    </div>
                </div>
            </div>
        @endif

        {{-- 2. Pending Payment Section --}}
        @if($pendingPayment)
            <div class="bg-amber-50 border-2 border-amber-200 rounded-[2.5rem] overflow-hidden shadow-sm relative animate-pulse-slow">
                <div class="p-10">
                    <div class="flex items-center justify-between flex-wrap gap-8">
                        <div class="flex items-center gap-8">
                            <div class="w-20 h-20 bg-amber-100 rounded-[2rem] flex items-center justify-center text-amber-600 shadow-inner">
                                <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <div class="space-y-1">
                                <h3 class="text-2xl font-black text-amber-900 uppercase tracking-tight">Awaiting Verification</h3>
                                <p class="text-amber-700 font-medium">Submitted on {{ $pendingPayment->created_at->format('M d, Y h:i A') }}</p>
                                <div class="inline-flex items-center gap-2 px-3 py-1 bg-white/50 rounded-lg text-xs font-bold text-amber-800 border border-amber-200 mt-2">
                                    Ref: {{ $pendingPayment->reference_number }}
                                </div>
                            </div>
                        </div>
                        <form action="{{ route('customer.cancel-payment', $pendingPayment) }}" method="POST" onsubmit="return confirm('Cancel this payment request?')">
                            @csrf
                            <button type="submit" class="bg-white border-2 border-amber-200 text-amber-700 font-black px-8 py-4 rounded-2xl hover:bg-amber-100 transition-all active:scale-95 shadow-sm">
                                Cancel Request
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        @endif

        {{-- 3. Payment Flow / No License --}}
        @if(!$activeLicense && !$pendingPayment)
            <div class="grid lg:grid-cols-5 gap-8">
                <!-- Payment Instructions -->
                <div class="lg:col-span-2 space-y-6">
                    <div class="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden h-full">
                        <div class="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <h3 class="text-2xl font-black mb-10 tracking-tight uppercase">Payment Guide</h3>
                        
                        <div class="space-y-10">
                            <div class="flex gap-6">
                                <div class="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-brand-900/50">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                                <div>
                                    <p class="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-1">Lifetime License</p>
                                    <p class="text-3xl font-black">₱{{ number_format($settings['license_price'], 2) }}</p>
                                </div>
                            </div>

                            <div class="flex gap-6">
                                <div class="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-900/50">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                                </div>
                                <div>
                                    <p class="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-1">GCash Account</p>
                                    <p class="text-3xl font-black tracking-widest text-emerald-400">{{ $settings['gcash_number'] }}</p>
                                    <p class="text-[10px] text-slate-500 font-black mt-3 uppercase tracking-widest leading-relaxed">Include your email in the GCash message</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Submission Form -->
                <div class="lg:col-span-3">
                    <div class="bg-white p-10 lg:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 h-full">
                        <div class="flex items-center justify-between mb-8">
                            <h3 class="text-2xl font-black text-slate-900 tracking-tight uppercase">Submit Proof of Payment</h3>
                            <div class="px-4 py-2 bg-brand-50 rounded-xl text-brand-700 text-[10px] font-black uppercase tracking-widest border border-brand-100">
                                Step 2: Verification
                            </div>
                        </div>

                        <!-- Submission Guide -->
                        <div class="mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                            <h4 class="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <svg class="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                Quick Submission Guide
                            </h4>
                            <ul class="space-y-3">
                                <li class="flex items-start gap-3 text-xs font-bold text-slate-600">
                                    <span class="w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center shrink-0 text-[10px]">1</span>
                                    Enter the 11-digit GCash number used for the payment.
                                </li>
                                <li class="flex items-start gap-3 text-xs font-bold text-slate-600">
                                    <span class="w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center shrink-0 text-[10px]">2</span>
                                    Upload a clear screenshot of your GCash successful transaction receipt.
                                </li>
                                <li class="flex items-start gap-3 text-xs font-bold text-slate-600">
                                    <span class="w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center shrink-0 text-[10px]">3</span>
                                    Wait for our admin to verify your payment (usually within 1-2 hours).
                                </li>
                            </ul>
                        </div>

                        <form action="{{ route('customer.submit-payment') }}" method="POST" enctype="multipart/form-data" class="space-y-8">
                            @csrf
                            <div class="space-y-3">
                                <div class="flex items-center justify-between">
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">GCash Number (Used to pay)</label>
                                    <span class="text-[10px] font-bold text-slate-400">Example: 09123456789</span>
                                </div>
                                <input type="text" name="reference_number" required maxlength="11"
                                    class="block w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none font-bold text-lg @error('reference_number') border-rose-500 @enderror" 
                                    placeholder="09XXXXXXXXX"
                                    value="{{ old('reference_number') }}">
                                @error('reference_number') <p class="text-xs text-rose-500 font-bold">{{ $message }}</p> @enderror
                            </div>

                            <div class="space-y-3">
                                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction Receipt Screenshot</label>
                                <div class="relative group">
                                    <input type="file" name="receipt_image" id="receipt_image" accept="image/*" required 
                                        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        onchange="previewImage(this)">
                                    <div id="upload-placeholder" class="w-full py-8 px-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 group-hover:border-brand-400 group-hover:bg-brand-50 transition-all">
                                        <svg class="w-10 h-10 text-slate-300 group-hover:text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        <p class="text-sm font-black text-slate-500 group-hover:text-brand-700">Click to upload receipt</p>
                                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">PNG, JPG up to 2MB</p>
                                    </div>
                                    <div id="image-preview" class="hidden w-full rounded-2xl overflow-hidden border-2 border-brand-500 relative aspect-video bg-slate-100 shadow-inner group animate-fade-in transition-all duration-300">
                                        <img src="" class="w-full h-full object-contain">
                                        <div class="absolute inset-0 bg-brand-900/10 pointer-events-none"></div>
                                        <div class="absolute top-4 left-4 px-3 py-1.5 bg-brand-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2 shadow-lg animate-bounce-short">
                                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                                            Image Attached
                                        </div>
                                        <button type="button" onclick="clearPreview()" class="absolute top-4 right-4 p-2 bg-rose-500 text-white rounded-xl shadow-lg hover:bg-rose-600 transition-colors z-20 hover:scale-110 active:scale-95">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    </div>
                                </div>
                                @error('receipt_image') <p class="text-xs text-rose-500 font-bold">{{ $message }}</p> @enderror
                            </div>

                            <button type="submit" class="w-full bg-brand-600 hover:bg-brand-700 text-white font-black py-6 rounded-2xl shadow-xl shadow-brand-100 transition-all hover:-translate-y-1 active:scale-95 text-lg uppercase tracking-widest">
                                Submit for Verification
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        @endif

        {{-- 4. Payment History --}}
        <div class="bg-white overflow-hidden shadow-sm rounded-[2.5rem] border border-slate-100">
            <div class="p-10">
                <div class="flex items-center justify-between mb-8">
                    <h3 class="text-xl font-black text-slate-900 uppercase tracking-tight">Payment History</h3>
                    <div class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-slate-100">
                        <thead>
                            <tr>
                                <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference</th>
                                <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th class="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Receipt</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50">
                            @forelse($paymentHistory as $payment)
                                <tr class="hover:bg-slate-50 transition-colors">
                                    <td class="px-6 py-5 whitespace-nowrap text-sm font-bold text-slate-600">{{ $payment->created_at->format('M d, Y') }}</td>
                                    <td class="px-6 py-5 whitespace-nowrap text-sm font-black text-slate-900">₱{{ number_format($payment->amount, 2) }}</td>
                                    <td class="px-6 py-5 whitespace-nowrap text-sm font-medium text-slate-500 uppercase">{{ $payment->reference_number }}</td>
                                    <td class="px-6 py-5 whitespace-nowrap">
                                        @if($payment->status === 'pending')
                                            <span class="px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full bg-amber-100 text-amber-700 border border-amber-200">Pending</span>
                                        @elseif($payment->status === 'verified')
                                            <span class="px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">Verified</span>
                                        @else
                                            <span class="px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full bg-rose-100 text-rose-700 border border-rose-200">Rejected</span>
                                        @endif
                                    </td>
                                    <td class="px-6 py-5 whitespace-nowrap text-right text-sm">
                                        @if($payment->receipt_image)
                                            <a href="{{ Storage::url($payment->receipt_image) }}" target="_blank" class="text-brand-600 font-black hover:text-brand-800 transition-colors underline underline-offset-4 decoration-2 decoration-brand-200">View Receipt</a>
                                        @else
                                            <span class="text-slate-300 font-bold">--</span>
                                        @endif
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" class="px-6 py-16 text-center">
                                        <div class="flex flex-col items-center gap-3">
                                            <svg class="w-12 h-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                            <p class="text-slate-400 font-bold italic">No payment records found.</p>
                                        </div>
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    @push('scripts')
        <script>
            function copyLicense() {
                const key = document.getElementById('license-key');
                if (!key) return;
                
                navigator.clipboard.writeText(key.innerText).then(() => {
                    alert('License key copied to clipboard!');
                });
            }

            function previewImage(input) {
                const placeholder = document.getElementById('upload-placeholder');
                const previewContainer = document.getElementById('image-preview');
                const previewImg = previewContainer ? previewContainer.querySelector('img') : null;

                if (input.files && input.files[0] && previewImg) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        previewImg.src = e.target.result;
                        placeholder.classList.add('hidden');
                        previewContainer.classList.remove('hidden');
                    }
                    reader.readAsDataURL(input.files[0]);
                }
            }

            function clearPreview() {
                const input = document.getElementById('receipt_image');
                const placeholder = document.getElementById('upload-placeholder');
                const previewContainer = document.getElementById('image-preview');
                
                if (input) input.value = '';
                if (placeholder) placeholder.classList.remove('hidden');
                if (previewContainer) previewContainer.classList.add('hidden');
            }
        </script>
    @endpush
</x-customer-layout>
