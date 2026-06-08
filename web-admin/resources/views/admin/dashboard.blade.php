<x-admin-layout>
    <div class="space-y-8">
        {{-- Status Notifications --}}
        @if(session('status'))
            <div class="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl flex items-center gap-4 shadow-sm">
                <div class="bg-emerald-500 rounded-full p-1 text-white">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <p class="text-emerald-800 font-bold text-sm">{{ session('status') }}</p>
            </div>
        @endif

        {{-- 1. Statistics Cards --}}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-amber-100/50 transition-all duration-300 group">
                <div class="flex items-start justify-between mb-6">
                    <div class="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <span class="bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Awaiting</span>
                </div>
                <h4 class="text-4xl font-black text-slate-900 tracking-tight mb-1">{{ $pendingCount }}</h4>
                <p class="text-slate-400 font-bold text-sm uppercase tracking-wider mb-4">Pending Verifications</p>
                <div class="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span class="text-amber-600 font-black">₱{{ number_format($pendingTotal, 2) }}</span>
                    <svg class="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </div>
            </div>

            <div class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300 group">
                <div class="flex items-start justify-between mb-6">
                    <div class="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <span class="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Revenue</span>
                </div>
                <h4 class="text-4xl font-black text-slate-900 tracking-tight mb-1">{{ $verifiedTodayCount }}</h4>
                <p class="text-slate-400 font-bold text-sm uppercase tracking-wider mb-4">Verified Today</p>
                <div class="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span class="text-emerald-600 font-black">₱{{ number_format($verifiedTodayTotal, 2) }}</span>
                    <svg class="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </div>
            </div>

            <div class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-brand-100/50 transition-all duration-300 group">
                <div class="flex items-start justify-between mb-6">
                    <div class="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300">
                        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                    </div>
                    <span class="bg-brand-100 text-brand-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Licenses</span>
                </div>
                <h4 class="text-4xl font-black text-slate-900 tracking-tight mb-1">{{ $activeLicensesCount }}</h4>
                <p class="text-slate-400 font-bold text-sm uppercase tracking-wider mb-4">Total Active Keys</p>
                <div class="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span class="text-brand-600 font-black">All Devices</span>
                    <svg class="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </div>
            </div>
        </div>

        {{-- 2. Pending Verifications --}}
        <div class="space-y-6">
            <div class="flex items-center justify-between">
                <h3 class="text-xl font-black text-slate-900 uppercase tracking-tight">Pending Requests <span class="ml-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">{{ $pendingCount }}</span></h3>
                <button class="text-brand-600 font-bold text-sm hover:underline">View All Requests</button>
            </div>
            
            @forelse($pendingPayments as $payment)
                <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col lg:flex-row">
                    {{-- Receipt Image Preview --}}
                    <div class="lg:w-64 bg-slate-100 relative group cursor-pointer overflow-hidden" onclick="window.open('{{ Storage::url($payment->receipt_image) }}', '_blank')">
                        @if($payment->receipt_image)
                            <img src="{{ Storage::url($payment->receipt_image) }}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0h-3"></path></svg>
                            </div>
                        @else
                            <div class="w-full h-full flex items-center justify-center text-slate-300">
                                <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            </div>
                        @endif
                    </div>

                    {{-- Data & Actions --}}
                    <div class="flex-1 p-8 grid md:grid-cols-2 gap-8">
                        <div>
                            <div class="flex items-center gap-4 mb-6">
                                <div class="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center font-black text-brand-600 text-lg">
                                    {{ strtoupper(substr($payment->user->name, 0, 1)) }}
                                </div>
                                <div>
                                    <h4 class="font-black text-slate-900 text-lg leading-tight">{{ $payment->user->name }}</h4>
                                    <p class="text-sm text-slate-400 font-bold tracking-tight">{{ $payment->user->email }}</p>
                                </div>
                            </div>
                            <div class="space-y-3">
                                <div class="flex items-center gap-3 text-sm">
                                    <span class="w-24 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Amount:</span>
                                    <span class="font-black text-slate-900">₱{{ number_format($payment->amount, 2) }}</span>
                                </div>
                                <div class="flex items-center gap-3 text-sm">
                                    <span class="w-24 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Reference:</span>
                                    <span class="font-black text-brand-600 tracking-[0.2em]">{{ $payment->reference_number }}</span>
                                </div>
                                <div class="flex items-center gap-3 text-sm">
                                    <span class="w-24 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Submitted:</span>
                                    <span class="font-bold text-slate-600">{{ $payment->created_at->format('M d, Y - h:i A') }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-col justify-between">
                            <div class="flex items-center gap-2 mb-6 lg:justify-end">
                                <div class="flex -space-x-2">
                                    <div class="w-8 h-8 rounded-full border-2 border-white bg-emerald-500 flex items-center justify-center text-[10px] text-white font-black">✓</div>
                                    <div class="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-black">2</div>
                                    <div class="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-black">3</div>
                                </div>
                                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification Steps</span>
                            </div>
                            
                            <div class="flex gap-4">
                                <button type="button" onclick="confirmApprove('{{ $payment->id }}')" class="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-brand-100 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                                    Approve
                                </button>
                                <form id="approve-form-{{ $payment->id }}" action="{{ route('admin.payments.verify', $payment) }}" method="POST" class="hidden">
                                    @csrf
                                </form>
                                <button onclick="openRejectModal('{{ $payment->id }}')" class="flex-1 bg-white border-2 border-slate-100 text-rose-500 font-black py-4 rounded-2xl hover:bg-rose-50 hover:border-rose-100 transition-all flex items-center justify-center gap-2">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            @empty
                <div class="bg-white p-20 text-center rounded-[3rem] border border-dashed border-slate-200">
                    <div class="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg class="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h4 class="text-2xl font-black text-slate-900 tracking-tight mb-2">Zero Pending Tasks</h4>
                    <p class="text-slate-400 font-bold max-w-sm mx-auto">All payments have been verified. You're doing a great job!</p>
                </div>
            @endforelse
        </div>

        {{-- 3. Recent Activity Table --}}
        <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div class="p-8 flex items-center justify-between border-b border-slate-50">
                <h3 class="text-xl font-black text-slate-900 uppercase tracking-tight">Recent Activity</h3>
                <div class="flex items-center gap-2">
                    <span class="w-3 h-3 bg-emerald-500 rounded-full"></span>
                    <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Live Updates</span>
                </div>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-100">
                    <thead class="bg-slate-50/50">
                        <tr>
                            <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer</th>
                            <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Value</th>
                            <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">License Key</th>
                            <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                            <th class="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Processed By</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                        @foreach($recentVerifiedPayments as $payment)
                            <tr class="hover:bg-slate-50 transition-colors group">
                                <td class="px-8 py-5 whitespace-nowrap">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-500">
                                            {{ strtoupper(substr($payment->user->name, 0, 1)) }}
                                        </div>
                                        <div>
                                            <div class="text-sm font-black text-slate-900">{{ $payment->user->name }}</div>
                                            <div class="text-[10px] text-slate-400 font-bold">{{ $payment->user->email }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-8 py-5 whitespace-nowrap font-black text-slate-900 text-sm">₱{{ number_format($payment->amount, 2) }}</td>
                                <td class="px-8 py-5 whitespace-nowrap">
                                    <div class="flex items-center gap-2">
                                        <code class="px-3 py-1 bg-brand-50 text-brand-700 rounded-lg font-black text-xs tracking-widest border border-brand-100">
                                            {{ $payment->license->license_key ?? 'N/A' }}
                                        </code>
                                        <button class="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-brand-600">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                                        </button>
                                    </div>
                                </td>
                                <td class="px-8 py-5 whitespace-nowrap">
                                    <div class="flex flex-col">
                                        <span class="text-emerald-600 font-black text-xs uppercase tracking-widest">Verified</span>
                                        <span class="text-[10px] text-slate-400 font-bold italic">{{ $payment->verified_at ? $payment->verified_at->diffForHumans() : 'N/A' }}</span>
                                    </div>
                                </td>
                                <td class="px-8 py-5 whitespace-nowrap text-right">
                                    <div class="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
                                        <div class="w-4 h-4 bg-slate-400 rounded-full"></div>
                                        <span class="text-[10px] font-black text-slate-600 uppercase tracking-tight">{{ $payment->verifiedBy->name ?? 'System' }}</span>
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            <div class="p-6 bg-slate-50/50 text-center">
                <button class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] hover:text-brand-600 transition-colors">Load More History</button>
            </div>
        </div>
    </div>

    {{-- Reject Modal --}}
    <div id="reject-modal" class="fixed inset-0 z-50 hidden overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-center justify-center min-h-screen p-4">
            <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onclick="closeRejectModal()"></div>
            <div class="relative bg-white rounded-[3rem] shadow-2xl p-12 max-w-lg w-full transform transition-all border border-slate-100">
                <div class="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-8 mx-auto">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </div>
                <h3 class="text-2xl font-black text-slate-900 mb-2 text-center uppercase tracking-tight">Reject Payment</h3>
                <p class="text-slate-400 font-bold text-center text-sm mb-10 leading-relaxed">Please provide a clear reason why this payment is being rejected. This will be shown to the customer.</p>
                
                <form id="reject-form" method="POST">
                    @csrf
                    <div class="mb-10">
                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Rejection Reason</label>
                        <textarea name="rejection_reason" required rows="4" class="block w-full px-5 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:ring-4 focus:ring-rose-100 focus:border-rose-500 transition-all outline-none font-bold text-slate-700 placeholder-slate-300" placeholder="e.g. Reference number does not exist in our GCash records."></textarea>
                    </div>
                    <div class="flex gap-4">
                        <button type="button" onclick="closeRejectModal()" class="flex-1 px-8 py-5 bg-slate-100 hover:bg-slate-200 rounded-3xl font-black text-slate-600 transition-all">Cancel</button>
                        <button type="submit" class="flex-1 px-8 py-5 bg-rose-500 hover:bg-rose-600 text-white rounded-3xl font-black shadow-xl shadow-rose-200 transition-all">Confirm Reject</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    @push('scripts')
    <script>
        function confirmApprove(paymentId) {
            Swal.fire({
                title: 'Verify Payment?',
                text: "This will generate a license key for the customer.",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#16a34a',
                cancelButtonColor: '#f1f5f9',
                confirmButtonText: 'Yes, Approve It!',
                cancelButtonText: 'Cancel',
                customClass: {
                    confirmButton: 'rounded-2xl font-black uppercase tracking-widest px-8 py-4',
                    cancelButton: 'rounded-2xl font-black uppercase tracking-widest px-8 py-4 text-slate-600'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    document.getElementById('approve-form-' + paymentId).submit();
                }
            })
        }

        function openRejectModal(paymentId) {
            const modal = document.getElementById('reject-modal');
            const form = document.getElementById('reject-form');
            form.action = `/admin/payments/${paymentId}/reject`;
            modal.classList.remove('hidden');
        }

        function closeRejectModal() {
            document.getElementById('reject-modal').classList.add('hidden');
        }

        // Show success/error messages with SweetAlert
        @if(session('status'))
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: "{{ session('status') }}",
                confirmButtonColor: '#16a34a',
                customClass: {
                    confirmButton: 'rounded-2xl font-black uppercase tracking-widest px-8 py-4'
                }
            });
        @endif

        @if(session('error'))
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: "{{ session('error') }}",
                confirmButtonColor: '#f43f5e',
                customClass: {
                    confirmButton: 'rounded-2xl font-black uppercase tracking-widest px-8 py-4'
                }
            });
        @endif
    </script>
    @endpush
</x-admin-layout>
