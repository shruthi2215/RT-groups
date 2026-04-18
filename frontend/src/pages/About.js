import React from 'react';
import { motion } from 'framer-motion';
import { Award, Users, TrendingUp, Shield, Target, Zap } from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export const About = () => {
  const values = [
    {
      icon: <Shield className="w-12 h-12 text-[#D4AF37]" />,
      title: 'Trust & Transparency',
      description: 'Building relationships through honest communication and transparent processes'
    },
    {
      icon: <Target className="w-12 h-12 text-[#D4AF37]" />,
      title: 'Client Focus',
      description: 'Your vision and satisfaction are at the center of everything we do'
    },
    {
      icon: <Zap className="w-12 h-12 text-[#D4AF37]" />,
      title: 'Excellence',
      description: 'Delivering superior quality through expertise and attention to detail'
    }
  ];

  const stats = [
    { icon: <Award className="w-8 h-8" />, number: '25+', label: 'Projects Completed' },
    { icon: <Users className="w-8 h-8" />, number: '100+', label: 'Satisfied Clients' },
    { icon: <TrendingUp className="w-8 h-8" />, number: 'New', label: 'Fresh & Growing' }
  ];

  return (
    <div className="min-h-screen pt-20">
      <section className="py-20 md:py-32 bg-[#0A0F1D]" data-testid="about-hero">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h1
              className="text-5xl sm:text-6xl font-bold text-white mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              About <span className="text-[#D4AF37]">RT Groups</span>
            </h1>
            <p className="text-[#94A3B8] text-lg max-w-3xl mx-auto leading-relaxed">
              Your trusted partner in real estate and construction excellence | Your Space, Our Promise
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeInUp}>
              <h2
                className="text-3xl sm:text-4xl font-bold text-white mb-6"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Building Dreams,<br />
                Creating <span className="text-[#D4AF37]">Legacies</span>
              </h2>
              <p className="text-[#94A3B8] leading-relaxed mb-6">
                RT Groups is a fresh and dynamic real estate and construction company committed to transforming
                visions into reality. Though newly established, our team brings together passionate professionals
                dedicated to delivering excellence in residential, commercial, and infrastructure sectors.
              </p>
              <p className="text-[#94A3B8] leading-relaxed mb-6">
                Our comprehensive services span property buying and selling mediation, end-to-end construction
                solutions, and skilled manpower supply. We pride ourselves on delivering excellence through
                transparent processes, quality workmanship, and unwavering commitment to client satisfaction.
              </p>
              <p className="text-[#94A3B8] leading-relaxed">
                Whether you're looking to invest in property, build your dream home, or require expert
                construction support, RT Groups is your trusted partner every step of the way.
                <br /><br />
                <span className="text-[#D4AF37] font-semibold">Your Space, Our Promise.</span>
              </p>
            </motion.div>
            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              className="relative h-96 rounded-2xl overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1762811054947-605b20298615"
                alt="BuildDreams"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1D]/50 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#121B2F]" data-testid="stats-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                transition={{ delay: index * 0.15 }}
                data-testid={`about-stat-${index}`}
                className="bg-[#0A0F1D] border border-white/5 rounded-2xl p-8 text-center"
              >
                <div className="flex justify-center mb-4 text-[#D4AF37]">{stat.icon}</div>
                <div
                  className="text-5xl font-bold text-white mb-2"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {stat.number}
                </div>
                <div className="text-[#94A3B8] text-sm uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-[#0A0F1D]" data-testid="values-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2
              className="text-4xl sm:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Our <span className="text-[#D4AF37]">Values</span>
            </h2>
            <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
              The principles that guide us in everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                transition={{ delay: index * 0.15 }}
                data-testid={`value-card-${index}`}
                className="bg-[#121B2F] border border-white/5 rounded-2xl p-8 text-center hover:-translate-y-2 hover:border-white/20 transition-all duration-300"
              >
                <div className="flex justify-center mb-6">{value.icon}</div>
                <h3
                  className="text-2xl font-semibold text-white mb-4"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {value.title}
                </h3>
                <p className="text-[#94A3B8] leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};