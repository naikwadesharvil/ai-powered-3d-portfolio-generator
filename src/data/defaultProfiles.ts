import type { PortfolioData, UserRole } from '../types/portfolio';
import { normalizePortfolioData } from '../types/portfolioSchema.ts';

export const STUDENT_PROFILE: PortfolioData = normalizePortfolioData({
  id: 'profile_sharvil_naikwade',
  version: 1,
  lastUpdated: '2026-10-10',
  role: 'student',
  theme: 'cyberpunk_neon',
  hero3DMode: 'kinetic_360',
  name: 'Sharvil Naikwade',
  tagline: 'AI/ML Engineer & Python Developer',
  shortBio: 'Final-year B.Tech student specializing in Artificial Intelligence and Machine Learning. Hands-on experience in Python development, machine learning, NLP, and LLM integration.',
  fullBio: 'Final-year B.Tech student specializing in Artificial Intelligence and Machine Learning at Rajarambapu Institute of Technology. Experienced in API testing, unit testing, model evaluation, and data preprocessing. Passionate about engineering reliable, data-driven AI systems and deploying scalable full-stack applications with modern web technologies.',
  avatarUrl: '',
  resumeUrl: '#',
  targetRole: 'AI/ML Engineer / Junior Python Developer',
  interests: ['Artificial Intelligence', 'Machine Learning', 'NLP', 'Computer Vision', 'Web Development'],
  email: 'sharvilnaikwade@gmail.com',
  phone: '+91 7709159322',
  location: 'Senapati Kapshi, Maharashtra, India',
  github: 'https://github.com/naikwadesharvil',
  linkedin: 'https://linkedin.com/in/sharvil-naikwade-2294ab2bb',
  twitter: 'https://x.com',
  telemetry: {
    session: 'SESSION: ONLINE',
    timezone: 'UTC+05:30 [INDIA]',
    status: 'STATUS: ACTIVE // 2026',
    coords: '16.8524° N, 74.2814° E',
    fps: '60 [STABLE]',
    coreEngine: 'AI // 3D CANVAS // ENGINE',
  },
  bentoStats: {
    stat1: {
      title: 'CORE STACK',
      value: 'Python, SQL, C, Java',
      subtext: 'Primary programming languages'
    },
    stat2: {
      title: 'EDUCATION',
      value: 'B.Tech AI & ML',
      subtext: 'RIT Islampur | CGPA: 7.29/10'
    },
    stat3: {
      title: 'PUBLICATIONS',
      value: '2 Papers (1 Best Paper)',
      subtext: 'IC SMART 2026 & IJERT'
    }
  },
  skills: [
    { name: 'Python', category: 'Languages', level: 'expert' },
    { name: 'SQL', category: 'Languages', level: 'advanced' },
    { name: 'Machine Learning', category: 'AI/ML', level: 'expert' },
    { name: 'Scikit-Learn', category: 'AI/ML', level: 'advanced' },
    { name: 'PyTorch & TensorFlow', category: 'Deep Learning', level: 'intermediate' },
    { name: 'NLP & Transformers', category: 'AI/ML', level: 'advanced' },
    { name: 'React', category: 'Web', level: 'intermediate' },
    { name: 'Django & REST APIs', category: 'Web', level: 'advanced' },
    { name: 'Ollama & LLMs', category: 'AI/ML', level: 'advanced' },
    { name: 'Unit Testing (pytest)', category: 'Software Testing', level: 'advanced' },
    { name: 'MySQL & MongoDB', category: 'Databases', level: 'advanced' },
    { name: 'Git & Docker', category: 'Tools', level: 'advanced' }
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'Sepsis Detection Using Machine Learning',
      description: 'Engineered an early clinical decision-support ML system predicting sepsis onset using logistic regression and decision tree classification, achieving 80% model validation accuracy.',
      tags: ['Python', 'Scikit-Learn', 'Logistic Regression', 'Clinical Data'],
      role: 'Lead ML Developer',
      metrics: '80% Clinical Classification Accuracy',
      github: 'https://github.com/naikwadesharvil',
      date: 'Jan 2026 – Oct 2026',
      isAiIdea: false
    },
    {
      id: 'proj-2',
      title: 'Mental Health Detection Using NLP',
      description: 'Built a multi-class textual classification pipeline applying LSTM neural networks to assess sentiment and mental health distress from clinical and social language samples.',
      tags: ['Python', 'NLP', 'LSTM', 'Tokenization', 'Text Classification'],
      role: 'NLP Researcher',
      metrics: 'Sequence Tokenization & High Precision',
      github: 'https://github.com/naikwadesharvil',
      date: 'Jan 2026 – Apr 2026',
      isAiIdea: false
    },
    {
      id: 'proj-3',
      title: 'KnowledgeOS – Personal AI Assistant',
      description: 'Full-stack AI assistant integrating local open-source LLMs via Ollama, Django REST API backend, MongoDB persistent memory, and a dynamic React user interface.',
      tags: ['Django', 'React', 'Ollama', 'Local LLMs', 'MongoDB'],
      role: 'Full-Stack Developer',
      metrics: 'Offline Local Inference & Zero-Latency Memory',
      github: 'https://github.com/naikwadesharvil',
      date: 'Personal Project',
      isAiIdea: false
    },
    {
      id: 'proj-4',
      title: 'Smart Waste Collection Optimization',
      description: 'Predictive analytics prototype using linear regression to forecast waste bin replenishment rates, optimizing municipal truck dispatch schedules and fuel costs.',
      tags: ['Python', 'Pandas', 'Linear Regression', 'Predictive Analytics'],
      role: 'Data Analyst',
      metrics: 'Route Efficiency Prototype',
      github: 'https://github.com/naikwadesharvil',
      date: 'Aug 2025 – Jan 2026',
      isAiIdea: false
    },
    {
      id: 'proj-5',
      title: 'Autonomous Multi-Modal Drone Vision [AI Idea]',
      description: 'Suggested AI research concept: Edge-deployed lightweight YOLOv10 object detection and path planning for agricultural orchard disease scanning.',
      tags: ['Computer Vision', 'Edge AI', 'OpenCV', 'Project Idea'],
      role: 'Suggested Next Milestone',
      metrics: 'Planned Concept',
      isAiIdea: true
    }
  ],
  experiences: [
    {
      id: 'exp-1',
      company: 'EduSkills | Google for Developers',
      role: 'AI/ML Virtual Intern',
      period: 'Jul 2024 – Sep 2024',
      location: 'Remote',
      points: [
        'Completed intensive 10-week curriculum in foundational Machine Learning, data preprocessing, and model benchmarking.',
        'Developed end-to-end classification pipelines using Scikit-Learn and evaluated precision/recall trade-offs across structured datasets.'
      ],
      isVerified: true
    },
    {
      id: 'exp-2',
      company: 'EduSkills | AWS Academy',
      role: 'Data Engineering Virtual Intern',
      period: 'Jan 2025 – Mar 2025',
      location: 'Remote',
      points: [
        'Executed cloud-based data transformation pipelines, ETL staging, and SQL feature querying on Amazon SageMaker environments.',
        'Validated data cleaning scripts for high-dimensional feature stores.'
      ],
      isVerified: true
    }
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'Rajarambapu Institute of Technology, Islampur',
      degree: 'B.Tech in Artificial Intelligence & Machine Learning',
      period: '2023 – 2026',
      score: 'CGPA: 7.29 / 10.0',
      details: 'Active Class Representative & Treasurer of AIML Students Association.'
    },
    {
      id: 'edu-2',
      institution: 'Sanjay Ghodawat Olympiad School',
      degree: 'HSC & SSC Secondary Education',
      period: '2021 – 2023',
      score: 'SSC: 88% | HSC: 55%',
      details: 'Specialization in Sciences and Higher Mathematics.'
    }
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'Deloitte Data Analytics Job Simulation',
      issuer: 'Forage',
      date: 'Jun – Jul 2026'
    },
    {
      id: 'cert-2',
      name: 'Supervised Machine Learning: Regression and Classification',
      issuer: 'DeepLearning.AI / Andrew Ng',
      date: 'Feb 2026'
    },
    {
      id: 'cert-3',
      name: 'Natural Language Processing (NLP)',
      issuer: 'Coursera',
      date: 'Jan 2026'
    },
    {
      id: 'cert-4',
      name: 'Oracle Cloud Infrastructure Certified Foundations',
      issuer: 'Oracle',
      date: 'Apr 2026'
    }
  ],
  publications: [
    {
      id: 'pub-1',
      title: 'A Probabilistic Open-Set Intrusion Detection Framework for Sustainable Security in Decentralized Digital Ecosystems',
      publisher: 'IC SMART 2026 Conference',
      date: '2026',
      award: '🏆 Best Paper Award Winner'
    },
    {
      id: 'pub-2',
      title: 'Interpretative Sleep Stage Scoring: An Explainable CNN & LSTM-Attention Framework for Single-Channel EEG',
      publisher: 'International Journal of Engineering Research & Technology (IJERT), Vol. 15 Issue 07',
      date: 'Jul 2026'
    }
  ],
  services: [],
  testimonials: [],
  sectionVisibility: {
    hero: true,
    welcome: true,
    about: true,
    skills: true,
    projects: true,
    experience: true,
    education: true,
    certifications: true,
    publications: true,
    services: false,
    testimonials: false,
    contact: true
  },
  sectionOrder: ['hero', 'welcome', 'about', 'projects', 'experience', 'certifications', 'publications', 'contact']
});

export const JOB_SEEKER_PROFILE: PortfolioData = normalizePortfolioData({
  ...STUDENT_PROFILE,
  id: 'profile_job_seeker',
  role: 'job_seeker',
  persona: 'job_seeker',
  tagline: 'Junior AI Engineer | Full-Stack Python Specialist',
  shortBio: 'Targeting Associate AI Engineer & Python Developer roles. Proven experience building machine learning classification systems, RESTful microservices, and explainable neural networks.',
  targetRole: 'Associate AI Engineer / Python Software Developer',
  bentoStats: {
    stat1: {
      title: 'EXPERIENCE',
      value: '2 Internships',
      subtext: 'Google EduSkills & AWS Academy'
    },
    stat2: {
      title: 'RESEARCH',
      value: 'Best Paper Award',
      subtext: 'IC SMART 2026 Intrusion Detection'
    },
    stat3: {
      title: 'PROJECTS',
      value: '4 Production Prototypes',
      subtext: 'Tested & Documented on GitHub'
    }
  },
  sectionVisibility: {
    hero: true,
    welcome: true,
    about: true,
    skills: true,
    projects: true,
    experience: true,
    education: true,
    certifications: true,
    publications: true,
    services: false,
    testimonials: false,
    contact: true
  },
  sectionOrder: ['hero', 'welcome', 'about', 'experience', 'projects', 'certifications', 'contact']
});

export const PROFESSIONAL_PROFILE: PortfolioData = normalizePortfolioData({
  id: 'profile_professional',
  version: 1,
  lastUpdated: '2026-10-10',
  role: 'professional',
  theme: 'obsidian_stealth',
  hero3DMode: 'hologram_core',
  name: 'Marcus Vance',
  tagline: 'Staff AI Systems Architect & Research Lead',
  shortBio: 'Architecting fault-tolerant distributed inference pipelines and multi-modal foundational model deployments across enterprise cloud environments.',
  fullBio: '10+ years driving AI system architecture and distributed ML infrastructure. Led cross-functional engineering squads delivering high-throughput inference engines serving 40M+ monthly requests with sub-50ms latency.',
  avatarUrl: '/assets/profile.png',
  resumeUrl: '#',
  targetRole: 'Principal Machine Learning Architect',
  interests: ['Distributed Systems', 'Foundational Models', 'LLMOps', 'Zero-Trust Security'],
  email: 'marcus.vance@enterprise-ai.io',
  location: 'San Francisco, CA / Hybrid',
  github: 'https://github.com',
  linkedin: 'https://linkedin.com',
  telemetry: {
    session: 'SESSION: ENTERPRISE_SECURE',
    timezone: 'UTC-07:00 [SF, CA]',
    status: 'STATUS: ACTIVE ARCHITECT',
    coords: '37.7749° N, 122.4194° W',
    fps: '60 [STABLE]',
    coreEngine: 'TENSOR-FLOW // DISTRIBUTED-CLUSTER',
  },
  bentoStats: {
    stat1: {
      title: 'SCALE',
      value: '40M+ Req/Mo',
      subtext: '99.99% Production Uptime'
    },
    stat2: {
      title: 'INFRASTRUCTURE',
      value: 'Kubernetes & Ray',
      subtext: 'Multi-GPU Cluster Orchestration'
    },
    stat3: {
      title: 'PATENTS & PAPERS',
      value: '5 Granted Patents',
      subtext: 'Distributed Cache & Quantization'
    }
  },
  skills: [
    { name: 'Distributed PyTorch', category: 'Core', level: 'expert' },
    { name: 'Kubernetes & Kubeflow', category: 'Cloud Infra', level: 'expert' },
    { name: 'Ray & vLLM', category: 'Inference', level: 'expert' },
    { name: 'Go & Rust', category: 'Systems', level: 'advanced' },
    { name: 'System Design', category: 'Architecture', level: 'expert' }
  ],
  projects: [
    {
      id: 'prof-p1',
      title: 'HyperScale vLLM Inference Gateway',
      description: 'Architected an automated multi-GPU continuous-batching inference gateway reducing model serving costs by 42% while improving P99 latency by 3.2x.',
      tags: ['vLLM', 'Ray', 'CUDA', 'Python', 'FastAPI'],
      metrics: '42% Cost Reduction | sub-45ms P99',
      isAiIdea: false
    },
    {
      id: 'prof-p2',
      title: 'Autonomous Zero-Trust Vector Database',
      description: 'Designed a partitioned vector retrieval architecture indexing 100M+ high-dimensional embeddings with real-time role-based access control and tenant isolation.',
      tags: ['Qdrant', 'Rust', 'Kubernetes', 'gRPC'],
      metrics: '100M+ Vectors | 12ms Search Latency',
      isAiIdea: false
    }
  ],
  experiences: [
    {
      id: 'exp-prof-1',
      company: 'Synthetix Cloud Systems',
      role: 'Staff ML Architect',
      period: '2023 – Present',
      location: 'San Francisco, CA',
      points: [
        'Directed the foundational infrastructure initiative serving 40M+ API requests monthly.',
        'Mentored 14 senior engineers and authored organizational standards for model evaluation.'
      ],
      isVerified: true
    }
  ],
  education: [
    {
      id: 'edu-prof-1',
      institution: 'Stanford University',
      degree: 'M.S. in Computer Science (Systems & AI)',
      period: '2014 – 2016'
    }
  ],
  certifications: [],
  publications: [
    {
      id: 'pub-prof-1',
      title: 'Sub-Byte Dynamic Quantization for Real-Time Edge Ensembles',
      publisher: 'NeurIPS Systems Workshop',
      date: '2024'
    }
  ],
  services: [],
  testimonials: [],
  sectionVisibility: {
    hero: true,
    welcome: true,
    about: true,
    skills: true,
    projects: true,
    experience: true,
    education: true,
    certifications: false,
    publications: true,
    services: false,
    testimonials: false,
    contact: true
  },
  sectionOrder: ['hero', 'welcome', 'about', 'experience', 'projects', 'publications', 'contact']
});

export const FREELANCER_PROFILE: PortfolioData = normalizePortfolioData({
  id: 'profile_freelancer',
  version: 1,
  lastUpdated: '2026-10-10',
  role: 'freelancer',
  theme: 'sunset_titanium',
  hero3DMode: 'kinetic_360',
  name: 'Elena Rostova',
  tagline: 'Creative Technologist & 3D Web Architect',
  shortBio: 'Crafting award-winning web experiences, custom interactive 3D web graphics, and high-converting creative digital products for global brands.',
  fullBio: 'Freelance Creative Developer with 7 years collaborating with design studios, venture-backed startups, and luxury brands worldwide. Combining WebGL, Three.js, React, and bespoke typography to build memorable digital flagships.',
  avatarUrl: '/assets/profile.png',
  resumeUrl: '#',
  targetRole: 'Fractional Creative Developer / 3D Web Consultant',
  interests: ['Creative Development', 'Three.js / WebGL', 'Brand Identity', 'Interactive Shaders'],
  email: 'elena@rostova-studios.design',
  location: 'London, UK / Worldwide',
  github: 'https://github.com',
  linkedin: 'https://linkedin.com',
  twitter: 'https://x.com',
  telemetry: {
    session: 'SESSION: STUDIO_ACTIVE',
    timezone: 'UTC+01:00 [LONDON]',
    status: 'STATUS: BOOKINGS OPEN // Q4',
    coords: '51.5074° N, 0.1278° W',
    fps: '60 [STABLE]',
    coreEngine: 'THREE.JS // WEBGL // GSAP',
  },
  bentoStats: {
    stat1: {
      title: 'AWARDS',
      value: '8 Awwwards & FWA',
      subtext: 'Site of the Day Winner'
    },
    stat2: {
      title: 'DELIVERED',
      value: '35+ Client Sites',
      subtext: 'Luxury, Fintech, & AI Startups'
    },
    stat3: {
      title: 'SATISFACTION',
      value: '100% 5-Star Rating',
      subtext: 'Direct Client Feedback'
    }
  },
  skills: [
    { name: 'Three.js & WebGL', category: '3D Graphics', level: 'expert' },
    { name: 'React & Next.js', category: 'Frontend', level: 'expert' },
    { name: 'GLSL Shaders', category: 'Creative', level: 'advanced' },
    { name: 'Figma & UI Systems', category: 'Design', level: 'advanced' },
    { name: 'Performance Optimization', category: 'Engineering', level: 'expert' }
  ],
  projects: [
    {
      id: 'free-p1',
      title: 'Lumina – Interactive 3D Luxury Watch Flagship',
      description: 'Built a bespoke real-time 3D watch customizer with physically-based materials, custom environment reflections, and smooth 60fps micro-animations.',
      tags: ['Three.js', 'React', 'GLSL', 'E-Commerce'],
      metrics: 'Award: Awwwards Site of the Day | +180% Engagement',
      isAiIdea: false
    },
    {
      id: 'free-p2',
      title: 'Aura Protocol – Cybernetic Web Experience',
      description: 'Designed and engineered a dark-mode interactive brand site featuring procedural soundscapes, real-time particle simulations, and dynamic typography.',
      tags: ['WebGL', 'Audio Synthesis', 'Framer Motion'],
      metrics: 'Over 250k viral visits in week 1',
      isAiIdea: false
    }
  ],
  experiences: [],
  education: [
    {
      id: 'edu-free-1',
      institution: 'Royal College of Art, London',
      degree: 'B.A. Interaction Design',
      period: '2016 – 2019'
    }
  ],
  certifications: [],
  publications: [],
  services: [
    {
      id: 'srv-1',
      title: 'Interactive 3D Website Development',
      description: 'End-to-end design and coding of bespoke WebGL / Three.js 3D web experiences optimized for desktop and mobile.',
      deliverables: ['Custom 3D Shaders', 'Zero-Lag 60 FPS Scrubber', 'Responsive Layout', 'Full Source Code'],
      startingPrice: 'Starting at $4,500'
    },
    {
      id: 'srv-2',
      title: 'High-Impact Brand Flagship',
      description: 'Transforming your startup or brand into an unforgettable digital showcase that turns visitors into high-value clients.',
      deliverables: ['Bento Grid UI', 'Custom Animations', 'CMS Integration', 'SEO & Analytics'],
      startingPrice: 'Starting at $3,200'
    },
    {
      id: 'srv-3',
      title: '3D Performance Audit & Optimization',
      description: 'Profiling existing WebGL/Three.js applications, resolving memory leaks, and maximizing frame rates across mobile devices.',
      deliverables: ['Asset Compression Pipeline', 'Draw-Call Optimization', 'Audit Report'],
      startingPrice: 'Starting at $1,500'
    }
  ],
  testimonials: [
    {
      id: 'test-1',
      clientName: 'Julian Sterling',
      clientRole: 'CEO & Founder',
      company: 'Aetheric AI',
      feedback: 'Elena delivered a mind-blowing 3D portfolio that immediately set us apart from competitors. Our conversion rate doubled within three weeks.'
    },
    {
      id: 'test-2',
      clientName: 'Sophia Lin',
      clientRole: 'Head of Brand',
      company: 'Kuro Studio Tokyo',
      feedback: 'Unrivaled technical craftsmanship and aesthetic perfection. She captured the cinematic spirit of our brand flawlessly.'
    }
  ],
  sectionVisibility: {
    hero: true,
    welcome: true,
    about: true,
    skills: true,
    projects: true,
    experience: false,
    education: true,
    certifications: false,
    publications: false,
    services: true,
    testimonials: true,
    contact: true
  },
  sectionOrder: ['hero', 'welcome', 'about', 'services', 'projects', 'contact']
});

export const NEUTRAL_PLACEHOLDER_PROFILE: PortfolioData = normalizePortfolioData({
  id: 'profile_new_visitor',
  version: 2,
  role: 'student',
  theme: 'cyberpunk_neon',
  hero3DMode: 'kinetic_360',
  name: 'Your Name',
  tagline: 'Your Role & Specialization',
  shortBio: 'Enter your background details in the AI Studio to generate your personalized 3D hologram portfolio.',
  fullBio: 'Tell the world about yourself and what you are building. Enter your details in the Studio to generate your personalized 3D portfolio with custom 3D holograms, interactive project blueprints, and ATS resume exports.',
  avatarUrl: '',
  resumeUrl: '#',
  targetRole: 'Software Engineer',
  interests: ['System Architecture', 'Modern Web', 'Interactive 3D'],
  email: '',
  phone: '',
  location: 'City, Country',
  github: '',
  linkedin: '',
  twitter: '',
  telemetry: {
    session: 'SESSION: READY',
    timezone: 'UTC [LOCAL]',
    status: 'STATUS: READY FOR GENERATION',
    coords: '0.0000° N, 0.0000° E',
    fps: '60 [STABLE]',
    coreEngine: 'AI // 3D CANVAS // ENGINE',
  },
  bentoStats: {
    stat1: {
      title: 'PRIMARY DOMAIN',
      value: 'Technology',
      subtext: 'Engineering & Craft'
    },
    stat2: {
      title: 'EXPERTISE',
      value: '6+ Skills',
      subtext: 'Ready for Generation'
    },
    stat3: {
      title: 'PORTFOLIO',
      value: '3D Hologram',
      subtext: 'Instant Synthesis'
    }
  },
  skills: [
    { name: 'Core Skill 1', category: 'Core', level: 'advanced' },
    { name: 'Core Skill 2', category: 'Core', level: 'advanced' },
    { name: 'System Architecture', category: 'Engineering', level: 'intermediate' },
    { name: 'Rapid Prototyping', category: 'Engineering', level: 'intermediate' },
    { name: 'Optimization', category: 'Performance', level: 'intermediate' },
    { name: 'Telemetry', category: 'Operations', level: 'intermediate' },
  ],
  projects: [
    {
      id: 'proj-flagship-placeholder',
      title: 'Your Flagship Project',
      description: 'Enter your project details in the Studio to see an interactive 3D blueprint generated here.',
      tools: ['Modern Stack', 'Core Framework', 'Cloud Engine'],
      metrics: 'Designed for production performance',
      role: 'Lead Architect',
      isAiIdea: false,
    }
  ],
  education: [
    {
      id: 'edu-placeholder',
      institution: 'Your University / Institution',
      degree: 'Your Degree / Certification',
      period: '2022 - Present',
      score: 'Graduating Scholar',
    }
  ],
  experiences: [],
  certifications: [],
  publications: [],
  sectionVisibility: {
    hero: true,
    welcome: true,
    about: true,
    skills: true,
    projects: true,
    experience: false,
    education: true,
    certifications: false,
    publications: false,
    services: false,
    testimonials: false,
    contact: true
  },
  sectionOrder: ['hero', 'welcome', 'about', 'skills', 'projects', 'education', 'contact']
});

export const ROLE_PROFILES: Record<UserRole, PortfolioData> = {
  student: STUDENT_PROFILE,
  job_seeker: JOB_SEEKER_PROFILE,
  professional: PROFESSIONAL_PROFILE,
  freelancer: FREELANCER_PROFILE
};

