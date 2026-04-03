import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers } from '../lib/api';
import { Trophy, Medal, Search, ArrowLeft, MapPin, Languages, X } from 'lucide-react';

const Leaderboard = () => {
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [gender, setGender] = useState('all');
    const [birthYear, setBirthYear] = useState('all');
    const [filterRegion, setFilterRegion] = useState('all');
    const [filterLanguage, setFilterLanguage] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }
        getUsers({})
            .then(res => setAllUsers(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [navigate]);

    const ranked = useMemo(() => {
        return allUsers
            .filter(u => u.etapScores && u.etapScores.length > 0)
            .map(u => ({
                ...u,
                avgScore: u.etapScores.reduce((sum, s) => sum + s.ball, 0) / u.etapScores.length,
                etapCount: u.etapScores.length,
            }))
            .sort((a, b) => b.avgScore - a.avgScore);
    }, [allUsers]);

    const filtered = useMemo(() => {
        let list = ranked;
        if (gender !== 'all') list = list.filter(u => u.gender === gender);
        if (birthYear !== 'all') list = list.filter(u => String(u.birthYear) === String(birthYear));
        if (filterRegion !== 'all') list = list.filter(u => u.region === filterRegion);
        if (filterLanguage !== 'all') list = list.filter(u => u.participationLanguage === filterLanguage);
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter(u =>
                `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
                String(u.competitionId).includes(q) ||
                (u.phone && u.phone.includes(q))
            );
        }
        return list;
    }, [ranked, gender, birthYear, filterRegion, filterLanguage, search]);

    const hasActiveFilters = search || gender !== 'all' || birthYear !== 'all' || filterRegion !== 'all' || filterLanguage !== 'all';
    const noFiltersActive = !search && gender === 'all' && birthYear === 'all' && filterRegion === 'all' && filterLanguage === 'all';

    const clearFilters = () => {
        setSearch('');
        setGender('all');
        setBirthYear('all');
        setFilterRegion('all');
        setFilterLanguage('all');
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
        if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
        if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
        return <span className="text-sm font-bold text-gray-400 w-5 text-center">{rank}</span>;
    };

    const getRankBg = (rank) => {
        if (rank === 1) return 'bg-yellow-50 border-yellow-200';
        if (rank === 2) return 'bg-gray-50 border-gray-200';
        if (rank === 3) return 'bg-amber-50 border-amber-200';
        return 'bg-white border-gray-100';
    };

    const getScoreBadge = (avg) => {
        if (avg >= 90) return 'bg-green-100 text-green-800';
        if (avg >= 70) return 'bg-blue-100 text-blue-700';
        if (avg >= 50) return 'bg-yellow-100 text-yellow-700';
        return 'bg-red-100 text-red-600';
    };

    const selectClass = "border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white";

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Yuklanmoqda...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b shadow-sm sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={() => navigate('/admin')}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    <h1 className="text-lg font-bold text-gray-900 flex-1">Лидер борд</h1>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {filtered.length} катышуучу
                    </span>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50"
                        >
                            <X className="h-3 w-3" /> Тазала
                        </button>
                    )}
                </div>

                {/* Search */}
                <div className="max-w-3xl mx-auto px-4 pb-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Аты же ID боюнча издоо..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="max-w-3xl mx-auto px-4 pb-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <select value={gender} onChange={e => setGender(e.target.value)} className={selectClass}>
                        <option value="all">Бардык жыныстар</option>
                        <option value="Уул">Уул (Эркек)</option>
                        <option value="Кыз">Кыз (Аял)</option>
                    </select>
                    <select value={birthYear} onChange={e => setBirthYear(e.target.value)} className={selectClass}>
                        <option value="all">Бардык жылаар</option>
                        {[2013, 2014, 2015, 2016, 2017, 2018, 2019].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <select value={filterRegion} onChange={e => setFilterRegion(e.target.value)} className={selectClass}>
                        <option value="all">Бардык райондор</option>
                        <option value="Ош">Ош</option>
                        <option value="Манас">Манас</option>
                        <option value="Өзгөн">Өзгөн</option>
                        <option value="Ноокат">Ноокат</option>
                        <option value="Кызыл-кыя">Кызыл-кыя</option>
                        <option value="Араван">Араван</option>
                        <option value="Башка район">Башка район</option>
                        <option value="Башка республика">Башка республика</option>
                    </select>
                    <select value={filterLanguage} onChange={e => setFilterLanguage(e.target.value)} className={selectClass}>
                        <option value="all">Бардык тилдер</option>
                        <option value="Өзбек тили">Өзбек тили</option>
                        <option value="Кыргыз тили">Кыргыз тили</option>
                    </select>
                </div>
            </div>

            {/* Top 3 podium */}
            {filtered.length >= 3 && noFiltersActive && (
                <div className="max-w-3xl mx-auto px-4 pt-5 pb-2">
                    <div className="flex items-end justify-center gap-3">
                        {/* 2nd */}
                        <div className="flex-1 max-w-40 bg-white border-2 border-gray-200 rounded-xl p-3 text-center shadow-sm">
                            <Medal className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                            <div className="text-xs text-gray-400 font-medium mb-1">2-орун</div>
                            <div className="font-bold text-sm text-gray-800 leading-tight">
                                {filtered[1].firstName} {filtered[1].lastName}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">#{filtered[1].competitionId}</div>
                            <div className="mt-2 text-2xl font-black text-gray-600">
                                {filtered[1].avgScore.toFixed(1)}
                            </div>
                        </div>
                        {/* 1st */}
                        <div className="flex-1 max-w-45 bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 text-center shadow-md -mt-4">
                            <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-1" />
                            <div className="text-xs text-yellow-600 font-bold mb-1">1-орун</div>
                            <div className="font-bold text-sm text-gray-800 leading-tight">
                                {filtered[0].firstName} {filtered[0].lastName}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">#{filtered[0].competitionId}</div>
                            <div className="mt-2 text-3xl font-black text-yellow-600">
                                {filtered[0].avgScore.toFixed(1)}
                            </div>
                        </div>
                        {/* 3rd */}
                        <div className="flex-1 max-w-40 bg-amber-50 border-2 border-amber-200 rounded-xl p-3 text-center shadow-sm">
                            <Medal className="h-6 w-6 text-amber-600 mx-auto mb-1" />
                            <div className="text-xs text-amber-600 font-medium mb-1">3-орун</div>
                            <div className="font-bold text-sm text-gray-800 leading-tight">
                                {filtered[2].firstName} {filtered[2].lastName}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">#{filtered[2].competitionId}</div>
                            <div className="mt-2 text-2xl font-black text-amber-600">
                                {filtered[2].avgScore.toFixed(1)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Full list */}
            <div className="max-w-3xl mx-auto px-4 py-4 space-y-2">
                {filtered.length === 0 ? (
                    <div className="text-center text-gray-400 py-16">Натыйжа жок</div>
                ) : (
                    filtered.map((user, idx) => {
                        const rank = idx + 1;
                        return (
                            <div
                                key={user._id}
                                className={`flex items-center gap-3 border rounded-xl px-4 py-3 ${getRankBg(rank)}`}
                            >
                                <div className="w-7 flex items-center justify-center shrink-0">
                                    {getRankIcon(rank)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded">
                                            #{user.competitionId}
                                        </span>
                                        <span className="font-semibold text-gray-800 text-sm">
                                            {user.firstName} {user.lastName}
                                        </span>
                                        <span className="text-xs text-gray-400">{user.gender} · {user.birthYear}</span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                        <span className="flex items-center gap-1 text-xs text-gray-400">
                                            <MapPin className="h-3 w-3" />{user.region}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-gray-400">
                                            <Languages className="h-3 w-3" />{user.participationLanguage}
                                        </span>
                                        <span className="text-xs text-gray-400">{user.etapCount} этап</span>
                                    </div>
                                </div>
                                <div className={`text-lg font-black px-3 py-1 rounded-lg ${getScoreBadge(user.avgScore)}`}>
                                    {user.avgScore.toFixed(1)}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
