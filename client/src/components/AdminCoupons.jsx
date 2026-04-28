import React, { useState, useEffect } from 'react';
import './AdminCoupons.css';
import { buildApiUrl, getApiErrorMessage } from '../utils/apiUrl';

const getAuthToken = () => {
  try {
    const user = JSON.parse(localStorage.getItem('bookshareUser') || '{}');
    return user.token || null;
  } catch {
    return null;
  }
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    description: '',
    maxUses: '',
    minOrderAmount: '0',
    maxDiscount: '',
    validUntil: ''
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) throw new Error('No token found');
      
      const response = await fetch(buildApiUrl('/api/coupons/all'), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Failed to fetch coupons'));
      }

      const data = await response.json();
      setCoupons(data.coupons);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error loading coupons');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      const response = await fetch(buildApiUrl('/api/coupons/create'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          discountValue: parseFloat(formData.discountValue),
          maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
          minOrderAmount: parseFloat(formData.minOrderAmount),
          maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null
        })
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Failed to create coupon'));
      }

      // Reset form and refresh coupons
      setFormData({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        description: '',
        maxUses: '',
        minOrderAmount: '0',
        maxDiscount: '',
        validUntil: ''
      });
      setShowCreateForm(false);
      fetchCoupons();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleCoupon = async (couponId, currentStatus) => {
    try {
      const token = getAuthToken();
      const response = await fetch(buildApiUrl(`/api/coupons/${couponId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Failed to update coupon'));
      }

      fetchCoupons();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      try {
        const token = getAuthToken();
        const response = await fetch(buildApiUrl(`/api/coupons/${couponId}`), {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(await getApiErrorMessage(response, 'Failed to delete coupon'));
        }

        fetchCoupons();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading && coupons.length === 0) {
    return <div className="coupons-loading">Loading coupons...</div>;
  }

  return (
    <div className="admin-coupons">
      <div className="coupons-header">
        <h1>Coupon Management</h1>
        <button
          className="btn-create-coupon"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? '✕ Cancel' : '+ Create Coupon'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Create Coupon Form */}
      {showCreateForm && (
        <form className="coupon-form" onSubmit={handleCreateCoupon}>
          <h2>Create New Coupon</h2>

          <div className="form-group">
            <label>Coupon Code *</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="e.g., SAVE20"
              required
              className="form-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Discount Type *</label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (Tk)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Discount Value *</label>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleInputChange}
                placeholder="e.g., 20"
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the coupon offer"
              className="form-input"
              rows="2"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Minimum Order Amount (Tk)</label>
              <input
                type="number"
                name="minOrderAmount"
                value={formData.minOrderAmount}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Maximum Discount (Tk)</label>
              <input
                type="number"
                name="maxDiscount"
                value={formData.maxDiscount}
                onChange={handleInputChange}
                placeholder="Leave empty for no limit"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Maximum Uses</label>
              <input
                type="number"
                name="maxUses"
                value={formData.maxUses}
                onChange={handleInputChange}
                placeholder="Leave empty for unlimited"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Valid Until *</label>
              <input
                type="date"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <button type="submit" className="btn-submit">
            ✓ Create Coupon
          </button>
        </form>
      )}

      {/* Coupons Table */}
      <div className="coupons-table-container">
        <table className="coupons-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Type</th>
              <th>Value</th>
              <th>Min Order</th>
              <th>Max Discount</th>
              <th>Uses</th>
              <th>Valid Until</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon._id}>
                <td className="code-cell">{coupon.code}</td>
                <td>{coupon.discountType === 'percentage' ? '%' : 'Tk'}</td>
                <td>{coupon.discountValue}</td>
                <td>Tk {coupon.minOrderAmount}</td>
                <td>{coupon.maxDiscount ? `Tk ${coupon.maxDiscount}` : 'No limit'}</td>
                <td>
                  {coupon.maxUses
                    ? `${coupon.usedCount}/${coupon.maxUses}`
                    : `${coupon.usedCount}/∞`}
                </td>
                <td>{new Date(coupon.validUntil).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${coupon.isActive ? 'active' : 'inactive'}`}>
                    {coupon.isActive ? '✅ Active' : '❌ Inactive'}
                  </span>
                </td>
                <td>
                  <button
                    className={`btn-toggle ${coupon.isActive ? 'btn-deactivate' : 'btn-activate'}`}
                    onClick={() => handleToggleCoupon(coupon._id, coupon.isActive)}
                    title={coupon.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {coupon.isActive ? '🚫' : '✅'}
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteCoupon(coupon._id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {coupons.length === 0 && !loading && (
        <div className="no-coupons">
          <p>No coupons created yet</p>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
