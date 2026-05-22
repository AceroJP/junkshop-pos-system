<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'Junkshop POS') }}</title>

        <!-- Favicon -->
        <link rel="icon" type="image/png" href="{{ asset('assets/logo.png') }}?v={{ time() }}">
        <link rel="apple-touch-icon" href="{{ asset('assets/logo.png') }}?v={{ time() }}">

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
            .auth-gradient {
                background: radial-gradient(circle at 0% 0%, #f0fdf4 0%, #ffffff 50%, #f0fdf4 100%);
            }
        </style>
    </head>
    <body class="font-sans text-slate-900 antialiased h-full auth-gradient">
        <div class="min-h-screen flex flex-col items-center justify-center p-6">
            <div class="w-full max-w-[440px]">
                <!-- Logo Area -->
                <div class="flex flex-col items-center mb-10">
                    <a href="/" class="group transition-transform hover:scale-105 duration-300">
                        <div class="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-brand-100 overflow-hidden border border-slate-100">
                            <img src="{{ asset('assets/logo.png') }}" class="w-full h-full object-contain p-2" alt="Logo">
                        </div>
                    </a>
                    <h2 class="mt-6 text-2xl font-black tracking-tight text-slate-900 uppercase">
                        Junkshop <span class="text-brand-600">POS</span>
                    </h2>
                    <p class="text-slate-500 font-medium text-sm mt-2">Welcome back! Please sign in to your account.</p>
                </div>

                <!-- Auth Card -->
                <div class="bg-white/70 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-brand-100/50 border border-white">
                    {{ $slot }}
                </div>

                <!-- Footer Links -->
                <div class="mt-10 text-center">
                    <p class="text-slate-500 text-sm font-medium">
                        &copy; {{ date('Y') }} Junkshop POS System.
                    </p>
                </div>
            </div>
        </div>
    </body>
</html>
