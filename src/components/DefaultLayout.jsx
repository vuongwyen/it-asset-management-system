import { Link, Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import axiosClient from "../axios-client";
import { useEffect } from "react";

export default function DefaultLayout() {
    const { user, token, setUser, setToken, notification } = useStateContext();

    if (!token) {
        return <Navigate to="/login" />;
    }

    const onLogout = (ev) => {
        ev.preventDefault();

        axiosClient.post('/logout')
            .then(() => {
                setUser({});
                setToken(null);
            });
    };

    useEffect(() => {
        axiosClient.get('/me')
            .then(({ data }) => {
                setUser(data);
            });
    }, []);

    return (
        <div id="defaultLayout" className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-slate-800 text-white flex flex-col">
                <div className="h-16 flex items-center justify-center text-xl font-bold border-b border-slate-700">
                    IT Asset Manager
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    <Link to="/dashboard" className="block px-4 py-2 rounded hover:bg-slate-700 transition">Dashboard</Link>
                    <Link to="/assets" className="block px-4 py-2 rounded hover:bg-slate-700 transition">Assets</Link>
                    <Link to="/users" className="block px-4 py-2 rounded hover:bg-slate-700 transition">Users</Link>
                </nav>
            </aside>
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white shadow flex items-center justify-between px-6">
                    <div className="text-xl font-semibold text-gray-800">
                        Welcome, {user.name}
                    </div>
                    <div>
                        <a href="#" onClick={onLogout} className="text-slate-600 hover:text-slate-900 font-medium">
                            Logout
                        </a>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {notification &&
                        <div className="bg-green-500 text-white p-4 rounded mb-4 shadow">
                            {notification}
                        </div>
                    }
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
