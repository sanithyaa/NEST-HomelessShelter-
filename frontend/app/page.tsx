'use client'

import { motion } from 'framer-motion'
import { Heart, MapPin, MessageCircle, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const features = [
    {
      icon: MapPin,
      title: 'Resource Navigation',
      description: 'Find nearby shelters, food banks, and essential services',
      color: 'text-amber',
    },
    {
      icon: MessageCircle,
      title: 'Real-Time Support',
      description: 'Get instant help and guidance from our team',
      color: 'text-brown',
    },
    {
      icon: Users,
      title: 'Community Connect',
      description: 'Connect with volunteers and support networks',
      color: 'text-earthy',
    },
    {
      icon: Heart,
      title: 'Personalized Care',
      description: 'Tailored recommendations based on your needs',
      color: 'text-deepbrown',
    },
  ]

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-tan via-cream to-beige dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg py-20 px-4 transition-all duration-500">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-deepbrown dark:text-dark-text mb-6 transition-colors duration-500">
              Welcome to <span className="text-amber dark:text-amber animate-pulse-slow">NEST</span>
            </h1>
            <p className="text-xl text-brown dark:text-dark-muted mb-8 max-w-2xl mx-auto transition-colors duration-500">
              Connecting those in need with resources, support, and hope. Your
              journey to stability starts here.
            </p>
            <div className="flex gap-4 justify-center flex-wrap relative z-50">
              <a 
                href="/auth/login"
                className="btn-primary cursor-pointer inline-block"
              >
                Get Started
              </a>
              <button 
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="btn-secondary"
              >
                Learn More
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-cream dark:bg-dark-bg transition-all duration-500">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-deepbrown dark:text-dark-text mb-12 transition-colors duration-500">
            How We Help
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card hover:shadow-2xl hover:scale-105 transition-all duration-300 group cursor-pointer"
              >
                <feature.icon className={`w-12 h-12 ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`} />
                <h3 className="text-xl font-semibold text-deepbrown dark:text-dark-text mb-2 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-brown dark:text-dark-muted transition-colors duration-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-deepbrown dark:bg-gradient-to-br dark:from-dark-surface dark:to-dark-bg text-white py-16 px-4 transition-all duration-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber/5 via-transparent to-earthy/5 dark:from-amber/10 dark:to-earthy/10"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4 transition-colors duration-300">Ready to Get Started?</h2>
          <p className="text-lg mb-8 text-tan dark:text-dark-muted transition-colors duration-300">
            Join thousands who have found support and resources through our
            platform
          </p>
          <Link 
            href="/auth/register"
            onClick={(e) => {
              console.log('Link clicked!')
            }}
            className="inline-block bg-amber hover:bg-brown text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-amber/30 hover:scale-105 active:scale-95"
          >
            Access Resources Now
          </Link>
        </div>
      </section>
    </main>
  )
}
