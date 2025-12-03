import { useState, useRef } from "react";
import axiosClient from "../../axios-client";
import { useStateContext } from "../../contexts/ContextProvider";

export default function ImportAssetModal({ isOpen, onClose, onSuccess }) {
    const { setNotification } = useStateContext();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        setErrors([]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const file = fileInputRef.current.files[0];
        if (!file) {
            setErrors([{ errors: ['Vui lòng chọn file để upload.'] }]);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        setErrors([]);

        axiosClient.post('/assets/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
            .then(({ data }) => {
                setNotification(data.message || 'Import tài sản thành công!');
                onSuccess();
                onClose();
            })
            .catch(err => {
                const response = err.response;
                if (response && response.status === 422) {
                    if (response.data.errors) {
                        // Backend returns structured errors
                        setErrors(response.data.errors);
                    } else {
                        setErrors([{ errors: [response.data.message] }]);
                    }
                } else {
                    console.error(err);
                    setErrors([{ errors: ['Có lỗi xảy ra, vui lòng thử lại.'] }]);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <h3 className="text-xl font-semibold leading-6 text-gray-900 mb-4">
                            Import Tài sản từ Excel
                        </h3>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                Vui lòng sử dụng file mẫu để nhập dữ liệu chính xác.
                            </p>
                            <a
                                href="/template_assets.xlsx"
                                download
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                            >
                                Tải file mẫu tại đây
                            </a>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Chọn file (.xlsx, .csv)</label>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept=".xlsx, .xls, .csv"
                                        className="mt-1 block w-full text-sm text-gray-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-md file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-blue-50 file:text-blue-700
                                            hover:file:bg-blue-100"
                                    />
                                </div>

                                {errors.length > 0 && (
                                    <div className="bg-red-50 border-l-4 border-red-500 p-4 max-h-60 overflow-y-auto">
                                        <div className="flex">
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-red-800">
                                                    Đã có lỗi xảy ra khi import:
                                                </h3>
                                                <div className="mt-2 text-sm text-red-700">
                                                    <ul className="list-disc pl-5 space-y-1">
                                                        {errors.map((error, index) => (
                                                            <li key={index}>
                                                                {error.row ? `Dòng ${error.row}: ` : ''}
                                                                {Array.isArray(error.errors) ? error.errors.join(', ') : error.errors}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-sm"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-sm disabled:opacity-50"
                                >
                                    {loading ? 'Đang Upload...' : 'Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
