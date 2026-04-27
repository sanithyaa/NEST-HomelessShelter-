'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, User, MapPin, Heart, Briefcase, ClipboardList } from 'lucide-react'
import { ShelterRequest } from '@/lib/api'
import dynamic from 'next/dynamic'

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)

interface ShelterProfilePreviewProps {
  request: ShelterRequest
  isOpen: boolean
  onClose: () => void
}

export function ShelterProfilePreview({
  request,
  isOpen,
  onClose,
}: ShelterProfilePreviewProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-cream-50 dark:bg-dark-surface shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-deepbrown dark:text-dark-text">
                  Profile Preview
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-tan dark:hover:bg-dark-card rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-brown-600 dark:text-brown-400" />
                </button>
              </div>

              {/* Basic Info */}
              <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-amber/20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-amber" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-deepbrown dark:text-dark-text">
                      {request.name}
                    </h3>
                    <p className="text-sm text-brown-600 dark:text-brown-400">
                      {request.age} years • {request.gender}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-brown-600 dark:text-brown-400 mb-1">
                      Submitted By
                    </p>
                    <p className="text-sm text-deepbrown dark:text-dark-text">
                      {request.submittedBy}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-brown-600 dark:text-brown-400 mb-1">
                      Submission Date
                    </p>
                    <p className="text-sm text-deepbrown dark:text-dark-text">
                      {new Date(request.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <ClipboardList className="w-5 h-5 text-amber" />
                  <h4 className="font-semibold text-deepbrown dark:text-dark-text">
                    Request Reason
                  </h4>
                </div>
                <p className="text-sm text-brown-800 dark:text-brown-200">
                  {request.reason}
                </p>
              </div>

              {/* Health Info */}
              {request.health && (
                <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-5 h-5 text-amber" />
                    <h4 className="font-semibold text-deepbrown dark:text-dark-text">
                      Health Information
                    </h4>
                  </div>
                  <p className="text-sm text-brown-800 dark:text-brown-200">
                    {request.health}
                  </p>
                </div>
              )}

              {/* Skills */}
              {request.skills && (
                <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Briefcase className="w-5 h-5 text-amber" />
                    <h4 className="font-semibold text-deepbrown dark:text-dark-text">
                      Skills & Abilities
                    </h4>
                  </div>
                  <p className="text-sm text-brown-800 dark:text-brown-200">
                    {request.skills}
                  </p>
                </div>
              )}

              {/* Needs */}
              {request.needs && (
                <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <ClipboardList className="w-5 h-5 text-amber" />
                    <h4 className="font-semibold text-deepbrown dark:text-dark-text">
                      Immediate Needs
                    </h4>
                  </div>
                  <p className="text-sm text-brown-800 dark:text-brown-200">
                    {request.needs}
                  </p>
                </div>
              )}

              {/* Location Map */}
              {request.location && (
                <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-amber" />
                    <h4 className="font-semibold text-deepbrown dark:text-dark-text">
                      Location
                    </h4>
                  </div>
                  {request.locationName && (
                    <p className="text-sm text-brown-800 dark:text-brown-200 mb-3">
                      {request.locationName}
                    </p>
                  )}
                  <div className="h-48 rounded-xl overflow-hidden">
                    <MapContainer
                      center={[request.location.lat, request.location.lng]}
                      zoom={13}
                      scrollWheelZoom={false}
                      className="h-full w-full"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[request.location.lat, request.location.lng]} />
                    </MapContainer>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
