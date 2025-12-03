import { useEffect, useState } from "react";
import axiosClient from "../../axios-client";
import { useStateContext } from "../../contexts/ContextProvider";

export default function CheckinModal({ isOpen, onClose, asset, onSuccess }) {
    const { setNotification } = useStateContext();
    const [loading, setLoading] = useState(false);
    const [statuses, setStatuses] = useState([]);
    const [formData, setFormData] = useState({
        status_id: '',
        note: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            axiosClient.get('/status-labels')
                .then(({ data }) => {
                    setStatuses(data.data || data);
                })
                .catch(err => console.error(err));

            // Reset form
            setFormData({ status_id: '', note: '' });
            setErrors({});
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const payload = {
            asset_id: asset.id,
            status_id: formData.status_id,
            note: formData.note
        };

        axiosClient.post('/assets/checkin', payload)
            .then(() => {
                setNotification('Thu hồi tài sản thành công!');
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
                            Thu hồi tài sản: {asset?.name || asset?.asset_tag}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Trạng thái sau khi trả <span className="text-red-500">*</span></label>
                                    <select
                                        value={formData.status_id}
                                        onChange={e => setFormData({ ...formData, status_id: e.target.value })}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.status_id ? 'border-red-500' : ''}`}
                                        required
                                    >
                                        <option value="">Chọn trạng thái</option>
                                        {statuses.map(status => (
                                            <option key={status.id} value={status.id}>{status.name}</option>
                                        ))}
                                    </select>
                                    {errors.status_id && <p className="mt-1 text-xs text-red-500">{errors.status_id[0]}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
                                    <textarea
                                        value={formData.note}
                                        onChange={e => setFormData({ ...formData, note: e.target.value })}
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
                                    {loading ? 'Đang xử lý...' : 'Thu hồi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
