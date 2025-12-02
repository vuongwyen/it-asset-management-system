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
        // Assuming 'Deployed' is the status name for deployed assets
        return getStatusCount('Deployed');
    };

    const getBrokenMaintenanceCount = () => {
        // Sum of 'Broken' and 'In Maintenance' (adjust names based on your DB)
        // Based on previous context, status might be 'Ready to Deploy', 'Deployed', 'Archived', etc.
        // Let's sum up non-ready/non-deployed if specific names aren't guaranteed, 
        // or just look for 'Broken' and 'In Maintenance' specifically as requested.
        const broken = stats.assets_by_status.find(s => s.status === 'Broken' || s.type === 'undeployable');
        const maintenance = stats.assets_by_status.find(s => s.status === 'In Maintenance');
        return (broken ? broken.count : 0) + (maintenance ? maintenance.count : 0);
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
                                        {log.user && (
                                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Target: {log.user.name}
                                            </div>
                                        )}
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
