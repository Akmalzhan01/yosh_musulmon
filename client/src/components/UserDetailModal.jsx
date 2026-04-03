import React, { useState } from 'react';
import { X, Plus, Trash2, MapPin, Calendar, Languages, Phone, Edit } from 'lucide-react';
import { updateScore, deleteScore } from '../lib/api';

const UserDetailModal = ({ user, isOpen, onClose, onUserUpdated, onToggle, onEdit, onDelete }) => {
    const [etap, setEtap] = useState('');
    const [ball, setBall] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen || !user) return null;

    const scores = user.etapScores || [];
    const avgScore = scores.length > 0
        ? (scores.reduce((sum, s) => sum + s.ball, 0) / scores.length).toFixed(1)
        : null;

    const handleAddScore = async (e) => {
        e.preventDefault();
        if (!etap || ball === '') return;
        const etapNum = parseInt(etap);
        const ballNum = parseFloat(ball);
        if (isNaN(etapNum) || isNaN(ballNum)) return;

        setSaving(true);
        setError('');
        try {
            const res = await updateScore(user._id, etapNum, ballNum);
            onUserUpdated(res.data.user);
            setEtap('');
            setBall('');
        } catch {
            setError('Saqlashda xato');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteScore = async (etapNum) => {
        try {
            const res = await deleteScore(user._id, etapNum);
            onUserUpdated(res.data.user);
        } catch {
            setError('O\'chirishda xato');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b">
                    <div className="flex items-center gap-3">
                        <span className="bg-blue-600 text-white font-bold text-lg px-3 py-1 rounded-lg">
                            #{user.competitionId || '—'}
                        </span>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {user.firstName} {user.lastName}
                            </h2>
                            <p className="text-sm text-gray-500">{user.phone}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* User info */}
                <div className="p-5 grid grid-cols-2 gap-3 border-b">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{user.birthYear} — {user.gender}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{user.region}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Languages className="h-4 w-4 text-gray-400" />
                        <span>{user.participationLanguage}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{user.phone}</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2 text-sm">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.arrived ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                            {user.arrived ? 'Келди' : 'Келген жок'}
                        </span>
                        {user.arrivedAt && (
                            <span className="text-xs text-gray-400">
                                {new Date(user.arrivedAt).toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>

                {/* Scores */}
                <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-800">Этап баллдары</h3>
                        {avgScore !== null && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1 text-sm">
                                <span className="text-gray-500">Орточо:</span>
                                <span className="font-bold text-blue-700 ml-1">{avgScore}</span>
                            </div>
                        )}
                    </div>

                    {scores.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-3">Балл кирителген жок</p>
                    ) : (
                        <div className="space-y-2 mb-4">
                            {[...scores].sort((a, b) => a.etap - b.etap).map(s => (
                                <div key={s.etap} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                                    <span className="text-sm font-medium text-gray-700">{s.etap}-этап</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-bold text-blue-600">{s.ball}</span>
                                        <button
                                            onClick={() => handleDeleteScore(s.etap)}
                                            className="p-1 text-gray-300 hover:text-red-500 transition"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add score form */}
                    <form onSubmit={handleAddScore} className="flex gap-2 mt-3">
                        <input
                            type="number"
                            min="1"
                            placeholder="Этап"
                            value={etap}
                            onChange={e => setEtap(e.target.value)}
                            className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <input
                            type="number"
                            step="0.1"
                            placeholder="Балл"
                            value={ball}
                            onChange={e => setBall(e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <button
                            type="submit"
                            disabled={saving || !etap || ball === ''}
                            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-40 transition flex items-center gap-1"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </form>
                    {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                </div>

                {/* Mobile actions — only shown on small screens */}
                {(onToggle || onEdit || onDelete) && (
                    <div className="sm:hidden border-t px-5 py-4 flex items-center gap-3">
                        {onToggle && (
                            <button
                                onClick={() => onToggle(user._id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition ${
                                    user.arrived
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <span>{user.arrived ? '✓ Келди' : 'Келген жок'}</span>
                            </button>
                        )}
                        {onEdit && (
                            <button
                                onClick={() => onEdit(user)}
                                className="flex items-center justify-center gap-1 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm font-semibold transition"
                            >
                                <Edit className="h-4 w-4" /> Оңдоо
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => onDelete(user._id)}
                                className="flex items-center justify-center gap-1 px-4 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 text-sm font-semibold transition"
                            >
                                <Trash2 className="h-4 w-4" /> Өчүрүү
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDetailModal;
