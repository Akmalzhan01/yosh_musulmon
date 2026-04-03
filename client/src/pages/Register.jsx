import React, { useState, useEffect } from 'react';
import { registerUser, getSettings } from '../lib/api';
import { User, CheckCircle, AlertCircle, Star, Sparkles, Trophy, Rocket, BookOpen } from 'lucide-react';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import logo from '../assets/logo.png';
import personsGif from '../assets/persons.gif';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        gender: 'Уул',
        birthYear: '2014',
        region: 'Ош',
        participationLanguage: 'Кыргыз тили'
    });
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [whatsappJoined, setWhatsappJoined] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [registrationOpen, setRegistrationOpen] = useState(true);
    const [settingsLoading, setSettingsLoading] = useState(true);

    useEffect(() => {
        getSettings()
            .then(res => setRegistrationOpen(res.data.registrationOpen))
            .catch(() => setRegistrationOpen(true))
            .finally(() => setSettingsLoading(false));
    }, []);

    // ... (existing code)


    // Progress Calculation
    const totalFields = 7;
    const filledFields = Object.values(formData).filter(value => value !== '').length;
    const progress = Math.min((filledFields / totalFields) * 100, 100);

    useEffect(() => {
        if (success) {
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#FFD700', '#FF69B4', '#00CED1', '#32CD32']
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#FFD700', '#FF69B4', '#00CED1', '#32CD32']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        }
    }, [success]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhoneChange = (value) => {
        if (!value) {
            setFormData({ ...formData, phone: '' });
            return;
        }

        let validatedValue = value;

        // Qirg'iziston (+996) - max 13 (9 digits)
        if (value.startsWith('+996') && value.length > 13) {
            validatedValue = value.slice(0, 13);
        }
        // O'zbekiston (+998) - max 13 (9 digits)
        else if (value.startsWith('+998') && value.length > 13) {
            validatedValue = value.slice(0, 13);
        }
        // Rossiya/Qozog'iston (+7) - max 12 (10 digits)
        else if (value.startsWith('+7') && value.length > 12) {
            validatedValue = value.slice(0, 12);
        }

        setFormData({ ...formData, phone: validatedValue });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        if (!formData.phone) {
            setError('Телефон номерин киргизиңиз');
            setLoading(false);
            return;
        }

        try {
            await registerUser(formData);
            setSuccess(true);
            setFormData({
                firstName: '',
                lastName: '',
                phone: '',
                gender: 'Уул',
                birthYear: '2014',
                region: 'Ош',
                participationLanguage: 'Кыргыз тили'
            });
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Ката кетти. Сураныч, кайра аракет кылыңыз.');
        } finally {
            setLoading(false);
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 100, damping: 15, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    const floatingEmojiVariants = {
        animate: {
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
            transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    // Background Elements
    const BackgroundElements = () => (
        <>
            <motion.div
                animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-20 left-10 text-yellow-300 opacity-80 pointer-events-none hidden sm:block"
            >
                <Star size={48} fill="currentColor" />
            </motion.div>
            <motion.div
                animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-20 right-10 text-pink-300 opacity-80 pointer-events-none hidden sm:block"
            >
                <Sparkles size={56} />
            </motion.div>
            <motion.div
                animate={{ x: [0, 30, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-5 text-green-300 opacity-60 pointer-events-none hidden sm:block"
            >
                <div className="w-12 h-12 rounded-full border-4 border-current"></div>
            </motion.div>

            {/* New Floating Emojis - Responsive positioning */}
            <motion.div
                variants={floatingEmojiVariants}
                animate="animate"
                className="absolute top-10 right-5 sm:top-40 sm:right-20 text-2xl sm:text-4xl opacity-60 pointer-events-none"
            >
                🏆
            </motion.div>
            <motion.div
                variants={floatingEmojiVariants}
                animate="animate"
                className="absolute bottom-10 left-5 sm:bottom-40 sm:left-20 text-2xl sm:text-4xl opacity-60 pointer-events-none"
                style={{ animationDelay: "1s" }}
            >
                📚
            </motion.div>
            <motion.div
                variants={floatingEmojiVariants}
                animate="animate"
                className="absolute top-20 left-1/4 sm:top-1/3 sm:right-1/4 text-2xl sm:text-4xl opacity-60 pointer-events-none"
                style={{ animationDelay: "2s" }}
            >
                🚀
            </motion.div>
        </>
    );

    if (!registrationOpen) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                <motion.div
                    animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-20 left-10 text-yellow-300 opacity-60 pointer-events-none hidden sm:block"
                >
                    <Star size={48} fill="currentColor" />
                </motion.div>
                <motion.div
                    animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-20 right-10 text-pink-300 opacity-60 pointer-events-none hidden sm:block"
                >
                    <Sparkles size={56} />
                </motion.div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                    className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-12 max-w-md w-full border-4 border-white/50"
                >
                    <div className="text-6xl mb-6">🔒</div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-800 mb-3">
                        Катталуу токтотулду
                    </h1>
                    <p className="text-gray-500 text-base sm:text-lg leading-relaxed">
                        Азыр катталуу убактылуу токтотулган. <br />
                        Кийинчерээк кайра аракет кылыңыз.
                    </p>
                    <div className="mt-8 w-16 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mx-auto" />
                </motion.div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 text-center overflow-hidden relative">

                {/* Background Decorations */}
                <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 right-10 w-20 h-20 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-20 h-20 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-md border-4 border-yellow-400 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500"></div>

                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex justify-center mb-6"
                    >
                        <img src={logo} alt="Logo" className="h-28 sm:h-40 w-auto mx-auto drop-shadow-lg" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex justify-center -mt-6 mb-6"
                    >
                        <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center bg-indigo-950 rounded-full shadow-inner overflow-hidden border-4 border-yellow-400/50">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/20 via-transparent to-transparent"></div>
                            <img
                                src={personsGif}
                                alt="Celebrating People"
                                className="w-full h-full object-cover mix-blend-screen scale-125 pt-4"
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4, type: "spring" }}
                        className="mb-4 inline-block"
                    >
                        <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500 mx-auto" />
                    </motion.div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">Ура! Куттуктайбыз!</h2>
                    <p className="text-gray-700 text-base sm:text-lg mb-8 font-medium">
                        Сиз ийгиликтүү катталдыңыз! <br /> Мелдеште көрүшкөнчө! 🚀
                    </p>

                    <div className="space-y-3">
                        <motion.a
                            href="https://whatsapp.com/channel/0029VbCXvhbInlqMNPKtET0V"
                            target="_blank"
                            onClick={() => setWhatsappJoined(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="block w-full bg-green-500 text-white py-3 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl shadow-lg hover:bg-green-600 transition transform flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                            </svg>
                            WhatsApp каналга кошулуу
                        </motion.a>

                        {whatsappJoined && (
                            <motion.button
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSuccess(false)}
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl shadow-lg hover:shadow-xl transition transform"
                            >
                                Кайра катталуу
                            </motion.button>
                        )}
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

            <BackgroundElements />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-md mx-auto relative z-10"
            >
                <div className="text-center mb-6 sm:mb-8">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="flex justify-center mb-4 sm:mb-6"
                    >
                        <img src={logo} alt="Logo" className="h-28 sm:h-40 w-auto mx-auto drop-shadow-2xl" />
                    </motion.div>
                    <h2 className="text-3xl sm:text-4xl font-black text-white drop-shadow-md tracking-wide">
                        Катталуу
                    </h2>
                    <p className="mt-2 text-base sm:text-lg text-blue-100 font-medium">
                        Мелдешке катышуу үчүн маалыматтарыңызды киргизиңиз
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-6 w-full bg-blue-900/30 rounded-full h-4 backdrop-blur-sm overflow-hidden border border-blue-300/30">
                        <motion.div
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-4 rounded-full shadow-[0_0_10px_rgba(255,215,0,0.7)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>

                <div className="bg-white/95 backdrop-blur-md py-6 px-5 sm:py-8 sm:px-10 shadow-2xl rounded-3xl border-4 border-white/50 relative">
                    {/* Decorative Corner Icon */}
                    <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 bg-yellow-400 p-2 sm:p-3 rounded-full shadow-lg transform rotate-12 z-20">
                        <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>

                    <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-100 border-l-4 border-red-500 p-3 sm:p-4 mb-4 rounded-r-xl"
                            >
                                <div className="flex items-center">
                                    <div className="shrink-0">
                                        <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-bold text-red-700">{error}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div className="grid grid-cols-1 gap-4 sm:gap-5">
                            {[
                                { id: 'firstName', label: 'Аты', type: 'text', placeholder: 'Атыңызды жазыңыз' },
                                { id: 'lastName', label: 'Фамилиясы', type: 'text', placeholder: 'Фамилияңызды жазыңыз' }
                            ].map((field) => (
                                <motion.div
                                    key={field.id}
                                    variants={itemVariants}
                                    onFocus={() => setFocusedField(field.id)}
                                    onBlur={() => setFocusedField(null)}
                                    animate={focusedField === field.id ? { scale: 1.02 } : { scale: 1 }}
                                >
                                    <label htmlFor={field.id} className="block text-sm font-bold text-gray-700 mb-1">
                                        {field.label}
                                    </label>
                                    <input
                                        id={field.id}
                                        name={field.id}
                                        type={field.type}
                                        required
                                        value={formData[field.id]}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-3 sm:px-5 sm:py-4 border-2 border-indigo-100 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition-all duration-300 text-base sm:text-lg font-medium"
                                        placeholder={field.placeholder}
                                    />
                                </motion.div>
                            ))}

                            <motion.div variants={itemVariants}>
                                <label htmlFor="gender" className="block text-sm font-bold text-gray-700 mb-1">
                                    Жынысы
                                </label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-3 sm:px-5 sm:py-4 border-2 border-indigo-100 rounded-2xl shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition-all duration-300 text-base sm:text-lg font-medium bg-white"
                                >
                                    <option value="Уул">👦 Уул</option>
                                    <option value="Кыз">👧 Кыз</option>
                                </select>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <label htmlFor="birthYear" className="block text-sm font-bold text-gray-700 mb-1">
                                    Туулган жылы
                                </label>
                                <select
                                    id="birthYear"
                                    name="birthYear"
                                    value={formData.birthYear}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-3 sm:px-5 sm:py-4 border-2 border-indigo-100 rounded-2xl shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition-all duration-300 text-base sm:text-lg font-medium bg-white"
                                >
                                    {[2013, 2014, 2015, 2016, 2017, 2018, 2019].map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <label htmlFor="region" className="block text-sm font-bold text-gray-700 mb-1">
                                    Району
                                </label>
                                <select
                                    id="region"
                                    name="region"
                                    value={formData.region}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-3 sm:px-5 sm:py-4 border-2 border-indigo-100 rounded-2xl shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition-all duration-300 text-base sm:text-lg font-medium bg-white"
                                >
                                    <option value="Ош">🏙️ Ош</option>
                                    <option value="Манас">🏞️ Манас</option>
                                    <option value="Өзгөн">🏰 Өзгөн</option>
                                    <option value="Ноокат">🍎 Ноокат</option>
                                    <option value="Кызыл-кыя">🏔️ Кызыл-кыя</option>
                                    <option value="Араван">🍒 Араван</option>
                                    <option value="Башка район">📍 Башка район</option>
                                    <option value="Башка республика">🌍 Башка республика</option>
                                </select>
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <label htmlFor="participationLanguage" className="block text-sm font-bold text-gray-700 mb-1">
                                    Катышуу тили
                                </label>
                                <select
                                    id="participationLanguage"
                                    name="participationLanguage"
                                    value={formData.participationLanguage}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-3 sm:px-5 sm:py-4 border-2 border-indigo-100 rounded-2xl shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition-all duration-300 text-base sm:text-lg font-medium bg-white"
                                >
                                    <option value="Кыргыз тили">Кыргыз тили</option>
                                    <option value="Өзбек тили">Өзбек тили</option>
                                </select>
                            </motion.div>
                            <motion.div
                                variants={itemVariants}
                                onFocus={() => setFocusedField('phone')}
                                onBlur={() => setFocusedField(null)}
                                animate={focusedField === 'phone' ? { scale: 1.02 } : { scale: 1 }}
                            >
                                <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-1">
                                    Телефон номери
                                </label>
                                <div className="border-2 border-indigo-100 rounded-2xl overflow-hidden focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-200 transition-all duration-300">
                                    <PhoneInput
                                        international
                                        defaultCountry="KG"
                                        value={formData.phone}
                                        onChange={handlePhoneChange}
                                        className="px-4 py-3 sm:px-5 sm:py-4"
                                        inputClassName="bg-transparent border-none outline-none shadow-none focus:outline-none focus:ring-0 w-full ml-2 text-base sm:text-lg font-medium placeholder-gray-400"
                                    />
                                </div>
                            </motion.div>

                            <motion.div
                                variants={itemVariants}
                                className="pt-2 sm:pt-4"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05, rotate: [-1, 1, -1] }}
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full flex justify-center py-3 sm:py-4 px-4 border border-transparent rounded-2xl shadow-lg text-lg sm:text-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {loading ? '🚀 Жөнөтүлүүдө...' : '✨ Катталуу'}
                                </motion.button>
                            </motion.div>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
