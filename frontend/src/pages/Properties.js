import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Bed, Bath, Square, Heart, Filter } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    minPrice: '',
    maxPrice: '',
    location: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    fetchProperties();
    if (user) {
      fetchFavorites();
    }
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters, properties]);

  const fetchProperties = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/properties`);
      setProperties(response.data);
      setFilteredProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/users/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(response.data.map(p => p.id));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleFavorite = async (propertyId) => {
    if (!user) {
      toast.error('Please login to save favorites');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BACKEND_URL}/api/users/favorites/${propertyId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFavorites(response.data.favorites);
      toast.success(favorites.includes(propertyId) ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const applyFilters = () => {
    let filtered = properties;

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.type) {
      filtered = filtered.filter((p) => p.type === filters.type);
    }

    if (filters.location) {
      filtered = filtered.filter((p) =>
        p.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.minPrice) {
      filtered = filtered.filter((p) => p.price >= parseFloat(filters.minPrice));
    }

    if (filters.maxPrice) {
      filtered = filtered.filter((p) => p.price <= parseFloat(filters.maxPrice));
    }

    setFilteredProperties(filtered);
  };

  const resetFilters = () => {
    setFilters({
      type: '',
      minPrice: '',
      maxPrice: '',
      location: ''
    });
    setSearchTerm('');
  };

  const formatPrice = (price) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    }
    return `₹${price.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen pt-20">
      <section className="py-20 md:py-32 bg-[#0A0F1D]" data-testid="properties-hero">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h1
              className="text-5xl sm:text-6xl font-bold text-white mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Find Your Dream <span className="text-[#D4AF37]">Property</span>
            </h1>
            <p className="text-[#94A3B8] text-lg max-w-3xl mx-auto leading-relaxed">
              Explore our curated collection of premium properties
            </p>
          </motion.div>

          <motion.div {...fadeInUp} className="mb-8">
            <div className="bg-[#121B2F] border border-white/5 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Search by title or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    data-testid="properties-search-input"
                    className="w-full pl-12 bg-[#0A0F1D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  data-testid="toggle-filters-button"
                  className="bg-[#D4AF37] text-[#0A0F1D] px-6 py-3 rounded-xl font-medium hover:bg-[#F3C94D] transition-colors duration-300 flex items-center justify-center space-x-2"
                >
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                </button>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-white/5" data-testid="filters-panel">
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    data-testid="filter-type-select"
                    className="bg-[#0A0F1D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    <option value="Villa">Villa</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    data-testid="filter-min-price-input"
                    className="bg-[#0A0F1D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    data-testid="filter-max-price-input"
                    className="bg-[#0A0F1D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  />
                  <button
                    onClick={resetFilters}
                    data-testid="reset-filters-button"
                    className="bg-transparent border border-white/20 text-white px-4 py-3 rounded-xl font-medium hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors duration-300"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-20" data-testid="no-properties">
              <p className="text-[#94A3B8] text-lg">No properties found matching your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="properties-grid">
              {filteredProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  {...fadeInUp}
                  transition={{ delay: index * 0.1 }}
                  data-testid={`property-card-${index}`}
                  className="bg-[#121B2F] border border-white/5 rounded-2xl overflow-hidden hover:-translate-y-2 hover:border-white/20 transition-all duration-300 group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={property.images[0] || 'https://images.unsplash.com/photo-1762811054947-605b20298615'}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121B2F] to-transparent" />
                    {user && (
                      <button
                        onClick={() => toggleFavorite(property.id)}
                        data-testid={`favorite-button-${index}`}
                        className="absolute top-4 right-4 p-2 bg-[#0A0F1D]/80 backdrop-blur-sm rounded-full hover:scale-110 transition-transform"
                      >
                        <Heart
                          className={`w-5 h-5 ${favorites.includes(property.id) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-white'}`}
                        />
                      </button>
                    )}
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-[#D4AF37] text-[#0A0F1D] px-3 py-1 rounded-full text-sm font-semibold">
                        {property.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3
                      className="text-xl font-semibold text-white mb-2"
                      style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                      {property.title}
                    </h3>
                    <div className="flex items-center text-[#94A3B8] text-sm mb-4">
                      <MapPin className="w-4 h-4 mr-1" />
                      {property.location}
                    </div>
                    <p className="text-[#94A3B8] text-sm mb-4 line-clamp-2">
                      {property.description}
                    </p>
                    {(property.bedrooms || property.bathrooms || property.area) && (
                      <div className="flex items-center gap-4 mb-4 text-sm text-[#94A3B8]">
                        {property.bedrooms && (
                          <div className="flex items-center">
                            <Bed className="w-4 h-4 mr-1" />
                            {property.bedrooms}
                          </div>
                        )}
                        {property.bathrooms && (
                          <div className="flex items-center">
                            <Bath className="w-4 h-4 mr-1" />
                            {property.bathrooms}
                          </div>
                        )}
                        {property.area && (
                          <div className="flex items-center">
                            <Square className="w-4 h-4 mr-1" />
                            {property.area} sqft
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div>
                        <p className="text-[#94A3B8] text-xs mb-1">Price</p>
                        <p className="text-[#D4AF37] text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                          {formatPrice(property.price)}
                        </p>
                      </div>
                      <button
                        onClick={() => window.open('https://wa.me/918105854999?text=I am interested in ' + property.title, '_blank')}
                        className="bg-[#D4AF37] text-[#0A0F1D] px-4 py-2 rounded-full font-medium text-sm hover:bg-[#F3C94D] transition-colors duration-300"
                      >
                        Inquire
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};