
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { WEDDING_DATE, COUPLE_NAMES, COUPLE_DATA, GALLERY_IMAGES, EVENT_DATA, GIFT_DATA } from './data';
import { CountdownTime, Wish } from './types';
import metadata from './metadata.json';

// Setup Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const App: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<CountdownTime>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [wishes, setWishes] = useState<Wish[]>([
    {
      id: '1',
      name: 'Laura Andini',
      message: 'Happy Wedding Fulan! ❤️❤️❤️',
      status: 'Going',
      timestamp: new Date()
    }
  ]);
  const [isGeneratingWish, setIsGeneratingWish] = useState(false);
  const [currentName, setCurrentName] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentStatus, setCurrentStatus] = useState<'Going' | 'Maybe' | 'Not Going'>('Going');
  const [toName, setToName] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false); // NEW
  const audioRef = useRef<HTMLAudioElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const manualPauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProgrammaticScrollRef = useRef(false); // NEW // NEW

  // Read URL parameter 'to'
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('to');
    if (name) {
      setToName(name);
    }
  }, []);

  // Set document title from metadata
  useEffect(() => {
    document.title = metadata.title;
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleAutoScroll = () => {
    setIsAutoScrolling(prev => !prev);
  };

  // Auto-scrolling logic
  useEffect(() => {
    const contentElement = contentRef.current;

    if (isAutoScrolling && contentElement && !isManuallyPaused) {
      contentElement.style.scrollBehavior = 'auto';

      const scrollStep = () => {
        const maxScroll = contentElement.scrollHeight - contentElement.clientHeight;
        if (contentElement.scrollTop >= maxScroll - 1) {
          setIsAutoScrolling(false);
          return;
        }
        isProgrammaticScrollRef.current = true; // Set flag just before scrolling
        contentElement.scrollTop += 1;
        animationFrameRef.current = requestAnimationFrame(scrollStep);
      };
      animationFrameRef.current = requestAnimationFrame(scrollStep);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (contentElement) {
        contentElement.style.scrollBehavior = 'smooth';
      }
      isProgrammaticScrollRef.current = false; // Reset flag on cleanup
    };
  }, [isAutoScrolling, isManuallyPaused]); // Added isManuallyPaused to dependencies

  // Handle manual scroll to pause auto-scroll
  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;

    const handleScroll = () => {
      if (isProgrammaticScrollRef.current) {
        // This scroll event was triggered by our auto-scroll. Reset the flag and ignore.
        isProgrammaticScrollRef.current = false;
        return;
      }

      // If we reach here, it's a manual scroll.
      if (isAutoScrolling) {
        setIsManuallyPaused(true);

        if (manualPauseTimeoutRef.current) {
          clearTimeout(manualPauseTimeoutRef.current);
        }

        manualPauseTimeoutRef.current = setTimeout(() => {
          setIsManuallyPaused(false);
          manualPauseTimeoutRef.current = null;
        }, 10000); // 10 seconds
      }
    };

    contentElement.addEventListener('scroll', handleScroll);

    return () => {
      contentElement.removeEventListener('scroll', handleScroll);
      if (manualPauseTimeoutRef.current) {
        clearTimeout(manualPauseTimeoutRef.current);
        manualPauseTimeoutRef.current = null;
      }
    };
  }, [isAutoScrolling, isManuallyPaused]); // Depend on isAutoScrolling to re-create handler with latest state. Add isManuallyPaused for consistency.

  // Countdown logic
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = WEDDING_DATE.getTime() - now.getTime();

      if (diff <= 0) {
        clearInterval(timer);
      } else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleGenerateAIWish = async () => {
    if (!currentName) {
      alert("Please enter your name first!");
      return;
    }
    setIsGeneratingWish(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a heartwarming and creative wedding wish for Tiara and Kevin from me, ${currentName}. Keep it under 50 words.`,
        config: {
          temperature: 0.8,
        }
      });
      if (response.text) {
        setCurrentMessage(response.text.trim());
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate wish. Please try again.");
    } finally {
      setIsGeneratingWish(false);
    }
  };

  const handleSubmitWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentName || !currentMessage) return;

    const newWish: Wish = {
      id: Date.now().toString(),
      name: currentName,
      message: currentMessage,
      status: currentStatus,
      timestamp: new Date()
    };

    setWishes([newWish, ...wishes]);
    setCurrentName('');
    setCurrentMessage('');
  };

  return (
    <div className="flex min-h-screen font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-1/2 bg-bg-dark text-white p-20 flex-col justify-center items-center relative overflow-hidden fixed h-screen left-0 top-0">
        <div className="absolute top-10 left-10 w-2 h-2 bg-blue-300 rounded-full opacity-50"></div>
        <div className="absolute bottom-20 right-20 w-3 h-3 bg-yellow-200 rounded-full opacity-40"></div>
        <div className="z-10 text-center">
          <p className="uppercase tracking-[0.3em] text-sm mb-6 text-blue-200">Undangan Pernikahan</p>
          <h1 className="font-display text-8xl mb-6">{COUPLE_NAMES.short}</h1>
          <p className="font-serif italic text-blue-100 max-w-md mx-auto leading-relaxed text-lg">
            "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu istri-istri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang."
          </p>
        </div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-900 rounded-full filter blur-3xl opacity-30"></div>
      </div>

      {/* Main Content Area */}
      <div ref={contentRef} className={`w-full lg:w-1/2 h-screen overflow-y-auto no-scrollbar relative transition-all duration-1000 bg-bg-light ${!isOpen ? 'overflow-hidden' : ''}`}>

        {/* Cover Screen */}
        <div className={`absolute inset-0 z-50 bg-[#cce3f3] flex flex-col transition-transform duration-1000 ease-in-out ${isOpen ? '-translate-y-full' : 'translate-y-0'}`}>
          <div className="relative flex-grow overflow-hidden">
            <img src="https://picsum.photos/seed/travel/800/1200" alt="Couple" className="w-full h-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#cce3f3] via-transparent to-transparent"></div>
          </div>
          <div className="relative z-10 px-8 py-12 text-center -mt-10 bg-[#cce3f3] rounded-t-3xl">
            <h2 className="font-display text-6xl text-primary mb-2">{COUPLE_NAMES.short}</h2>
            <p className="text-sm uppercase tracking-widest text-gray-500 mb-6 font-bold">{EVENT_DATA.ceremony.date}</p>
            <div className="mb-10">
              <p className="text-xs text-gray-500 uppercase mb-1">Yth. Bapak/Ibu/Saudara/i,</p>
              <h3 className="text-xl font-bold text-gray-800">{toName || 'Tamu Undangan'}</h3>
            </div>
            <button
              onClick={() => {
                setIsOpen(true);
                // Auto-play music and start auto scrolling when invitation is opened
                setTimeout(() => {
                  if (audioRef.current) {
                    audioRef.current.play().catch(e => console.log("Auto-play failed:", e));
                    setIsPlaying(true);
                  }
                  // Start auto scrolling automatically
                  setIsAutoScrolling(true);
                }, 500); // Increased delay to ensure DOM is fully updated
              }}
              className="px-10 py-4 bg-primary text-white rounded-full font-bold shadow-lg hover:bg-blue-800 transition transform hover:scale-105 flex items-center justify-center mx-auto"
            >
              <span className="material-icons-round mr-2">drafts</span> Buka Undangan
            </button>
          </div>
        </div>

        {/* Scrollable Content (Visible after opening) */}
        {isOpen && (
          <div className="pb-32">
            {/* Music Control */}
            <button
              onClick={toggleMusic}
              className={`fixed top-6 right-6 z-40 w-12 h-12 bg-white/80 backdrop-blur rounded-full shadow-lg flex items-center justify-center text-primary ${isPlaying ? 'animate-slow-spin' : ''}`}
            >
              <span className="material-icons-round">music_note</span>
            </button>

            {/* Auto Scroll Control */}
            <button
              onClick={toggleAutoScroll}
              className={`fixed top-6 right-20 z-40 w-12 h-12 bg-white/80 backdrop-blur rounded-full shadow-lg flex items-center justify-center text-primary ${isAutoScrolling ? 'animate-slow-spin' : ''}`}
            >
              <span className="material-icons-round">arrow_downward</span>
            </button>

            {/* Hidden Audio Element */}
            <audio
              ref={audioRef}
              loop
              onEnded={() => setIsPlaying(false)}
              onError={() => {
                console.error("Audio failed to load or play");
                setIsPlaying(false);
              }}
            >
              <source src={COUPLE_NAMES.song} type="audio/mpeg" />
              Browser Anda tidak mendukung elemen audio.
            </audio>

            {/* Hero Section */}
            <section id="home" className="h-screen relative flex items-end">
              <img src="https://picsum.photos/seed/hero/800/1200" alt="Hero" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white"></div>
              <div className="relative z-10 w-full p-8 pb-24 text-center">
                <h1 className="font-display text-6xl text-white mb-4">{COUPLE_NAMES.short}</h1>
                <p className="font-bold text-white mb-8">{EVENT_DATA.ceremony.date}</p>
                <div className="flex justify-center space-x-4">
                  {[
                    { label: 'Hari', value: timeLeft.days },
                    { label: 'Jam', value: timeLeft.hours },
                    { label: 'Menit', value: timeLeft.minutes },
                    { label: 'Detik', value: timeLeft.seconds }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col bg-white/80 backdrop-blur p-3 rounded-xl w-16 shadow-md border border-white/50">
                      <span className="text-2xl font-bold text-primary">{String(item.value).padStart(2, '0')}</span>
                      <span className="text-[0.6rem] uppercase font-bold text-gray-500">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Quote Section */}
            <section className="py-20 px-10 text-center bg-white relative overflow-hidden">
              <div className="max-w-md mx-auto relative z-10">
                <span className="text-5xl text-primary/20 font-serif leading-none">“</span>
                <p className="font-serif italic text-lg text-gray-600 mb-6 leading-relaxed">

                  ﷽

                </p>
                <p className="mb-4">
                  وَمِنْ ءَايَٰتِهِۦٓ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَٰجًا لِّتَسْكُنُوٓا۟ إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ۚ إِنَّ فِى ذَٰلِكَ لَءَايَٰتٍ لِّقَوْمٍ يَتَفَكَّرُونَ
                </p>
                <p className="mb-4">
                  Artinya: "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu istri-istri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda bagi kaum yang berfikir."
                </p>


                <p className="text-xs font-bold text-primary uppercase tracking-widest">(Q.S. Ar-Rum: 21)</p>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full opacity-50"></div>
            </section>

            {/* Couple Section */}
            <section id="couple" className="relative overflow-hidden py-20 px-8 bg-bg-light rounded-[3rem] mx-4 shadow-sm my-10">
              <img src="/border.webp" alt="Dekorasi Bunga" className="absolute -top-10 -right-10 w-64 h-64 opacity-30 transform rotate-180" />
              <img src="/border.webp" alt="Dekorasi Bunga" className="absolute -bottom-10 -left-10 w-64 h-64 opacity-30" />
              <div className="text-center mb-16 relative z-10">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-2">Pasangan Mempelai</p>
                <h2 className="font-display text-5xl text-primary">Mempelai </h2>
              </div>

              <div className="flex flex-col items-center mb-12">
                <div className="w-48 h-48 rounded-full overflow-hidden border-8 border-white shadow-xl mb-6 transform hover:rotate-2 transition">
                  <img src={COUPLE_DATA.bride.image} alt="Mempelai Wanita" className="w-full h-full object-cover" />
                </div>
                <h3 className="font-display text-4xl text-gray-800 mb-2">{COUPLE_DATA.bride.name}</h3>
                <p className="text-sm text-gray-500 uppercase tracking-widest mb-4">( {COUPLE_DATA.bride.short} )</p>
                <p className="text-sm text-gray-500 mb-4">{COUPLE_DATA.bride.parents}</p>
                <div className="flex space-x-4">
                  <a href={`https://instagram.com/${COUPLE_DATA.bride.instagram.substring(1)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:bg-primary hover:text-white transition">
                    <i className="fab fa-instagram"></i>
                  </a>
                </div>
              </div>

              <div className="text-center font-display text-6xl text-secondary my-12 opacity-50">&</div>

              <div className="flex flex-col items-center">
                <div className="w-48 h-48 rounded-full overflow-hidden border-8 border-white shadow-xl mb-6 transform hover:-rotate-2 transition">
                  <img src={COUPLE_DATA.groom.image} alt="Mempelai Pria" className="w-full h-full object-cover" />
                </div>
                <h3 className="font-display text-4xl text-gray-800 mb-2">{COUPLE_DATA.groom.name}</h3>
                <p className="text-sm text-gray-500 uppercase tracking-widest mb-4">( {COUPLE_DATA.groom.short} )</p>
                <p className="text-sm text-gray-500 mb-4">{COUPLE_DATA.groom.parents}</p>
                <div className="flex space-x-4">
                  <a href={`https://instagram.com/${COUPLE_DATA.groom.instagram.substring(1)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:bg-primary hover:text-white transition">
                    <i className="fab fa-instagram"></i>
                  </a>
                </div>
              </div>
            </section>

            {/* Event Section */}
            <section id="event" className="py-20 px-8">
              <div className="text-center mb-12">
                <h2 className="font-display text-5xl text-primary mb-4">Detail Acara</h2>
                <p className="text-sm text-gray-500 max-w-lg mx-auto">Dengan segala kerendahan hati, kami bermaksud mengundang Bapak/Ibu/Saudara/i dalam acara pernikahan kami yang akan diselenggarakan pada:</p>
              </div>

              <div className="space-y-8">
                <div className="bg-white p-8 rounded-3xl shadow-xl border-t-8 border-primary relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className="material-icons-round text-8xl">mosque</span>
                  </div>
                  <h3 className="font-display text-3xl text-gray-800 mb-2">{EVENT_DATA.ceremony.title}</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-4">{EVENT_DATA.ceremony.date}</p>
                  <p className="inline-block px-4 py-1 bg-gray-100 rounded-full text-sm text-gray-600 mb-6">{EVENT_DATA.ceremony.time}</p>
                  <div className="mb-8">
                    <p className="font-bold text-lg text-gray-800">{EVENT_DATA.ceremony.locationName}</p>
                    <p className="text-sm text-gray-500">{EVENT_DATA.ceremony.locationAddress}</p>
                  </div>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(EVENT_DATA.ceremony.locationAddress)}`} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center space-x-2 transition hover:bg-blue-800">
                    <span className="material-icons-round text-sm">near_me</span> <span>Lihat di Google Maps</span>
                  </a>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-xl border-t-8 border-primary relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className="material-icons-round text-8xl">restaurant</span>
                  </div>
                  <h3 className="font-display text-3xl text-gray-800 mb-2">{EVENT_DATA.reception.title}</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-4">{EVENT_DATA.reception.date}</p>
                  <p className="inline-block px-4 py-1 bg-gray-100 rounded-full text-sm text-gray-600 mb-6">{EVENT_DATA.reception.time}</p>
                  <div className="mb-8">
                    <p className="font-bold text-lg text-gray-800">{EVENT_DATA.reception.locationName}</p>
                    <p className="text-sm text-gray-500">{EVENT_DATA.reception.locationAddress}</p>
                  </div>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(EVENT_DATA.reception.locationAddress)}`} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center space-x-2 transition hover:bg-blue-800">
                    <span className="material-icons-round text-sm">near_me</span> <span>Lihat di Google Maps</span>
                  </a>
                </div>
              </div>
            </section>

            {/* Gallery Section */}
            {GALLERY_IMAGES && GALLERY_IMAGES.length > 0 && (
              <section id="gallery" className="py-20 px-6">
                <h2 className="font-display text-5xl text-center text-primary mb-12">Galeri</h2>
                <div className="grid grid-cols-2 gap-4">
                  {GALLERY_IMAGES.map((img, i) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:scale-[1.02] transition duration-500">
                      <img src={img} alt={`Galeri ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Gift Section */}
            <section id="gift" className="py-20 px-8 bg-white">
              <div className="text-center mb-12">
                <h2 className="font-display text-5xl text-primary mb-4">Hadiah Pernikahan</h2>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">Kehadiran Anda adalah anugerah terindah, namun jika Anda ingin memberikan tanda kasih, Anda dapat menggunakan salah satu dari berikut:</p>
              </div>

              <div className="space-y-4">
                {GIFT_DATA.map((bank, index) => (
                  <div key={index} className="p-6 bg-bg-light rounded-2xl border border-gray-100 shadow-sm text-center">
                    <p className={`font-bold ${bank.color} mb-2`}>{bank.bankName}</p>
                    <p className="text-xs text-gray-400">Atas Nama</p>
                    <p className="font-bold text-gray-800 mb-2">{bank.accountName}</p>
                    <div className="bg-white py-3 rounded-lg font-mono text-xl font-bold flex items-center justify-center gap-2">
                      <span>{bank.accountNumber}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(bank.accountNumber)}
                        className="text-gray-400 hover:text-primary"><span className="material-icons-round text-sm">content_copy</span></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Wishes Section */}
            <section id="wishes" className="py-20 px-8 bg-bg-light rounded-t-[3rem] -mt-10 relative z-10">
              <h2 className="font-display text-5xl text-center text-primary mb-12">Ucapan & Doa</h2>

              <form onSubmit={handleSubmitWish} className="bg-white p-6 rounded-3xl shadow-xl mb-12 border border-blue-50">
                <input
                  type="text"
                  placeholder="Nama Anda"
                  value={currentName}
                  onChange={(e) => setCurrentName(e.target.value)}
                  className="w-full mb-4 px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary outline-none"
                />
                <div className="relative mb-4">
                  <textarea
                    placeholder="Tulis ucapan & doa Anda..."
                    rows={4}
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary outline-none resize-none"
                  ></textarea>
                </div>
                <div className="flex gap-2 mb-6">
                  {[
                    { value: 'Going', label: 'Hadir' },
                    { value: 'Maybe', label: 'Mungkin Hadir' },
                    { value: 'Not Going', label: 'Tidak Bisa Hadir' }
                  ].map((status) => (
                    <button
                      key={status.value}
                      type="button"
                      onClick={() => setCurrentStatus(status.value as any)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${currentStatus === status.value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
                <button className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition">
                  Kirim Ucapan
                </button>
              </form>

              <div className="space-y-6 max-h-[500px] overflow-y-auto no-scrollbar pr-2">
                {wishes.map((wish) => (
                  <div key={wish.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-800">{wish.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${wish.status === 'Going' ? 'bg-green-100 text-green-600' :
                        wish.status === 'Maybe' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
                        }`}>
                        {wish.status === 'Going' ? 'Hadir' : wish.status === 'Maybe' ? 'Mungkin Hadir' : 'Tidak Bisa Hadir'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed italic">"{wish.message}"</p>
                    <p className="text-[10px] text-gray-400 mt-2 text-right">
                      {new Date(wish.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-8 text-center bg-bg-dark text-white rounded-t-[3rem] -mt-10">
              <h2 className="font-display text-5xl mb-6">{COUPLE_NAMES.short}</h2>
              <p className="text-sm text-blue-200 mb-12">Terima kasih atas kehadiran & doa restu Anda.</p>
              <div className="border-t border-blue-900 pt-12 text-[10px] text-blue-400 uppercase tracking-widest leading-relaxed">
                <p>{COUPLE_NAMES.short} E-Undangan</p>
                <p>Dibuat dengan ❤️ untuk hari yang spesial</p>
              </div>
            </footer>
          </div>
        )}

        {/* Navigation - appears on both mobile and desktop */}
        {isOpen && (
          <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
            <div className="glass-nav rounded-3xl shadow-2xl flex justify-around items-center px-4 py-3 w-[85vw] max-w-sm lg:w-[600px]">
              {[
                { icon: 'home', label: 'Beranda', target: 'home' },
                { icon: 'favorite', label: 'Mempelai', target: 'couple' },
                { icon: 'event', label: 'Acara', target: 'event' },
                { icon: 'image', label: 'Galeri', target: 'gallery' },
                { icon: 'chat_bubble', label: 'Ucapan', target: 'wishes' }
              ]
                .filter(item => item.target !== 'gallery' || (GALLERY_IMAGES && GALLERY_IMAGES.length > 0))
                .map((item) => (
                  <a
                    key={item.label}
                    href={`#${item.target}`}
                    className="flex flex-col items-center text-gray-400 hover:text-primary transition"
                  >
                    <span className="material-icons-round">{item.icon}</span>
                    <span className="text-[10px] font-bold">{item.label}</span>
                  </a>
                ))}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};

export default App;
