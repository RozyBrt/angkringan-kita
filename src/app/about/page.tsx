'use client';

import { MapPin, Clock, Phone, Coffee, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-coffee-700 rounded-2xl text-cream-50 mb-5 shadow-lg">
          <Coffee size={36} />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-coffee-900 mb-3">
          Tentang Kami
        </h1>
        <p className="text-coffee-500 text-lg max-w-lg mx-auto leading-relaxed">
          Lebih dari sekadar tempat ngopi — ini rumah kedua buat kamu yang butuh ketenangan
          dan cemilan murah meriah.
        </p>
      </div>

      {/* Story */}
      <div className="card p-6 sm:p-8 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Heart size={18} className="text-warm-500" />
          <h2 className="font-display text-xl font-semibold text-coffee-900">Cerita Kami</h2>
        </div>
        <div className="space-y-4 text-coffee-600 leading-relaxed text-sm sm:text-base">
          <p>
            <strong className="text-coffee-800">Angkringan Kita</strong> bermula dari keinginan sederhana:
            menyediakan tempat nongkrong yang nyaman, dengan makanan dan minuman tradisional
            yang rasanya beneran — bukan yang angin-anginan.
          </p>
          <p>
            Mulai dari <em>Kopi Hitam Tubruk</em> yang diseduh pakai air mendidih dari poci tanah liat,
            hasta <em>Nasi Kucing</em> bungkus daun pisang yang sambalnya bikin nagih. Semua racikan kami
            dibuat fresh setiap hari, tanpa bahan pengawet, dan dengan harga yang ramah di kantong.
          </p>
          <p>
            Kami percaya bahwa makanan enak tidak harus mahal. Maka dari itu, di Angkringan Kita,
            kamu bisa kenyang, happy, dan dompetmu tetap aman. 😄
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {/* Location */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-cream-100 rounded-xl">
              <MapPin size={18} className="text-coffee-700" />
            </div>
            <h3 className="font-display font-semibold text-coffee-900">Lokasi</h3>
          </div>
          <p className="text-coffee-600 text-sm leading-relaxed">
            Jl. Angkringan No. 17, Seturan,<br />
            Caturtunggal, Depok, Sleman,<br />
            Yogyakarta 55281
          </p>
        </div>

        {/* Hours */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-cream-100 rounded-xl">
              <Clock size={18} className="text-coffee-700" />
            </div>
            <h3 className="font-display font-semibold text-coffee-900">Jam Buka</h3>
          </div>
          <div className="text-coffee-600 text-sm space-y-1">
            <div className="flex justify-between">
              <span>Senin – Jumat</span>
              <span className="font-medium text-coffee-800">16:00 – 23:00</span>
            </div>
            <div className="flex justify-between">
              <span>Sabtu – Minggu</span>
              <span className="font-medium text-coffee-800">15:00 – 00:00</span>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="card p-5 sm:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-cream-100 rounded-xl">
              <Phone size={18} className="text-coffee-700" />
            </div>
            <h3 className="font-display font-semibold text-coffee-900">Hubungi Kami</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 
                         rounded-xl text-sm font-medium border border-green-200 
                         hover:bg-green-100 transition-colors"
            >
              💬 WhatsApp
            </a>
            <a
              href="https://instagram.com/angkringan.kita"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-700 
                         rounded-xl text-sm font-medium border border-pink-200 
                         hover:bg-pink-100 transition-colors"
            >
              📸 Instagram
            </a>
          </div>
        </div>
      </div>

      {/* Map Embed */}
      <div className="card overflow-hidden mb-8">
        <div className="p-4 border-b border-cream-100">
          <h3 className="font-display font-semibold text-coffee-900 flex items-center gap-2">
            <MapPin size={16} className="text-coffee-500" />
            Temukan Kami di Peta
          </h3>
        </div>
        <div className="aspect-video relative bg-cream-100">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.1!2d110.4!3d-7.77!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwNDYnMTIuMCJTIDExMMKwMjQnMDAuMCJF!5e0!3m2!1sid!2sid!4v1!5m2!1sid!2sid"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0"
          />
        </div>
      </div>

      {/* Fun tagline */}
      <div className="text-center text-coffee-400 text-sm">
        <p>☕ Kopi murah, teman akrab, suasana santai. Itulah Angkringan Kita.</p>
      </div>
    </div>
  );
}
