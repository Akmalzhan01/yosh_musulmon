import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, toggleArrived, deleteUser, updateUser } from '../lib/api';
import { Search, LogOut, RefreshCw, MapPin, Calendar, Languages, Filter, X, Trash2, Edit } from 'lucide-react';
import EditUserModal from '../components/EditUserModal';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters State
    const [search, setSearch] = useState('');
    const [gender, setGender] = useState('all');
    const [region, setRegion] = useState('all');
    const [birthYear, setBirthYear] = useState('all');
    const [participationLanguage, setParticipationLanguage] = useState('all');

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
        }
    }, [navigate]);

    // Fetch users when any filter changes
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchUsers();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [search, gender, region, birthYear, participationLanguage]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = {
                search,
                gender,
                region,
                birthYear,
                participationLanguage
            };
            console.log('Fetching users with params:', params);
            const response = await getUsers(params);
            console.log('Users fetched:', response.data.length);
            setUsers(response.data);
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
        // Optimistic update
        console.log('Toggling user:', id);
        setUsers(users.map(user =>
            user._id === id ? { ...user, arrived: !user.arrived } : user
        ));

        try {
            await toggleArrived(id);
        } catch (error) {
            console.error('Error toggling status:', error);
            // Revert on error
            fetchUsers();
        }
    };

    const handleDelete = async (id) => {
        console.log('Attempting to delete user:', id);
        if (window.confirm('Сиз чын эле бул колдонуучуну өчүрүүнү каалайсызбы?')) {
            try {
                // Optimistic UI update
                setUsers(users.filter(user => user._id !== id));
                await deleteUser(id);
                console.log('User deleted successfully:', id);
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Өчүрүүдө ката кетти');
                fetchUsers(); // Revert on error
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
            setIsEditModalOpen(false);
            fetchUsers(); // Refresh list to show updated data
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Жаңыртууда ката кетти');
        }
    };

    const clearFilters = () => {
        console.log('Clearing filters');
        setSearch('');
        setGender('all');
        setRegion('all');
        setBirthYear('all');
        setParticipationLanguage('all');
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    const hasActiveFilters = search || gender !== 'all' || region !== 'all' || birthYear !== 'all' || participationLanguage !== 'all';

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <header className="bg-white shadow sticky top-0 z-10">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <span>Катышуучулар</span>
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                            {users.length}
                        </span>
                    </h1>
                    <button
                        onClick={handleLogout}
                        className="flex items-center text-gray-600 hover:text-red-600 transition p-2 rounded-lg hover:bg-gray-100"
                    >
                        <LogOut className="h-5 w-5 mr-1" />
                        <span className="hidden sm:inline">Чыгуу</span>
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Filters Section */}
                <div className="bg-white p-4 shadow-sm sm:rounded-lg mb-6 mx-4 sm:mx-0 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-gray-700 font-medium">
                            <Filter className="h-5 w-5" />
                            Фильтрлер
                        </div>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center text-sm text-red-600 hover:text-red-800 transition"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Тазалоо
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Search */}
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
                                placeholder="Издоо..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Gender Filter */}
                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                            <option value="all">Бардык жыныстар</option>
                            <option value="Эркек">Эркек</option>
                            <option value="Аял">Аял</option>
                        </select>

                        {/* Year Filter */}
                        <select
                            value={birthYear}
                            onChange={(e) => setBirthYear(e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                            <option value="all">Бардык жылаар</option>
                            {[2014, 2015, 2016, 2017, 2018, 2019].map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>

                        {/* Region Filter */}
                        <select
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
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

                        {/* Language Filter */}
                        <select
                            value={participationLanguage}
                            onChange={(e) => setParticipationLanguage(e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                            <option value="all">Бардык тилдер</option>
                            <option value="Өзбек тили">Өзбек тили</option>
                            <option value="Кыргыз тили">Кыргыз тили</option>
                        </select>
                    </div>
                </div>

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
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
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

                                        <div className="ml-4 flex-shrink-0 flex items-center gap-2">
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

            </main>

            {/* Edit Modal */}
            <EditUserModal
                user={currentUser}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleUpdateUser}
            />
        </div>
    );
};

export default AdminDashboard;
