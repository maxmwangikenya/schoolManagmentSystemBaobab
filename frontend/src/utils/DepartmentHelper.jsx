import React from 'react';
import { useNavigate } from 'react-router-dom';

export const columns = [
    {
        name: "S No",
        selector: (row) => row.sno,
        width: "80px"
    },
    {
        name: "Department Name",
        selector: (row) => row.dep_name,
        sortable: true
    },
    {
        name: "Description",
        selector: (row) => row.description,
        sortable: true
    },
    {
        name: "Action",
        selector: (row) => row.action,
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
        width: "150px"
    }
];

// Version 1: Simple navigation
export const DepartmentButton = ({ departmentId, departmentData }) => {
    const navigate = useNavigate();

    const handleEdit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Edit clicked for department:', departmentId);
        
        // Navigate to edit page with department ID
        navigate(`/admin-dashboard/edit-department/${departmentId}`, {
            state: { department: departmentData }
        });
    };

    const handleDelete = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Delete clicked for department:', departmentId);
        
        if (window.confirm(`Are you sure you want to delete "${departmentData?.dep_name}" department?`)) {
            // This is a simple approach - in a real app, you'd want to handle this better
            alert('Delete functionality needs to be implemented in the parent component');
        }
    };

    return (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <button
                type="button"
                onClick={handleEdit}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Edit Department"
            >
                Edit
            </button>
            <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                title="Delete Department"
            >
                Delete
            </button>
        </div>
    );
};

// Version 2: With proper callback props (recommended)
export const DepartmentButtonV2 = ({ departmentId, departmentData, onEdit, onDelete }) => {
    const handleEdit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Edit clicked for department:', departmentId);
        
        if (onEdit) {
            onEdit(departmentId, departmentData);
        } else {
            console.warn('No onEdit handler provided');
        }
    };

    const handleDelete = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Delete clicked for department:', departmentId);
        
        if (onDelete) {
            onDelete(departmentId, departmentData);
        } else {
            console.warn('No onDelete handler provided');
        }
    };

    return (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <button
                type="button"
                onClick={handleEdit}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Edit Department"
            >
                <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
            </button>
            <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                title="Delete Department"
            >
                <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
            </button>
        </div>
    );
};