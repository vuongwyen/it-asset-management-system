import { useEffect, useState } from "react";
import axiosClient from "../axios-client";

export default function Dashboard() {
    const [stats, setStats] = useState({
        total_assets: 0,
        total_cost: 0,
        assets_by_status: [],
        recent_activity: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosClient.get('/dashboard-stats')
            .then(({ data }) => {
                setStats(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

    const currencyFormat = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    });

    const getStatusCount = (statusName) => {
        const status = stats.assets_by_status.find(s => s.status === statusName);
        return status ? status.count : 0;
    };

    const getDeployedCount = () => {
        return getStatusCount('Deployed');
    };

    const getBrokenMaintenanceCount = () => {
        const broken = stats.assets_by_status.find(s => s.status === 'Broken' || s.type === 'undeployable');
        const maintenance = stats.assets_by_status.find(s => s.status === 'In Maintenance');
        return (broken ? broken.count : 0) + (maintenance ? maintenance.count : 0);
    };

    const handleDownloadPdf = (historyId) => {
        axiosClient.get(`/assets/checkout/${historyId}/pdf`, {
            responseType: 'blob', // Important for file download
        })
            .then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `bien-ban-ban-giao-${historyId}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
            })
            .catch((error) => {
                console.error("Download failed:", error);
                alert("Không thể tải file PDF. Vui lòng thử lại.");
            });
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

            {loading && <div className="text-center py-4">Loading stats...</div>}

            {!loading && (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-blue-500">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Total Assets</dt>
                                            <dd>
                                                <div className="text-lg font-medium text-gray-900">{stats.total_assets}</div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-green-500">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Total Cost</dt>
                                            <dd>
                                                <div className="text-lg font-medium text-gray-900">{currencyFormat.format(stats.total_cost)}</div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-indigo-500">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                                        <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Deployed</dt>
                                            <dd>
                                                <div className="text-lg font-medium text-gray-900">{getDeployedCount()}</div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-red-500">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Broken / Maint.</dt>
                                            <dd>
                                                <div className="text-lg font-medium text-gray-900">{getBrokenMaintenanceCount()}</div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Recent Activity
                            </h3>
                        </div>
                        <ul className="divide-y divide-gray-200">
                            {stats.recent_activity.map((log) => (
                                <li key={log.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium text-indigo-600 truncate">
                                            {log.admin ? log.admin.name : 'System'}
                                            <span className="text-gray-500 font-normal"> {log.action_type} </span>
                                            {log.asset ? log.asset.asset_tag : 'Unknown Asset'}
                                        </div>
                                        <div className="ml-2 flex-shrink-0 flex">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                {new Date(log.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-sm text-gray-500">
                                                {log.note || 'No notes'}
                                            </p>
                                        </div>
                                        <div className="flex items-center">
                                            {log.user && (
                                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    Target: {log.user.name}
                                                </div>
                                            )}
                                            {log.action_type === 'checkout' && (
                                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-4">
                                                    <button
                                                        onClick={() => handleDownloadPdf(log.id)}
                                                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                                        title="Tải biên bản bàn giao"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 001.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                                                        </svg>
                                                        <span className="hidden sm:inline">Print</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {stats.recent_activity.length === 0 && (
                                <li className="px-4 py-4 sm:px-6 text-center text-gray-500">No recent activity.</li>
                            )}
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
}
