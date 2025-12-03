import { useEffect, useState } from "react";
import axiosClient from "../../axios-client";
import { useStateContext } from "../../contexts/ContextProvider";
import RoleModal from "./RoleModal";

export default function RoleTable() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [meta, setMeta] = useState({});
    const { setNotification } = useStateContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);

    const getRoles = (url) => {
        url = url || "/roles";
        setLoading(true);
        axiosClient
            .get(url)
            .then(({ data }) => {
                setRoles(data.data);
                setMeta(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        getRoles();
    }, []);

    const onDeleteClick = (role) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa vai trò này?")) {
            return;
        }
        axiosClient.delete(`/roles/${role.id}`).then(() => {
            setNotification("Xóa vai trò thành công");
            getRoles();
        });
    };

    const openModal = (role = null) => {
        setSelectedRole(role);
        setIsModalOpen(true);
    };

    const handleModalSuccess = () => {
        getRoles();
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold text-gray-900">Quản lý Vai trò</h1>
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guard Name</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading && (
                            <tr>
                                <td colSpan="4" className="text-center py-4">Loading...</td>
                            </tr>
                        )}
                        {!loading && roles.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center py-4">No roles found</td>
                            </tr>
                        )}
                        {!loading && roles.map((role) => (
                            <tr key={role.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.guard_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => openModal(role)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => onDeleteClick(role)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Pagination if needed */}
                {!loading && meta.links && (
                    <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-gray-50">
                        {/* Simple pagination logic or reuse a Pagination component */}
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => getRoles(meta.prev_page_url)}
                                disabled={!meta.prev_page_url}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => getRoles(meta.next_page_url)}
                                disabled={!meta.next_page_url}
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
                                            onClick={() => link.url && getRoles(link.url)}
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

            <RoleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                role={selectedRole}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
}
