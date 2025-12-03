import React from 'react';

export default function StatusBadge({ type, label }) {
    const getColor = (type) => {
        switch (type) {
            case 'deployable': // Ready
                return 'bg-green-100 text-green-800';
            case 'deployed': // Deployed
                return 'bg-blue-100 text-blue-800';
            case 'broken': // Broken - assuming 'broken' or similar for red
            case 'archived':
                return 'bg-red-100 text-red-800';
            case 'pending': // Maintenance/Pending
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getColor(type)}`}>
            {label}
        </span>
    );
}
