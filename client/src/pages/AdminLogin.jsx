import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../lib/api';
import { Lock, AlertCircle } from 'lucide-react';

const AdminLogin = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await adminLogin(password);
            if (response.data.success) {
                // Store token (simple implementation)
                localStorage.setItem('adminToken', response.data.token);
                navigate('/admin');
            } else {
                setError('Туура эмес сыр сөз');
            }
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError('Туура эмес сыр сөз');
            } else {
                setError('Кирүүдө ката кетти. Сервер уйкуда болушу мүмкүн (Render free tier), 1 мүнөт күтө туруңуз.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
                <div>
                    <div className="mx-auto h-12 w-12 bg-gray-900 rounded-full flex items-center justify-center text-white">
                        <Lock className="h-6 w-6" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Админ кирүү
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-sm text-red-700 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            {error}
                        </div>
                    )}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="password" class="sr-only">Сыр сөз</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md rounded-b-md focus:outline-none focus:ring-gray-900 focus:border-gray-900 focus:z-10 sm:text-sm"
                                placeholder="Админ сыр сөзүн жазыңыз"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                        >
                            Кирүү
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
