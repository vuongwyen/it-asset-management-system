import { useEffect, useState } from "react";
import axiosClient from "../../axios-client";
import ManufacturerModal from "./ManufacturerModal";

export default function ManufacturerTable() {
    const [manufacturers, setManufacturers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [meta, setMeta] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedManufacturer, setSelectedManufacturer] = useState(null);

    useEffect(() => {
        getManufacturers();
    }, []);

    const getManufacturers = (page = 1) => {
        setLoading(true);
        axiosClient.get(`/manufacturers?page=${page}`)
            .then(({ data }) => {
                setLoading(false);
                setManufacturers(data.data);
                setMeta(data.meta);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    const onDelete = (manufacturer) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa hãng sản xuất này?")) {
            return;
        }
        axiosClient.delete(`/manufacturers/${manufacturer.id}`)
            .then(() => {
                getManufacturers(meta.current_page);
            })
            .catch(err => {
                const response = err.response;
                if (response && response.data && response.data.message) {
                    alert(response.data.message);
                }
            });
    };

    const openCreateModal = () => {
        setSelectedManufacturer(null);
        setIsModalOpen(true);
    };

    const openEditModal = (manufacturer) => {
        setSelectedManufacturer(manufacturer);
        setIsModalOpen(true);
    };

    const handleModalSuccess = () => {
        setIsModalOpen(false);
        getManufacturers(meta.current_page);
    };

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Hãng sản xuất</h1>
                <button
                    onClick={openCreateModal}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Thêm mới
                </button>
            </div>

            {/* Data Table */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Support URL</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Support Email</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading && (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-500">Loading...</td>
                                </tr>
                            )}
                            {!loading && manufacturers.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-500">No manufacturers found.</td>
                                </tr>
                            )}
                            {!loading && manufacturers.map(manufacturer => (
                                <tr key={manufacturer.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {manufacturer.image_url ? (
                                            <img
                                                src={manufacturer.image_url}
                                                alt={manufacturer.name}
                                                className="h-16 w-16 object-contain rounded-md border border-gray-200"
                                            />
                                        ) : (
                                            <div className="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                                                <span className="text-xs">No Logo</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900">{manufacturer.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {manufacturer.support_url ? (
                                            <a href={manufacturer.support_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                                                {manufacturer.support_url}
                                            </a>
                                        ) : (
                                            <span className="text-sm text-gray-500">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{manufacturer.support_email || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(manufacturer)}
                                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                                title="Edit"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                </svg>
                                            </button>
                                            <button onClick={() => onDelete(manufacturer)} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50" title="Delete">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && meta.links && (
                    <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-gray-50">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => getManufacturers(meta.current_page - 1)}
                                disabled={meta.current_page === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => getManufacturers(meta.current_page + 1)}
                                disabled={meta.current_page === meta.last_page}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{meta.from}</span> to <span className="font-medium">{meta.to}</span> of <span className="font-medium">{meta.total}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    {meta.links.map((link, index) => (
                                        <button
                                            key={index}
                                            onClick={() => link.url && getManufacturers(link.label.includes('Previous') ? meta.current_page - 1 : (link.label.includes('Next') ? meta.current_page + 1 : link.label))}
                                            disabled={!link.url || link.active}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${link.active ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'} ${index === 0 ? 'rounded-l-md' : ''} ${index === meta.links.length - 1 ? 'rounded-r-md' : ''}`}
                                        >
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Manufacturer Modal */}
            <ManufacturerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                manufacturer={selectedManufacturer}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
}
