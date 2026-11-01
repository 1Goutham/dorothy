/*
 * Dorothy, verified resource directory.
 *
 * `verified` levels:
 *   "official" , run by a government body; details taken from its own website.
 *   "community", a community organisation that Dorothy volunteers have personally confirmed
 *                 (phone answered, address visited, consent to be listed obtained).
 * Only add an organisation after it has agreed to be listed. Never list private individuals'
 * phone numbers or addresses. Shelter addresses are shared only on request, never published.
 */
window.DOROTHY_RESOURCES = [
  {
    cat: "emergency", name: "Emergency 112", ta: "அவசர உதவி 112",
    desc: "India's single emergency number for police, fire and ambulance. Free, 24×7, all of Tamil Nadu.",
    scope: "India", phone: "112", url: "https://112.gov.in/", verified: "official", checked: "2026-11",
  },
  {
    cat: "wellbeing", name: "Tele-MANAS 14416", ta: "டெலி-மனஸ் 14416",
    desc: "Government of India's free mental health helpline, 24×7. Choose your language; calls are routed to trained counsellors in your state. Also 1-800-891-4416.",
    scope: "India", phone: "14416", url: "https://telemanas.mohfw.gov.in/", verified: "official", checked: "2026-11",
  },
  {
    cat: "legal", name: "National Portal for Transgender Persons", ta: "திருநர்களுக்கான தேசிய இணையதளம்",
    desc: "Apply online for a Certificate of Identity and Transgender ID Card. No medical examination needed. Track status, raise grievances, and access SMILE scheme benefits.",
    scope: "India", url: "https://transgender.dosje.gov.in/", verified: "official", checked: "2026-11",
  },
  {
    cat: "legal", name: "Free legal aid · NALSA 15100", ta: "இலவச சட்ட உதவி 15100",
    desc: "Free legal services through the District Legal Services Authority at your district court. National helpline 15100.",
    scope: "India", phone: "15100", url: "https://nalsa.gov.in/", verified: "official", checked: "2026-11",
  },
  {
    cat: "shelter", name: "Garima Greh shelter homes", ta: "கரிமா கிரஹ் தங்கும் இல்லங்கள்",
    desc: "Shelter homes for transgender persons with food, medical care, recreation and skill support. Funded under SMILE and run by community organisations. Tamil Nadu has a Garima Greh; the official list of organisations is on the National Portal.",
    scope: "India · Tamil Nadu", url: "https://transgender.dosje.gov.in/", verified: "official", checked: "2026-11",
  },
  {
    cat: "shelter", name: "Tamil Nadu Transgender Welfare Board", ta: "தமிழ்நாடு திருநங்கையர் நல வாரியம்",
    desc: "India's first transgender welfare board (2008). Schemes include identity and ration cards, house site pattas, residential homes, sewing machines, higher-education support and a monthly pension. Apply via your District Social Welfare Office.",
    scope: "Tamil Nadu", url: "https://tnsocialwelfare.tn.gov.in/en/specilisationstransgenders-welfare/tamil-nadu-transgender-welfare-board", verified: "official", checked: "2026-11",
  },
  {
    cat: "education", name: "SMILE scholarships", ta: "SMILE கல்வி உதவித்தொகை",
    desc: "Central scholarships for transgender students from Class IX to post-graduation. Apply through the National Portal; a transgender certificate is required.",
    scope: "India", url: "https://www.myscheme.gov.in/schemes/smile", verified: "official", checked: "2026-11",
  },
  {
    cat: "education", name: "TN Welfare Board: higher education support", ta: "உயர்கல்வி உதவி · நல வாரியம்",
    desc: "Support for higher education listed by the Tamil Nadu Transgender Welfare Board. Ask at your District Social Welfare Office for current eligibility.",
    scope: "Tamil Nadu", url: "https://tnsocialwelfare.tn.gov.in/en/specilisationstransgenders-welfare/tamil-nadu-transgender-welfare-board", verified: "official", checked: "2026-11",
  },
  {
    cat: "work", name: "Naan Mudhalvan", ta: "நான் முதல்வன்",
    desc: "Tamil Nadu government's free skilling, career guidance and placement platform, open to all residents.",
    scope: "Tamil Nadu", url: "https://www.naanmudhalvan.tn.gov.in/", verified: "official", checked: "2026-11",
  },
  {
    cat: "work", name: "SMILE: skill development & livelihood", ta: "SMILE: திறன் மேம்பாடு",
    desc: "Skill training and livelihood support for transgender persons under the Ministry of Social Justice and Empowerment.",
    scope: "India", url: "https://www.myscheme.gov.in/schemes/smile", verified: "official", checked: "2026-11",
  },
  {
    cat: "health", name: "Ayushman Bharat TG Plus", ta: "ஆயுஷ்மான் பாரத் TG Plus",
    desc: "Health cover under PM-JAY for transgender persons certified on the National Portal, including a package for gender-affirming treatment.",
    scope: "India", url: "https://transgender.dosje.gov.in/", verified: "official", checked: "2026-11",
  },
];

window.DOROTHY_CATS = {
  all: { en: "All", ta: "அனைத்தும்" },
  emergency: { en: "Emergency", ta: "அவசரம்" },
  shelter: { en: "Safe shelter", ta: "தங்குமிடம்" },
  wellbeing: { en: "Wellbeing", ta: "நலம்" },
  legal: { en: "Identity & rights", ta: "அடையாளம் & உரிமை" },
  education: { en: "Scholarships", ta: "கல்வி" },
  work: { en: "Work & careers", ta: "வேலை" },
  health: { en: "Health", ta: "மருத்துவம்" },
};
