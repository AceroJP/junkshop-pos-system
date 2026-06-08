<x-admin-layout>
    <div class="space-y-8">
        <div class="flex items-center justify-between">
            <h3 class="text-2xl font-black text-slate-900 uppercase tracking-tight">User Management</h3>
            <div class="flex items-center gap-4">
                <div class="relative">
                    <input type="text" placeholder="Search users..." class="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all">
                    <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-100">
                    <thead class="bg-slate-50/50">
                        <tr>
                            <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">User Details</th>
                            <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Role</th>
                            <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Payments</th>
                            <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Licenses</th>
                            <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                            <th class="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                        @foreach($users as $user)
                            <tr class="hover:bg-slate-50 transition-colors group">
                                <td class="px-8 py-5 whitespace-nowrap">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-500">
                                            {{ strtoupper(substr($user->name, 0, 1)) }}
                                        </div>
                                        <div>
                                            <div class="text-sm font-black text-slate-900">{{ $user->name }}</div>
                                            <div class="text-[10px] text-slate-400 font-bold tracking-tight">{{ $user->email }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-8 py-5 whitespace-nowrap">
                                    <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest {{ $user->isAdmin() ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600' }}">
                                        {{ $user->role }}
                                    </span>
                                </td>
                                <td class="px-8 py-5 whitespace-nowrap text-sm font-bold text-slate-600">
                                    {{ $user->payments_count }}
                                </td>
                                <td class="px-8 py-5 whitespace-nowrap text-sm font-bold text-slate-600">
                                    {{ $user->licenses_count }}
                                </td>
                                <td class="px-8 py-5 whitespace-nowrap">
                                    @if($user->is_active)
                                        <span class="flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                                            <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Active
                                        </span>
                                    @else
                                        <span class="flex items-center gap-1.5 text-rose-500 text-[10px] font-black uppercase tracking-widest">
                                            <span class="w-1.5 h-1.5 bg-rose-500 rounded-full"></span> Suspended
                                        </span>
                                    @endif
                                </td>
                                <td class="px-8 py-5 whitespace-nowrap text-right">
                                    @if(!$user->isSuperAdmin())
                                        <form action="{{ route('admin.users.toggle-status', $user) }}" method="POST" onsubmit="return confirm('Change status for this user?')">
                                            @csrf
                                            <button type="submit" class="p-2 {{ $user->is_active ? 'text-rose-500 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50' }} rounded-xl transition-all" title="{{ $user->is_active ? 'Deactivate User' : 'Activate User' }}">
                                                @if($user->is_active)
                                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                                                    </svg>
                                                @else
                                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                    </svg>
                                                @endif
                                            </button>
                                        </form>
                                    @else
                                        <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Protected</span>
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            <div class="p-8 bg-slate-50/50">
                {{ $users->links() }}
            </div>
        </div>
    </div>
</x-admin-layout>
