
    import React from 'react';
    import { 
    FaUserGraduate, 
    FaChalkboardTeacher, 
    FaCog 
    } from 'react-icons/fa';   
    import '@/index.css';  

 
    function App() {
    return (
        <div className="min-h-screen bg-gray-50">
        <header 
            className="bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white relative overflow-hidden"
            style={{
            backgroundImage: 'url(src/assets/gc.jpg)', 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            }}
        >
            <div className="absolute inset-0 bg-black opacity-20"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <div className="animate-fade-in">
            <div className="flex justify-center items-center gap-6 mb-6">
                <div className="flex justify-center items-center gap-6 mb-6">
                <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg border-4 border-green-400">
                    <img
                    src="src/assets/gcef1.png"
                    alt="GCEF Logo"
                    className="w-full h-full object-cover"
                    />
                </div>

                </div>
            </div>
                <h1 className="text-6xl md:text-7xl font-bold mb-6 drop-shadow-lg text-green-400">
                GCEF
                </h1>
                <h2 className="text-3xl md:text-4xl font-semibold mb-6 leading-tight">
                Welcome to the Gordon College Event Feed Portal
                </h2>

                <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto opacity-90">
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
                href="/student-Login" 
                className="group block bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out p-8 text-center border-2 border-gray-100 hover:border-green-500 hover:bg-green-50 animate-fade-in-item"
                aria-label="Student Portal"
            >
                <div className="mx-auto mb-6 p-4 bg-green-100 rounded-full w-20 h-20 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <FaUserGraduate className="text-3xl text-green-600 group-hover:text-green-700" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-700">
                Student Portal
                </h3>
                <p className="text-gray-600 leading-relaxed">
                Discover events, register for activities, and manage your schedule easily!.
                </p>
            </a>

            <a
                href="/OrgLogin"
                className="group block bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out p-8 text-center border-2 border-gray-100 hover:border-green-500 hover:bg-green-50 animate-fade-in-item"
                aria-label="Organizer Portal"
            >
                <div className="mx-auto mb-6 p-4 bg-green-100 rounded-full w-20 h-20 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <FaChalkboardTeacher className="text-3xl text-green-600 group-hover:text-green-700" />
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
                className="group block bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out p-8 text-center border-2 border-gray-100 hover:border-green-500 hover:bg-green-50 animate-fade-in-item"
                aria-label="Admin Portal"
            >
                <div className="mx-auto mb-6 p-4 bg-green-100 rounded-full w-20 h-20 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <FaCog className="text-3xl text-green-600 group-hover:text-green-700" />
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

        <footer className="bg-gray-900 text-white py-12 mt-auto border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                <div>
                <h4 className="text-xl font-bold text-green-400 mb-4">Gordon College Event Feed</h4>
                <p className="text-gray-400">
                    Your Official Guide to Gordon College Centralized Event Portal.
                </p>
                </div>
                <div>
                <h5 className="font-semibold mb-4">GCEF Portal</h5>
                <p className="text-gray-400">
                    © 2025 Gordon College. All rights reserved. | 
                    <a href="/terms" className="text-green-400 hover:underline ml-1">Privacy Policy</a>
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

    export default App;