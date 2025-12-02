import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../axios-client";

export default function Assets() {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [meta, setMeta] = useState({});

    useEffect(() => {
        getAssets();
    }, []);

    const getAssets = (page = 1) => {
        setLoading(true);
        axiosClient.get(`/assets?page=${page}`)
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

    const statusColor = (type) => {
        switch (type) {
            case 'deployable': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'archived': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const currencyFormat = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Assets</h1>
                <Link to="/assets/new" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Add New
                </Link>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tag / Serial</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading && (
                            <tr>
                                <td colSpan="6" className="text-center py-4">Loading...</td>
                            </tr>
                        )}
                        {!loading && assets.map(asset => (
                            <tr key={asset.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {asset.image ? (
                                        <img src={`http://127.0.0.1:8000/storage/${asset.image}`} alt="" className="h-10 w-10 rounded-full object-cover" />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">No Img</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{asset.asset_tag}</div>
                                    <div className="text-sm text-gray-500">{asset.serial}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{asset.model?.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(asset.status_label?.type)}`}>
                                        {asset.status_label?.name}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {currencyFormat.format(asset.purchase_cost)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={'/assets/' + asset.id} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                                    <button onClick={ev => onDelete(asset)} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                {!loading && meta.links && (
                    <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
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
                                            onClick={() => link.url && getAssets(link.label == '&laquo; Previous' ? meta.current_page - 1 : (link.label == 'Next &raquo;' ? meta.current_page + 1 : link.label))}
                                            disabled={!link.url || link.active}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${link.active ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'} ${index === 0 ? 'rounded-l-md' : ''} ${index === meta.links.length - 1 ? 'rounded-r-md' : ''}`}
                                        >
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
