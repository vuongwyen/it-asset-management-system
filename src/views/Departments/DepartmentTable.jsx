import { useEffect, useState } from "react";
import axiosClient from "../../axios-client";
import { useStateContext } from "../../contexts/ContextProvider";
import DepartmentModal from "./DepartmentModal";

export default function DepartmentTable() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [meta, setMeta] = useState({});
    const { setNotification } = useStateContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);

    const getDepartments = (url) => {
        url = url || "/departments";
        setLoading(true);
        axiosClient
            .get(url)
            .then(({ data }) => {
                setDepartments(data.data);
                setMeta(data.meta);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        getDepartments();
    }, []);

    const onDeleteClick = (department) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa phòng ban này?")) {
            return;
        }
        axiosClient.delete(`/departments/${department.id}`).then(() => {
            setNotification("Xóa phòng ban thành công");
            getDepartments();
        });
    };

    const openModal = (department = null) => {
        setSelectedDepartment(department);
        setIsModalOpen(true);
    };

    const handleModalSuccess = () => {
        getDepartments();
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold text-gray-900">Quản lý Phòng ban</h1>
                <button
                    onClick={() => openModal()}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm"
                >
                    Add New
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading && (
                            <tr>
                                <td colSpan="4" className="text-center py-4">Loading...</td>
                            </tr>
                        )}
                        {!loading && departments.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center py-4">No departments found</td>
                            </tr>
                        )}
                        {!loading && departments.map((department) => (
                            <tr key={department.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{department.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{department.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{department.manager?.name || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => openModal(department)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => onDeleteClick(department)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Pagination */}
                {!loading && meta && meta.links && (
                    <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-gray-50">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => getDepartments(meta.links[0].url)}
                                disabled={!meta.links[0].url}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => getDepartments(meta.links[meta.links.length - 1].url)}
                                disabled={!meta.links[meta.links.length - 1].url}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{meta.from}</span> to <span className="font-medium">{meta.to}</span> of{' '}
                                    <span className="font-medium">{meta.total}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    {meta.links.map((link, index) => (
                                        <button
                                            key={index}
                                            onClick={() => link.url && getDepartments(link.url)}
                                            disabled={!link.url || link.active}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${link.active
                                                    ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                                } ${!link.url ? "cursor-not-allowed opacity-50" : ""}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        ></button>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <DepartmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                department={selectedDepartment}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
}
