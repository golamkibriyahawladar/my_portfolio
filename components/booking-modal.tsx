'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Video, Clock, X, ExternalLink, ArrowRight } from 'lucide-react'

export function BookingModal() {
  const [isOpen, setIsOpen] = useState(false)

  // Default: Calendly-style embed. User can set their own booking URL
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL || ''

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/15 text-white/80 text-sm font-semibold hover:bg-white/10 hover:border-white/25 transition-all duration-300"
      >
        <Calendar className="w-4 h-4 text-[#a3e635]" />
        <span>Book a Discovery Call</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-white/40" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-md bg-[#0e0e14] border border-white/15 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#a3e635]/15 border border-[#a3e635]/30 flex items-center justify-center">
                    <Video className="w-4 h-4 text-[#a3e635]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Schedule a Call</h3>
                    <p className="text-[10px] text-white/40 font-mono">15-min Discovery Session</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {bookingUrl ? (
                  // Embed booking widget
                  <div className="rounded-xl overflow-hidden bg-white" style={{ minHeight: 400 }}>
                    <iframe
                      src={bookingUrl}
                      className="w-full h-[400px] border-0"
                      title="Book a call"
                    />
                  </div>
                ) : (
                  // Fallback: Info card with contact options
                  <div className="space-y-5">
                    <div className="p-4 rounded-xl bg-[#a3e635]/5 border border-[#a3e635]/15">
                      <h4 className="text-xs font-bold text-white mb-2">What to expect:</h4>
                      <ul className="space-y-2 text-[11px] text-white/60">
                        <li className="flex items-start gap-2">
                          <Clock className="w-3.5 h-3.5 mt-0.5 text-[#a3e635] shrink-0" />
                          <span>15-minute focused session to understand your project</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Video className="w-3.5 h-3.5 mt-0.5 text-[#a3e635] shrink-0" />
                          <span>Google Meet / Zoom — your preference</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Calendar className="w-3.5 h-3.5 mt-0.5 text-[#a3e635] shrink-0" />
                          <span>Available Sunday–Thursday, 10 AM – 8 PM (GMT+6)</span>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <a
                        href="mailto:golamkibriyahawladar@gmail.com?subject=Discovery%20Call%20Request"
                        className="w-full py-3 rounded-xl bg-[#a3e635] text-black text-xs font-bold hover:bg-[#b5f03d] transition-colors flex items-center justify-center gap-2"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        Request a Call via Email
                      </a>
                      <button
                        onClick={() => {
                          setIsOpen(false)
                          setTimeout(() => {
                            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
                          }, 300)
                        }}
                        className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                      >
                        Or send a message via contact form
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-white/5 text-center text-[10px] text-white/25 font-mono">
                Typically responds within 2 hours during business hours
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
