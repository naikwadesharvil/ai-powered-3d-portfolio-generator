import type { Persona } from '../types/portfolioSchema';

export interface DisciplineConfig {
  id: string;
  label: string;
  shortName: string;
  category: string;
  description: string;
  skillCategories: {
    name: string;
    skills: string[];
  }[];
  projectTypes: string[];
  tools: string[];
  terminology: string[];
  defaultInterests: string[];
  metricsPlaceholder: string;
  personaSectionEmphasis: Record<Persona, string[]>;
}

export const STANDARD_DISCIPLINES: Record<string, DisciplineConfig> = {
  cs_it: {
    id: 'cs_it',
    label: 'Computer Science, IT, AI/ML & Data Science',
    shortName: 'Computer Science',
    category: 'Computing & Software',
    description: 'Algorithms, distributed architectures, neural networks, cloud microservices, and full-stack systems.',
    skillCategories: [
      { name: 'Core Languages', skills: ['Python', 'TypeScript', 'Java', 'C++', 'Go', 'SQL'] },
      { name: 'AI & Data Science', skills: ['PyTorch', 'TensorFlow', 'Scikit-Learn', 'Pandas', 'Hugging Face', 'Ollama'] },
      { name: 'Frontend & Full-Stack', skills: ['React', 'Next.js', 'Vite', 'Tailwind CSS', 'GraphQL', 'REST APIs'] },
      { name: 'Cloud & Infrastructure', skills: ['Docker', 'Kubernetes', 'AWS', 'GCP', 'PostgreSQL', 'Redis'] },
    ],
    projectTypes: [
      'Distributed Real-Time Inference Gateway',
      'Explainable Neural Diagnostic Classification System',
      'Autonomous Multi-Agent Workflow Engine',
      'High-Throughput gRPC Microservices Mesh',
    ],
    tools: ['VS Code', 'Git', 'Docker', 'Postman', 'Jupyter', 'Linux/Bash', 'Weights & Biases'],
    terminology: [
      'P99 latency', 'throughput', 'token streaming', 'sharding', 'microservices',
      'gradient descent', 'F1-score', 'explainable AI', 'fault tolerance', 'idempotency'
    ],
    defaultInterests: ['Artificial Intelligence', 'Distributed Systems', 'Cloud Architecture', 'Machine Learning'],
    metricsPlaceholder: 'e.g., Sub-40ms P99 latency & 25,000 req/sec',
    personaSectionEmphasis: {
      student: ['education', 'projects', 'skills', 'certifications', 'about', 'contact'],
      job_seeker: ['about', 'skills', 'projects', 'experience', 'education', 'contact'],
      professional: ['experience', 'projects', 'about', 'skills', 'publications', 'contact'],
      freelancer: ['services', 'projects', 'testimonials', 'skills', 'about', 'contact'],
    },
  },

  mechanical: {
    id: 'mechanical',
    label: 'Mechanical Engineering',
    shortName: 'Mechanical',
    category: 'Core Engineering',
    description: 'Machine design, finite element analysis (FEA), thermal systems, CAD modeling, and manufacturing tooling.',
    skillCategories: [
      { name: 'CAD & 3D Modeling', skills: ['SolidWorks', 'CATIA', 'Autodesk Inventor', 'AutoCAD', 'PTC Creo'] },
      { name: 'Simulation & Analysis', skills: ['ANSYS Mechanical', 'Abaqus', 'FEA Stress Analysis', 'CFD Simulation', 'MATLAB'] },
      { name: 'Manufacturing & Production', skills: ['GD&T', 'CNC G-Code', 'DFM / DFA', '3D Printing (FDM/SLA)', 'Sheet Metal Design'] },
      { name: 'Thermal & Fluid Dynamics', skills: ['Heat Transfer', 'HVAC Design', 'Thermodynamics', 'Fluid Mechanics', 'ANSYS Fluent'] },
    ],
    projectTypes: [
      'High-Torque Planetary Gearbox with FEA Stress Validation',
      'Microchannel Liquid Cooling Cold Plate for EV Battery Pack',
      'Automated Pick-and-Place Pneumatic Gantry Mechanism',
      'Aerodynamic Downforce Optimization via Computational Fluid Dynamics',
    ],
    tools: ['SolidWorks', 'ANSYS Workbench', 'AutoCAD', 'Mastercam', 'MATLAB/Simulink', 'Caliper/Micrometer CMM'],
    terminology: [
      'Von Mises stress', 'factor of safety (FOS)', 'thermal dissipation (W/m²K)', 'tolerance stack-up',
      'yield strength (MPa)', 'boundary layer separation', 'structural deflection', 'surface roughness (Ra)'
    ],
    defaultInterests: ['CAD/CAM Modeling', 'FEA Structural Simulation', 'Thermal Engineering', 'Precision Manufacturing'],
    metricsPlaceholder: 'e.g., 32% weight reduction, FOS > 2.4 under 15kN cyclic load',
    personaSectionEmphasis: {
      student: ['education', 'projects', 'skills', 'certifications', 'about', 'contact'],
      job_seeker: ['about', 'skills', 'projects', 'experience', 'education', 'contact'],
      professional: ['experience', 'projects', 'skills', 'publications', 'about', 'contact'],
      freelancer: ['services', 'projects', 'testimonials', 'skills', 'about', 'contact'],
    },
  },

  civil: {
    id: 'civil',
    label: 'Civil & Structural Engineering',
    shortName: 'Civil',
    category: 'Core Engineering',
    description: 'Structural mechanics, seismic analysis, Building Information Modeling (BIM), geotechnical, and construction scheduling.',
    skillCategories: [
      { name: 'Structural Analysis', skills: ['ETABS', 'STAAD.Pro', 'SAP2000', 'SAFE', 'RCC & Steel Design'] },
      { name: 'BIM & Drafting', skills: ['Autodesk Revit', 'AutoCAD Civil 3D', 'Navisworks', 'Tekla Structures'] },
      { name: 'Geotechnical & Surveying', skills: ['Total Station', 'GIS / QGIS', 'Soil Mechanics', 'Slope Stability', 'Foundation Design'] },
      { name: 'Project Management', skills: ['Primavera P6', 'MS Project', 'Quantity Surveying', 'Cost Estimation', 'IS/ACI Codes'] },
    ],
    projectTypes: [
      'Multi-Story RCC Commercial Complex Seismic Analysis (IS 1893)',
      'Prestressed Concrete Box Girder Flyover Design & Load Rating',
      'Urban Stormwater Drainage Network Simulation via SWMM',
      'Deep Excavation Soldier Pile Retaining Wall with Soil Anchor Modeling',
    ],
    tools: ['ETABS', 'STAAD.Pro', 'Revit BIM', 'AutoCAD', 'Primavera P6', 'Total Station'],
    terminology: [
      'story drift ratio', 'bending moment (kN·m)', 'shear capacity', 'bearing pressure (kN/m²)',
      'seismic base shear', 'deflection limit (L/350)', 'BIM LOD 350', 'clash detection rate'
    ],
    defaultInterests: ['Structural Mechanics', 'BIM Modeling', 'Seismic Engineering', 'Sustainable Infrastructure'],
    metricsPlaceholder: 'e.g., Story drift < 0.004 under seismic Zone IV, 18% steel weight savings',
    personaSectionEmphasis: {
      student: ['education', 'projects', 'skills', 'certifications', 'about', 'contact'],
      job_seeker: ['about', 'skills', 'projects', 'experience', 'education', 'contact'],
      professional: ['experience', 'projects', 'about', 'skills', 'certifications', 'contact'],
      freelancer: ['services', 'projects', 'testimonials', 'skills', 'about', 'contact'],
    },
  },

  electrical: {
    id: 'electrical',
    label: 'Electrical & Electronics Engineering',
    shortName: 'Electrical',
    category: 'Core Engineering',
    description: 'Power systems, circuit design, PCB layout, control theory, electric machines, and power electronics.',
    skillCategories: [
      { name: 'Circuit & PCB Design', skills: ['Altium Designer', 'KiCAD', 'Eagle PCB', 'LTspice', 'OrCAD Capture'] },
      { name: 'Power & Energy Systems', skills: ['MATLAB/Simulink', 'ETAP', 'PSCADD', 'Power Distribution', 'Substation Design'] },
      { name: 'Power Electronics & Drives', skills: ['Inverters & Converters', 'BLDC Motor Drives', 'PWM Control', 'MOSFET/IGBT Gate Drivers'] },
      { name: 'Embedded & Control', skills: ['STM32 (C/C++)', 'FPGA (Verilog/VHDL)', 'PID Controllers', 'PLC Programming', 'LabVIEW'] },
    ],
    projectTypes: [
      'Bidirectional DC-DC Buck-Boost Converter for Lithium-Ion Energy Storage',
      'Microcontroller-Based Smart Grid Energy Monitor with Modbus/RS-485',
      'Four-Layer High-Speed Impedance-Controlled PCB for Sensor Hub',
      'Field-Oriented Control (FOC) Drive for 3kW Permanent Magnet Synchronous Motor',
    ],
    tools: ['Altium Designer', 'KiCAD', 'LTspice', 'MATLAB/Simulink', 'ETAP', 'Digital Storage Oscilloscope'],
    terminology: [
      'total harmonic distortion (THD < 3%)', 'efficiency (96.4%)', 'ripple voltage (mVpp)',
      'switching frequency (kHz)', 'impedance matching (50Ω)', 'power factor (> 0.98)', 'transient response'
    ],
    defaultInterests: ['Power Electronics', 'PCB Circuit Design', 'Renewable Energy Systems', 'Embedded Control'],
    metricsPlaceholder: 'e.g., 96.8% peak efficiency, < 25mVpp output voltage ripple at 48V/10A',
    personaSectionEmphasis: {
      student: ['education', 'projects', 'skills', 'certifications', 'about', 'contact'],
      job_seeker: ['about', 'skills', 'projects', 'experience', 'education', 'contact'],
      professional: ['experience', 'projects', 'skills', 'publications', 'about', 'contact'],
      freelancer: ['services', 'projects', 'testimonials', 'skills', 'about', 'contact'],
    },
  },

  mechatronics: {
    id: 'mechatronics',
    label: 'Mechatronics & Robotics Engineering',
    shortName: 'Mechatronics',
    category: 'Interdisciplinary Engineering',
    description: 'Autonomous robotics, kinematics, embedded firmware, sensor fusion, PLC automation, and electromechanical actuators.',
    skillCategories: [
      { name: 'Robotics & Control', skills: ['ROS / ROS2', 'Gazebo Sim', 'Inverse Kinematics', 'SLAM Navigation', 'MoveIt'] },
      { name: 'Embedded Systems', skills: ['Embedded C/C++', 'FreeRTOS', 'ARM Cortex-M', 'ESP32', 'CAN Bus / SPI / I2C'] },
      { name: 'Sensors & Vision', skills: ['OpenCV', 'Sensor Fusion (Kalman Filter)', 'LiDAR Point Clouds', 'IMU Calibration'] },
      { name: 'Automation & Actuation', skills: ['PLC / SCADA', 'Pneumatics & Hydraulics', 'Stepper & Servo Tuning', 'SolidWorks'] },
    ],
    projectTypes: [
      '6-DOF Robotic Manipulator with Inverse Kinematics and ROS2 Trajectory Planning',
      'Autonomous Mobile Robot (AMR) with 2D LiDAR SLAM and Dynamic Obstacle Avoidance',
      'High-Speed Computer Vision Conveyor Sorting Cell with Pneumatic Ejection',
      'Custom Quadruped Robot with Real-Time Balance Control and IMU Fusion',
    ],
    tools: ['ROS2 Humble', 'Gazebo', 'Ubuntu Linux', 'SolidWorks', 'STM32CubeIDE', 'Saleae Logic Analyzer'],
    terminology: [
      'repeatability (±0.05 mm)', 'loop latency (1 ms)', 'Kalman filter covariance', 'degrees of freedom (DOF)',
      'trajectory spline', 'torque constant (N·m/A)', 'bus baud rate (1 Mbps CAN)', 'SLAM loop closure'
    ],
    defaultInterests: ['Robotics (ROS2)', 'Autonomous Navigation (SLAM)', 'Embedded Systems', 'Industrial Automation'],
    metricsPlaceholder: 'e.g., ±0.08mm trajectory repeatability, 100Hz real-time sensor fusion loop',
    personaSectionEmphasis: {
      student: ['education', 'projects', 'skills', 'certifications', 'about', 'contact'],
      job_seeker: ['about', 'skills', 'projects', 'experience', 'education', 'contact'],
      professional: ['experience', 'projects', 'skills', 'publications', 'about', 'contact'],
      freelancer: ['services', 'projects', 'testimonials', 'skills', 'about', 'contact'],
    },
  },
};

/**
 * Returns a complete DisciplineConfig for any standard or custom free-text discipline.
 * For custom disciplines, it dynamically extracts and formulates terminology,
 * skills, and project archetypes without requiring code changes.
 */
export function getDisciplineConfig(disciplineKey: string, customText?: string): DisciplineConfig {
  const normalizedKey = disciplineKey ? disciplineKey.toLowerCase().trim() : 'cs_it';

  // Direct standard match
  if (STANDARD_DISCIPLINES[normalizedKey]) {
    return STANDARD_DISCIPLINES[normalizedKey];
  }

  // Alias checks
  if (normalizedKey.includes('mech') && !normalizedKey.includes('tronics')) return STANDARD_DISCIPLINES.mechanical;
  if (normalizedKey.includes('civil') || normalizedKey.includes('structur')) return STANDARD_DISCIPLINES.civil;
  if (normalizedKey.includes('elec') && !normalizedKey.includes('tronics')) return STANDARD_DISCIPLINES.electrical;
  if (normalizedKey.includes('tronics') || normalizedKey.includes('robot')) return STANDARD_DISCIPLINES.mechatronics;
  if (normalizedKey.includes('cs') || normalizedKey.includes('comp') || normalizedKey.includes('code') || normalizedKey.includes('ai')) {
    return STANDARD_DISCIPLINES.cs_it;
  }

  // Dynamic Free-Text Custom Discipline Generator
  const rawTitle = customText?.trim() || disciplineKey?.trim() || 'Custom Specialized Engineering';
  const displayLabel = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);
  const words = displayLabel.split(/\s+/).filter(Boolean);
  const primaryWord = words[0] || 'Engineering';
  const secondaryWord = words[1] || 'Systems';

  return {
    id: 'other',
    label: displayLabel,
    shortName: displayLabel.length > 20 ? `${words[0]} Engineering` : displayLabel,
    category: 'Custom Field',
    description: `Specialized professional practice focused on ${displayLabel}, verified technical methodology, and standards compliance.`,
    skillCategories: [
      { name: 'Core Methodologies', skills: [`${primaryWord} Principles`, `${secondaryWord} Modeling`, 'Technical Analysis', 'Quality Assurance'] },
      { name: 'Domain Software & Tools', skills: [`Industry Standard Software`, 'Computational Analysis', 'Data Acquisition', 'Documentation'] },
      { name: 'Standards & Protocols', skills: ['Industry Specifications', 'Safety Standards', 'Regulatory Compliance', 'Verification & Testing'] },
    ],
    projectTypes: [
      `${displayLabel} Implementation Prototype & Validation Study`,
      `Performance Optimization Analysis for ${secondaryWord} Systems`,
      `Design and Experimental Benchmarking in ${displayLabel}`,
      `Next-Generation ${primaryWord} Workflow Automation`,
    ],
    tools: ['Specialized Domain Software', 'Data Analysis Tools', 'Benchmarking Instrumentation', 'CAD/Technical Drafting'],
    terminology: [
      'efficiency', 'yield', 'tolerance', 'validation accuracy',
      'system reliability', 'standards compliance', 'throughput'
    ],
    defaultInterests: [displayLabel, `${primaryWord} Systems`, 'Process Optimization', 'Applied Technology'],
    metricsPlaceholder: 'e.g., Quantifiable impact, efficiency metric, or verified milestone',
    personaSectionEmphasis: {
      student: ['education', 'projects', 'skills', 'certifications', 'about', 'contact'],
      job_seeker: ['about', 'skills', 'projects', 'experience', 'education', 'contact'],
      professional: ['experience', 'projects', 'skills', 'publications', 'about', 'contact'],
      freelancer: ['services', 'projects', 'testimonials', 'skills', 'about', 'contact'],
    },
  };
}

/**
 * Builds the exact contextual prompt fragment injected into OpenAI / offline synthesis.
 * Dynamically includes skill categories, project types, tools, and terminology.
 * Custom disciplines are handled dynamically without code changes.
 */
export function buildDisciplinePromptFragment(disciplineKey: string, customText?: string): string {
  const config = getDisciplineConfig(disciplineKey, customText);

  const skillSummary = config.skillCategories
    .map((c) => `${c.name}: [${c.skills.join(', ')}]`)
    .join('; ');

  return `DISCIPLINE CONTEXT & DOMAIN SPECIFICATIONS:
- Target Discipline: ${config.label} (${config.shortName})
- Core Category: ${config.category}
- Discipline Description: ${config.description}
- Standard Industry Skill Categories: ${skillSummary}
- Typical Project Types & Archetypes: ${config.projectTypes.join('; ')}
- Industry Tools & Software: ${config.tools.join(', ')}
- Domain Terminology & Quantitative Metrics to Respect: ${config.terminology.join(', ')}
- Persona Emphasis Guidelines:
  * student: prioritize foundational education, coursework, and capstone project bullets with academic validation.
  * job_seeker: prioritize immediate technical skills, ATS capability headlines, and quantifiable project metrics.
  * professional: prioritize enterprise experience, systems architecture, team leadership, and production uptime/scale.
  * freelancer: prioritize service packages, end-to-end client deliverables, turnaround speed, and testimonials.
- ANTI-HALLUCINATION INSTRUCTION: Incorporate appropriate terminology and realistic structure from above, but NEVER invent fake jobs, fake degrees, or unprovided claims. Only structure and polish the user's verified input.`;
}
