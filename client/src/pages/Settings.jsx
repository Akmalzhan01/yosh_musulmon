import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings as SettingsIcon, Key, Users, Shield, ToggleLeft, ToggleRight } from 'lucide-react';
import { getSettings, updateSettings } from '../lib/api';

const Settings = () => {
    const navigate = useNavigate();
    const [registrationOpen, setRegistrationOpen] = useState(true);
    const [toggling, setToggling] = useState(false);
    const [toast, setToast] = useState('');

    useEffect(() => {
        const role = localStorage.getItem('adminRole');
        if (role !== 'superadmin') {
            navigate('/admin');
            return;
        }
        getSettings().then(res => setRegistrationOpen(res.data.registrationOpen)).catch(() => {});
    }, [navigate]);

    const handleToggle = async () => {
        setToggling(true);
        try {
            const res = await updateSettings({ registrationOpen: !registrationOpen });
            setRegistrationOpen(res.data.registrationOpen);
            setToast(res.data.registrationOpen ? 'Катталуу ачылды ✓' : 'Катталуу токтотулду ✓');
            setTimeout(() => setToast(''), 3000);
        } catch {
            setToast('Ката кетти');
            setTimeout(() => setToast(''), 3000);
        } finally {
            setToggling(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b shadow-sm sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={() => navigate('/admin')}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <SettingsIcon className="h-6 w-6 text-gray-600" />
                    <h1 className="text-lg font-bold text-gray-900 flex-1">Жөндөөлөр</h1>
                    <span className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 font-semibold px-2 py-1 rounded-full">
                        <Shield className="h-3 w-3" /> Superadmin
                    </span>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

                {/* Registration toggle */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="font-semibold text-gray-800 text-base">Катталуу</h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {registrationOpen
                                    ? 'Катталуу азыр ачык — колдонуучулар катталa алат'
                                    : 'Катталуу токтотулду — катталуу баракчасы жабык'}
                            </p>
                        </div>
                        <button
                            onClick={handleToggle}
                            disabled={toggling}
                            className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition ${
                                registrationOpen
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                            } disabled:opacity-50`}
                        >
                            {registrationOpen
                                ? <><ToggleRight className="h-5 w-5" /> Ачык</>
                                : <><ToggleLeft className="h-5 w-5" /> Жабык</>
                            }
                        </button>
                    </div>
                </div>

                {/* Toast */}
                {toast && (
                    <div className={`p-3 rounded-xl text-sm font-medium ${toast.includes('Ката') ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                        {toast}
                    </div>
                )}

                {/* Roles info */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                        <Users className="h-5 w-5 text-gray-500" /> Ролдор
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                            <div>
                                <div className="font-medium text-sm text-gray-800">Admin</div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                    Катышуучуларды көрүү, издөө, фильтрлөө, статусту өзгөртүү, балл кошуу/өчүрүү, өчүрүү/редакциялоо, лидерборд
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                            <span className="mt-1.5 w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                            <div>
                                <div className="font-medium text-sm text-purple-800">Superadmin</div>
                                <div className="text-xs text-purple-600 mt-0.5">
                                    Админдин бардык мүмкүнчүлүктөрү + Жөндөөлөр барагы
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Password info */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                        <Key className="h-5 w-5 text-gray-500" /> Сыр сөздөр
                    </h2>
                    <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Admin сыр сөз</div>
                            <div className="text-sm font-mono text-gray-700 bg-white border border-gray-200 rounded px-3 py-2 select-none">
                                {'•'.repeat(8)}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">Сервердеги <code className="bg-gray-100 px-1 rounded">.env</code> файлындагы <code className="bg-gray-100 px-1 rounded">ADMIN_PASSWORD</code></div>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                            <div className="text-xs font-semibold text-purple-500 uppercase tracking-wide mb-1">Superadmin сыр сөз</div>
                            <div className="text-sm font-mono text-gray-700 bg-white border border-purple-200 rounded px-3 py-2 select-none">
                                {'•'.repeat(10)}
                            </div>
                            <div className="text-xs text-purple-400 mt-1">Сервердеги <code className="bg-purple-100 px-1 rounded">.env</code> файлындагы <code className="bg-purple-100 px-1 rounded">SUPERADMIN_PASSWORD</code></div>
                        </div>
                    </div>
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                        Сыр сөздү өзгөртүү үчүн сервердеги <strong>.env</strong> файлын жаңыртып, серверди өчүрүп-күйгүзүңүз.
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Settings;
