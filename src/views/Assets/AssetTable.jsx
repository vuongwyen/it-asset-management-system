import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../axios-client";
import StatusBadge from "./StatusBadge";
import useDebounce from "../../hooks/useDebounce";
import AssetModal from "./AssetModal";
import CheckoutModal from "./CheckoutModal";
import CheckinModal from "./CheckinModal";
import ImportAssetModal from "./ImportAssetModal";

export default function AssetTable() {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [meta, setMeta] = useState({});

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);

    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isCheckinOpen, setIsCheckinOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [transactionAsset, setTransactionAsset] = useState(null);

    // Filters state
    const [filters, setFilters] = useState({
        search: '',
        status_id: '',
        category_id: ''
    });

    // Debounce search term
    const debouncedSearch = useDebounce(filters.search, 500);

    // Filter options state
    const [categories, setCategories] = useState([]);
    const [statuses, setStatuses] = useState([]);

    // Fetch initial data (options)
    useEffect(() => {
        axiosClient.get('/categories')
            .then(({ data }) => setCategories(data.data || data))
            .catch(err => console.error(err));

        axiosClient.get('/status-labels')
            .then(({ data }) => setStatuses(data.data || data))
            .catch(err => console.error(err));
    }, []);

    // Fetch assets when page or filters change
    useEffect(() => {
        getAssets();
    }, [debouncedSearch, filters.status_id, filters.category_id]);

    const getAssets = (page = 1) => {
        setLoading(true);
        const params = {
            page,
            search: debouncedSearch,
            status_id: filters.status_id,
            category_id: filters.category_id
        };

        axiosClient.get('/assets', { params })
            .then(({ data }) => {
                setLoading(false);
                setAssets(data.data);
                setMeta(data.meta);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    const onDelete = (asset) => {
        if (!window.confirm("Are you sure you want to delete this asset?")) {
            return;
        }
        axiosClient.delete(`/assets/${asset.id}`)
            .then(() => {
                getAssets(meta.current_page);
            });
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const openCreateModal = () => {
        setSelectedAsset(null);
        setIsModalOpen(true);
    };

    const openEditModal = (asset) => {
        setSelectedAsset(asset);
        setIsModalOpen(true);
    };

    const openCheckoutModal = (asset) => {
        setTransactionAsset(asset);
        setIsCheckoutOpen(true);
    };

    const openCheckinModal = (asset) => {
        setTransactionAsset(asset);
        setIsCheckinOpen(true);
    };

    const handleModalSuccess = () => {
        setIsModalOpen(false);
        setIsCheckoutOpen(false);
        setIsCheckinOpen(false);
        setIsImportOpen(false);
        getAssets(meta.current_page);
    };

    const currencyFormat = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    });

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Tài sản</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsImportOpen(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        Import Excel
                    </button>
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
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                    <input
                        type="text"
                        placeholder="Tìm theo tên hoặc tag..."
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={filters.search}
                        onChange={e => handleFilterChange('search', e.target.value)}
                    />
                </div>
                <div className="w-48">
                    <select
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={filters.status_id}
                        onChange={e => handleFilterChange('status_id', e.target.value)}
                    >
                        <option value="">Tất cả trạng thái</option>
                        {statuses.map(status => (
                            <option key={status.id} value={status.id}>{status.name}</option>
                        ))}
                    </select>
                </div>
                <div className="w-48">
                    <select
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={filters.category_id}
                        onChange={e => handleFilterChange('category_id', e.target.value)}
                    >
                        <option value="">Tất cả loại</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Tag / Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category / Model</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading && (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500">Loading...</td>
                                </tr>
                            )}
                            {!loading && assets.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500">No assets found.</td>
                                </tr>
                            )}
                            {!loading && assets.map(asset => (
                                <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {asset.image ? (
                                            <img src={`http://127.0.0.1:8000/storage/${asset.image}`} alt="" className="h-10 w-10 rounded-full object-cover border border-gray-200" />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                                </svg>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900">{asset.name || 'N/A'}</div>
                                        <div className="text-xs text-gray-500">{asset.asset_tag}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{asset.model?.category?.name}</div>
                                        <div className="text-xs text-gray-500">{asset.model?.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge type={asset.status_label?.type} label={asset.status_label?.name} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {currencyFormat.format(asset.purchase_cost)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2 items-center">
                                            {/* Transaction Buttons */}
                                            {asset.status_label?.type === 'deployable' && (
                                                <button
                                                    onClick={() => openCheckoutModal(asset)}
                                                    className="bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded text-xs font-semibold mr-2"
                                                >
                                                    Cấp phát
                                                </button>
                                            )}
                                            {asset.status_label?.type === 'deployed' && (
                                                <button
                                                    onClick={() => openCheckinModal(asset)}
                                                    className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-2 py-1 rounded text-xs font-semibold mr-2"
                                                >
                                                    Thu hồi
                                                </button>
                                            )}

                                            <button
                                                onClick={() => openEditModal(asset)}
                                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                                title="Edit"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                </svg>
                                            </button>
                                            <button onClick={() => onDelete(asset)} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50" title="Delete">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                            </button>
                                            <button className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
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
                                onClick={() => getAssets(meta.current_page - 1)}
                                disabled={meta.current_page === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => getAssets(meta.current_page + 1)}
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
                                            onClick={() => link.url && getAssets(link.label.includes('Previous') ? meta.current_page - 1 : (link.label.includes('Next') ? meta.current_page + 1 : link.label))}
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

            {/* Asset Modal */}
            <AssetModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                asset={selectedAsset}
                onSuccess={handleModalSuccess}
            />

            {/* Checkout Modal */}
            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                asset={transactionAsset}
                onSuccess={handleModalSuccess}
            />

            {/* Checkin Modal */}
            <CheckinModal
                isOpen={isCheckinOpen}
                onClose={() => setIsCheckinOpen(false)}
                asset={transactionAsset}
                onSuccess={handleModalSuccess}
            />

            <ImportAssetModal
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
}
