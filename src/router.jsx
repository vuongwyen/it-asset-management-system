import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "./views/Login";
import Dashboard from "./views/Dashboard";
import Users from "./views/Users";
import Assets from "./views/Assets";
import Manufacturers from "./views/Manufacturers";
import Categories from "./views/Categories";
import StatusLabels from "./views/StatusLabels";
import Roles from "./views/Roles";
import Departments from "./views/Departments";
import NotFound from "./views/NotFound";
import DefaultLayout from "./components/DefaultLayout";
import GuestLayout from "./components/GuestLayout";

const router = createBrowserRouter([
    {
        path: '/',
        element: <DefaultLayout />,
        children: [
            {
                path: '/',
                element: <Navigate to="/dashboard" />
            },
            {
                path: '/dashboard',
                element: <Dashboard />
            },
            {
                path: '/users',
                element: <Users />
            },
            {
                path: '/assets',
                element: <Assets />
            },
            {
                path: '/manufacturers',
                element: <Manufacturers />
            },
            {
                path: '/categories',
                element: <Categories />
            },
            {
                path: '/status-labels',
                element: <StatusLabels />
            },
            {
                path: '/roles',
                element: <Roles />
            },
            {
                path: '/departments',
                element: <Departments />
            },
        ]
    },
    {
        path: '/',
        element: <GuestLayout />,
        children: [
            {
                path: '/login',
                element: <Login />
            },
        ]
    },
    {
        path: '*',
        element: <NotFound />
    }
]);

export default router;
