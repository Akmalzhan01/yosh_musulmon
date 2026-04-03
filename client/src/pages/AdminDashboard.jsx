import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, toggleArrived, deleteUser, updateUser, migrateIds, createUser } from '../lib/api';
import { Search, LogOut, RefreshCw, MapPin, Calendar, Languages, Filter, X, Trash2, Edit, Menu, Trophy, Settings, UserPlus } from 'lucide-react';
import EditUserModal from '../components/EditUserModal';
import UserDetailModal from '../components/UserDetailModal';
import AddUserModal from '../components/AddUserModal';

const PAGE_SIZE = 50;

const AdminDashboard = () => {
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const isSuperAdmin = localStorage.getItem('adminRole') === 'superadmin';
    const [page, setPage] = useState(1);

    // Filters State - localStorage dan o'qib boshlash
    const savedFilters = JSON.parse(localStorage.getItem('adminFilters') || '{}');
    const [searchInput, setSearchInput] = useState(savedFilters.search || '');
    const [search, setSearch] = useState(savedFilters.search || '');
    const [gender, setGender] = useState(savedFilters.gender || 'all');
    const [region, setRegion] = useState(savedFilters.region || 'all');
    const [birthYear, setBirthYear] = useState(savedFilters.birthYear || 'all');
    const [participationLanguage, setParticipationLanguage] = useState(savedFilters.participationLanguage || 'all');

    const debounceRef = useRef(null);
    const handleSearchChange = useCallback((e) => {
        const val = e.target.value;
        setSearchInput(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setSearch(val);
            setPage(1);
        }, 300);
    }, []);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Detail Modal State
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [detailUser, setDetailUser] = useState(null);

    // Add User Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Mobile filter drawer
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }
        fetchUsers();
    }, []);

    // Filterlarni localStorage ga saqlash
    useEffect(() => {
        localStorage.setItem('adminFilters', JSON.stringify({ search: searchInput, gender, region, birthYear, participationLanguage }));
    }, [searchInput, gender, region, birthYear, participationLanguage]);

    // Filter o'zgarganda page ni reset qilish
    useEffect(() => { setPage(1); }, [gender, region, birthYear, participationLanguage]);

    // Client-side filter — server ga murojaat qilmaydi
    const filteredUsers = useMemo(() => {
        return allUsers.filter(user => {
            if (search) {
                const q = search.toLowerCase();
                const match =
                    user.firstName?.toLowerCase().includes(q) ||
                    user.lastName?.toLowerCase().includes(q) ||
                    user.phone?.includes(q) ||
                    String(user.competitionId).includes(q);
                if (!match) return false;
            }
            if (gender !== 'all' && user.gender !== gender) return false;
            if (region !== 'all' && user.region !== region) return false;
            if (birthYear !== 'all' && String(user.birthYear) !== String(birthYear)) return false;
            if (participationLanguage !== 'all' && user.participationLanguage !== participationLanguage) return false;
            return true;
        });
    }, [allUsers, search, gender, region, birthYear, participationLanguage]);

    const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
    const users = useMemo(() => filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filteredUsers, page]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await getUsers({});
            setAllUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            if (error.response && error.response.status === 401) {
                navigate('/admin/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id) => {
        setAllUsers(allUsers.map(user =>
            user._id === id ? { ...user, arrived: !user.arrived } : user
        ));
        try {
            await toggleArrived(id);
        } catch (error) {
            console.error('Error toggling status:', error);
            fetchUsers();
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Сиз чын эле бул колдонуучуну өчүрүүнү каалайсызбы?')) {
            try {
                setAllUsers(allUsers.filter(user => user._id !== id));
                await deleteUser(id);
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Өчүрүүдө ката кетти');
                fetchUsers();
            }
        }
    };

    const handleEditClick = (user) => {
        setCurrentUser(user);
        setIsEditModalOpen(true);
    };

    const handleUpdateUser = async (id, updatedData) => {
        try {
            await updateUser(id, updatedData);
            setAllUsers(allUsers.map(user => user._id === id ? { ...user, ...updatedData } : user));
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Жаңыртууда ката кетти');
        }
    };

    const handleOpenDetail = (user) => {
        setDetailUser(user);
        setIsDetailModalOpen(true);
    };

    const handleUserUpdated = (updatedUser) => {
        setAllUsers(allUsers.map(u => u._id === updatedUser._id ? updatedUser : u));
        setDetailUser(updatedUser);
    };

    const handleMigrateIds = async () => {
        if (!window.confirm('Mavjud userlarga ID berish (1100dan boshlab)?')) return;
        try {
            const res = await migrateIds();
            alert(res.data.message);
            fetchUsers();
        } catch (e) {
            alert('Xato: ' + (e.response?.data?.message || e.message));
        }
    };

    const handleAddUser = async (formData) => {
        const res = await createUser(formData);
        setAllUsers([res.data.user, ...allUsers]);
    };

    const clearFilters = () => {
        setSearchInput('');
        setSearch('');
        setGender('all');
        setRegion('all');
        setBirthYear('all');
        setParticipationLanguage('all');
        setPage(1);
        localStorage.removeItem('adminFilters');
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminRole');
        navigate('/admin/login');
    };

    const hasActiveFilters = searchInput || gender !== 'all' || region !== 'all' || birthYear !== 'all' || participationLanguage !== 'all';

    const filterSelects = (
        <>
            <select value={gender} onChange={(e) => setGender(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option value="all">Бардык жыныстар</option>
                <option value="Уул">Уул (Эркек)</option>
                <option value="Кыз">Кыз (Аял)</option>
            </select>
            <select value={birthYear} onChange={(e) => setBirthYear(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option value="all">Бардык жылаар</option>
                {[2013, 2014, 2015, 2016, 2017, 2018, 2019].map(year => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </select>
            <select value={region} onChange={(e) => setRegion(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
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
            <select value={participationLanguage} onChange={(e) => setParticipationLanguage(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option value="all">Бардык тилдер</option>
                <option value="Өзбек тили">Өзбек тили</option>
                <option value="Кыргыз тили">Кыргыз тили</option>
            </select>
        </>
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <header className="bg-white shadow sticky top-0 z-20">
                <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex items-center gap-3">
                    {/* Search — always visible */}
                    <div className="relative flex-1 max-w-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-9 sm:text-sm border-gray-300 rounded-md py-2"
                            placeholder="Издоо..."
                            value={searchInput}
                            onChange={handleSearchChange}
                        />
                    </div>

                    {/* Title + count — hidden on mobile */}
                    <h1 className="hidden sm:flex text-xl font-bold text-gray-900 items-center gap-2 shrink-0">
                        <span>Катышуучулар</span>
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                            {filteredUsers.length}
                        </span>
                    </h1>
                    {/* Count badge on mobile */}
                    <span className="sm:hidden bg-blue-100 text-blue-800 text-sm font-medium px-2 py-0.5 rounded-full shrink-0">
                        {filteredUsers.length}
                    </span>

                    <div className="flex items-center gap-1 ml-auto shrink-0">
                        {/* Add User button */}
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-1 text-green-600 hover:text-green-700 transition p-2 rounded-lg hover:bg-green-50"
                            title="Катышуучу кошуу"
                        >
                            <UserPlus className="h-5 w-5" />
                        </button>

                        {/* Leaderboard button */}
                        <button
                            onClick={() => navigate('/admin/leaderboard')}
                            className="flex items-center gap-1 text-yellow-600 hover:text-yellow-700 transition p-2 rounded-lg hover:bg-yellow-50"
                            title="Лидер борд"
                        >
                            <Trophy className="h-5 w-5" />
                        </button>

                        {/* Settings — superadmin only */}
                        {isSuperAdmin && (
                            <button
                                onClick={() => navigate('/admin/settings')}
                                className="flex items-center text-purple-600 hover:text-purple-700 transition p-2 rounded-lg hover:bg-purple-50"
                                title="Жөндөөлөр"
                            >
                                <Settings className="h-5 w-5" />
                            </button>
                        )}

                        {/* Burger — mobile only */}
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className="sm:hidden relative p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                        >
                            <Menu className="h-5 w-5" />
                            {hasActiveFilters && (
                                <span className="absolute top-1 right-1 h-2 w-2 bg-blue-600 rounded-full" />
                            )}
                        </button>

                        <button onClick={handleLogout}
                            className="flex items-center text-gray-600 hover:text-red-600 transition p-2 rounded-lg hover:bg-gray-100">
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile filter drawer */}
            {isFilterOpen && (
                <div className="fixed inset-0 z-30 flex">
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-black bg-opacity-40" onClick={() => setIsFilterOpen(false)} />
                    {/* Drawer */}
                    <div className="relative ml-auto w-72 bg-white h-full shadow-xl flex flex-col">
                        <div className="flex items-center justify-between px-4 py-4 border-b">
                            <div className="flex items-center gap-2 font-semibold text-gray-800">
                                <Filter className="h-4 w-4" />
                                Фильтрлер
                            </div>
                            <button onClick={() => setIsFilterOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                            {filterSelects}
                            {hasActiveFilters && (
                                <button onClick={() => { clearFilters(); setIsFilterOpen(false); }}
                                    className="w-full flex items-center justify-center gap-1 text-sm text-red-600 border border-red-200 rounded-md py-2 hover:bg-red-50">
                                    <X className="h-4 w-4" /> Тазалоо
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <main className="max-w-7xl mx-auto py-4 sm:py-6 sm:px-6 lg:px-8">
                {/* Desktop Filters */}
                <div className="hidden sm:block bg-white p-4 shadow-sm rounded-lg mb-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-gray-700 font-medium text-sm">
                            <Filter className="h-4 w-4" />
                            Фильтрлер
                        </div>
                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="flex items-center text-sm text-red-600 hover:text-red-800">
                                <X className="h-4 w-4 mr-1" /> Тазалоо
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {filterSelects}
                    </div>
                </div>

                {/* Mobile active filter badges */}
                {hasActiveFilters && (
                    <div className="sm:hidden flex items-center gap-2 px-4 mb-3 flex-wrap">
                        {gender !== 'all' && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{gender}</span>}
                        {birthYear !== 'all' && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{birthYear}</span>}
                        {region !== 'all' && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{region}</span>}
                        {participationLanguage !== 'all' && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{participationLanguage}</span>}
                        <button onClick={clearFilters} className="text-xs text-red-500 underline">Тазалоо</button>
                    </div>
                )}

                {/* Users List */}
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {loading ? (
                            <li className="p-8 text-center text-gray-500">
                                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                                Жүктөлүүдө...
                            </li>
                        ) : users.length === 0 ? (
                            <li className="p-8 text-center text-gray-500 py-12">
                                <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-lg font-medium text-gray-900">Эч ким табылган жок</p>
                                <p className="text-gray-500">Фильтрлерди өзгөртүп көрүңүз</p>
                            </li>
                        ) : (
                            users.map((user) => (
                                <li key={user._id}>
                                    <div className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50 transition group">
                                        <div
                                            className="flex-1 min-w-0 cursor-pointer"
                                            onClick={() => handleOpenDetail(user)}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                {user.competitionId && (
                                                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded shrink-0">
                                                        #{user.competitionId}
                                                    </span>
                                                )}
                                                <p className="text-lg font-bold text-blue-600 truncate group-hover:text-blue-800 transition">
                                                    {user.firstName} {user.lastName}
                                                </p>
                                                {user.arrived && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                        Келди
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center mb-2">
                                                <p className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-0.5 rounded">
                                                    {user.phone}
                                                </p>
                                                <span className="text-xs text-gray-400 ml-2 hidden sm:inline-block">
                                                    {new Date(user.registeredAt).toLocaleDateString()}
                                                </span>
                                                {user.etapScores?.length > 0 && (
                                                    <span className="ml-2 text-xs bg-yellow-50 border border-yellow-200 text-yellow-700 px-2 py-0.5 rounded">
                                                        Орт: {(user.etapScores.reduce((s, e) => s + e.ball, 0) / user.etapScores.length).toFixed(1)}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap text-xs sm:text-sm text-gray-500 gap-x-4 gap-y-2 mt-2">
                                                <span className="flex items-center px-2 py-1 bg-gray-50 rounded-md border border-gray-100">
                                                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                                    {user.birthYear} ({user.gender})
                                                </span>
                                                <span className="flex items-center px-2 py-1 bg-gray-50 rounded-md border border-gray-100">
                                                    <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                                    {user.region}
                                                </span>
                                                <span className="flex items-center px-2 py-1 bg-gray-50 rounded-md border border-gray-100">
                                                    <Languages className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                                    {user.participationLanguage}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="ml-4 flex-shrink-0 hidden sm:flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggle(user._id)}
                                                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${user.arrived ? 'bg-green-500' : 'bg-gray-200'}`}
                                                title={user.arrived ? "Келбеди деп белгилөө" : "Келди деп белгилөө"}
                                            >
                                                <span className="sr-only">Келгендигин белгилөө</span>
                                                <span
                                                    aria-hidden="true"
                                                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${user.arrived ? 'translate-x-5' : 'translate-x-0'}`}
                                                />
                                            </button>

                                            <button
                                                onClick={() => handleEditClick(user)}
                                                className="p-2 text-gray-400 hover:text-blue-600 transition rounded-full hover:bg-blue-50"
                                                title="Оңдоо"
                                            >
                                                <Edit className="h-5 w-5" />
                                            </button>

                                            <button
                                                onClick={() => handleDelete(user._id)}
                                                className="p-2 text-gray-400 hover:text-red-600 transition rounded-full hover:bg-red-50"
                                                title="Өчүрүү"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 px-2">
                        <span className="text-sm text-gray-500">
                            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredUsers.length)} / {filteredUsers.length}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 text-sm rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100"
                            >
                                ← Мурунку
                            </button>
                            <span className="px-3 py-1 text-sm text-gray-700">{page} / {totalPages}</span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1 text-sm rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100"
                            >
                                Кийинки →
                            </button>
                        </div>
                    </div>
                )}

            </main>

            {/* Add User Modal */}
            <AddUserModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddUser}
            />

            {/* Edit Modal */}
            <EditUserModal
                user={currentUser}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleUpdateUser}
            />

            {/* Detail Modal */}
            <UserDetailModal
                user={detailUser}
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                onUserUpdated={handleUserUpdated}
                onToggle={(id) => { handleToggle(id); }}
                onEdit={(user) => { setIsDetailModalOpen(false); handleEditClick(user); }}
                onDelete={(id) => { setIsDetailModalOpen(false); handleDelete(id); }}
            />
        </div>
    );
};

export default AdminDashboard;
