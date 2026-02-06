// Falling Waters Day Spa & Salon - Site Configuration
// All content is driven by this config file

const CONFIG = {
  // ============================================
  // PRACTICE INFORMATION
  // ============================================
  practice: {
    name: "Falling Waters Day Spa & Salon",
    tagline: "Your Escape to Relaxation",
    description: "Full service day spa and salon located in Draper, UT. Serving the community for over 27 years with massage, hair, skin care, nails, and more.",
    established: "1998",
    yearsExperience: "27+",
    
    // Contact
    phone: "(801) 501-9000",
    phoneClean: "8015019000",
    email: "Spa@tacfitness.com",
    
    // Location
    address: {
      street: "1101 E Draper Parkway",
      city: "Draper",
      state: "Utah",
      zip: "84020",
      full: "1101 E Draper Parkway, Draper, Utah 84020"
    },
    
    // Note about location
    locationNote: "Inside Treehouse Athletic Club — Open to the Public",
    
    // Hours
    hours: {
      monday: "9:00 AM - 6:00 PM",
      tuesday: "9:00 AM - 6:00 PM",
      wednesday: "9:00 AM - 6:00 PM",
      thursday: "9:00 AM - 6:00 PM",
      friday: "9:00 AM - 6:00 PM",
      saturday: "9:00 AM - 4:00 PM",
      sunday: "Closed"
    },
    
    // Social & Web
    website: "https://www.fallingwatersdayspa.com",
    bookingUrl: "https://go.booker.com/#/location/fallingwaters",
    facebook: "https://www.facebook.com/fallingwatersdayspasalon/",
    instagram: "",
    
    // Google Maps
    googleMapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3027.8!2d-111.8631!3d40.5245!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sFalling%20Waters%20Day%20Spa!5e0!3m2!1sen!2sus!4v1234567890",
    googleMapsLink: "https://www.google.com/maps/place/Falling+Waters+Day+Spa+%26+Salon/@40.5245,-111.8631,17z"
  },

  // ============================================
  // BRANDING & DESIGN
  // ============================================
  branding: {
    // Color Palette - Serene Spa Theme
    colors: {
      primary: "#5B8A72",      // Sage green
      secondary: "#C9A96E",    // Warm gold
      accent: "#8FBCBB",       // Soft teal
      dark: "#2D3E40",         // Deep forest
      light: "#F7F9F8",        // Off-white
      text: "#333333"
    },
    
    // Logo
    logo: {
      main: "/images/logo.png",
      white: "/images/logo-white.png",
      alt: "Falling Waters Day Spa & Salon"
    },
    
    // Typography
    fonts: {
      heading: "'Cormorant Garamond', Georgia, serif",
      body: "'Montserrat', 'Segoe UI', sans-serif"
    }
  },

  // ============================================
  // HERO SECTION
  // ============================================
  hero: {
    headline: "Your Escape to Relaxation",
    subheadline: "Draper's Premier Day Spa & Salon for Over 27 Years",
    description: "Indulge in a tranquil retreat where expert therapists and stylists help you look and feel your absolute best. Massage, skincare, hair, nails — all under one roof.",
    backgroundImage: "/images/hero-spa.jpg",
    cta: {
      primary: {
        text: "Book Your Experience",
        link: "https://go.booker.com/#/location/fallingwaters"
      },
      secondary: {
        text: "View Our Services",
        link: "/services/index.html"
      }
    },
    stats: [
      { number: "27+", label: "Years of Excellence" },
      { number: "5", label: "Service Categories" },
      { number: "10%", label: "Off for TAC Members" },
      { number: "5★", label: "Client Reviews" }
    ]
  },

  // ============================================
  // SERVICES
  // ============================================
  services: {
    headline: "Our Services",
    subheadline: "Comprehensive spa and salon services tailored to your needs",
    
    categories: [
      {
        id: "massage",
        name: "Massage Therapy",
        shortDescription: "Relax and unwind with our therapeutic massage services",
        fullDescription: "Escape from the hustle and bustle of daily life and indulge in our unparalleled massage services. Our team of expert massage therapists will help you relax and unwind with their skilled hands and personalized approach.",
        icon: "spa",
        image: "/images/service-massage.jpg",
        services: [
          { name: "Swedish Massage", duration: "60 min", price: "$90" },
          { name: "Swedish Massage", duration: "90 min", price: "$120" },
          { name: "Deep Tissue Massage", duration: "60 min", price: "$100" },
          { name: "Deep Tissue Massage", duration: "90 min", price: "$140" },
          { name: "Hot Stone Massage", duration: "90 min", price: "$145" },
          { name: "Aromatherapy Massage", duration: "60 min", price: "$100" },
          { name: "Couples Massage", duration: "60 min", price: "$180" },
          { name: "Prenatal Massage", duration: "60 min", price: "$95" }
        ]
      },
      {
        id: "skincare",
        name: "Skin Care",
        shortDescription: "Advanced facials and treatments for radiant skin",
        fullDescription: "Indulge in luxurious skin care services designed to leave your skin feeling refreshed and rejuvenated. Our experienced aestheticians use high-quality products and advanced techniques to help you achieve a healthy and glowing complexion.",
        icon: "face",
        image: "/images/service-facial.jpg",
        services: [
          { name: "Custom Facial", duration: "90 min", price: "$155" },
          { name: "Refresher Facial", duration: "60 min", price: "$99" },
          { name: "Refresher Facial", duration: "30 min", price: "$60" },
          { name: "HydraFacial Signature", duration: "45 min", price: "$195" },
          { name: "HydraFacial Deluxe", duration: "60 min", price: "$248" },
          { name: "HydraFacial Platinum", duration: "90 min", price: "$410" },
          { name: "Back Facial", duration: "60 min", price: "$99" },
          { name: "Chemical Peel - Enzyme", duration: "30 min", price: "$105" },
          { name: "Chemical Peel - Medium", duration: "45 min", price: "$135" },
          { name: "Chemical Peel - Aggressive", duration: "45 min", price: "$175" },
          { name: "Microdermabrasion Express", duration: "30 min", price: "$65" },
          { name: "Microdermabrasion + Facial", duration: "60 min", price: "$120" }
        ]
      },
      {
        id: "hair",
        name: "Hair Services",
        shortDescription: "Expert cuts, color, and styling for your perfect look",
        fullDescription: "Indulge in luxury where our expert stylists will provide you with the ultimate hair experience. From classic cuts to modern styles, our stylists will work with you to create a look that perfectly complements your unique style and personality.",
        icon: "cut",
        image: "/images/service-hair.jpg",
        services: [
          { name: "Women's Haircut", price: "$55+" },
          { name: "Men's Haircut", price: "$35+" },
          { name: "Children's Haircut", price: "$25+" },
          { name: "Blowout & Style", price: "$45+" },
          { name: "Single Process Color", price: "$85+" },
          { name: "Partial Highlights", price: "$95+" },
          { name: "Full Highlights", price: "$135+" },
          { name: "Balayage", price: "$175+" },
          { name: "Color Correction", price: "Consultation" },
          { name: "Keratin Treatment", price: "$250+" }
        ]
      },
      {
        id: "nails",
        name: "Nail Care",
        shortDescription: "Luxurious manicures and pedicures for beautiful hands & feet",
        fullDescription: "Indulge in luxurious nail care services where our skilled technicians will pamper your hands and feet to perfection. From classic manicures and pedicures to trendy nail art designs, we offer a wide range of services to suit your style.",
        icon: "nail",
        image: "/images/service-nails.jpg",
        services: [
          { name: "Classic Manicure", duration: "30 min", price: "$40" },
          { name: "Gel Polish Manicure", duration: "45 min", price: "$48" },
          { name: "Spa Pedicure", duration: "60 min", price: "$55" },
          { name: "Spa Pedicure with Gel Polish", duration: "75 min", price: "$70" },
          { name: "Polish Change", duration: "15 min", price: "$15" },
          { name: "Nail Art", price: "$5+" }
        ]
      },
      {
        id: "brows-lashes",
        name: "Brows & Lashes",
        shortDescription: "Perfect your look with expert brow and lash services",
        fullDescription: "The perfect brows and lashes are just a step away at Falling Waters! Our expert technicians specialize in creating flawless, customized looks that will enhance your natural beauty.",
        icon: "eye",
        image: "/images/service-lashes.jpg",
        services: [
          { name: "Brow Tinting", price: "$23" },
          { name: "Brow Waxing", price: "$23" },
          { name: "Brow Tweezing", price: "$28" },
          { name: "Brow Tinting & Waxing", price: "$45" },
          { name: "Brow Lamination, Wax & Tint", price: "$95" },
          { name: "Lash Tinting", price: "$23" },
          { name: "Lash Lift & Tint", price: "$90" },
          { name: "Classic Lash Full Set", price: "$170" },
          { name: "Classic Lash Fill", price: "$75" },
          { name: "Hybrid Lash Full Set", price: "$180" },
          { name: "Hybrid Lash Fill", price: "$85" },
          { name: "Volume Lash Full Set", price: "$200" },
          { name: "Volume Lash Fill", price: "$95" },
          { name: "Mini Lash Fill", price: "$45" },
          { name: "Lash Extension Removal", price: "$40" }
        ]
      }
    ],
    
    // Special offer
    specialOffer: {
      enabled: true,
      title: "Treehouse Athletic Club Members",
      description: "TAC members receive 10% off all services!",
      disclaimer: "Must show valid TAC membership at time of service"
    }
  },

  // ============================================
  // ABOUT SECTION
  // ============================================
  about: {
    headline: "About Falling Waters",
    subheadline: "A Draper Tradition Since 1998",
    story: [
      "Falling Waters Day Spa & Salon has been a staple for the Draper and Sandy, Utah community for over 27 years!",
      "Offering a wide range of services and open to the public, Falling Waters is here to serve you with a friendly smile and supportive customer service.",
      "Located inside the Treehouse Athletic Club on Draper Parkway, our spa provides a serene escape where you can indulge in massage therapy, skin care, hair services, nail care, and brow & lash treatments — all performed by experienced, passionate professionals.",
      "Whether you're looking to ease tense muscles, refresh your look, or simply treat yourself to some well-deserved pampering, Falling Waters is your destination for relaxation and rejuvenation."
    ],
    image: "/images/about-spa.jpg",
    values: [
      {
        title: "Relaxation",
        description: "A tranquil environment designed for your complete comfort"
      },
      {
        title: "Expertise",
        description: "27+ years of skilled therapists and stylists"
      },
      {
        title: "Quality",
        description: "Premium products and advanced techniques"
      },
      {
        title: "Community",
        description: "Proudly serving Draper and Sandy families"
      }
    ]
  },

  // ============================================
  // POLICIES
  // ============================================
  policies: {
    cancellation: {
      notice: "24 hours",
      lateCancelFee: "50% of service amount",
      noShowFee: "Full service amount",
      description: "Falling Waters understands that sometimes schedules change and therefore requests at least 24 hours' notice when canceling or rescheduling your appointment. A credit card is required to hold your appointment."
    }
  },

  // ============================================
  // TESTIMONIALS
  // ============================================
  testimonials: [
    {
      quote: "The best spa experience in Utah! The massage therapists are incredibly skilled and the atmosphere is so relaxing. I've been coming here for years.",
      author: "Sarah M.",
      service: "Massage Client"
    },
    {
      quote: "Finally found my go-to salon! My colorist here is amazing and really listens to what I want. The whole experience is luxurious.",
      author: "Jennifer K.",
      service: "Hair Client"
    },
    {
      quote: "Love the HydraFacial treatments here. My skin has never looked better. The aestheticians really know their stuff!",
      author: "Michelle T.",
      service: "Skincare Client"
    },
    {
      quote: "Been getting my lashes done here for over a year. The technicians are true artists and the results are always beautiful and natural-looking.",
      author: "Amanda R.",
      service: "Lash Client"
    }
  ],

  // ============================================
  // CONTACT / FOOTER
  // ============================================
  contact: {
    headline: "Visit Us Today",
    subheadline: "Book your escape to relaxation",
    formEnabled: false,
    preferredContact: "phone"
  },

  footer: {
    copyright: "© 2026 Falling Waters Day Spa & Salon. All rights reserved.",
    disclaimer: "Services and pricing subject to change. Please call to confirm.",
    links: [
      { text: "Privacy Policy", url: "/privacy.html" },
      { text: "Terms of Service", url: "/terms.html" }
    ]
  },

  // ============================================
  // SEO
  // ============================================
  seo: {
    title: "Falling Waters Day Spa & Salon | Draper, UT",
    description: "Full service day spa and salon in Draper, Utah. Massage therapy, facials, HydraFacial, hair cuts & color, nails, lash extensions & more. Book your relaxation today!",
    keywords: "day spa draper utah, massage draper, facial draper, hydrafacial utah, hair salon draper, lash extensions draper, nails draper, spa near me, falling waters",
    ogImage: "/images/og-image.jpg"
  }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
