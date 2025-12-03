import { useEffect, useState } from "react";
import axiosClient from "../../axios-client";
import { useStateContext } from "../../contexts/ContextProvider";

export default function AssetModal({ isOpen, onClose, asset, onSuccess }) {
    const { setNotification } = useStateContext();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Dropdown data
    const [models, setModels] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [statuses, setStatuses] = useState([]);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        asset_tag: '',
        serial: '',
        model_id: '',
        status_id: '',
        supplier_id: '',
        purchase_date: '',
        purchase_cost: '',
        warranty_months: '',
        image: null
    });

    const [imagePreview, setImagePreview] = useState(null);

    // Fetch dropdown options on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [modelsRes, suppliersRes, statusesRes] = await Promise.all([
                    axiosClient.get('/models'),
                    axiosClient.get('/suppliers'),
                    axiosClient.get('/status-labels')
                ]);
                setModels(modelsRes.data.data || modelsRes.data);
                setSuppliers(suppliersRes.data.data || suppliersRes.data);
                setStatuses(statusesRes.data.data || statusesRes.data);
            } catch (error) {
                console.error("Error fetching form data:", error);
            }
        };

        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    // Reset or Fill form when asset changes
    useEffect(() => {
        if (asset) {
            setFormData({
                name: asset.name || '',
                asset_tag: asset.asset_tag || '',
                serial: asset.serial || '',
                model_id: asset.model_id || '',
                status_id: asset.status_id || '',
                supplier_id: asset.supplier_id || '',
                purchase_date: asset.purchase_date || '',
                purchase_cost: asset.purchase_cost || '',
                warranty_months: asset.warranty_months || '',
                image: null
            });
            setImagePreview(asset.image ? `http://127.0.0.1:8000/storage/${asset.image}` : null);
        } else {
            setFormData({
                name: '',
                asset_tag: '',
                serial: '',
                model_id: '',
                status_id: '',
                supplier_id: '',
                purchase_date: '',
                purchase_cost: '',
                warranty_months: '',
                image: null
            });
            setImagePreview(null);
        }
        setErrors({});
    }, [asset, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const payload = new FormData();
        for (const key in formData) {
            if (formData[key] !== null && formData[key] !== '') {
                payload.append(key, formData[key]);
            }
        }

        let request;
        if (asset) {
            payload.append('_method', 'PUT');
            request = axiosClient.post(`/assets/${asset.id}`, payload);
        } else {
            request = axiosClient.post('/assets', payload);
        }

        request
            .then(() => {
                setNotification(asset ? 'Cập nhật tài sản thành công!' : 'Thêm tài sản mới thành công!');
                onSuccess();
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
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

            {/* Modal Panel */}
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                <h3 className="text-xl font-semibold leading-6 text-gray-900 mb-6">
                                    {asset ? `Cập nhật tài sản: ${asset.name || asset.asset_tag}` : 'Thêm tài sản mới'}
                                </h3>

                                <form onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Column 1 */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Tên tài sản</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.name ? 'border-red-500' : ''}`}
                                                />
                                                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name[0]}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Mã tài sản (Tag) <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    name="asset_tag"
                                                    value={formData.asset_tag}
                                                    onChange={handleChange}
                                                    required
                                                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.asset_tag ? 'border-red-500' : ''}`}
                                                />
                                                {errors.asset_tag && <p className="mt-1 text-xs text-red-500">{errors.asset_tag[0]}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Số Serial</label>
                                                <input
                                                    type="text"
                                                    name="serial"
                                                    value={formData.serial}
                                                    onChange={handleChange}
                                                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.serial ? 'border-red-500' : ''}`}
                                                />
                                                {errors.serial && <p className="mt-1 text-xs text-red-500">{errors.serial[0]}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Model <span className="text-red-500">*</span></label>
                                                <select
                                                    name="model_id"
                                                    value={formData.model_id}
                                                    onChange={handleChange}
                                                    required
                                                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.model_id ? 'border-red-500' : ''}`}
                                                >
                                                    <option value="">Chọn Model</option>
                                                    {models.map(m => (
                                                        <option key={m.id} value={m.id}>{m.name}</option>
                                                    ))}
                                                </select>
                                                {errors.model_id && <p className="mt-1 text-xs text-red-500">{errors.model_id[0]}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Nhà cung cấp <span className="text-red-500">*</span></label>
                                                <select
                                                    name="supplier_id"
                                                    value={formData.supplier_id}
                                                    onChange={handleChange}
                                                    required
                                                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.supplier_id ? 'border-red-500' : ''}`}
                                                >
                                                    <option value="">Chọn Nhà cung cấp</option>
                                                    {suppliers.map(s => (
                                                        <option key={s.id} value={s.id}>{s.name}</option>
                                                    ))}
                                                </select>
                                                {errors.supplier_id && <p className="mt-1 text-xs text-red-500">{errors.supplier_id[0]}</p>}
                                            </div>
                                        </div>

                                        {/* Column 2 */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Trạng thái <span className="text-red-500">*</span></label>
                                                <select
                                                    name="status_id"
                                                    value={formData.status_id}
                                                    onChange={handleChange}
                                                    required
                                                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.status_id ? 'border-red-500' : ''}`}
                                                >
                                                    <option value="">Chọn Trạng thái</option>
                                                    {statuses.map(s => (
                                                        <option key={s.id} value={s.id}>{s.name}</option>
                                                    ))}
                                                </select>
                                                {errors.status_id && <p className="mt-1 text-xs text-red-500">{errors.status_id[0]}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Giá mua (VND)</label>
                                                <input
                                                    type="number"
                                                    name="purchase_cost"
                                                    value={formData.purchase_cost}
                                                    onChange={handleChange}
                                                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.purchase_cost ? 'border-red-500' : ''}`}
                                                />
                                                {errors.purchase_cost && <p className="mt-1 text-xs text-red-500">{errors.purchase_cost[0]}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Ngày mua</label>
                                                <input
                                                    type="date"
                                                    name="purchase_date"
                                                    value={formData.purchase_date}
                                                    onChange={handleChange}
                                                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.purchase_date ? 'border-red-500' : ''}`}
                                                />
                                                {errors.purchase_date && <p className="mt-1 text-xs text-red-500">{errors.purchase_date[0]}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Bảo hành (tháng)</label>
                                                <input
                                                    type="number"
                                                    name="warranty_months"
                                                    value={formData.warranty_months}
                                                    onChange={handleChange}
                                                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.warranty_months ? 'border-red-500' : ''}`}
                                                />
                                                {errors.warranty_months && <p className="mt-1 text-xs text-red-500">{errors.warranty_months[0]}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Hình ảnh</label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                />
                                                {imagePreview && (
                                                    <div className="mt-2">
                                                        <img src={imagePreview} alt="Preview" className="h-32 w-auto object-cover rounded-md border border-gray-300" />
                                                    </div>
                                                )}
                                                {errors.image && <p className="mt-1 text-xs text-red-500">{errors.image[0]}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex justify-end gap-3">
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
                                            {loading ? 'Đang lưu...' : 'Lưu'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
