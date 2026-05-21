<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full bg-slate-50">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'Junkshop POS') }} - Customer Portal</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

        <!-- Scripts -->
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
            tailwind.config = {
                theme: {
                    extend: {
                        colors: {
                            brand: {
                                50: '#f0fdf4',
                                100: '#dcfce7',
                                200: '#bbf7d0',
                                300: '#86efac',
                                400: '#4ade80',
                                500: '#22c55e',
                                600: '#16a34a',
                                700: '#15803d',
                                800: '#166534',
                                900: '#14532d',
                            }
                        },
                        fontFamily: {
                            sans: ['Inter', 'sans-serif'],
                        },
                    }
                }
            }
        </script>
        <style>
            [x-cloak] { display: none !important; }
            .sidebar-link-active {
                background: #16a34a;
                color: white;
                box-shadow: 0 10px 15px -3px rgba(22, 163, 74, 0.2);
            }
        </style>
        <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
    </head>
    <body class="font-sans antialiased h-full text-slate-900" x-data="{ sidebarOpen: false }">
        <div class="flex h-full overflow-hidden">
            <!-- Sidebar Desktop -->
            <aside class="hidden lg:flex flex-col w-72 bg-white border-r border-slate-100 shrink-0">
                <div class="h-20 flex items-center px-8 gap-3 border-b border-slate-50">
                    <div class="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-200">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                    </div>
                    <span class="text-xl font-black tracking-tight text-slate-900 uppercase">Junkshop <span class="text-brand-600">POS</span></span>
                </div>

                <nav class="flex-1 p-6 space-y-2 overflow-y-auto">
                    <a href="{{ route('customer.dashboard') }}" class="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 {{ request()->routeIs('customer.dashboard') ? 'sidebar-link-active' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-bold' }}">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                        Dashboard
                    </a>
                    <a href="{{ route('customer.download') }}" class="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 {{ request()->routeIs('customer.download') ? 'sidebar-link-active' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-bold' }}">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Download POS
                    </a>
                    <div class="pt-4 pb-2 px-4">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Support</p>
                    </div>
                    <a href="mailto:{{ \App\Models\Setting::get('support_email', 'support@junkshop.com') }}" class="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-bold transition-all duration-200">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002-2z"></path></svg>
                        Email Support
                    </a>
                </nav>

                <div class="p-6 border-t border-slate-50">
                    <div class="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
                        <div class="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center text-brand-700 font-black">
                            {{ strtoupper(substr(Auth::user()->name, 0, 1)) }}
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-black text-slate-900 truncate">{{ Auth::user()->name }}</p>
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ Auth::user()->role }}</p>
                        </div>
                        <form method="POST" action="{{ route('logout') }}">
                            @csrf
                            <button type="submit" class="text-slate-400 hover:text-rose-500 transition-colors">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                            </button>
                        </form>
                    </div>
                </div>
            </aside>

            <!-- Main Content Area -->
            <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
                <!-- Top Header -->
                <header class="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
                    <button @click="sidebarOpen = true" class="lg:hidden p-2 text-slate-500">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                    
                    <h1 class="text-xl font-black text-slate-900 uppercase tracking-tight">Customer Portal</h1>

                    <div class="flex items-center gap-4">
                        <div class="h-8 w-px bg-slate-100 hidden sm:block"></div>
                        <p class="hidden sm:block text-sm font-bold text-slate-500 italic">{{ now()->format('l, M d, Y') }}</p>
                    </div>
                </header>

                <!-- Page Content -->
                <main class="flex-1 overflow-y-auto p-8">
                    {{ $slot }}
                </main>
            </div>
        </div>

        <!-- Mobile Sidebar Overlay -->
        <div x-show="sidebarOpen" x-cloak class="fixed inset-0 z-50 lg:hidden">
            <div @click="sidebarOpen = false" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"></div>
            <aside x-show="sidebarOpen" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="-translate-x-full" x-transition:enter-end="translate-x-0" class="fixed inset-y-0 left-0 w-72 bg-white flex flex-col">
                <div class="h-20 flex items-center px-8 gap-3 border-b border-slate-50">
                    <div class="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    </div>
                    <span class="text-xl font-black text-slate-900 uppercase">Junkshop POS</span>
                </div>
                <nav class="flex-1 p-6 space-y-2">
                    <a href="{{ route('customer.dashboard') }}" class="flex items-center gap-3 px-4 py-3.5 rounded-2xl {{ request()->routeIs('customer.dashboard') ? 'sidebar-link-active' : 'text-slate-500 font-bold' }}">Dashboard</a>
                    <a href="{{ route('customer.download') }}" class="flex items-center gap-3 px-4 py-3.5 rounded-2xl {{ request()->routeIs('customer.download') ? 'sidebar-link-active' : 'text-slate-500 font-bold' }}">Download POS</a>
                </nav>
            </aside>
        </div>

        @stack('scripts')
    </body>
</html>
