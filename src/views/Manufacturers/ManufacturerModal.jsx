import { useEffect, useState } from "react";
import axiosClient from "../../axios-client";
import { useStateContext } from "../../contexts/ContextProvider";

export default function ManufacturerModal({ isOpen, onClose, manufacturer, onSuccess }) {
    const { setNotification } = useStateContext();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        support_url: '',
        support_email: '',
        support_phone: '',
        image: null
    });

    useEffect(() => {
        if (isOpen) {
            if (manufacturer) {
                setFormData({
                    name: manufacturer.name,
                    support_url: manufacturer.support_url || '',
                    support_email: manufacturer.support_email || '',
                    support_phone: manufacturer.support_phone || '',
                    image: null
                });
                setImagePreview(manufacturer.image_url);
            } else {
                setFormData({
                    name: '',
                    support_url: '',
                    support_email: '',
                    support_phone: '',
                    image: null
                });
                setImagePreview(null);
            }
            setErrors({});
        }
    }, [isOpen, manufacturer]);

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, image: null }));
        setImagePreview(null);
        // Note: If editing, this just clears the new upload or preview. 
        // If we wanted to delete the existing image on the backend, we might need a separate flag or API call.
        // For now, this just handles the UI state for the form submission.
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const payload = new FormData();
        payload.append('name', formData.name);
        if (formData.support_url) payload.append('support_url', formData.support_url);
        if (formData.support_email) payload.append('support_email', formData.support_email);
        if (formData.support_phone) payload.append('support_phone', formData.support_phone);
        if (formData.image) payload.append('image', formData.image);

        let request;
        if (manufacturer) {
            payload.append('_method', 'PUT');
            request = axiosClient.post(`/manufacturers/${manufacturer.id}`, payload);
        } else {
            request = axiosClient.post('/manufacturers', payload);
        }

        request
            .then(() => {
                setNotification(manufacturer ? 'Cập nhật hãng thành công!' : 'Tạo hãng thành công!');
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
                            {manufacturer ? 'Chỉnh sửa Hãng sản xuất' : 'Thêm Hãng sản xuất mới'}
                        </h3>
                        <form onSubmit={handleSubmit} encType="multipart/form-data">
                            <div className="space-y-4">
                                {/* Logo Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Logo</label>
                                    <div className="mt-1 flex items-center gap-4">
                                        {imagePreview ? (
                                            <div className="relative h-20 w-20">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="h-20 w-20 object-contain rounded-md border border-gray-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={removeImage}
                                                    className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white p-1 hover:bg-red-600"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="h-20 w-20 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                                </svg>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                    </div>
                                    {errors.image && <p className="mt-1 text-xs text-red-500">{errors.image[0]}</p>}
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tên hãng <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => handleChange('name', e.target.value)}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.name ? 'border-red-500' : ''}`}
                                        required
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name[0]}</p>}
                                </div>

                                {/* Support URL */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">URL Hỗ trợ</label>
                                    <input
                                        type="url"
                                        value={formData.support_url}
                                        onChange={e => handleChange('support_url', e.target.value)}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.support_url ? 'border-red-500' : ''}`}
                                        placeholder="https://example.com"
                                    />
                                    {errors.support_url && <p className="mt-1 text-xs text-red-500">{errors.support_url[0]}</p>}
                                </div>

                                {/* Support Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email Hỗ trợ</label>
                                    <input
                                        type="email"
                                        value={formData.support_email}
                                        onChange={e => handleChange('support_email', e.target.value)}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.support_email ? 'border-red-500' : ''}`}
                                    />
                                    {errors.support_email && <p className="mt-1 text-xs text-red-500">{errors.support_email[0]}</p>}
                                </div>

                                {/* Support Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Điện thoại Hỗ trợ</label>
                                    <input
                                        type="text"
                                        value={formData.support_phone}
                                        onChange={e => handleChange('support_phone', e.target.value)}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.support_phone ? 'border-red-500' : ''}`}
                                    />
                                    {errors.support_phone && <p className="mt-1 text-xs text-red-500">{errors.support_phone[0]}</p>}
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
