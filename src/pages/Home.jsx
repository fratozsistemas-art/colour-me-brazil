import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createPageUrl } from '../utils';
import { 
  Book, Palette, Globe, Star, Trophy, Sparkles, 
  Smartphone, Download, ArrowRight, CheckCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const handleGetStarted = () => {
    window.location.href = createPageUrl('Library');
  };

  // Generate QR code URLs for app download
  const iosAppUrl = 'https://apps.apple.com/app/colour-me-brazil'; // Replace with actual App Store URL
  const androidAppUrl = 'https://play.google.com/store/apps/details?id=com.colourmebrazil'; // Replace with actual Play Store URL
  
  const iosQRCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(iosAppUrl)}`;
  const androidQRCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(androidAppUrl)}`;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4" style={{ background: 'linear-gradient(135deg, #FFF8F0 0%, #FFD23F 50%, #FF8C42 100%)' }}>
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69383fc9e0a81f2fec355d14/fb45bdf53_A_beautiful_watercolor_toucan_bird_illustration_in-1765301342087.png"
                alt="Colour Me Brazil"
                className="w-32 h-32 object-contain"
              />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-800">
              Colour Me Brazil
            </h1>
            <p className="text-2xl md:text-3xl mb-4 text-gray-700">
              Explore Brazilian Culture Through Art
            </p>
            <p className="text-lg md:text-xl mb-8 text-gray-600 max-w-3xl mx-auto">
              An interactive bilingual coloring experience for children aged 6-12. 
              Discover the Amazon rainforest, Brazilian folklore, and cultural traditions 
              through beautiful illustrations and engaging stories.
            </p>
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="text-xl px-8 py-6 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-xl"
            >
              Get Started
              <ArrowRight className="w-6 h-6 ml-2" />
            </Button>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 text-6xl animate-bounce">🦜</div>
        <div className="absolute bottom-10 right-10 text-6xl animate-bounce" style={{ animationDelay: '0.5s' }}>🌺</div>
        <div className="absolute top-1/2 right-20 text-5xl animate-pulse">🌿</div>
        <div className="absolute bottom-1/4 left-20 text-5xl animate-pulse" style={{ animationDelay: '1s' }}>🎨</div>
      </section>

      {/* About Us Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-orange-50 to-blue-50">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold mb-6 text-gray-800">About Colour Me Brazil</h2>
            <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
              <p>
                Welcome to <strong>Colour Me Brazil</strong>, where culture meets creativity! We're on a mission to bring 
                Brazilian heritage to life through interactive, bilingual storytelling and art.
              </p>
              <p>
                Our platform offers children aged 6-12 an immersive experience exploring the Amazon rainforest, 
                rich folklore, vibrant traditions, and unique wildlife of Brazil. Each story is carefully crafted 
                to educate and inspire young minds while celebrating the beauty and diversity of Brazilian culture.
              </p>
              <p>
                Through engaging narratives, stunning illustrations, and hands-on coloring activities, children 
                can develop language skills, cultural awareness, and artistic expression—all while having fun!
              </p>
              <p className="text-xl font-semibold text-orange-600 mt-6">
                Join us on this colorful journey through Brazil! 🇧🇷✨
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
            Why Kids Love Colour Me Brazil
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 h-full border-2 border-orange-200 hover:shadow-xl transition-shadow flex flex-col">
                <Book className="w-12 h-12 text-orange-500 mb-4" />
                <h3 className="text-xl font-bold mb-3 text-gray-800">Interactive Stories</h3>
                <p className="text-gray-600 flex-grow">
                  Bilingual narrated stories in English and Portuguese with audio, 
                  quizzes, and cultural facts to make learning fun.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 h-full border-2 border-blue-200 hover:shadow-xl transition-shadow flex flex-col">
                <Palette className="w-12 h-12 text-blue-500 mb-4" />
                <h3 className="text-xl font-bold mb-3 text-gray-800">Creative Coloring</h3>
                <p className="text-gray-600 flex-grow">
                  Advanced digital coloring tools with brushes, fill patterns, 
                  and the ability to save and share artwork.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 h-full border-2 border-purple-200 hover:shadow-xl transition-shadow flex flex-col">
                <Trophy className="w-12 h-12 text-purple-500 mb-4" />
                <h3 className="text-xl font-bold mb-3 text-gray-800">Gamification</h3>
                <p className="text-gray-600 flex-grow">
                  Earn points, unlock achievements, climb tiers, and compete on 
                  leaderboards while learning about Brazilian culture.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 h-full border-2 border-green-200 hover:shadow-xl transition-shadow flex flex-col">
                <Globe className="w-12 h-12 text-green-500 mb-4" />
                <h3 className="text-xl font-bold mb-3 text-gray-800">Cultural Learning</h3>
                <p className="text-gray-600 flex-grow">
                  Explore Brazilian folklore, Amazon wildlife, traditions, 
                  and vocabulary through engaging content.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 h-full border-2 border-pink-200 hover:shadow-xl transition-shadow flex flex-col">
                <Star className="w-12 h-12 text-pink-500 mb-4" />
                <h3 className="text-xl font-bold mb-3 text-gray-800">Community</h3>
                <p className="text-gray-600 flex-grow">
                  Share artwork, collaborate on stories, create reading paths, 
                  and connect with other young artists.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 h-full border-2 border-yellow-200 hover:shadow-xl transition-shadow flex flex-col">
                <Sparkles className="w-12 h-12 text-yellow-500 mb-4" />
                <h3 className="text-xl font-bold mb-3 text-gray-800">Offline Mode</h3>
                <p className="text-gray-600 flex-grow">
                  Download books and color anywhere, even without internet. 
                  Perfect for travel and on-the-go learning.
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mobile App Download Section */}
      <section className="py-16 px-4" style={{ background: 'linear-gradient(135deg, #A8DADC 0%, #2E86AB 100%)' }}>
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Smartphone className="w-16 h-16 mx-auto mb-4 text-white" />
            <h2 className="text-4xl font-bold mb-4 text-white">
              Download Our Mobile App
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Get the best experience on your mobile device. 
              Scan the QR code with your phone camera to download.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* iOS App */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 text-center">
                <div className="text-6xl mb-4">🍎</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">iOS App</h3>
                <div className="bg-white p-4 rounded-xl inline-block mb-4 shadow-inner">
                  <img 
                    src={iosQRCode} 
                    alt="iOS App QR Code"
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Scan with your iPhone or iPad camera
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(iosAppUrl, '_blank')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download on App Store
                </Button>
              </Card>
            </motion.div>

            {/* Android App */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 text-center">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Android App</h3>
                <div className="bg-white p-4 rounded-xl inline-block mb-4 shadow-inner">
                  <img 
                    src={androidQRCode} 
                    alt="Android App QR Code"
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Scan with your Android device camera
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(androidAppUrl, '_blank')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Get it on Google Play
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Meet Grace Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center gap-8"
          >
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-orange-200 to-pink-200 flex items-center justify-center flex-shrink-0 shadow-xl">
              <span className="text-7xl">👩‍🎨</span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{
                background: 'linear-gradient(135deg, #FF6B35 0%, #2E86AB 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Meet Grace
              </h2>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                Grace is an educator and artist passionate about bringing Brazilian culture to children around the world. 
                With a background in children's literature and multicultural education, she created Colour Me Brazil to 
                make learning about Brazil's rich heritage fun, interactive, and accessible.
              </p>
              <p className="text-gray-600 leading-relaxed italic">
                "Every child deserves to explore the world through art and stories. Brazil's vibrant culture, incredible 
                wildlife, and beautiful traditions should be celebrated and shared with the next generation."
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-orange-500 mb-2">12+</div>
              <p className="text-gray-600">Illustrated Books</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-blue-500 mb-2">144+</div>
              <p className="text-gray-600">Coloring Pages</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-purple-500 mb-2">2</div>
              <p className="text-gray-600">Languages</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-green-500 mb-2">100%</div>
              <p className="text-gray-600">Educational Fun</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4" style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)' }}>
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Ready to Start Your Brazilian Adventure?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of children exploring Brazilian culture through art and storytelling.
          </p>
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="text-xl px-8 py-6 bg-white text-orange-600 hover:bg-gray-100 shadow-xl"
          >
            Start Learning Today
            <ArrowRight className="w-6 h-6 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
}