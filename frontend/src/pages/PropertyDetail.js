import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Bed, Bath, Square, Heart, ArrowLeft, Phone, MessageCircle, Calendar } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    fetchProperty();
    if (user) {
      checkFavorite();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/properties/${id}`);
      setProperty(response.data);
    } catch (error) {
      console.error('Error fetching property:', error);
      toast.error('Failed to load property');
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/users/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsFavorite(response.data.some((p) => p.id === id));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast.error('Please login to save favorites');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${BACKEND_URL}/api/users/favorites/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  const formatPrice = (price) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString()}`;
  };

  const getImageUrl = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1762811054947-605b20298615';
    if (img.startsWith('http')) return img;
    return `${BACKEND_URL}${img.startsWith('/') ? '' : '/'}${img}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  if (!property) return null;

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1762811054947-605b20298615'];

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#0A0F1D]" data-testid="property-detail-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <button
          onClick={() => navigate('/properties')}
          data-testid="back-to-properties-button"
          className="flex items-center space-x-2 text-[#94A3B8] hover:text-[#D4AF37] mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Properties</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden mb-4"
              data-testid="property-main-image"
            >
              <img
                src={getImageUrl(images[selectedImage])}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-[#D4AF37] text-[#0A0F1D] px-4 py-2 rounded-full text-sm font-semibold">
                  {property.type}
                </span>
              </div>
              {user && (
                <button
                  onClick={toggleFavorite}
                  data-testid="detail-favorite-button"
                  className="absolute top-4 right-4 p-3 bg-[#0A0F1D]/80 backdrop-blur-sm rounded-full hover:scale-110 transition-transform"
                >
                  <Heart
                    className={`w-6 h-6 ${isFavorite ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-white'}`}
                  />
                </button>
              )}
            </motion.div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3 mb-8" data-testid="image-gallery-thumbnails">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    data-testid={`thumbnail-${idx}`}
                    className={`relative h-24 rounded-xl overflow-hidden transition-all ${
                      selectedImage === idx
                        ? 'ring-2 ring-[#D4AF37]'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`${property.title} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#121B2F] border border-white/5 rounded-2xl p-8"
            >
              <h1
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: 'Playfair Display, serif' }}
                data-testid="property-title"
              >
                {property.title}
              </h1>
              <div className="flex items-center text-[#94A3B8] mb-6">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{property.location}</span>
              </div>

              {(property.bedrooms || property.bathrooms || property.area) && (
                <div className="grid grid-cols-3 gap-4 mb-8 pb-8 border-b border-white/5">
                  {property.bedrooms !== null && property.bedrooms !== undefined && (
                    <div className="text-center">
                      <Bed className="w-6 h-6 text-[#D4AF37] mx-auto mb-2" />
                      <p className="text-white font-semibold">{property.bedrooms}</p>
                      <p className="text-[#94A3B8] text-sm">Bedrooms</p>
                    </div>
                  )}
                  {property.bathrooms !== null && property.bathrooms !== undefined && (
                    <div className="text-center">
                      <Bath className="w-6 h-6 text-[#D4AF37] mx-auto mb-2" />
                      <p className="text-white font-semibold">{property.bathrooms}</p>
                      <p className="text-[#94A3B8] text-sm">Bathrooms</p>
                    </div>
                  )}
                  {property.area && (
                    <div className="text-center">
                      <Square className="w-6 h-6 text-[#D4AF37] mx-auto mb-2" />
                      <p className="text-white font-semibold">{property.area}</p>
                      <p className="text-[#94A3B8] text-sm">Sq Ft</p>
                    </div>
                  )}
                </div>
              )}

              <h2 className="text-xl font-semibold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                Description
              </h2>
              <p className="text-[#94A3B8] leading-relaxed whitespace-pre-line" data-testid="property-description">
                {property.description}
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <div className="bg-[#121B2F] border border-white/5 rounded-2xl p-8">
              <p className="text-[#94A3B8] text-sm mb-2">Price</p>
              <p
                className="text-4xl font-bold text-[#D4AF37] mb-6"
                style={{ fontFamily: 'Playfair Display, serif' }}
                data-testid="property-price"
              >
                {formatPrice(property.price)}
              </p>

              <div className="space-y-3">
                <button
                  onClick={() =>
                    window.open(
                      `https://wa.me/918105854999?text=Hi, I am interested in ${property.title} located at ${property.location}. Please share more details.`,
                      '_blank'
                    )
                  }
                  data-testid="whatsapp-inquire-button"
                  className="w-full bg-green-500 text-white py-3 rounded-full font-semibold hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>WhatsApp Us</span>
                </button>

                <a
                  href="tel:+918105854999"
                  data-testid="call-inquire-button"
                  className="w-full bg-[#D4AF37] text-[#0A0F1D] py-3 rounded-full font-semibold hover:bg-[#F3C94D] transition-colors flex items-center justify-center space-x-2"
                >
                  <Phone className="w-5 h-5" />
                  <span>Call Now</span>
                </a>

                <Link
                  to="/contact"
                  data-testid="book-visit-button"
                  className="w-full bg-transparent border border-white/20 text-white py-3 rounded-full font-semibold hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Book a Visit</span>
                </Link>
              </div>

              <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-[#94A3B8] text-sm leading-relaxed">
                  Interested in this property? Our team is ready to assist you with viewings, negotiations,
                  and all documentation.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
