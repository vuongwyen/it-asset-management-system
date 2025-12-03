import { useEffect, useState } from "react";
import axiosClient from "../../axios-client";
import { useStateContext } from "../../contexts/ContextProvider";

export default function StatusLabelModal({ isOpen, onClose, statusLabel, onSuccess }) {
    const { setNotification } = useStateContext();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        type: 'deployable',
        notes: ''
    });

    const types = [
        { value: 'deployable', label: 'Deployable' },
        { value: 'pending', label: 'Pending' },
        { value: 'archived', label: 'Archived' },
        { value: 'broken', label: 'Broken' },
        { value: 'lost', label: 'Lost' },
    ];

    useEffect(() => {
        if (isOpen) {
            if (statusLabel) {
                setFormData({
                    name: statusLabel.name,
                    type: statusLabel.type,
                    notes: statusLabel.notes || ''
                });
            } else {
                setFormData({
                    name: '',
                    type: 'deployable',
                    notes: ''
                });
            }
            setErrors({});
        }
    }, [isOpen, statusLabel]);

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const request = statusLabel
            ? axiosClient.put(`/status-labels/${statusLabel.id}`, formData)
            : axiosClient.post('/status-labels', formData);

        request
            .then(() => {
                setNotification(statusLabel ? 'Cập nhật nhãn tình trạng thành công!' : 'Tạo nhãn tình trạng thành công!');
                onSuccess();
                onClose();
            })
            .catch(err => {
                const response = err.response;
                if (response && response.status === 422) {
                    setErrors(response.data.errors);
                } else {
                    console.error(err);
                    setNotification('Có lỗi xảy ra, vui lòng thử lại.');
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
                            {statusLabel ? 'Chỉnh sửa Nhãn tình trạng' : 'Thêm Nhãn tình trạng mới'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tên trạng thái <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => handleChange('name', e.target.value)}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.name ? 'border-red-500' : ''}`}
                                        required
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name[0]}</p>}
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Loại <span className="text-red-500">*</span></label>
                                    <select
                                        value={formData.type}
                                        onChange={e => handleChange('type', e.target.value)}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.type ? 'border-red-500' : ''}`}
                                    >
                                        {types.map(type => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                    {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type[0]}</p>}
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={e => handleChange('notes', e.target.value)}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    />
                                </div>
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
                                    {loading ? 'Đang xử lý...' : 'Lưu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
