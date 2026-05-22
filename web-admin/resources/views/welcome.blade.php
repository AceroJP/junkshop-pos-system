<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Junkshop POS System | Smart Offline POS for Recycling Businesses</title>
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="{{ asset('assets/logo.png') }}?v={{ time() }}">
    <link rel="apple-touch-icon" href="{{ asset('assets/logo.png') }}?v={{ time() }}">

    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
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
        .glass-card {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .hero-gradient {
            background: radial-gradient(circle at 50% 50%, #f0fdf4 0%, #ffffff 100%);
        }
    </style>
</head>
<body class="bg-white text-slate-900 font-sans antialiased selection:bg-brand-500 selection:text-white" 
    :class="{ 'overflow-hidden': showModal }"
    x-data="{ 
    showModal: false, 
    modalImage: '', 
    modalTitle: '',
    openImage(src, title) {
        this.modalImage = src;
        this.modalTitle = title;
        this.showModal = true;
    }
}">

    <!-- NAVIGATION -->
    <nav class="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16 md:h-20">
                <div class="flex items-center gap-2">
                    <div class="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-brand-100 overflow-hidden border border-slate-100">
                        <img src="{{ asset('assets/logo.png') }}" class="w-full h-full object-contain p-1" alt="Junkshop POS Logo">
                    </div>
                    <span class="text-lg md:text-xl font-extrabold tracking-tight text-slate-900">JUNKSHOP <span class="text-brand-600">POS</span></span>
                </div>
                
                <!-- Desktop Menu -->
                <div class="hidden lg:flex items-center gap-8">
                    <a href="#features" class="text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors">Features</a>
                    <a href="#how-it-works" class="text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors">How it Works</a>
                    <a href="#pricing" class="text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors">Pricing</a>
                    <a href="#screenshots" class="text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors">Screenshots</a>
                </div>

                <div class="flex items-center gap-2 md:gap-4">
                    @auth
                        <a href="{{ url('/dashboard') }}" class="text-xs md:text-sm font-bold text-slate-700 hover:text-brand-600 px-2 md:px-4 py-2 transition-all">Dashboard</a>
                    @else
                        <a href="{{ route('login') }}" class="text-xs md:text-sm font-bold text-slate-700 hover:text-brand-600 px-2 md:px-4 py-2 transition-all">Login</a>
                        <a href="{{ route('register') }}" class="bg-brand-600 hover:bg-brand-700 text-white text-[10px] md:text-sm font-bold px-4 md:px-6 py-2 md:py-3 rounded-full shadow-lg shadow-brand-200 transition-all">Get License</a>
                    @endauth
                    
                    <!-- Mobile Menu Button -->
                    <button id="mobile-menu-button" class="lg:hidden p-2 text-slate-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- Mobile Menu -->
        <div id="mobile-menu" class="hidden lg:hidden bg-white border-b border-slate-100 px-4 py-6 space-y-4 shadow-xl">
            <a href="#features" class="block text-base font-bold text-slate-600 hover:text-brand-600">Features</a>
            <a href="#how-it-works" class="block text-base font-bold text-slate-600 hover:text-brand-600">How it Works</a>
            <a href="#pricing" class="block text-base font-bold text-slate-600 hover:text-brand-600">Pricing</a>
            <a href="#screenshots" class="block text-base font-bold text-slate-600 hover:text-brand-600">Screenshots</a>
        </div>
    </nav>

    <script>
        const btn = document.getElementById('mobile-menu-button');
        const menu = document.getElementById('mobile-menu');
        
        btn.addEventListener('click', () => {
            menu.classList.toggle('hidden');
        });

        // Close menu when clicking a link
        document.querySelectorAll('#mobile-menu a').forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.add('hidden');
            });
        });
    </script>

    <!-- HERO SECTION -->
    <section class="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden hero-gradient">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid lg:grid-cols-2 gap-16 items-center">
                <div class="relative z-10">
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-bold mb-6 border border-brand-200">
                        <span class="relative flex h-2 w-2">
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                        </span>
                        OFFLINE-FIRST POS FOR JUNKSHOPS
                    </div>
                    <h1 class="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-8 tracking-tight">
                        Junkshop <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-emerald-500">POS System</span>
                    </h1>
                    <p class="text-xl text-slate-600 mb-10 leading-relaxed max-w-xl">
                        Smart Offline POS System for Junkshops & Recycling Businesses. Manage your operations without internet, built for reliability and speed.
                    </p>
                    <div class="flex flex-wrap gap-4 mb-12">
                        @guest
                            <a href="{{ route('register') }}" class="bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-brand-200 transition-all hover:-translate-y-1">Get License Now</a>
                        @else
                            <a href="{{ url('/dashboard') }}" class="bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-brand-200 transition-all hover:-translate-y-1">Go to Dashboard</a>
                        @endguest
                        <a href="#" class="bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all">Download Demo</a>
                    </div>
                    <div class="grid grid-cols-3 gap-6">
                        <div class="flex items-center gap-2 text-sm font-bold text-slate-500">
                            <svg class="w-5 h-5 text-brand-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                            Offline First
                        </div>
                        <div class="flex items-center gap-2 text-sm font-bold text-slate-500">
                            <svg class="w-5 h-5 text-brand-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                            Secure System
                        </div>
                        <div class="flex items-center gap-2 text-sm font-bold text-slate-500">
                            <svg class="w-5 h-5 text-brand-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                            One-time Payment
                        </div>
                    </div>
                </div>
                <div class="relative">
                    <div class="absolute -top-20 -right-20 w-96 h-96 bg-brand-100 rounded-full blur-3xl opacity-50"></div>
                    <div class="relative z-10 glass-card p-4 rounded-[2.5rem] shadow-2xl border border-white/50">
                        <div class="bg-slate-900 rounded-[2rem] overflow-hidden aspect-[4/3] shadow-inner flex items-center justify-center p-8">
                            <!-- Dashboard Mockup -->
                            <div class="w-full h-full bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
                                <div class="h-8 bg-slate-900 flex items-center px-4 gap-2">
                                    <div class="w-2 h-2 rounded-full bg-rose-500"></div>
                                    <div class="w-2 h-2 rounded-full bg-amber-500"></div>
                                    <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                                </div>
                                <div class="flex-1 p-6">
                                    <div class="grid grid-cols-3 gap-4 mb-6">
                                        <div class="h-20 bg-slate-700/50 rounded-lg p-3">
                                            <div class="w-8 h-2 bg-brand-500/50 rounded mb-2"></div>
                                            <div class="w-16 h-4 bg-white/10 rounded"></div>
                                        </div>
                                        <div class="h-20 bg-slate-700/50 rounded-lg p-3">
                                            <div class="w-8 h-2 bg-brand-500/50 rounded mb-2"></div>
                                            <div class="w-16 h-4 bg-white/10 rounded"></div>
                                        </div>
                                        <div class="h-20 bg-slate-700/50 rounded-lg p-3">
                                            <div class="w-8 h-2 bg-brand-500/50 rounded mb-2"></div>
                                            <div class="w-16 h-4 bg-white/10 rounded"></div>
                                        </div>
                                    </div>
                                    <div class="h-32 bg-slate-700/50 rounded-lg mb-4"></div>
                                    <div class="flex gap-4">
                                        <div class="flex-1 h-20 bg-slate-700/50 rounded-lg"></div>
                                        <div class="w-24 h-20 bg-brand-600 rounded-lg"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Printer Mockup Overlay -->
                        <div class="absolute -bottom-10 -left-10 w-48 h-48 bg-white rounded-3xl shadow-2xl p-4 flex flex-col items-center justify-center border border-slate-100 animate-bounce-slow">
                            <svg class="w-16 h-16 text-slate-800 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                            <span class="text-[10px] font-black text-slate-400 tracking-widest uppercase">Thermal Printing</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- FEATURES SECTION -->
    <section id="features" class="py-24 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-20">
                <h2 class="text-brand-600 font-extrabold text-sm tracking-[0.2em] uppercase mb-4">Powerful Features</h2>
                <p class="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">Everything You Need in One System</p>
            </div>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <!-- Feature 1 -->
                <div class="group p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-brand-100 transition-all duration-300">
                    <div class="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-600 transition-colors duration-300">
                        <svg class="w-8 h-8 text-brand-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    </div>
                    <h3 class="text-xl font-extrabold text-slate-900 mb-4 tracking-tight">Offline POS System</h3>
                    <p class="text-slate-600 leading-relaxed font-medium">Works perfectly without internet after activation. Fast, reliable, and always ready for business.</p>
                </div>
                <!-- Feature 2 -->
                <div class="group p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-brand-100 transition-all duration-300">
                    <div class="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-600 transition-colors duration-300">
                        <svg class="w-8 h-8 text-brand-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                    </div>
                    <h3 class="text-xl font-extrabold text-slate-900 mb-4 tracking-tight">Inventory Management</h3>
                    <p class="text-slate-600 leading-relaxed font-medium">Manage junk items, weights, and real-time pricing per kg with ease and precision.</p>
                </div>
                <!-- Feature 3 -->
                <div class="group p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-brand-100 transition-all duration-300">
                    <div class="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-600 transition-colors duration-300">
                        <svg class="w-8 h-8 text-brand-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                    </div>
                    <h3 class="text-xl font-extrabold text-slate-900 mb-4 tracking-tight">Thermal Receipt Printing</h3>
                    <p class="text-slate-600 leading-relaxed font-medium">Native support for ESC/POS thermal printers. Fast checkout and clean professional receipts.</p>
                </div>
                <!-- Feature 4 -->
                <div class="group p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-brand-100 transition-all duration-300">
                    <div class="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-600 transition-colors duration-300">
                        <svg class="w-8 h-8 text-brand-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                    <h3 class="text-xl font-extrabold text-slate-900 mb-4 tracking-tight">Secure Login System</h3>
                    <p class="text-slate-600 leading-relaxed font-medium">Role-based access for admins and cashiers. Secure local authentication to protect your data.</p>
                </div>
                <!-- Feature 5 -->
                <div class="group p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-brand-100 transition-all duration-300">
                    <div class="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-600 transition-colors duration-300">
                        <svg class="w-8 h-8 text-brand-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                    </div>
                    <h3 class="text-xl font-extrabold text-slate-900 mb-4 tracking-tight">License Activation System</h3>
                    <p class="text-slate-600 leading-relaxed font-medium">One-time activation per PC using secure hardware fingerprinting for license control.</p>
                </div>
                <!-- Feature 6 -->
                <div class="group p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-brand-100 transition-all duration-300">
                    <div class="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-600 transition-colors duration-300">
                        <svg class="w-8 h-8 text-brand-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <h3 class="text-xl font-extrabold text-slate-900 mb-4 tracking-tight">One-time Purchase</h3>
                    <p class="text-slate-600 leading-relaxed font-medium">No monthly fees. Pay once and use the software forever for your business operations.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- HOW IT WORKS SECTION -->
    <section id="how-it-works" class="py-24 bg-slate-50 overflow-hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-24">
                <h2 class="text-brand-600 font-extrabold text-sm tracking-[0.2em] uppercase mb-4">How it Works</h2>
                <p class="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">Get Started in 4 Simple Steps</p>
            </div>
            <div class="relative">
                <!-- Connector Line -->
                <div class="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-slate-200 border-dashed border-t-2"></div>
                <div class="grid lg:grid-cols-4 gap-12 relative z-10">
                    <!-- Step 1 -->
                    <div class="flex flex-col items-center text-center group">
                        <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-xl shadow-slate-200 border-4 border-slate-50 group-hover:border-brand-500 transition-all duration-300 relative">
                            <span class="absolute -top-2 -right-2 w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center text-sm font-black">01</span>
                            <svg class="w-10 h-10 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                        </div>
                        <h3 class="text-xl font-extrabold text-slate-900 mb-3 tracking-tight">Register Account</h3>
                        <p class="text-slate-500 font-medium">Create your business account on our secure online platform.</p>
                    </div>
                    <!-- Step 2 -->
                    <div class="flex flex-col items-center text-center group">
                        <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-xl shadow-slate-200 border-4 border-slate-50 group-hover:border-brand-500 transition-all duration-300 relative">
                            <span class="absolute -top-2 -right-2 w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center text-sm font-black">02</span>
                            <svg class="w-10 h-10 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                        </div>
                        <h3 class="text-xl font-extrabold text-slate-900 mb-3 tracking-tight">Purchase License</h3>
                        <p class="text-slate-500 font-medium">Pay via GCash and we will instantly verify your payment.</p>
                    </div>
                    <!-- Step 3 -->
                    <div class="flex flex-col items-center text-center group">
                        <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-xl shadow-slate-200 border-4 border-slate-50 group-hover:border-brand-500 transition-all duration-300 relative">
                            <span class="absolute -top-2 -right-2 w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center text-sm font-black">03</span>
                            <svg class="w-10 h-10 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        </div>
                        <h3 class="text-xl font-extrabold text-slate-900 mb-3 tracking-tight">Download Installer</h3>
                        <p class="text-slate-500 font-medium">Download the latest desktop application installer for Windows.</p>
                    </div>
                    <!-- Step 4 -->
                    <div class="flex flex-col items-center text-center group">
                        <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-xl shadow-slate-200 border-4 border-slate-50 group-hover:border-brand-500 transition-all duration-300 relative">
                            <span class="absolute -top-2 -right-2 w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center text-sm font-black">04</span>
                            <svg class="w-10 h-10 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <h3 class="text-xl font-extrabold text-slate-900 mb-3 tracking-tight">Activate & Use</h3>
                        <p class="text-slate-500 font-medium">Enter your license key and start using the system fully offline.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- PRODUCT SHOWCASE SECTION -->
    <section id="screenshots" class="py-24 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-20">
                <h2 class="text-brand-600 font-extrabold text-sm tracking-[0.2em] uppercase mb-4">Product Showcase</h2>
                <p class="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">Designed for Recycling Businesses</p>
            </div>
            
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

            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                @foreach($showcaseItems as $item)
                    <div class="group cursor-pointer" @click="openImage('{{ asset($item['image_path'] ?? 'assets/placeholder.png') }}', '{{ $item['title'] }}')">
                        <div class="rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-brand-200/50 group-hover:-translate-y-2">
                            <div class="bg-slate-800 aspect-video flex flex-col relative overflow-hidden">
                                @if(isset($item['image_path']))
                                    <img src="{{ asset($item['image_path']) }}" alt="{{ $item['title'] }}" 
                                        class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110">
                                @else
                                    <div class="h-6 bg-slate-900 px-3 flex items-center gap-1.5 shrink-0 z-10">
                                        <div class="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                                        <div class="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                        <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    </div>
                                    <div class="flex-1 p-4 overflow-hidden opacity-40 transition-transform duration-700 group-hover:scale-110">
                                        <div class="grid grid-cols-2 gap-3 mb-4">
                                            <div class="h-16 bg-slate-700/50 rounded-lg"></div>
                                            <div class="h-16 bg-slate-700/50 rounded-lg"></div>
                                        </div>
                                        <div class="h-24 bg-slate-700/50 rounded-lg"></div>
                                    </div>
                                    <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                        <svg class="w-12 h-12 text-slate-700/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    </div>
                                @endif
                                
                                <!-- Overlay on hover -->
                                <div class="absolute inset-0 bg-brand-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                    <div class="bg-white/90 backdrop-blur-sm p-3 rounded-2xl scale-50 group-hover:scale-100 transition-transform duration-500 shadow-xl">
                                        <svg class="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="mt-8 text-center px-4">
                            <h4 class="text-xl font-extrabold text-slate-900 mb-2 uppercase tracking-tight">{{ $item['title'] }}</h4>
                            <p class="text-slate-500 font-medium leading-relaxed">{{ $item['desc'] }}</p>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    </section>

    <!-- PRICING SECTION -->
    <section id="pricing" class="py-24 bg-slate-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-20">
                <h2 class="text-brand-600 font-extrabold text-sm tracking-[0.2em] uppercase mb-4">Pricing</h2>
                <p class="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">Simple & Affordable Pricing</p>
            </div>
            <div class="max-w-md mx-auto">
                <div class="relative group">
                    <div class="absolute -inset-1 bg-gradient-to-r from-brand-600 to-emerald-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div class="relative bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100">
                        <div class="absolute top-0 right-10 -translate-y-1/2 bg-brand-600 text-white px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase">Best Value</div>
                        <div class="text-center mb-10">
                            <h3 class="text-2xl font-black text-slate-900 mb-2">Lifetime License</h3>
                            <div class="flex items-center justify-center gap-1 mb-2">
                                <span class="text-3xl font-bold text-slate-900">₱</span>
                                <span class="text-6xl font-black text-slate-900 tracking-tighter">{{ number_format(floor($settings['license_price'])) }}</span>
                                <span class="text-xl font-bold text-slate-400">.{{ sprintf('%02d', ($settings['license_price'] - floor($settings['license_price'])) * 100) }}</span>
                            </div>
                            <p class="text-slate-500 font-bold">One-time payment only</p>
                        </div>
                        <ul class="space-y-5 mb-10">
                            <li class="flex items-center gap-4 text-slate-700 font-semibold">
                                <div class="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg class="w-4 h-4 text-brand-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                </div>
                                Lifetime use
                            </li>
                            <li class="flex items-center gap-4 text-slate-700 font-semibold">
                                <div class="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg class="w-4 h-4 text-brand-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                </div>
                                Works 100% offline
                            </li>
                            <li class="flex items-center gap-4 text-slate-700 font-semibold">
                                <div class="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg class="w-4 h-4 text-brand-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                </div>
                                Free updates (major versions)
                            </li>
                            <li class="flex items-center gap-4 text-slate-700 font-semibold">
                                <div class="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg class="w-4 h-4 text-brand-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                </div>
                                1 PC Activation
                            </li>
                            <li class="flex items-center gap-4 text-slate-700 font-semibold">
                                <div class="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg class="w-4 h-4 text-brand-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                </div>
                                Email & Chat support
                            </li>
                        </ul>
                        @guest
                            <a href="{{ route('register') }}" class="block w-full text-center bg-brand-600 hover:bg-brand-700 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-brand-100 transition-all hover:-translate-y-1">Get License Now</a>
                        @else
                            <a href="{{ url('/dashboard') }}" class="block w-full text-center bg-brand-600 hover:bg-brand-700 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-brand-100 transition-all hover:-translate-y-1">Go to Dashboard</a>
                        @endguest
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA SECTION -->
    <section class="py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="bg-slate-900 rounded-[3rem] p-12 lg:p-20 relative overflow-hidden shadow-2xl">
                <div class="absolute top-0 right-0 w-1/2 h-full bg-brand-600/10 blur-[120px]"></div>
                <div class="relative z-10 text-center lg:text-left grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 class="text-4xl lg:text-6xl font-black text-white mb-6 leading-tight">Start Using Junkshop POS Today!</h2>
                        <p class="text-xl text-slate-400 font-medium">Fast, Offline, Secure and Made for Junkshops. Join 100+ businesses growing with us.</p>
                    </div>
                    <div class="flex flex-wrap justify-center lg:justify-end gap-6">
                        @guest
                            <a href="{{ route('register') }}" class="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-lg hover:bg-slate-100 transition-all hover:-translate-y-1">Get License Now</a>
                        @else
                            <a href="{{ url('/dashboard') }}" class="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-lg hover:bg-slate-100 transition-all hover:-translate-y-1">Go to Dashboard</a>
                        @endguest
                        <a href="#" class="bg-slate-800 text-white border border-slate-700 px-10 py-5 rounded-2xl font-black text-lg hover:bg-slate-700 transition-all flex items-center gap-3">
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
                            Contact Support
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- IMAGE MODAL -->
    <div x-show="showModal" 
        x-transition:enter="transition ease-out duration-300"
        x-transition:enter-start="opacity-0"
        x-transition:enter-end="opacity-100"
        x-transition:leave="transition ease-in duration-200"
        x-transition:leave-start="opacity-100"
        x-transition:leave-end="opacity-0"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12 bg-slate-900/90 backdrop-blur-md"
        @keydown.escape.window="showModal = false"
        x-cloak>
        
        <!-- Close Button -->
        <button @click="showModal = false" class="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[110]">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div class="relative max-w-7xl w-full flex flex-col items-center justify-center" @click.away="showModal = false">
            <!-- Modal Content -->
            <div x-show="showModal"
                x-transition:enter="transition ease-out duration-500 delay-100"
                x-transition:enter-start="opacity-0 scale-90 translate-y-8"
                x-transition:enter-end="opacity-100 scale-100 translate-y-0"
                class="rounded-[1.5rem] lg:rounded-[2.5rem] overflow-hidden shadow-2xl">
                
                <img :src="modalImage" :alt="modalTitle" class="max-w-full max-h-[85vh] block object-contain">
            </div>
        </div>
    </div>

    <!-- FOOTER SECTION -->
    <footer class="bg-white border-t border-slate-100 pt-20 pb-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid md:grid-cols-4 gap-12 mb-20">
                <div class="col-span-1 md:col-span-1">
                    <div class="flex items-center gap-2 mb-6">
                        <div class="w-10 h-10 bg-white border border-slate-100 rounded-lg flex items-center justify-center shadow-sm overflow-hidden">
                            <img src="{{ asset('assets/logo.png') }}" class="w-full h-full object-contain p-1" alt="Logo">
                        </div>
                        <span class="text-lg font-black tracking-tight text-slate-900 uppercase">JUNKSHOP <span class="text-brand-600">POS</span></span>
                    </div>
                    <p class="text-slate-500 font-medium mb-6">Smart offline POS system for junkshops and recycling businesses.</p>
                    <div class="flex gap-4">
                        <a href="#" class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
                        <a href="#" class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg></a>
                    </div>
                </div>
                <div>
                    <h4 class="text-sm font-black text-slate-900 tracking-widest uppercase mb-8">Quick Links</h4>
                    <ul class="space-y-4">
                        <li><a href="#" class="text-slate-500 font-bold hover:text-brand-600 transition-colors">Home</a></li>
                        <li><a href="#features" class="text-slate-500 font-bold hover:text-brand-600 transition-colors">Features</a></li>
                        <li><a href="#how-it-works" class="text-slate-500 font-bold hover:text-brand-600 transition-colors">How it Works</a></li>
                        <li><a href="#pricing" class="text-slate-500 font-bold hover:text-brand-600 transition-colors">Pricing</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-sm font-black text-slate-900 tracking-widest uppercase mb-8">Support</h4>
                    <ul class="space-y-4">
                        <li><a href="#" class="text-slate-500 font-bold hover:text-brand-600 transition-colors">Contact Us</a></li>
                        <li><a href="#" class="text-slate-500 font-bold hover:text-brand-600 transition-colors">FAQs</a></li>
                        <li><a href="#" class="text-slate-500 font-bold hover:text-brand-600 transition-colors">Privacy Policy</a></li>
                        <li><a href="#" class="text-slate-500 font-bold hover:text-brand-600 transition-colors">Terms of Service</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-sm font-black text-slate-900 tracking-widest uppercase mb-8">Contact Us</h4>
                    <ul class="space-y-4">
                        <li class="flex items-start gap-3">
                            <svg class="w-5 h-5 text-brand-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            <span class="text-slate-500 font-bold">support@junkshoppos.com</span>
                        </li>
                        <li class="flex items-start gap-3">
                            <svg class="w-5 h-5 text-brand-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                            <span class="text-slate-500 font-bold">0912 345 6789</span>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="border-t border-slate-100 pt-10 text-center">
                <p class="text-slate-400 font-bold text-sm">© 2026 Junkshop POS System. All rights reserved.</p>
            </div>
        </div>
    </footer>

</body>
</html>
