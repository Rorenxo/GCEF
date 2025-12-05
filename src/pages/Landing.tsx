
    import React, { useState } from 'react';
    import { FaUserGraduate, FaChalkboardTeacher, FaCog, FaQrcode, FaBell, FaChartBar, FaListAlt, FaUserPlus, FaSignInAlt, FaSearch, FaCheckSquare, FaArrowRight, FaChevronDown, FaBars, FaTimes } from 'react-icons/fa';
    import '@/index.css';
    import '@/animations.css'; 
    import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
    import gcefLogo from '@/assets/gcef1.png';
    import headerBg from '@/assets/gc.jpg';
    import ctaBg from '@/assets/regCTA.jpg';
    import { cn } from '@/lib/utils';


    function App() {
        const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    return (
        <div className="min-h-screen bg-gray-50">
        <nav className="sticky top-0 z-50 bg-[#7cb93c]/95 backdrop-blur-md shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="hidden md:flex items-center">
                        <a href="/" className="flex-shrink-0 flex items-center gap-2"> 
                            <img className="h-10 w-auto" src={gcefLogo} alt="GCEF Logo" />
                            <span className="font-extrabold text-xl text-white hidden sm:block">GCEF</span>
                        </a>
                    </div>
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-900 hover:bg-gray-100 "
                            aria-controls="mobile-menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? <FaTimes className="block h-6 w-6" /> : <FaBars className="block h-6 w-6" />}
                        </button>
                    </div>
                    <div className="hidden md:flex items-baseline space-x-6">
                        <a href="#features" className="text-white hover:text-black px-3 py-2 rounded-md text-sm font-medium transition-colors">Features</a>
                        <a href="#how-it-works" className="text-white hover:text-black px-3 py-2 rounded-md text-sm font-medium transition-colors">How It Works</a>
                        <a href="#faq" className="text-white hover:text-black px-3 py-2 rounded-md text-sm font-medium transition-colors">FAQ</a>
                        <a href="/student-login" className="bg-white text-[#7cb93c] hover:bg-gray-200 px-4 py-2 rounded-md text-sm font-bold transition-colors">Login</a>
                    </div>
                </div>
            </div>
            <div
                className={cn(
                    'md:hidden transition-all duration-300 ease-in-out overflow-hidden',
                    isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                )}
                id="mobile-menu"
            >
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:bg-white/20 block px-3 py-2 rounded-md text-base font-medium">Features</a>
                    <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:bg-white/20 block px-3 py-2 rounded-md text-base font-medium">How It Works</a>
                    <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:bg-white/20 block px-3 py-2 rounded-md text-base font-medium">FAQ</a>
                    <a href="/student-login" onClick={() => setIsMobileMenuOpen(false)} className="bg-white text-[#7cb93c] hover:bg-gray-200 block px-3 py-2 rounded-md text-base font-bold text-center">Login</a>
                </div>
            </div>
        </nav>

        <header 
            className="bg-[#7cb93c] text-white relative overflow-hidden"
            style={{
            backgroundImage: `url(${headerBg})`, 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            }}
        >
            <div className="absolute inset-0 bg-black opacity-20"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <div className="animate-fade-in">
            <div className="flex justify-center items-center gap-6 mb-6">
                <div className="flex justify-center items-center gap-6 mb-6">
                <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg border-4 border-white/80">
                    <img
                    src={gcefLogo}
                    alt="GCEF Logo"
                    className="w-full h-full object-cover"
                    />
                </div>

                </div>
            </div>
                <h1 className="text-6xl md:text-7xl font-bold mb-6 drop-shadow-lg text-white">
                GCEF
                </h1>
                <h2 className="text-3xl md:text-4xl font-semibold mb-6 leading-tight">
                Welcome to the Gordon College Event Feed Portal
                </h2>

                <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto opacity-90">
                Your gateway to all school events, schedules, and activities.<br></br>
                Stay connected and informed with us.
                </p>
            </div>
            </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center mb-16 animate-fade-in-delay">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Choose Your Portal
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Access tailored features for students, organizers, and administrators.
            </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <a
                href="/student-login" 
                className="group block bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out p-8 text-center border-2 border-gray-100 hover:border-[#7cb93c] hover:bg-green-50 animate-fade-in-item"
                aria-label="Student Portal"
            >
                <div className="mx-auto mb-6 p-4 bg-green-100 rounded-full w-20 h-20 flex items-center justify-center group-hover:bg-[#d9efc4] transition-colors">
                <FaUserGraduate className="text-3xl text-[#7cb93c]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-700">
                Student Portal
                </h3>
                <p className="text-gray-600 leading-relaxed">
                Discover events, register for activities, and manage your schedule easily!
                </p>
            </a>

            <a
                href="/OrgLogin"
                className="group block bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out p-8 text-center border-2 border-gray-100 hover:border-[#7cb93c] hover:bg-green-50 animate-fade-in-item"
                aria-label="Organizer Portal"
            >
                <div className="mx-auto mb-6 p-4 bg-green-100 rounded-full w-20 h-20 flex items-center justify-center group-hover:bg-[#d9efc4] transition-colors">
                <FaChalkboardTeacher className="text-3xl text-[#7cb93c]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-700">
                Organizer Portal
                </h3>
                <p className="text-gray-600 leading-relaxed">
                Plan your events, view calendars, and collaborate with GCEF.
                </p>
            </a>
            <a
                href="/admin"
                className="group block bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out p-8 text-center border-2 border-gray-100 hover:border-[#7cb93c] hover:bg-green-50 animate-fade-in-item"
                aria-label="Admin Portal"
            >
                <div className="mx-auto mb-6 p-4 bg-green-100 rounded-full w-20 h-20 flex items-center justify-center group-hover:bg-[#d9efc4] transition-colors">
                <FaCog className="text-3xl text-[#7cb93c]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-700">
                Admin Portal
                </h3>
                <p className="text-gray-600 leading-relaxed">
                Full control over event management, user access, and system configurations.
                </p>
            </a>
            </div>
        </main>
        
        <section id="features" className="bg-gray-100 py-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 animate-fade-in-delay">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                        System Features
                    </h3>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Powerful tools to enhance the campus event experience for everyone.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-gray-100 animate-fade-in-item">
                        <div className="flex items-center gap-4 mb-4">
                            <FaQrcode className="text-3xl text-[#7cb93c]" />
                            <h4 className="text-xl font-bold text-gray-900">QR Code Attendance</h4>
                        </div>
                        <p className="text-gray-600">Effortless and accurate attendance tracking using unique QR codes for every student.</p>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-gray-100 animate-fade-in-item">
                        <div className="flex items-center gap-4 mb-4">
                            <FaBell className="text-3xl text-[#7cb93c]" />
                            <h4 className="text-xl font-bold text-gray-900">Real-time Notifications</h4>
                        </div>
                        <p className="text-gray-600">Stay informed with instant alerts for new events, schedule changes, and important announcements.</p>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-gray-100 animate-fade-in-item">
                        <div className="flex items-center gap-4 mb-4">
                            <FaChartBar className="text-3xl text-[#7cb93c]" />
                            <h4 className="text-xl font-bold text-gray-900">Insightful Statistics</h4>
                        </div>
                        <p className="text-gray-600">Organizers can access detailed analytics on event attendance and engagement.</p>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-gray-100 animate-fade-in-item">
                        <div className="flex items-center gap-4 mb-4">
                            <FaListAlt className="text-3xl text-[#7cb93c]" />
                            <h4 className="text-xl font-bold text-gray-900">Centralized Event Feed</h4>
                        </div>
                        <p className="text-gray-600">A modern, feed-style interface to browse all campus happenings in one place.</p>
                    </div>
                </div>
            </div>
        </section>

        <section 
            className="relative bg-contain bg-center py-24"
            style={{ backgroundImage: `url(${ctaBg})` }}
        >
            <div className="absolute inset-0 bg-[#7cb93c] opacity-80"></div>
            <div className="relative max-w-4xl mx-auto px-6 sm:px-6 lg:px-8 text-center text-white animate-fade-in">
                <h3 className="text-4xl font-bold mb-4 text-white">
                    Empower Your Organization
                </h3>
                <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                    Are you a student council or campus organizer? Streamline your event management, boost attendance, and gain valuable insights with GCEF's powerful tools.
                </p>
                <a
                    href="/OrgLogin/"
                    className="inline-block bg-white text-[#7cb93c] font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-100 hover:text-[#6aa334] transition-all duration-300 transform hover:-translate-y-1 text-lg"
                >
                    Register as an Organizer
                </a>
            </div>
        </section>

        <section id="how-it-works" className="bg-white py-20 overflow-x-hidden">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 animate-fade-in-delay">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                        How It Works
                    </h3>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Get started in four simple steps.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row lg:flex-nowrap items-stretch justify-center gap-y-10 gap-x-4">
                    <StepCard
                        icon={<FaUserPlus />}
                        step="1"
                        title="Register"
                        description="Create your account using your official school credentials to get started."
                        animationDelay="0ms"
                    />
                    <StepArrow animationDelay="150ms" />
                    <StepCard
                        icon={<FaSignInAlt />}
                        step="2"
                        title="Login"
                        description="Access your personalized portal to see features tailored for you."
                        animationDelay="300ms"
                    />
                    <StepArrow animationDelay="450ms" />
                    <StepCard
                        icon={<FaSearch />}
                        step="3"
                        title="Browse Events"
                        description="Explore the event feed to find upcoming school activities, seminars, and more."
                        animationDelay="600ms"
                    />
                    <StepArrow animationDelay="750ms" />
                    <StepCard
                        icon={<FaCheckSquare />}
                        step="4"
                        title="Join & Participate"
                        description="Join events and use your QR code for attendance tracking."
                        animationDelay="900ms"
                    />
                </div>
            </div>
        </section>

        <section id="faq" className="bg-gray-100 py-20">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 animate-fade-in-delay">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                        Frequently Asked Questions
                    </h3>
                    <p className="text-lg text-gray-600">
                        Have questions? We've got answers.
                    </p>
                </div>
                <div className="space-y-4">
                    <FaqItem
                        question="What is GCEF?"
                        answer="GCEF (Gordon College Event Feed) is the official centralized platform for managing and viewing all campus events. It's designed to keep students, organizers, and administrators connected and informed."
                    />
                    <FaqItem
                        question="How do I get my QR code for attendance?"
                        answer="Your unique QR code is automatically generated upon successful registration. You can find it in your student profile section after logging in. Simply present it at events for quick and easy attendance tracking."
                    />
                    <FaqItem
                        question="Who can create events on the platform?"
                        answer="Events can be created by approved student organizations and college departments. If you represent an organization, you can apply for an organizer account through the portal."
                    />
                    <FaqItem
                        question="Can I see events from other departments?"
                        answer="Yes! The main feed shows all public campus-wide events. You can also filter events by department to find what's most relevant to you."
                    />
                </div>
            </div>
        </section>

        <footer className="bg-gray-900 text-white py-12 mt-auto border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                <div>
                <h4 className="text-xl font-bold text-[#7cb93c] mb-4">Gordon College Event Feed</h4>
                <p className="text-gray-400">
                    Your Official Guide to Gordon College Centralized Event Portal.
                </p>
                </div>
                <div>
                <h5 className="font-semibold mb-4">GCEF Portal</h5>
                <p className="text-gray-400">
                    © 2025 Gordon College. All rights reserved. | 
                    <a href="/terms" className="text-[#7cb93c] hover:underline ml-1">Privacy Policy</a>
                </p>
                </div>
                            <div>
                <h5 className="font-semibold mb-4">Developed by UIX</h5>
                <p className="text-gray-400">
                    Lingad <br></br>
                    Moralda
                </p>
                </div>

            </div>
            </div>
        </footer>
        </div>
    );
    }

    const StepCard = ({ icon, step, title, description, animationDelay }: { icon: React.ReactNode, step: string, title: string, description: string, animationDelay: string }) => {
        const { ref, isIntersecting } = useIntersectionObserver();

        return (
            <div
                ref={ref}
                className={cn('relative text-center opacity-0 w-full max-w-xs lg:max-w-none lg:w-1/4', isIntersecting && 'animate-slide-in-up')}
                style={{ animationDelay }}
            >
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100 h-full flex flex-col">
                    <p className="text-lg font-bold text-[#7cb93c] mb-2">Step {step}</p>
                    <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 bg-green-100 rounded-full border-4 border-[#d9efc4] relative z-10">
                        <div className="text-3xl text-[#7cb93c]">{icon}</div>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{title}</h4>
                    <p className="text-gray-600 px-2 flex-grow">{description}</p>
                </div>
            </div>
        );
    };

    const StepArrow = ({ animationDelay }: { animationDelay: string }) => {
        const { ref, isIntersecting } = useIntersectionObserver();

        return (
            <div
                ref={ref}
                className={cn('hidden lg:flex items-center justify-center text-center opacity-0 mx-2', isIntersecting && 'animate-slide-in-up')}
                style={{ animationDelay }}
                aria-hidden="true"
            >
                <FaArrowRight className="text-4xl text-gray-300" />
            </div>
        );
    };

    const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
        const [isOpen, setIsOpen] = useState(false);

        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex justify-between items-center text-left p-5 font-semibold text-gray-800 hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-[#7cb93c] focus-visible:ring-opacity-50"
                    aria-expanded={isOpen}
                >
                    <span className="text-lg">{question}</span>
                    <FaChevronDown className={cn('transform transition-transform duration-300', isOpen ? 'rotate-180' : 'rotate-0')} />
                </button>
                <div
                    className={cn(
                        'grid transition-all duration-300 ease-in-out',
                        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    )}
                >
                    <div className="overflow-hidden">
                        <p className="p-5 pt-0 text-gray-600">{answer}</p>
                    </div>
                </div>
            </div>
        );
    };

    export default App;