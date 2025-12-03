import { useEffect, useState } from "react";
import axiosClient from "../../axios-client";
import { useStateContext } from "../../contexts/ContextProvider";

export default function DepartmentModal({ isOpen, onClose, department, onSuccess }) {
    const { setNotification } = useStateContext();
    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        manager_id: "",
    });

    useEffect(() => {
        // Fetch users for manager selection
        axiosClient.get('/users?all=true').then(({ data }) => {
            // Assuming API supports ?all=true or pagination, here we might just get first page or need a specific endpoint for dropdowns
            // For now, let's assume /users returns paginated data, we might need a dropdown specific endpoint or just use what we have.
            // If /users returns { data: [...] }, we use data.data
            setUsers(data.data || []);
        });
    }, []);

    useEffect(() => {
        if (department) {
            setFormData({
                name: department.name,
                manager_id: department.manager_id || "",
            });
        } else {
            setFormData({
                name: "",
                manager_id: "",
            });
        }
        setErrors(null);
    }, [department, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors(null);

        const payload = { ...formData };
        const request = department
            ? axiosClient.put(`/departments/${department.id}`, payload)
            : axiosClient.post("/departments", payload);

        request
            .then(() => {
                setNotification(department ? "Cập nhật phòng ban thành công" : "Tạo phòng ban thành công");
                onSuccess();
                onClose();
            })
            .catch((err) => {
                const response = err.response;
                if (response && response.status === 422) {
                    setErrors(response.data.errors);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                {department ? "Cập nhật Phòng ban" : "Thêm mới Phòng ban"}
                            </h3>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Tên Phòng ban</label>
                                <input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    placeholder="Nhập tên phòng ban"
                                />
                                {errors?.name && <p className="text-red-500 text-xs italic">{errors.name[0]}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Quản lý (Manager)</label>
                                <select
                                    value={formData.manager_id}
                                    onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
                                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                >
                                    <option value="">Chọn quản lý</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                                {errors?.manager_id && <p className="text-red-500 text-xs italic">{errors.manager_id[0]}</p>}
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                            >
                                {loading ? "Đang xử lý..." : "Lưu"}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
