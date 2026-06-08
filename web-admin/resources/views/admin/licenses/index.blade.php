<x-admin-layout>
    <div class="space-y-8">
        <div class="flex items-center justify-between">
            <h3 class="text-2xl font-black text-slate-900 uppercase tracking-tight">License Keys</h3>
            <div class="flex items-center gap-4">
                <div class="relative">
                    <input type="text" placeholder="Search keys..." class="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all">
                    <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-100">
                    <thead class="bg-slate-50/50">
                        <tr>
                            <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">License Key</th>
                            <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Owner</th>
                            <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hardware ID</th>
                            <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Issued</th>
                            <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                            <th class="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                        @foreach($licenses as $license)
                            <tr class="hover:bg-slate-50 transition-colors group">
                                <td class="px-8 py-5 whitespace-nowrap font-black text-brand-600 tracking-widest text-sm">
                                    {{ $license->license_key }}
                                </td>
                                <td class="px-8 py-5 whitespace-nowrap">
                                    <div class="text-sm font-black text-slate-900">{{ $license->user->name }}</div>
                                    <div class="text-[10px] text-slate-400 font-bold tracking-tight">{{ $license->user->email }}</div>
                                </td>
                                <td class="px-8 py-5 whitespace-nowrap">
                                    @if($license->device)
                                        <span class="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{{ $license->device->device_id }}</span>
                                    @else
                                        <span class="text-[10px] text-slate-300 font-black uppercase tracking-widest italic">Not Activated</span>
                                    @endif
                                </td>
                                <td class="px-8 py-5 whitespace-nowrap text-sm font-bold text-slate-500">
                                    {{ $license->created_at->format('M d, Y') }}
                                </td>
                                <td class="px-8 py-5 whitespace-nowrap">
                                    @if($license->status === 'active')
                                        <span class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200">Active</span>
                                    @elseif($license->status === 'inactive')
                                        <span class="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200">Inactive</span>
                                    @else
                                        <span class="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-200">{{ $license->status }}</span>
                                    @endif
                                </td>
                                <td class="px-8 py-5 whitespace-nowrap text-right">
                                    @if($license->status !== 'revoked')
                                        <form action="{{ route('admin.licenses.revoke', $license) }}" method="POST" onsubmit="return confirm('Revoke this license key? This action is permanent.')">
                                            @csrf
                                            <button type="submit" class="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all" title="Revoke License">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                                                </svg>
                                            </button>
                                        </form>
                                    @else
                                        <span class="text-[10px] font-black text-rose-300 uppercase tracking-widest italic">Revoked</span>
                                    @endif
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
