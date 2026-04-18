import React, { useState, useEffect, useRef } from 'react';
import { Plus, Upload, X, Building2, Trash2, Edit3 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const emptyForm = {
  title: '',
  description: '',
  price: '',
  location: '',
  type: 'Villa',
  bedrooms: '',
  bathrooms: '',
  area: '',
  images: []
};

export const PropertyManager = () => {
  const [properties, setProperties] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/properties`);
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const token = localStorage.getItem('token');
    const uploadedUrls = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(
          `${BACKEND_URL}/api/upload/image`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        uploadedUrls.push(response.data.url);
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setForm((prev) => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
    setUploading(false);
    toast.success(`${uploadedUrls.length} image(s) uploaded`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (idx) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx)
    }));
  };

  const handleEdit = (property) => {
    setForm({
      title: property.title,
      description: property.description,
      price: property.price.toString(),
      location: property.location,
      type: property.type,
      bedrooms: property.bedrooms?.toString() || '',
      bathrooms: property.bathrooms?.toString() || '',
      area: property.area?.toString() || '',
      images: property.images || []
    });
    setEditingId(property.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }
    setDeletingId(propertyId);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BACKEND_URL}/api/properties/${propertyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Property deleted');
      fetchProperties();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete property');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        location: form.location,
        type: form.type,
        images: form.images,
        bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
        area: form.area ? parseFloat(form.area) : null
      };

      if (editingId) {
        await axios.put(`${BACKEND_URL}/api/properties/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Property updated successfully!');
      } else {
        await axios.post(`${BACKEND_URL}/api/properties`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Property added successfully!');
      }

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      fetchProperties();
    } catch (error) {
      console.error('Error saving property:', error);
      toast.error(editingId ? 'Failed to update property' : 'Failed to create property');
    } finally {
      setSubmitting(false);
    }
  };

  const getImageUrl = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1762811054947-605b20298615';
    if (img.startsWith('http')) return img;
    return `${BACKEND_URL}${img.startsWith('/') ? '' : '/'}${img}`;
  };

  return (
    <div className="bg-[#121B2F] border border-white/5 rounded-2xl p-6" data-testid="property-manager">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Building2 className="w-5 h-5 mr-2 text-[#D4AF37]" />
          Property Management
        </h2>
        <button
          onClick={() => {
            if (showForm) {
              handleCancel();
            } else {
              setShowForm(true);
            }
          }}
          data-testid="toggle-add-property-button"
          className="bg-[#D4AF37] text-[#0A0F1D] px-4 py-2 rounded-full font-medium hover:bg-[#F3C94D] transition-colors flex items-center space-x-2"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showForm ? 'Cancel' : 'Add Property'}</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} data-testid="add-property-form" className="space-y-4 mb-6 bg-[#0A0F1D] border border-white/5 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold">
              {editingId ? 'Edit Property' : 'Add New Property'}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              data-testid="property-title-input"
              className="bg-[#121B2F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            />
            <input
              type="text"
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              required
              data-testid="property-location-input"
              className="bg-[#121B2F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            />
            <input
              type="number"
              placeholder="Price (INR)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              data-testid="property-price-input"
              className="bg-[#121B2F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            />
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              data-testid="property-type-select"
              className="bg-[#121B2F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            >
              <option value="Villa">Villa</option>
              <option value="Apartment">Apartment</option>
              <option value="Commercial">Commercial</option>
              <option value="Plot">Plot</option>
              <option value="Independent House">Independent House</option>
            </select>
            <input
              type="number"
              placeholder="Bedrooms"
              value={form.bedrooms}
              onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
              data-testid="property-bedrooms-input"
              className="bg-[#121B2F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            />
            <input
              type="number"
              placeholder="Bathrooms"
              value={form.bathrooms}
              onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
              data-testid="property-bathrooms-input"
              className="bg-[#121B2F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            />
            <input
              type="number"
              placeholder="Area (sqft)"
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
              data-testid="property-area-input"
              className="bg-[#121B2F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            />
          </div>
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            rows={4}
            data-testid="property-description-input"
            className="w-full bg-[#121B2F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          />

          <div>
            <label className="block text-white text-sm font-medium mb-2">Property Images</label>
            <div className="flex flex-wrap gap-3 mb-3">
              {form.images.map((img, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden group">
                  <img src={getImageUrl(img)} alt={`Property ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    data-testid={`remove-image-${idx}`}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              ))}
              <label className="w-24 h-24 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#D4AF37] transition-colors">
                <Upload className="w-6 h-6 text-[#94A3B8] mb-1" />
                <span className="text-xs text-[#94A3B8]">{uploading ? 'Uploading...' : 'Upload'}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  data-testid="property-image-upload-input"
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting || uploading}
              data-testid="submit-property-button"
              className="flex-1 bg-[#D4AF37] text-[#0A0F1D] py-3 rounded-full font-semibold hover:bg-[#F3C94D] transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingId ? 'Update Property' : 'Create Property'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                data-testid="cancel-edit-button"
                className="px-6 py-3 rounded-full font-semibold border border-white/20 text-white hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div className="space-y-3" data-testid="properties-list">
        <p className="text-[#94A3B8] text-sm mb-3">Total Properties: {properties.length}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
          {properties.map((property) => (
            <div
              key={property.id}
              data-testid={`property-item-${property.id}`}
              className="bg-[#0A0F1D] border border-white/5 rounded-xl p-3 flex items-center space-x-3"
            >
              <img
                src={getImageUrl(property.images?.[0])}
                alt={property.title}
                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{property.title}</p>
                <p className="text-[#94A3B8] text-sm truncate">{property.location}</p>
                <p className="text-[#D4AF37] text-sm font-semibold">
                  ₹{property.price >= 10000000 ? `${(property.price / 10000000).toFixed(2)} Cr` : `${(property.price / 100000).toFixed(2)} L`}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handleEdit(property)}
                  data-testid={`edit-property-${property.id}`}
                  className="p-2 bg-[#D4AF37]/20 text-[#D4AF37] rounded-lg hover:bg-[#D4AF37]/30 transition-colors"
                  aria-label="Edit property"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(property.id)}
                  disabled={deletingId === property.id}
                  data-testid={`delete-property-${property.id}`}
                  className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                  aria-label="Delete property"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
