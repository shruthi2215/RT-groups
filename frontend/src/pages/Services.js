import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, Hammer, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export const Services = () => {
  const services = [
    {
      icon: <Building2 className="w-16 h-16 text-[#D4AF37]" />,
      title: 'Property Buying & Selling',
      description: 'Expert real estate mediation services connecting buyers and sellers',
      features: [
        'Property valuation and market analysis',
        'Legal documentation support',
        'Negotiation assistance',
        'Post-sale support'
      ],
      image: 'https://images.unsplash.com/photo-1772475329864-e30a2f1278c0'
    },
    {
      icon: <Hammer className="w-16 h-16 text-[#D4AF37]" />,
      title: 'Construction Services',
      description: 'End-to-end construction solutions from foundation to finishing',
      features: [
        'Architectural design & planning',
        'Quality construction materials',
        'Timely project delivery',
        'Post-construction maintenance'
      ],
      image: 'https://images.unsplash.com/photo-1714562601554-8e3abf94b179'
    },
    {
      icon: <Users className="w-16 h-16 text-[#D4AF37]" />,
      title: 'Manpower Supply',
      description: 'Skilled workforce for construction and development projects',
      features: [
        'Verified skilled workers',
        'Project-based staffing',
        'Safety certified personnel',
        'Flexible workforce solutions'
      ],
      image: 'https://images.unsplash.com/photo-1775880303572-791fbbb73d32'
    }
  ];

  return (
    <div className="min-h-screen pt-20">
      <section className="py-20 md:py-32 bg-[#0A0F1D]" data-testid="services-hero">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h1
              className="text-5xl sm:text-6xl font-bold text-white mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Our <span className="text-[#D4AF37]">Services</span>
            </h1>
            <p className="text-[#94A3B8] text-lg max-w-3xl mx-auto leading-relaxed">
              Comprehensive solutions tailored to your real estate and construction needs.
              From property transactions to complete construction projects.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-[#0A0F1D]" data-testid="services-list">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-24">
          {services.map((service, index) => (
            <motion.div
              key={index}
              {...fadeInUp}
              transition={{ delay: index * 0.2 }}
              data-testid={`service-detail-${index}`}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="mb-6">{service.icon}</div>
                <h2
                  className="text-3xl sm:text-4xl font-bold text-white mb-4"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {service.title}
                </h2>
                <p className="text-[#94A3B8] text-lg mb-8 leading-relaxed">
                  {service.description}
                </p>
                <ul className="space-y-4 mb-8">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-[#D4AF37] mt-1 flex-shrink-0" />
                      <span className="text-[#94A3B8]">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  className="inline-flex items-center space-x-2 bg-[#D4AF37] text-[#0A0F1D] px-8 py-3 rounded-full font-semibold hover:bg-[#F3C94D] transition-colors duration-300"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                <div className="relative h-96 rounded-2xl overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1D]/50 to-transparent" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section
        className="py-20 md:py-32 relative overflow-hidden"
        style={{
          backgroundImage: 'url(https://static.prod-images.emergentagent.com/jobs/f4a875f8-922e-47d4-9515-0cf53c6e8020/images/9f0931d80574e656f51d4008cd7d22ecfd9f69098a87088517071d52ce3f8c90.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-[#0A0F1D]/85" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 text-center">
          <motion.div {...fadeInUp}>
            <h2
              className="text-4xl sm:text-5xl font-bold text-white mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Ready to Get Started?
            </h2>
            <p className="text-[#94A3B8] text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Contact us today to discuss your project requirements and get a free consultation.
            </p>
            <Link
              to="/contact"
              data-testid="services-cta-button"
              className="inline-flex items-center space-x-2 bg-[#D4AF37] text-[#0A0F1D] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#F3C94D] transition-colors duration-300"
            >
              <span>Book a Consultation</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};