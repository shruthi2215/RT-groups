import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Users, Hammer, ArrowRight, CheckCircle, Star, TrendingUp } from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const Home = () => {
  const services = [
    {
      icon: <Building2 className="w-12 h-12 text-[#D4AF37]" />,
      title: 'Property Buying & Selling',
      description: 'Expert mediation for seamless property transactions with best market rates',
      image: 'https://images.unsplash.com/photo-1772475329864-e30a2f1278c0'
    },
    {
      icon: <Hammer className="w-12 h-12 text-[#D4AF37]" />,
      title: 'Construction Services',
      description: 'End-to-end construction solutions from foundation to finishing',
      image: 'https://images.unsplash.com/photo-1714562601554-8e3abf94b179'
    },
    {
      icon: <Users className="w-12 h-12 text-[#D4AF37]" />,
      title: 'Manpower Supply',
      description: 'Skilled workforce for all your construction and development needs',
      image: 'https://images.unsplash.com/photo-1775880303572-791fbbb73d32'
    }
  ];

  const stats = [
    { number: '25+', label: 'Projects Completed' },
    { number: '100+', label: 'Happy Clients' },
    { number: 'New', label: 'Fresh & Growing' },
    { number: '20+', label: 'Expert Team' }
  ];

  const steps = [
    {
      number: '01',
      title: 'Contact Us',
      description: 'Reach out via chat, WhatsApp, or booking form'
    },
    {
      number: '02',
      title: 'Consultation',
      description: 'Discuss your needs with our expert team'
    },
    {
      number: '03',
      title: 'Execution',
      description: 'We deliver excellence in every project'
    }
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Property Buyer',
      content: 'Outstanding service! They helped me find my dream home in Mumbai with complete transparency.',
      rating: 5
    },
    {
      name: 'Priya Sharma',
      role: 'Construction Client',
      content: 'Professional construction team. Completed our office building on time with excellent quality.',
      rating: 5
    },
    {
      name: 'Amit Patel',
      role: 'Developer',
      content: 'Their manpower supply service is reliable and efficient. Highly recommended for large projects.',
      rating: 5
    }
  ];

  const featuredProjects = [
    {
      image: 'https://images.unsplash.com/photo-1762811054947-605b20298615',
      title: 'Luxury Residential Complex',
      location: 'Mumbai'
    },
    {
      image: 'https://images.unsplash.com/photo-1714562601554-8e3abf94b179',
      title: 'Commercial Tower',
      location: 'Bangalore'
    },
    {
      image: 'https://images.unsplash.com/photo-1772475329864-e30a2f1278c0',
      title: 'Premium Villas',
      location: 'Delhi'
    }
  ];

  return (
    <div className="min-h-screen">
      <section
        className="relative h-screen flex items-center justify-center overflow-hidden"
        data-testid="hero-section"
      >
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1762811054947-605b20298615)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0F1D]/95 via-[#0A0F1D]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 text-left">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-none"
              style={{ fontFamily: 'Playfair Display, serif' }}
              data-testid="hero-heading"
            >
              Your Space,<br />
              <span className="text-[#D4AF37]">Our Promise</span>
            </h1>
            <p className="text-lg sm:text-xl text-[#94A3B8] mb-10 max-w-2xl leading-relaxed" data-testid="hero-subheading">
              Construction, Property Deals & Workforce Solutions by RT Groups
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/contact"
                data-testid="cta-book-demo"
                className="bg-[#D4AF37] text-[#0A0F1D] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#F3C94D] transition-all duration-300 inline-flex items-center justify-center space-x-2 hover:shadow-lg hover:shadow-[#D4AF37]/30"
              >
                <span>Book a Demo</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button
                onClick={() => {
                  window.open('https://wa.me/918105854999?text=Hi! I am interested in your services.', '_blank');
                }}
                data-testid="cta-whatsapp"
                className="bg-transparent border-2 border-white/30 text-white px-8 py-4 rounded-full font-semibold text-lg hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all duration-300 inline-flex items-center justify-center space-x-2"
              >
                <span>Chat on WhatsApp</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-[#0A0F1D]" data-testid="services-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2
              className="text-4xl sm:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Our <span className="text-[#D4AF37]">Services</span>
            </h2>
            <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
              Comprehensive solutions for all your real estate and construction needs
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {services.map((service, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                data-testid={`service-card-${index}`}
                className="bg-[#121B2F] border border-white/5 rounded-2xl overflow-hidden hover:-translate-y-2 hover:border-white/20 transition-all duration-300 group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121B2F] to-transparent" />
                </div>
                <div className="p-8">
                  <div className="mb-4">{service.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {service.title}
                  </h3>
                  <p className="text-[#94A3B8] leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-[#121B2F]" data-testid="stats-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                data-testid={`stat-card-${index}`}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-[#D4AF37] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {stat.number}
                </div>
                <div className="text-[#94A3B8] text-sm uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-[#0A0F1D]" data-testid="how-it-works-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2
              className="text-4xl sm:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              How It <span className="text-[#D4AF37]">Works</span>
            </h2>
            <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
              Simple and transparent process from inquiry to execution
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                transition={{ delay: index * 0.2 }}
                data-testid={`step-card-${index}`}
                className="relative p-8 bg-[#121B2F] border border-white/5 rounded-2xl"
              >
                <div
                  className="text-8xl font-bold absolute -top-4 -right-4 opacity-5"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {step.number}
                </div>
                <div className="relative z-10">
                  <div className="text-[#D4AF37] text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {step.number}
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {step.title}
                  </h3>
                  <p className="text-[#94A3B8] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-[#121B2F]" data-testid="featured-projects-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2
              className="text-4xl sm:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Featured <span className="text-[#D4AF37]">Projects</span>
            </h2>
            <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
              Excellence delivered across diverse construction and real estate projects
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProjects.map((project, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                transition={{ delay: index * 0.15 }}
                data-testid={`project-card-${index}`}
                className="relative h-80 rounded-2xl overflow-hidden group cursor-pointer"
              >
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1D] via-[#0A0F1D]/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {project.title}
                  </h3>
                  <p className="text-[#D4AF37] text-sm">{project.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-[#0A0F1D]" data-testid="testimonials-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2
              className="text-4xl sm:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Client <span className="text-[#D4AF37]">Testimonials</span>
            </h2>
            <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
              Hear what our satisfied clients have to say
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                transition={{ delay: index * 0.15 }}
                data-testid={`testimonial-card-${index}`}
                className="bg-[#121B2F] border border-white/5 rounded-2xl p-8"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-[#D4AF37] fill-current" />
                  ))}
                </div>
                <p className="text-[#94A3B8] mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="text-white font-semibold">{testimonial.name}</p>
                  <p className="text-[#94A3B8] text-sm">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="py-20 md:py-32 relative overflow-hidden"
        data-testid="cta-section"
        style={{
          backgroundImage: 'url(https://static.prod-images.emergentagent.com/jobs/f4a875f8-922e-47d4-9515-0cf53c6e8020/images/9f0931d80574e656f51d4008cd7d22ecfd9f69098a87088517071d52ce3f8c90.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-[#0A0F1D]/80" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 text-center">
          <motion.div {...fadeInUp}>
            <h2
              className="text-4xl sm:text-5xl font-bold text-white mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Ready to Build or Buy?
            </h2>
            <p className="text-[#94A3B8] text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Let's turn your vision into reality. Contact us today for a free consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                data-testid="cta-final-book-demo"
                className="bg-[#D4AF37] text-[#0A0F1D] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#F3C94D] transition-all duration-300 inline-flex items-center justify-center space-x-2"
              >
                <span>Book Demo</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button
                onClick={() => {
                  window.open('https://wa.me/918105854999?text=Hi! I want to discuss a project.', '_blank');
                }}
                data-testid="cta-final-whatsapp"
                className="bg-transparent border-2 border-white/30 text-white px-8 py-4 rounded-full font-semibold text-lg hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all duration-300 inline-flex items-center justify-center space-x-2"
              >
                <span>Chat on WhatsApp</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};