<x-admin-layout>
    <div class="space-y-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h3 class="text-2xl font-black text-slate-900 uppercase tracking-tight">Master License Keys</h3>
                <p class="text-slate-500 font-medium">Generate special keys for internal testing and support.</p>
            </div>
            <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm w-full md:w-auto">
                <form action="{{ route('admin.master-licenses.store') }}" method="POST" class="flex flex-col sm:flex-row items-end gap-4">
                    @csrf
                    <div class="space-y-2 flex-1">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                        <input type="text" name="description" placeholder="e.g. Internal QA Team" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all font-bold">
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expires (Optional)</label>
                        <input type="date" name="expires_at" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all font-bold">
                    </div>
                    <button type="submit" class="px-6 py-3 bg-brand-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg shadow-brand-100 whitespace-nowrap">
                        Generate Key
                    </button>
                </form>
            </div>
        </div>

        @if (session('status'))
            <div class="bg-emerald-50 border border-emerald-100 text-emerald-700 px-6 py-4 rounded-2xl flex items-center justify-between">
                <span class="font-bold">{{ session('status') }}</span>
                <button onclick="navigator.clipboard.writeText('{{ Str::after(session('status'), ': ') }}')" class="text-[10px] font-black uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-lg hover:bg-emerald-200 transition-all">Copy Key</button>
            </div>
        @endif

        <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-100">
                    <thead class="bg-slate-50/50">
                        <tr>
                            <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">License Key</th>
                            <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Description</th>
                            <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Usage</th>
                            <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Expires</th>
                            <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                            <th class="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                        @foreach($licenses as $license)
                            <tr class="hover:bg-slate-50 transition-colors group">
                                <td class="px-8 py-5 whitespace-nowrap">
                                    <div class="flex items-center gap-3">
                                        <span class="font-black text-rose-600 tracking-widest text-sm select-all">{{ $license->license_key }}</span>
                                        <button onclick="navigator.clipboard.writeText('{{ $license->license_key }}')" class="text-slate-400 hover:text-brand-600 transition-all" title="Copy Key">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                                        </button>
                                    </div>
                                </td>
                                <td class="px-8 py-5 whitespace-nowrap">
                                    <div class="text-sm font-black text-slate-900">{{ $license->description ?: 'No description' }}</div>
                                    <div class="text-[10px] text-slate-400 font-bold tracking-tight">Created by {{ $license->creator->name }}</div>
                                </td>
                                <td class="px-8 py-5 whitespace-nowrap">
                                    <div class="text-xs font-bold text-slate-600">{{ $license->used_count }} Uses</div>
                                    <div class="text-[10px] text-slate-400 font-bold tracking-tight">Last used: {{ $license->last_used_at ? $license->last_used_at->diffForHumans() : 'Never' }}</div>
                                </td>
                                <td class="px-8 py-5 whitespace-nowrap">
                                    @if($license->expires_at)
                                        <span class="text-xs font-bold {{ $license->expires_at->isPast() ? 'text-rose-500' : 'text-slate-500' }}">
                                            {{ $license->expires_at->format('M d, Y') }}
                                        </span>
                                    @else
                                        <span class="text-[10px] text-slate-300 font-black uppercase tracking-widest">Never</span>
                                    @endif
                                </td>
                                <td class="px-8 py-5 whitespace-nowrap">
                                    <form action="{{ route('admin.master-licenses.toggle', $license) }}" method="POST">
                                        @csrf
                                        <button type="submit" class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all
                                            {{ $license->is_active ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200' }}">
                                            {{ $license->is_active ? 'Active' : 'Inactive' }}
                                        </button>
                                    </form>
                                </td>
                                <td class="px-8 py-5 whitespace-nowrap text-right">
                                    <form action="{{ route('admin.master-licenses.destroy', $license) }}" method="POST" onsubmit="return confirm('Delete this master key?')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="p-2 text-slate-300 hover:text-rose-500 transition-all">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            <div class="p-8 bg-slate-50/50">
                {{ $licenses->links() }}
            </div>
        </div>
    </div>
</x-admin-layout>
