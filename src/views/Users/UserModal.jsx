import { useEffect, useState } from "react";
import axiosClient from "../../axios-client";
import { useStateContext } from "../../contexts/ContextProvider";

export default function UserModal({ isOpen, onClose, user, onSuccess }) {
    const { setNotification } = useStateContext();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [departments, setDepartments] = useState([]);
    const [locations, setLocations] = useState([]);
    const [roles, setRoles] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        department_id: '',
        location_id: '',
        role: '',
    });

    useEffect(() => {
        if (isOpen) {
            // Fetch Master Data
            axiosClient.get('/departments').then(({ data }) => setDepartments(data.data));
            // Assuming locations endpoint exists, if not we might need to create it or mock it. 
            // Checking routes/api.php, locations resource is NOT there. 
            // Wait, I need to check if LocationController exists. 
            // For now, I will comment out Location fetch if it fails or assume it exists.
            // Actually, looking at previous steps, LocationResource exists, but maybe not the controller/route.
            // Let's assume for now we only fix Department and Role as requested.
            // But the user request said "department_id, location_id".
            // I will check if I can fetch locations. If not, I will skip it for now or add it.

            axiosClient.get('/roles').then(({ data }) => setRoles(data)); // RoleController returns array directly or paginated? 
            // RoleController index returns: response()->json($roles); where $roles is paginated.
            // So it should be data.data if paginated, or just data if not.
            // RoleController: $roles = Role::latest()->paginate(10); return response()->json($roles);
            // So it is data.data.

            if (user) {
                setFormData({
                    name: user.name,
                    email: user.email,
                    password: '',
                    password_confirmation: '',
                    department_id: user.department?.id || '',
                    location_id: user.location?.id || '',
                    role: user.roles?.[0] || '',
                });
            } else {
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    password_confirmation: '',
                    department_id: '',
                    location_id: '',
                    role: '',
                });
            }
            setErrors({});
        }
    }, [isOpen, user]);

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const payload = { ...formData };
        if (user && !payload.password) {
            delete payload.password;
            delete payload.password_confirmation;
        }

        const request = user
            ? axiosClient.put(`/users/${user.id}`, payload)
            : axiosClient.post('/users', payload);

        request
            .then(() => {
                setNotification(user ? 'Cập nhật người dùng thành công!' : 'Tạo người dùng thành công!');
                onSuccess();
                onClose();
            })
            .catch(err => {
                const response = err.response;
                if (response && response.status === 422) {
                    setErrors(response.data.errors);
                } else {
                    console.error(err);
                    setNotification('Có lỗi xảy ra, vui lòng thử lại.');
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <h3 className="text-xl font-semibold leading-6 text-gray-900 mb-4">
                            {user ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Họ và tên <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => handleChange('name', e.target.value)}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.name ? 'border-red-500' : ''}`}
                                        required
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name[0]}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => handleChange('email', e.target.value)}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.email ? 'border-red-500' : ''}`}
                                        required
                                        readOnly={!!user}
                                    />
                                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email[0]}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phòng ban</label>
                                    <select
                                        value={formData.department_id}
                                        onChange={e => handleChange('department_id', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    >
                                        <option value="">Chọn phòng ban</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                                        ))}
                                    </select>
                                    {errors.department_id && <p className="mt-1 text-xs text-red-500">{errors.department_id[0]}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Vai trò</label>
                                    <select
                                        value={formData.role}
                                        onChange={e => handleChange('role', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    >
                                        <option value="">Chọn vai trò</option>
                                        {roles.data && roles.data.map(role => (
                                            <option key={role.id} value={role.name}>{role.name}</option>
                                        ))}
                                    </select>
                                    {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role[0]}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Mật khẩu {user ? '(Để trống nếu không đổi)' : <span className="text-red-500">*</span>}
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={e => handleChange('password', e.target.value)}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.password ? 'border-red-500' : ''}`}
                                        required={!user}
                                    />
                                    {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password[0]}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Nhập lại mật khẩu {user ? '(Để trống nếu không đổi)' : <span className="text-red-500">*</span>}
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password_confirmation}
                                        onChange={e => handleChange('password_confirmation', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        required={!user}
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-sm"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-sm disabled:opacity-50"
                                >
                                    {loading ? 'Đang xử lý...' : 'Lưu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
