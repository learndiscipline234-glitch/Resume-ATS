import { supabase } from '@/integrations/supabase/client';

export interface RoleSkill {
  name: string;
  category: 'technical' | 'framework' | 'tool' | 'soft';
  importance: 'critical' | 'important' | 'nice-to-have';
  level: 'beginner' | 'intermediate' | 'advanced';
  description?: string;
  relatedSkills: string[];
}

export interface RoleDefinition {
  name: string;
  description: string;
  requiredSkills: RoleSkill[];
  optionalSkills: RoleSkill[];
  experienceLevels: {
    entry: string[];
    mid: string[];
    senior: string[];
  };
  salaryRange: {
    entry: string;
    mid: string;
    senior: string;
  };
  certifications: string[];
  commonTools: string[];
}

export class RoleDataService {
  private static roleDefinitions = new Map<string, RoleDefinition>();

  static {
    // Software Engineer
    this.roleDefinitions.set('Software Engineer', {
      name: 'Software Engineer',
      description: 'Develops software applications and systems using various programming languages and frameworks',
      requiredSkills: [
        {
          name: 'Programming Languages',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Core programming languages like Python, Java, JavaScript, etc.',
          relatedSkills: ['Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C#', 'Go', 'Rust']
        },
        {
          name: 'Version Control',
          category: 'tool',
          importance: 'critical',
          level: 'intermediate',
          description: 'Git and GitHub/GitLab',
          relatedSkills: ['Git', 'GitHub', 'GitLab', 'Bitbucket']
        },
        {
          name: 'Testing',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'Unit testing and test-driven development',
          relatedSkills: ['Unit Testing', 'TDD', 'Jest', 'JUnit', 'Pytest', 'Testing Frameworks']
        },
        {
          name: 'Problem Solving',
          category: 'soft',
          importance: 'critical',
          level: 'intermediate',
          description: 'Analytical thinking and debugging skills',
          relatedSkills: ['Debugging', 'Algorithm Design', 'Data Structures', 'Critical Thinking']
        }
      ],
      optionalSkills: [
        {
          name: 'Cloud Platforms',
          category: 'tool',
          importance: 'important',
          level: 'intermediate',
          description: 'AWS, Azure, or GCP',
          relatedSkills: ['AWS', 'Azure', 'GCP', 'Cloud Computing']
        },
        {
          name: 'DevOps',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'CI/CD and deployment practices',
          relatedSkills: ['Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'DevOps']
        }
      ],
      experienceLevels: {
        entry: ['Basic programming', 'Git', 'Testing basics'],
        mid: ['Multiple languages', 'Cloud basics', 'System design'],
        senior: ['Architecture', 'Team leadership', 'Mentoring']
      },
      salaryRange: {
        entry: '₹6L - ₹12L',
        mid: '₹12L - ₹25L',
        senior: '₹25L - ₹50L'
      },
      certifications: ['AWS Developer', 'Google Cloud Developer', 'Microsoft Azure Developer'],
      commonTools: ['VS Code', 'IntelliJ', 'Git', 'Docker', 'Jenkins']
    });

    // Data Scientist
    this.roleDefinitions.set('Data Scientist', {
      name: 'Data Scientist',
      description: 'Analyzes complex data to extract insights and build predictive models',
      requiredSkills: [
        {
          name: 'Python',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Primary programming language for data science',
          relatedSkills: ['Python', 'Py', 'Python Programming']
        },
        {
          name: 'SQL',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Database querying and data manipulation',
          relatedSkills: ['SQL', 'MySQL', 'PostgreSQL', 'Database Querying']
        },
        {
          name: 'Machine Learning',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'ML algorithms and model building',
          relatedSkills: ['Machine Learning', 'ML', 'Scikit-learn', 'TensorFlow', 'PyTorch']
        },
        {
          name: 'Data Analysis',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Statistical analysis and data exploration',
          relatedSkills: ['Data Analysis', 'Pandas', 'NumPy', 'Statistics', 'Data Exploration']
        },
        {
          name: 'Data Visualization',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'Creating charts and visualizations',
          relatedSkills: ['Data Visualization', 'Matplotlib', 'Seaborn', 'Plotly', 'Charts']
        }
      ],
      optionalSkills: [
        {
          name: 'Deep Learning',
          category: 'technical',
          importance: 'important',
          level: 'advanced',
          description: 'Neural networks and deep learning frameworks',
          relatedSkills: ['Deep Learning', 'Neural Networks', 'TensorFlow', 'PyTorch', 'Keras']
        },
        {
          name: 'Big Data',
          category: 'technical',
          importance: 'important',
          level: 'advanced',
          description: 'Handling large datasets',
          relatedSkills: ['Big Data', 'Spark', 'Hadoop', 'Kafka', 'Large Scale Processing']
        }
      ],
      experienceLevels: {
        entry: ['Python basics', 'SQL', 'Basic statistics'],
        mid: ['ML algorithms', 'Data visualization', 'Cloud platforms'],
        senior: ['Deep learning', 'MLOps', 'Team leadership']
      },
      salaryRange: {
        entry: '₹8L - ₹15L',
        mid: '₹15L - ₹30L',
        senior: '₹30L - ₹60L'
      },
      certifications: ['AWS Machine Learning', 'Google Cloud ML Engineer', 'Microsoft Azure Data Scientist'],
      commonTools: ['Jupyter', 'Pandas', 'Scikit-learn', 'TensorFlow', 'AWS SageMaker']
    });

    // Web Developer
    this.roleDefinitions.set('Web Developer', {
      name: 'Web Developer',
      description: 'Develops websites and web applications using frontend and backend technologies',
      requiredSkills: [
        {
          name: 'HTML/CSS',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Frontend markup and styling',
          relatedSkills: ['HTML', 'CSS', 'HTML5', 'CSS3', 'Responsive Design']
        },
        {
          name: 'JavaScript',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Frontend and backend JavaScript',
          relatedSkills: ['JavaScript', 'JS', 'ES6', 'Node.js', 'JavaScript Programming']
        },
        {
          name: 'Frontend Frameworks',
          category: 'framework',
          importance: 'critical',
          level: 'intermediate',
          description: 'React, Vue, or Angular',
          relatedSkills: ['React', 'Vue', 'Angular', 'Frontend Framework', 'UI Framework']
        },
        {
          name: 'Version Control',
          category: 'tool',
          importance: 'critical',
          level: 'intermediate',
          description: 'Git and GitHub',
          relatedSkills: ['Git', 'GitHub', 'Version Control']
        }
      ],
      optionalSkills: [
        {
          name: 'Backend Development',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'Server-side development',
          relatedSkills: ['Backend', 'Node.js', 'Express', 'API Development', 'Server Development']
        },
        {
          name: 'Databases',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'Database design and management',
          relatedSkills: ['Database', 'MySQL', 'PostgreSQL', 'MongoDB', 'Database Design']
        }
      ],
      experienceLevels: {
        entry: ['HTML/CSS', 'JavaScript basics', 'Git'],
        mid: ['Frontend frameworks', 'Backend basics', 'Database'],
        senior: ['Full-stack', 'Architecture', 'Team leadership']
      },
      salaryRange: {
        entry: '₹5L - ₹10L',
        mid: '₹10L - ₹20L',
        senior: '₹20L - ₹40L'
      },
      certifications: ['AWS Developer', 'Google Cloud Developer', 'Microsoft Azure Developer'],
      commonTools: ['VS Code', 'Chrome DevTools', 'Git', 'npm', 'Webpack']
    });

    // AI/ML Engineer
    this.roleDefinitions.set('AI/ML Engineer', {
      name: 'AI/ML Engineer',
      description: 'Develops and implements machine learning models and AI systems',
      requiredSkills: [
        {
          name: 'Python',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Primary programming language for ML/AI development',
          relatedSkills: ['Python', 'Py', 'Python Programming']
        },
        {
          name: 'Machine Learning',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Core ML algorithms and techniques',
          relatedSkills: ['Machine Learning', 'ML', 'MachineLearning', 'ML Algorithms']
        },
        {
          name: 'Deep Learning',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Neural networks and deep learning frameworks',
          relatedSkills: ['Deep Learning', 'DL', 'DeepLearning', 'Neural Networks', 'Neural Networks']
        },
        {
          name: 'TensorFlow',
          category: 'framework',
          importance: 'critical',
          level: 'intermediate',
          description: 'Google\'s machine learning framework',
          relatedSkills: ['TensorFlow', 'Tensor Flow', 'TF']
        },
        {
          name: 'PyTorch',
          category: 'framework',
          importance: 'critical',
          level: 'intermediate',
          description: 'Facebook\'s machine learning framework',
          relatedSkills: ['PyTorch', 'Py Torch', 'Pytorch']
        }
      ],
      optionalSkills: [
        {
          name: 'Natural Language Processing',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'Text processing and NLP techniques',
          relatedSkills: ['NLP', 'Natural Language Processing', 'Text Processing']
        },
        {
          name: 'Computer Vision',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'Image and video processing',
          relatedSkills: ['Computer Vision', 'CV', 'Image Processing', 'OpenCV']
        },
        {
          name: 'MLOps',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'ML operations and deployment',
          relatedSkills: ['MLOps', 'ML Ops', 'ML Operations', 'Model Deployment']
        }
      ],
      experienceLevels: {
        entry: ['Python basics', 'ML fundamentals', 'Data preprocessing'],
        mid: ['Model development', 'ML frameworks', 'Model evaluation'],
        senior: ['MLOps', 'Production systems', 'Team leadership']
      },
      salaryRange: {
        entry: '₹8L - ₹15L',
        mid: '₹15L - ₹30L',
        senior: '₹30L - ₹60L'
      },
      certifications: ['Google ML Engineer', 'AWS ML Specialty', 'Microsoft Azure AI Engineer'],
      commonTools: ['Jupyter', 'TensorBoard', 'MLflow', 'Kubeflow', 'Docker']
    });

    // Cloud Engineer
    this.roleDefinitions.set('Cloud Engineer', {
      name: 'Cloud Engineer',
      description: 'Designs, implements, and manages cloud infrastructure and services',
      requiredSkills: [
        {
          name: 'AWS',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Amazon Web Services cloud platform',
          relatedSkills: ['AWS', 'Amazon Web Services', 'Amazon Cloud']
        },
        {
          name: 'Docker',
          category: 'tool',
          importance: 'critical',
          level: 'intermediate',
          description: 'Containerization platform',
          relatedSkills: ['Docker', 'Containerization', 'Containers']
        },
        {
          name: 'Kubernetes',
          category: 'tool',
          importance: 'critical',
          level: 'intermediate',
          description: 'Container orchestration platform',
          relatedSkills: ['Kubernetes', 'K8s', 'Kube', 'Container Orchestration']
        },
        {
          name: 'Linux',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Linux operating system administration',
          relatedSkills: ['Linux', 'Ubuntu', 'CentOS', 'Red Hat', 'System Administration']
        }
      ],
      optionalSkills: [
        {
          name: 'Azure',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'Microsoft Azure cloud platform',
          relatedSkills: ['Azure', 'Microsoft Azure', 'Azure Cloud']
        },
        {
          name: 'GCP',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'Google Cloud Platform',
          relatedSkills: ['GCP', 'Google Cloud Platform', 'Google Cloud']
        },
        {
          name: 'Terraform',
          category: 'tool',
          importance: 'important',
          level: 'intermediate',
          description: 'Infrastructure as Code tool',
          relatedSkills: ['Terraform', 'IaC', 'Infrastructure as Code']
        }
      ],
      experienceLevels: {
        entry: ['Cloud basics', 'Linux fundamentals', 'Basic networking'],
        mid: ['Cloud services', 'Containerization', 'CI/CD'],
        senior: ['Architecture design', 'Multi-cloud', 'Team leadership']
      },
      salaryRange: {
        entry: '₹6L - ₹12L',
        mid: '₹12L - ₹25L',
        senior: '₹25L - ₹50L'
      },
      certifications: ['AWS Solutions Architect', 'Azure Solutions Architect', 'Google Cloud Architect'],
      commonTools: ['Terraform', 'Ansible', 'Jenkins', 'GitLab CI', 'Prometheus']
    });

    // Game Developer
    this.roleDefinitions.set('Game Developer', {
      name: 'Game Developer',
      description: 'Creates video games using various game engines and programming languages',
      requiredSkills: [
        {
          name: 'Unity',
          category: 'framework',
          importance: 'critical',
          level: 'intermediate',
          description: 'Unity game engine',
          relatedSkills: ['Unity', 'Unity3D', 'Unity Engine']
        },
        {
          name: 'C#',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Primary language for Unity development',
          relatedSkills: ['C#', 'CSharp', 'C Sharp']
        },
        {
          name: 'C++',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'High-performance game development',
          relatedSkills: ['C++', 'Cpp', 'C Plus Plus']
        },
        {
          name: 'Game Design',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Game mechanics and design principles',
          relatedSkills: ['Game Design', 'Game Mechanics', 'Gameplay Design']
        }
      ],
      optionalSkills: [
        {
          name: 'Unreal Engine',
          category: 'framework',
          importance: 'important',
          level: 'intermediate',
          description: 'Unreal Engine game development',
          relatedSkills: ['Unreal Engine', 'UE4', 'UE5', 'Unreal']
        },
        {
          name: '3D Modeling',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: '3D asset creation',
          relatedSkills: ['3D Modeling', '3D Art', 'Blender', 'Maya', '3ds Max']
        },
        {
          name: 'Game Physics',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'Physics simulation in games',
          relatedSkills: ['Game Physics', 'Physics Engine', 'Rigidbody', 'Collision Detection']
        }
      ],
      experienceLevels: {
        entry: ['Game engines basics', 'Programming fundamentals', 'Basic game mechanics'],
        mid: ['Advanced programming', 'Game optimization', 'Multiplayer systems'],
        senior: ['Game architecture', 'Team leadership', 'Project management']
      },
      salaryRange: {
        entry: '₹4L - ₹8L',
        mid: '₹8L - ₹18L',
        senior: '₹18L - ₹35L'
      },
      certifications: ['Unity Certified Developer', 'Unreal Engine Certification'],
      commonTools: ['Visual Studio', 'Blender', 'Photoshop', 'Git', 'Perforce']
    });

    // Mobile App Developer
    this.roleDefinitions.set('Mobile App Developer', {
      name: 'Mobile App Developer',
      description: 'Develops mobile applications for iOS and Android platforms',
      requiredSkills: [
        {
          name: 'React Native',
          category: 'framework',
          importance: 'critical',
          level: 'intermediate',
          description: 'Cross-platform mobile development',
          relatedSkills: ['React Native', 'ReactNative', 'RN']
        },
        {
          name: 'Flutter',
          category: 'framework',
          importance: 'critical',
          level: 'intermediate',
          description: 'Google\'s mobile development framework',
          relatedSkills: ['Flutter', 'Dart', 'Flutter Development']
        },
        {
          name: 'iOS Development',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'iOS app development with Swift',
          relatedSkills: ['iOS', 'Swift', 'Xcode', 'iOS Development']
        },
        {
          name: 'Android Development',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Android app development',
          relatedSkills: ['Android', 'Kotlin', 'Java', 'Android Studio', 'Android Development']
        }
      ],
      optionalSkills: [
        {
          name: 'UI/UX Design',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'Mobile user interface design',
          relatedSkills: ['UI/UX', 'Mobile Design', 'User Interface', 'User Experience']
        },
        {
          name: 'Firebase',
          category: 'tool',
          importance: 'important',
          level: 'intermediate',
          description: 'Google\'s mobile backend platform',
          relatedSkills: ['Firebase', 'Firebase Auth', 'Firestore', 'Firebase Functions']
        },
        {
          name: 'App Store Optimization',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'App store marketing and optimization',
          relatedSkills: ['ASO', 'App Store Optimization', 'App Marketing']
        }
      ],
      experienceLevels: {
        entry: ['Mobile development basics', 'Platform fundamentals', 'Basic UI'],
        mid: ['Cross-platform development', 'Advanced features', 'Performance optimization'],
        senior: ['Architecture design', 'Team leadership', 'App store strategy']
      },
      salaryRange: {
        entry: '₹5L - ₹10L',
        mid: '₹10L - ₹20L',
        senior: '₹20L - ₹40L'
      },
      certifications: ['Google Mobile Web Specialist', 'Apple Certified Developer'],
      commonTools: ['Xcode', 'Android Studio', 'Figma', 'Firebase Console', 'TestFlight']
    });

    // Database Administrator
    this.roleDefinitions.set('Database Administrator', {
      name: 'Database Administrator',
      description: 'Manages and maintains database systems and data integrity',
      requiredSkills: [
        {
          name: 'SQL',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Structured Query Language',
          relatedSkills: ['SQL', 'Structured Query Language', 'Database Queries']
        },
        {
          name: 'PostgreSQL',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Open-source relational database',
          relatedSkills: ['PostgreSQL', 'Postgres', 'PostgreSQL Database']
        },
        {
          name: 'Database Design',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Database schema design and optimization',
          relatedSkills: ['Database Design', 'Schema Design', 'Database Architecture']
        },
        {
          name: 'Performance Tuning',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Database performance optimization',
          relatedSkills: ['Performance Tuning', 'Query Optimization', 'Database Optimization']
        }
      ],
      optionalSkills: [
        {
          name: 'MySQL',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'Popular open-source database',
          relatedSkills: ['MySQL', 'MySQL Database']
        },
        {
          name: 'Oracle',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'Enterprise database system',
          relatedSkills: ['Oracle', 'Oracle Database', 'Oracle DB']
        },
        {
          name: 'MongoDB',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'NoSQL document database',
          relatedSkills: ['MongoDB', 'Mongo', 'NoSQL', 'Document Database']
        }
      ],
      experienceLevels: {
        entry: ['SQL basics', 'Database fundamentals', 'Basic administration'],
        mid: ['Advanced SQL', 'Performance tuning', 'Backup strategies'],
        senior: ['Database architecture', 'Team leadership', 'Disaster recovery']
      },
      salaryRange: {
        entry: '₹6L - ₹12L',
        mid: '₹12L - ₹25L',
        senior: '₹25L - ₹50L'
      },
      certifications: ['Oracle DBA', 'Microsoft SQL Server', 'MongoDB Certified'],
      commonTools: ['pgAdmin', 'MySQL Workbench', 'Oracle SQL Developer', 'MongoDB Compass']
    });

    // DevOps Engineer
    this.roleDefinitions.set('DevOps Engineer', {
      name: 'DevOps Engineer',
      description: 'Bridges development and operations through automation and infrastructure management',
      requiredSkills: [
        {
          name: 'CI/CD',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Continuous Integration and Deployment',
          relatedSkills: ['CI/CD', 'Continuous Integration', 'Continuous Deployment', 'Continuous Delivery']
        },
        {
          name: 'Docker',
          category: 'tool',
          importance: 'critical',
          level: 'intermediate',
          description: 'Containerization platform',
          relatedSkills: ['Docker', 'Containerization', 'Containers', 'Docker Compose']
        },
        {
          name: 'Kubernetes',
          category: 'tool',
          importance: 'critical',
          level: 'intermediate',
          description: 'Container orchestration',
          relatedSkills: ['Kubernetes', 'K8s', 'Kube', 'Container Orchestration']
        },
        {
          name: 'Linux',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Linux system administration',
          relatedSkills: ['Linux', 'Ubuntu', 'CentOS', 'Red Hat', 'System Administration']
        }
      ],
      optionalSkills: [
        {
          name: 'AWS',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'Amazon Web Services',
          relatedSkills: ['AWS', 'Amazon Web Services', 'Amazon Cloud']
        },
        {
          name: 'Monitoring',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'System and application monitoring',
          relatedSkills: ['Monitoring', 'Logging', 'Metrics', 'Alerting', 'Observability']
        },
        {
          name: 'Terraform',
          category: 'tool',
          importance: 'important',
          level: 'intermediate',
          description: 'Infrastructure as Code',
          relatedSkills: ['Terraform', 'IaC', 'Infrastructure as Code']
        }
      ],
      experienceLevels: {
        entry: ['Linux basics', 'Scripting fundamentals', 'Basic automation'],
        mid: ['Containerization', 'CI/CD pipelines', 'Cloud platforms'],
        senior: ['Architecture design', 'Team leadership', 'Strategic planning']
      },
      salaryRange: {
        entry: '₹8L - ₹15L',
        mid: '₹15L - ₹30L',
        senior: '₹30L - ₹60L'
      },
      certifications: ['AWS DevOps Engineer', 'Azure DevOps Engineer', 'Google Cloud DevOps'],
      commonTools: ['Jenkins', 'GitLab CI', 'Ansible', 'Prometheus', 'Grafana']
    });

    // UI/UX Designer
    this.roleDefinitions.set('UI/UX Designer', {
      name: 'UI/UX Designer',
      description: 'Designs user interfaces and experiences for digital products',
      requiredSkills: [
        {
          name: 'Figma',
          category: 'tool',
          importance: 'critical',
          level: 'intermediate',
          description: 'Collaborative design tool',
          relatedSkills: ['Figma', 'Figma Design', 'Design Tool']
        },
        {
          name: 'User Research',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Understanding user needs and behaviors',
          relatedSkills: ['User Research', 'User Studies', 'User Interviews', 'Usability Testing']
        },
        {
          name: 'Wireframing',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Creating low-fidelity design layouts',
          relatedSkills: ['Wireframing', 'Wireframes', 'Low-fidelity Design']
        },
        {
          name: 'Prototyping',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Creating interactive design prototypes',
          relatedSkills: ['Prototyping', 'Interactive Prototypes', 'Prototype Design']
        }
      ],
      optionalSkills: [
        {
          name: 'Adobe XD',
          category: 'tool',
          importance: 'important',
          level: 'intermediate',
          description: 'Adobe\'s design and prototyping tool',
          relatedSkills: ['Adobe XD', 'XD', 'Adobe Experience Design']
        },
        {
          name: 'Design Systems',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'Creating consistent design systems',
          relatedSkills: ['Design Systems', 'Design Tokens', 'Component Libraries']
        },
        {
          name: 'Accessibility',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'Designing for accessibility standards',
          relatedSkills: ['Accessibility', 'WCAG', 'Inclusive Design', 'A11y']
        }
      ],
      experienceLevels: {
        entry: ['Design tools basics', 'Design principles', 'Basic prototyping'],
        mid: ['User research', 'Advanced prototyping', 'Design systems'],
        senior: ['Design strategy', 'Team leadership', 'Design operations']
      },
      salaryRange: {
        entry: '₹4L - ₹8L',
        mid: '₹8L - ₹18L',
        senior: '₹18L - ₹35L'
      },
      certifications: ['Google UX Design', 'Adobe Certified Expert', 'Nielsen Norman Group'],
      commonTools: ['Sketch', 'InVision', 'Principle', 'Zeplin', 'Abstract']
    });

    // Product Manager
    this.roleDefinitions.set('Product Manager', {
      name: 'Product Manager',
      description: 'Manages product strategy, roadmap, and cross-functional team coordination',
      requiredSkills: [
        {
          name: 'Agile',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Agile development methodology',
          relatedSkills: ['Agile', 'Agile Methodology', 'Agile Development']
        },
        {
          name: 'Scrum',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Scrum framework for agile development',
          relatedSkills: ['Scrum', 'Scrum Master', 'Scrum Framework']
        },
        {
          name: 'Roadmapping',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Product roadmap planning and management',
          relatedSkills: ['Roadmapping', 'Product Roadmap', 'Roadmap Planning']
        },
        {
          name: 'Stakeholder Management',
          category: 'soft',
          importance: 'critical',
          level: 'intermediate',
          description: 'Managing relationships with stakeholders',
          relatedSkills: ['Stakeholder Management', 'Stakeholder Communication', 'Stakeholder Relations']
        }
      ],
      optionalSkills: [
        {
          name: 'Analytics',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'Product analytics and data analysis',
          relatedSkills: ['Analytics', 'Product Analytics', 'Data Analysis', 'Metrics']
        },
        {
          name: 'Business Strategy',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'Strategic business planning',
          relatedSkills: ['Business Strategy', 'Strategic Planning', 'Business Planning']
        },
        {
          name: 'Communication',
          category: 'soft',
          importance: 'important',
          level: 'intermediate',
          description: 'Effective communication skills',
          relatedSkills: ['Communication', 'Presentation Skills', 'Written Communication']
        }
      ],
      experienceLevels: {
        entry: ['Product basics', 'Agile fundamentals', 'Basic analytics'],
        mid: ['Advanced analytics', 'Stakeholder management', 'Cross-functional leadership'],
        senior: ['Strategic planning', 'Team leadership', 'Executive communication']
      },
      salaryRange: {
        entry: '₹8L - ₹15L',
        mid: '₹15L - ₹30L',
        senior: '₹30L - ₹60L'
      },
      certifications: ['Certified Scrum Product Owner', 'Google Product Management', 'Pragmatic Institute'],
      commonTools: ['Jira', 'Confluence', 'Figma', 'Mixpanel', 'Amplitude']
    });

    // IT Project Manager
    this.roleDefinitions.set('IT Project Manager', {
      name: 'IT Project Manager',
      description: 'Manages IT projects from initiation to completion',
      requiredSkills: [
        {
          name: 'Agile',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Agile project management methodology',
          relatedSkills: ['Agile', 'Agile Methodology', 'Agile Project Management']
        },
        {
          name: 'Scrum',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Scrum framework implementation',
          relatedSkills: ['Scrum', 'Scrum Master', 'Scrum Framework']
        },
        {
          name: 'Risk Management',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Identifying and managing project risks',
          relatedSkills: ['Risk Management', 'Risk Assessment', 'Risk Mitigation']
        },
        {
          name: 'Budgeting',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Project budget planning and management',
          relatedSkills: ['Budgeting', 'Budget Planning', 'Cost Management', 'Financial Planning']
        }
      ],
      optionalSkills: [
        {
          name: 'Scheduling',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'Project scheduling and timeline management',
          relatedSkills: ['Scheduling', 'Project Scheduling', 'Timeline Management', 'Gantt Charts']
        },
        {
          name: 'Communication',
          category: 'soft',
          importance: 'important',
          level: 'intermediate',
          description: 'Project communication management',
          relatedSkills: ['Communication', 'Project Communication', 'Stakeholder Communication']
        },
        {
          name: 'Leadership',
          category: 'soft',
          importance: 'important',
          level: 'intermediate',
          description: 'Team leadership and management',
          relatedSkills: ['Leadership', 'Team Leadership', 'Team Management', 'People Management']
        }
      ],
      experienceLevels: {
        entry: ['Project management basics', 'Agile fundamentals', 'Basic tools'],
        mid: ['Advanced methodologies', 'Team management', 'Risk management'],
        senior: ['Strategic planning', 'Program management', 'Executive leadership']
      },
      salaryRange: {
        entry: '₹6L - ₹12L',
        mid: '₹12L - ₹25L',
        senior: '₹25L - ₹50L'
      },
      certifications: ['PMP', 'Certified Scrum Master', 'PRINCE2', 'AgilePM'],
      commonTools: ['Microsoft Project', 'Jira', 'Confluence', 'Slack', 'Trello']
    });

    // Systems Architect
    this.roleDefinitions.set('Systems Architect', {
      name: 'Systems Architect',
      description: 'Designs and oversees complex system architectures and technical solutions',
      requiredSkills: [
        {
          name: 'System Design',
          category: 'technical',
          importance: 'critical',
          level: 'advanced',
          description: 'Designing scalable system architectures',
          relatedSkills: ['System Design', 'Architecture Design', 'System Architecture']
        },
        {
          name: 'Cloud Infrastructure',
          category: 'technical',
          importance: 'critical',
          level: 'advanced',
          description: 'Cloud-based infrastructure design',
          relatedSkills: ['Cloud Infrastructure', 'Cloud Architecture', 'Infrastructure Design']
        },
        {
          name: 'APIs',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'API design and management',
          relatedSkills: ['APIs', 'API Design', 'REST APIs', 'GraphQL', 'API Management']
        },
        {
          name: 'Microservices',
          category: 'technical',
          importance: 'critical',
          level: 'advanced',
          description: 'Microservices architecture design',
          relatedSkills: ['Microservices', 'Microservice Architecture', 'Service-Oriented Architecture']
        }
      ],
      optionalSkills: [
        {
          name: 'Networking',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'Network architecture and design',
          relatedSkills: ['Networking', 'Network Design', 'Network Architecture']
        },
        {
          name: 'Security',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'System security design and implementation',
          relatedSkills: ['Security', 'Cybersecurity', 'Security Architecture', 'Information Security']
        },
        {
          name: 'DevOps',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'DevOps practices and automation',
          relatedSkills: ['DevOps', 'DevOps Practices', 'Automation', 'CI/CD']
        }
      ],
      experienceLevels: {
        entry: ['System design basics', 'Cloud fundamentals', 'Basic architecture'],
        mid: ['Advanced architecture', 'Scalability design', 'Performance optimization'],
        senior: ['Enterprise architecture', 'Technical leadership', 'Strategic planning']
      },
      salaryRange: {
        entry: '₹12L - ₹20L',
        mid: '₹20L - ₹40L',
        senior: '₹40L - ₹80L'
      },
      certifications: ['AWS Solutions Architect', 'Azure Solutions Architect', 'Google Cloud Architect'],
      commonTools: ['Draw.io', 'Lucidchart', 'Visio', 'Terraform', 'Kubernetes']
    });

    // Blockchain Developer
    this.roleDefinitions.set('Blockchain Developer', {
      name: 'Blockchain Developer',
      description: 'Develops decentralized applications and smart contracts on blockchain platforms',
      requiredSkills: [
        {
          name: 'Solidity',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Programming language for Ethereum smart contracts',
          relatedSkills: ['Solidity', 'Smart Contract Development', 'Ethereum Development']
        },
        {
          name: 'Smart Contracts',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Self-executing contracts on blockchain',
          relatedSkills: ['Smart Contracts', 'Contract Development', 'Blockchain Contracts']
        },
        {
          name: 'Ethereum',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Ethereum blockchain platform',
          relatedSkills: ['Ethereum', 'ETH', 'Ethereum Blockchain']
        },
        {
          name: 'Web3.js',
          category: 'framework',
          importance: 'critical',
          level: 'intermediate',
          description: 'JavaScript library for Ethereum',
          relatedSkills: ['Web3.js', 'Web3', 'Ethereum JavaScript']
        }
      ],
      optionalSkills: [
        {
          name: 'Cryptography',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'Cryptographic principles and implementation',
          relatedSkills: ['Cryptography', 'Crypto', 'Encryption', 'Hash Functions']
        },
        {
          name: 'Distributed Systems',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'Distributed system design principles',
          relatedSkills: ['Distributed Systems', 'Decentralized Systems', 'P2P Networks']
        },
        {
          name: 'DeFi',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'Decentralized Finance applications',
          relatedSkills: ['DeFi', 'Decentralized Finance', 'DeFi Protocols']
        }
      ],
      experienceLevels: {
        entry: ['Blockchain basics', 'Smart contract fundamentals', 'Basic Web3'],
        mid: ['Advanced smart contracts', 'DeFi protocols', 'Security best practices'],
        senior: ['Protocol design', 'Team leadership', 'Ecosystem development']
      },
      salaryRange: {
        entry: '₹8L - ₹15L',
        mid: '₹15L - ₹35L',
        senior: '₹35L - ₹70L'
      },
      certifications: ['Certified Blockchain Developer', 'Ethereum Developer Certification'],
      commonTools: ['Truffle', 'Hardhat', 'Remix', 'MetaMask', 'Infura']
    });

    // Research Scientist
    this.roleDefinitions.set('Research Scientist', {
      name: 'Research Scientist',
      description: 'Conducts research and develops innovative solutions in technology and science',
      requiredSkills: [
        {
          name: 'Python',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Primary programming language for research',
          relatedSkills: ['Python', 'Py', 'Python Programming', 'Scientific Python']
        },
        {
          name: 'Mathematics',
          category: 'technical',
          importance: 'critical',
          level: 'advanced',
          description: 'Mathematical foundations for research',
          relatedSkills: ['Mathematics', 'Math', 'Mathematical Modeling', 'Statistics']
        },
        {
          name: 'Deep Learning',
          category: 'technical',
          importance: 'critical',
          level: 'advanced',
          description: 'Advanced machine learning techniques',
          relatedSkills: ['Deep Learning', 'DL', 'DeepLearning', 'Neural Networks']
        },
        {
          name: 'Experimentation',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Designing and conducting experiments',
          relatedSkills: ['Experimentation', 'Experimental Design', 'A/B Testing', 'Hypothesis Testing']
        }
      ],
      optionalSkills: [
        {
          name: 'Research Methodology',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'Scientific research methods and practices',
          relatedSkills: ['Research Methodology', 'Scientific Method', 'Research Design']
        },
        {
          name: 'TensorFlow',
          category: 'framework',
          importance: 'important',
          level: 'intermediate',
          description: 'Machine learning framework',
          relatedSkills: ['TensorFlow', 'Tensor Flow', 'TF']
        },
        {
          name: 'PyTorch',
          category: 'framework',
          importance: 'important',
          level: 'intermediate',
          description: 'Deep learning framework',
          relatedSkills: ['PyTorch', 'Py Torch', 'Pytorch']
        }
      ],
      experienceLevels: {
        entry: ['Research basics', 'Programming fundamentals', 'Basic statistics'],
        mid: ['Advanced research methods', 'Machine learning', 'Publication skills'],
        senior: ['Research leadership', 'Grant writing', 'Academic collaboration']
      },
      salaryRange: {
        entry: '₹10L - ₹18L',
        mid: '₹18L - ₹35L',
        senior: '₹35L - ₹70L'
      },
      certifications: ['PhD in relevant field', 'Research Methodology Certification'],
      commonTools: ['Jupyter', 'R', 'MATLAB', 'LaTeX', 'Git']
    });

    // QA Engineer
    this.roleDefinitions.set('QA Engineer', {
      name: 'QA Engineer',
      description: 'Ensures software quality through testing and quality assurance processes',
      requiredSkills: [
        {
          name: 'Test Automation',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Automated testing frameworks and tools',
          relatedSkills: ['Test Automation', 'Automated Testing', 'Test Frameworks']
        },
        {
          name: 'Selenium',
          category: 'tool',
          importance: 'critical',
          level: 'intermediate',
          description: 'Web application testing framework',
          relatedSkills: ['Selenium', 'Selenium WebDriver', 'Selenium Testing']
        },
        {
          name: 'API Testing',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Testing application programming interfaces',
          relatedSkills: ['API Testing', 'REST API Testing', 'API Test Automation']
        },
        {
          name: 'Manual Testing',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Manual testing processes and techniques',
          relatedSkills: ['Manual Testing', 'Functional Testing', 'User Acceptance Testing']
        }
      ],
      optionalSkills: [
        {
          name: 'Performance Testing',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'Testing application performance and scalability',
          relatedSkills: ['Performance Testing', 'Load Testing', 'Stress Testing']
        },
        {
          name: 'CI/CD',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'Continuous integration and deployment',
          relatedSkills: ['CI/CD', 'Continuous Integration', 'Continuous Deployment']
        },
        {
          name: 'JIRA',
          category: 'tool',
          importance: 'important',
          level: 'intermediate',
          description: 'Project management and bug tracking tool',
          relatedSkills: ['JIRA', 'Bug Tracking', 'Issue Management']
        }
      ],
      experienceLevels: {
        entry: ['Testing fundamentals', 'Manual testing', 'Basic automation'],
        mid: ['Advanced automation', 'Performance testing', 'CI/CD integration'],
        senior: ['Test strategy', 'Team leadership', 'Quality engineering']
      },
      salaryRange: {
        entry: '₹5L - ₹10L',
        mid: '₹10L - ₹20L',
        senior: '₹20L - ₹40L'
      },
      certifications: ['ISTQB', 'Selenium Certification', 'Agile Testing'],
      commonTools: ['Postman', 'JMeter', 'TestRail', 'Cypress', 'Playwright']
    });

    // Network Engineer
    this.roleDefinitions.set('Network Engineer', {
      name: 'Network Engineer',
      description: 'Designs, implements, and maintains network infrastructure and systems',
      requiredSkills: [
        {
          name: 'Networking',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Network protocols and technologies',
          relatedSkills: ['Networking', 'Network Protocols', 'Network Technologies']
        },
        {
          name: 'Routing',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Network routing protocols and configuration',
          relatedSkills: ['Routing', 'Routing Protocols', 'BGP', 'OSPF', 'EIGRP']
        },
        {
          name: 'Switching',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Network switching technologies',
          relatedSkills: ['Switching', 'VLAN', 'STP', 'Ethernet Switching']
        },
        {
          name: 'Firewall',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Network security and firewall management',
          relatedSkills: ['Firewall', 'Network Security', 'Security Policies']
        }
      ],
      optionalSkills: [
        {
          name: 'VPN',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'Virtual Private Network technologies',
          relatedSkills: ['VPN', 'Virtual Private Network', 'Site-to-Site VPN']
        },
        {
          name: 'Cisco',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'Cisco networking equipment and technologies',
          relatedSkills: ['Cisco', 'Cisco IOS', 'Cisco Switches', 'Cisco Routers']
        },
        {
          name: 'Security',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'Network security principles and implementation',
          relatedSkills: ['Security', 'Cybersecurity', 'Network Security', 'Information Security']
        }
      ],
      experienceLevels: {
        entry: ['Network fundamentals', 'Basic protocols', 'Equipment configuration'],
        mid: ['Advanced protocols', 'Security implementation', 'Troubleshooting'],
        senior: ['Network architecture', 'Team leadership', 'Strategic planning']
      },
      salaryRange: {
        entry: '₹6L - ₹12L',
        mid: '₹12L - ₹25L',
        senior: '₹25L - ₹50L'
      },
      certifications: ['CCNA', 'CCNP', 'JNCIA', 'Network+'],
      commonTools: ['Wireshark', 'Cisco Packet Tracer', 'GNS3', 'SolarWinds', 'PRTG']
    });

    // Business Analyst
    this.roleDefinitions.set('Business Analyst', {
      name: 'Business Analyst',
      description: 'Analyzes business processes and requirements to improve efficiency and outcomes',
      requiredSkills: [
        {
          name: 'SQL',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Structured Query Language for data analysis',
          relatedSkills: ['SQL', 'Structured Query Language', 'Database Queries']
        },
        {
          name: 'Excel',
          category: 'tool',
          importance: 'critical',
          level: 'intermediate',
          description: 'Microsoft Excel for data analysis and reporting',
          relatedSkills: ['Excel', 'Microsoft Excel', 'Spreadsheet Analysis']
        },
        {
          name: 'Data Visualization',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Creating visual representations of data',
          relatedSkills: ['Data Visualization', 'Charts', 'Dashboards', 'Reports']
        },
        {
          name: 'Requirements Gathering',
          category: 'technical',
          importance: 'critical',
          level: 'intermediate',
          description: 'Collecting and documenting business requirements',
          relatedSkills: ['Requirements Gathering', 'Business Requirements', 'Requirements Analysis']
        }
      ],
      optionalSkills: [
        {
          name: 'Communication',
          category: 'soft',
          importance: 'important',
          level: 'intermediate',
          description: 'Effective communication with stakeholders',
          relatedSkills: ['Communication', 'Stakeholder Communication', 'Presentation Skills']
        },
        {
          name: 'Documentation',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'Creating and maintaining business documentation',
          relatedSkills: ['Documentation', 'Business Documentation', 'Process Documentation']
        },
        {
          name: 'Process Improvement',
          category: 'technical',
          importance: 'important',
          level: 'intermediate',
          description: 'Analyzing and improving business processes',
          relatedSkills: ['Process Improvement', 'Business Process Analysis', 'Process Optimization']
        }
      ],
      experienceLevels: {
        entry: ['Business analysis basics', 'Data analysis fundamentals', 'Basic tools'],
        mid: ['Advanced analytics', 'Process improvement', 'Stakeholder management'],
        senior: ['Strategic analysis', 'Team leadership', 'Business strategy']
      },
      salaryRange: {
        entry: '₹5L - ₹10L',
        mid: '₹10L - ₹20L',
        senior: '₹20L - ₹40L'
      },
      certifications: ['CBAP', 'PMP', 'Six Sigma', 'Agile Business Analysis'],
      commonTools: ['Tableau', 'Power BI', 'Visio', 'Confluence', 'Jira']
    });
  }

  static getRoleDefinition(roleName: string): RoleDefinition | undefined {
    return this.roleDefinitions.get(roleName);
  }

  static getAllRoles(): RoleDefinition[] {
    return Array.from(this.roleDefinitions.values());
  }

  static getAllSkillsForRole(roleName: string): RoleSkill[] {
    const roleDef = this.getRoleDefinition(roleName);
    return roleDef ? [...roleDef.requiredSkills, ...roleDef.optionalSkills] : [];
  }

  static getRequiredSkillsForRole(roleName: string): RoleSkill[] {
    const roleDef = this.getRoleDefinition(roleName);
    return roleDef ? roleDef.requiredSkills : [];
  }

  static getOptionalSkillsForRole(roleName: string): RoleSkill[] {
    const roleDef = this.getRoleDefinition(roleName);
    return roleDef ? roleDef.optionalSkills : [];
  }

  static getCriticalSkillsForRole(roleName: string): RoleSkill[] {
    const skills = this.getAllSkillsForRole(roleName);
    return skills.filter(skill => skill.importance === 'critical');
  }

  static getImportantSkillsForRole(roleName: string): RoleSkill[] {
    const skills = this.getAllSkillsForRole(roleName);
    return skills.filter(skill => skill.importance === 'important');
  }

  static calculateSkillMatchScore(userSkills: string[], targetRole: string): {
    matchScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    criticalMissing: string[];
    importantMissing: string[];
  } {
    console.log('calculateSkillMatchScore input:', { 
      userSkills: userSkills.slice(0, 3), // Show first 3 items
      userSkillsType: typeof userSkills[0],
      targetRole 
    });
    
    const roleSkills = this.getAllSkillsForRole(targetRole);
    
    // Create a comprehensive list of all related skills for each role skill
    const allRelatedSkills: string[] = [];
    roleSkills.forEach(roleSkill => {
      allRelatedSkills.push(roleSkill.name.toLowerCase());
      allRelatedSkills.push(...roleSkill.relatedSkills.map(s => s.toLowerCase()));
    });
    
    // Remove duplicates and normalize
    const uniqueRelatedSkills = [...new Set(allRelatedSkills)];
    
    // Find matched skills by checking if user skills match any related skills
    const matchedSkills = userSkills.filter(userSkill => {
      const userSkillLower = userSkill.toLowerCase();
      return uniqueRelatedSkills.some(relatedSkill => {
        // Check for exact match or partial match
        return relatedSkill.includes(userSkillLower) || 
               userSkillLower.includes(relatedSkill) ||
               this.isSkillMatch(userSkillLower, relatedSkill);
      });
    });

    // Find missing skills - these are role skills that don't have matches
    const missingSkills = roleSkills
      .filter(roleSkill => {
        const roleSkillLower = roleSkill.name.toLowerCase();
        const hasMatch = userSkills.some(userSkill => {
          const userSkillLower = userSkill.toLowerCase();
          return roleSkillLower.includes(userSkillLower) || 
                 userSkillLower.includes(roleSkillLower) ||
                 roleSkill.relatedSkills.some(relatedSkill => 
                   relatedSkill.toLowerCase().includes(userSkillLower) ||
                   userSkillLower.includes(relatedSkill.toLowerCase())
                 ) ||
                 this.isSkillMatch(userSkillLower, roleSkillLower);
        });
        return !hasMatch;
      })
      .map(skill => skill.name);

    // Categorize missing skills by importance
    const criticalMissing = missingSkills.filter(skillName => {
      const skill = roleSkills.find(s => s.name === skillName);
      return skill?.importance === 'critical';
    });

    const importantMissing = missingSkills.filter(skillName => {
      const skill = roleSkills.find(s => s.name === skillName);
      return skill?.importance === 'important';
    });

    // Calculate match score (weighted by importance)
    const totalSkills = roleSkills.length;
    const criticalSkills = roleSkills.filter(s => s.importance === 'critical');
    const importantSkills = roleSkills.filter(s => s.importance === 'important');
    
    // Count how many critical and important skills are matched
    let criticalMatched = 0;
    let importantMatched = 0;
    
    criticalSkills.forEach(criticalSkill => {
      const hasMatch = userSkills.some(userSkill => {
        const userSkillLower = userSkill.toLowerCase();
        return criticalSkill.name.toLowerCase().includes(userSkillLower) ||
               userSkillLower.includes(criticalSkill.name.toLowerCase()) ||
               criticalSkill.relatedSkills.some(relatedSkill => 
                 relatedSkill.toLowerCase().includes(userSkillLower) ||
                 userSkillLower.includes(relatedSkill.toLowerCase())
               ) ||
               this.isSkillMatch(userSkillLower, criticalSkill.name.toLowerCase());
      });
      if (hasMatch) criticalMatched++;
    });
    
    importantSkills.forEach(importantSkill => {
      const hasMatch = userSkills.some(userSkill => {
        const userSkillLower = userSkill.toLowerCase();
        return importantSkill.name.toLowerCase().includes(userSkillLower) ||
               userSkillLower.includes(importantSkill.name.toLowerCase()) ||
               importantSkill.relatedSkills.some(relatedSkill => 
                 relatedSkill.toLowerCase().includes(userSkillLower) ||
                 userSkillLower.includes(relatedSkill.toLowerCase())
               ) ||
               this.isSkillMatch(userSkillLower, importantSkill.name.toLowerCase());
      });
      if (hasMatch) importantMatched++;
    });

    // Weighted scoring: critical skills = 3 points, important = 2 points, nice-to-have = 1 point
    const maxScore = (criticalSkills.length * 3) + (importantSkills.length * 2) + 
                   (totalSkills - criticalSkills.length - importantSkills.length);
    const actualScore = (criticalMatched * 3) + (importantMatched * 2) + 
                       (matchedSkills.length - criticalMatched - importantMatched);

    const matchScore = maxScore > 0 ? Math.round((actualScore / maxScore) * 100) : 0;

    console.log('calculateSkillMatchScore debug:', {
      userSkills: userSkills.slice(0, 3),
      userSkillsType: typeof userSkills[0],
      targetRole,
      matchedSkills: matchedSkills.slice(0, 3),
      matchedSkillsType: typeof matchedSkills[0],
      missingSkills: missingSkills.slice(0, 3),
      criticalMissing,
      importantMissing,
      matchScore
    });

    return {
      matchScore,
      matchedSkills,
      missingSkills,
      criticalMissing,
      importantMissing
    };
  }

  /**
   * Check if two skills are a match using fuzzy matching
   */
  private static isSkillMatch(skill1: string, skill2: string): boolean {
    // Common skill mappings
    const skillMappings: { [key: string]: string[] } = {
      'javascript': ['js', 'ecmascript', 'nodejs', 'node.js'],
      'typescript': ['ts'],
      'python': ['py'],
      'c++': ['cpp', 'c plus plus'],
      'c#': ['csharp', 'c sharp'],
      'react': ['reactjs', 'react.js'],
      'vue': ['vuejs', 'vue.js'],
      'angular': ['angularjs', 'angular.js'],
      'node.js': ['nodejs', 'node'],
      'machine learning': ['ml', 'machinelearning'],
      'deep learning': ['dl', 'deeplearning'],
      'data science': ['datascience'],
      'data analysis': ['dataanalysis'],
      'artificial intelligence': ['ai'],
      'natural language processing': ['nlp'],
      'computer vision': ['cv'],
      'sql': ['structured query language'],
      'nosql': ['no sql', 'non relational'],
      'aws': ['amazon web services'],
      'azure': ['microsoft azure'],
      'gcp': ['google cloud platform', 'google cloud'],
      'kubernetes': ['k8s', 'kube'],
      'docker': ['containerization'],
      'git': ['version control', 'git version control'],
      'github': ['git hub'],
      'gitlab': ['git lab'],
      'postgresql': ['postgres'],
      'mongodb': ['mongo'],
      'elasticsearch': ['elastic search'],
      'apache spark': ['spark'],
      'apache kafka': ['kafka'],
      'apache airflow': ['airflow'],
      'tensorflow': ['tensor flow'],
      'pytorch': ['py torch'],
      'scikit-learn': ['scikit learn', 'sklearn'],
      'matplotlib': ['mat plot lib'],
      'seaborn': ['sea born'],
      'jupyter': ['jupyter notebook'],
      'pandas': ['panda'],
      'numpy': ['num py'],
      'react native': ['reactnative'],
      'flutter': ['dart flutter'],
      'android studio': ['android'],
      'xcode': ['ios development'],
      'swift': ['swift programming'],
      'kotlin': ['kotlin programming'],
      'html': ['html5'],
      'css': ['css3'],
      'bootstrap': ['twitter bootstrap'],
      'tailwind': ['tailwind css'],
      'express': ['expressjs', 'express.js'],
      'django': ['django framework'],
      'flask': ['flask framework'],
      'spring': ['spring framework', 'spring boot'],
      'laravel': ['laravel framework'],
      'rails': ['ruby on rails'],
      'next.js': ['nextjs', 'next'],
      'nuxt.js': ['nuxtjs', 'nuxt'],
      'graphql': ['graph ql'],
      'rest': ['restful', 'rest api'],
      'api': ['application programming interface'],
      'ci/cd': ['continuous integration', 'continuous deployment'],
      'devops': ['dev ops'],
      'agile': ['agile methodology', 'scrum'],
      'scrum': ['scrum methodology'],
      'tdd': ['test driven development'],
      'bdd': ['behavior driven development'],
      'unit testing': ['unit test'],
      'integration testing': ['integration test'],
      'end-to-end testing': ['e2e testing', 'e2e test'],
      'selenium': ['selenium webdriver'],
      'cypress': ['cypress testing'],
      'jest': ['jest testing'],
      'mocha': ['mocha testing'],
      'chai': ['chai testing'],
      'pytest': ['py test'],
      'junit': ['j unit'],
      'testng': ['test ng'],
      'cucumber': ['cucumber testing'],
      'appium': ['appium testing'],
      'detox': ['detox testing'],
      'postman': ['postman api'],
      'insomnia': ['insomnia api'],
      'swagger': ['swagger api'],
      'figma': ['figma design'],
      'sketch': ['sketch design'],
      'adobe xd': ['xd'],
      'photoshop': ['ps'],
      'illustrator': ['ai'],
      'indesign': ['id'],
      'premiere': ['premiere pro'],
      'after effects': ['ae'],
      'blender': ['blender 3d'],
      'maya': ['autodesk maya'],
      '3ds max': ['3d studio max'],
      'unity': ['unity 3d'],
      'unreal engine': ['ue4', 'ue5'],
      'terraform': ['terraform iac'],
      'ansible': ['ansible automation'],
      'jenkins': ['jenkins ci'],
      'gitlab ci': ['gitlab continuous integration'],
      'github actions': ['github ci'],
      'azure devops': ['azure pipelines'],
      'circleci': ['circle ci'],
      'travis ci': ['travis continuous integration'],
      'heroku': ['heroku platform'],
      'vercel': ['vercel platform'],
      'netlify': ['netlify platform'],
      'digitalocean': ['digital ocean'],
      'linode': ['linode cloud'],
      'redis': ['redis cache'],
      'memcached': ['memcache'],
      'rabbitmq': ['rabbit mq'],
      'apache': ['apache server'],
      'nginx': ['nginx server'],
      'iis': ['internet information services'],
      'tomcat': ['apache tomcat'],
      'jetty': ['eclipse jetty'],
      'wildfly': ['jboss wildfly'],
      'weblogic': ['oracle weblogic'],
      'websphere': ['ibm websphere'],
      'glassfish': ['oracle glassfish'],
      'payara': ['payara server'],
      'liberty': ['websphere liberty'],
      'spring boot': ['springboot'],
      'spring mvc': ['spring model view controller'],
      'spring security': ['spring sec'],
      'spring data': ['spring data jpa'],
      'hibernate': ['hibernate orm'],
      'jpa': ['java persistence api'],
      'jdbc': ['java database connectivity'],
      'mybatis': ['my batis'],
      'jooq': ['jooq orm'],
      'querydsl': ['query dsl'],
      'cassandra': ['apache cassandra'],
      'dynamodb': ['dynamo db'],
      'couchdb': ['couch db'],
      'riak': ['riak database'],
      'neo4j': ['neo 4j'],
      'orientdb': ['orient db'],
      'arangodb': ['arango db'],
      'influxdb': ['influx db'],
      'timescaledb': ['timescale db'],
      'clickhouse': ['click house'],
      'bigquery': ['big query'],
      'redshift': ['amazon redshift'],
      'snowflake': ['snowflake data warehouse'],
      'databricks': ['data bricks'],
      'hive': ['apache hive'],
      'pig': ['apache pig'],
      'hbase': ['apache hbase'],
      'accumulo': ['apache accumulo'],
      'phoenix': ['apache phoenix'],
      'drill': ['apache drill'],
      'impala': ['apache impala'],
      'presto': ['presto sql'],
      'trino': ['trino sql'],
      'druid': ['apache druid'],
      'pinot': ['apache pinot'],
      'kylin': ['apache kylin'],
      'superset': ['apache superset'],
      'airflow': ['apache airflow'],
      'luigi': ['luigi workflow'],
      'prefect': ['prefect workflow'],
      'dagster': ['dagster workflow'],
      'kubeflow': ['kube flow'],
      'mlflow': ['ml flow'],
      'sagemaker': ['sage maker'],
      'azure ml': ['azure machine learning'],
      'vertex ai': ['vertex ai platform'],
      'hugging face': ['huggingface'],
      'transformers': ['hugging face transformers'],
      'bert': ['bidirectional encoder representations from transformers'],
      'gpt': ['generative pre trained transformer'],
      't5': ['text to text transfer transformer'],
      'roberta': ['robustly optimized bert approach'],
      'distilbert': ['distilled bert'],
      'albert': ['a lite bert'],
      'electra': ['efficiently learning an encoder that classifies token replacements accurately'],
      'deberta': ['decoding enhanced bert with disentangled attention'],
      'xlnet': ['generalized autoregressive pretraining for language understanding'],
      'transformer': ['transformer architecture'],
      'attention': ['attention mechanism'],
      'self attention': ['self attention mechanism'],
      'multi head attention': ['multi head attention mechanism'],
      'positional encoding': ['positional encoding mechanism'],
      'embedding': ['word embedding', 'sentence embedding'],
      'word2vec': ['word to vec'],
      'glove': ['global vectors for word representation'],
      'fasttext': ['fast text'],
      'elmo': ['embeddings from language models'],
      'ulmfit': ['universal language model fine tuning'],
      'openai': ['open ai'],
      'anthropic': ['anthropic ai'],
      'cohere': ['cohere ai'],
      'replicate': ['replicate ai'],
      'together': ['together ai'],
      'mistral': ['mistral ai'],
      'claude': ['claude ai'],
      'chatgpt': ['chat gpt'],
      'gpt-3': ['gpt 3'],
      'gpt-4': ['gpt 4'],
      'gpt-3.5': ['gpt 3.5'],
      'dall-e': ['dall e'],
      'midjourney': ['midjourney ai'],
      'stable diffusion': ['stable diffusion ai'],
      'comfyui': ['comfy ui'],
      'automatic1111': ['automatic 1111'],
      'invoke': ['invoke ai'],
      'novelai': ['novel ai'],
      'leonardo': ['leonardo ai'],
      'runway': ['runway ml'],
      'pika': ['pika labs'],
      'sora': ['openai sora'],
      'gen-2': ['runway gen 2'],
      'imagen': ['google imagen'],
      'parti': ['google parti'],
      'minimax': ['minimax ai'],
      'baidu': ['baidu ai'],
      'alibaba': ['alibaba ai'],
      'tencent': ['tencent ai'],
      'bytedance': ['bytedance ai'],
      'samsung': ['samsung ai'],
      'lg': ['lg ai'],
      'sk telecom': ['sk telecom ai'],
      'naver': ['naver ai'],
      'kakao': ['kakao ai'],
      'line': ['line ai'],
      'rakuten': ['rakuten ai'],
      'softbank': ['softbank ai'],
      'ntt': ['ntt ai'],
      'docomo': ['docomo ai'],
      'kddi': ['kddi ai'],
      'vodafone': ['vodafone ai'],
      'orange': ['orange ai'],
      'telefonica': ['telefonica ai'],
      'deutsche telekom': ['deutsche telekom ai'],
      'bt': ['bt ai'],
      'ee': ['ee ai'],
      'three': ['three ai'],
      'virgin': ['virgin ai'],
      'sky': ['sky ai'],
      'comcast': ['comcast ai'],
      'verizon': ['verizon ai'],
      'att': ['att ai'],
      't mobile': ['t mobile ai'],
      'sprint': ['sprint ai'],
      'tmobile': ['tmobile ai'],
      'metropcs': ['metropcs ai'],
      'cricket': ['cricket ai'],
      'boost': ['boost ai'],
      'virgin mobile': ['virgin mobile ai'],
      'straight talk': ['straight talk ai'],
      'total wireless': ['total wireless ai'],
      'simple mobile': ['simple mobile ai'],
      'net10': ['net10 ai'],
      'tracfone': ['tracfone ai'],
      'page plus': ['page plus ai'],
      'red pocket': ['red pocket ai'],
      'mint mobile': ['mint mobile ai'],
      'visible': ['visible ai'],
      'google fi': ['google fi ai'],
      'project fi': ['project fi ai'],
      'republic wireless': ['republic wireless ai'],
      'ting': ['ting ai'],
      'consumer cellular': ['consumer cellular ai'],
      'great call': ['great call ai'],
      'jitterbug': ['jitterbug ai'],
      'lively': ['lively ai'],
      'assurance wireless': ['assurance wireless ai'],
      'lifeline': ['lifeline ai'],
      'safelink': ['safelink ai'],
      'q link': ['q link ai'],
      'airtalk': ['airtalk ai'],
      'enroll': ['enroll ai'],
      'standup': ['standup ai'],
      'terracom': ['terracom ai'],
      'tag mobile': ['tag mobile ai'],
      'true wireless': ['true wireless ai'],
      'united wireless': ['united wireless ai'],
      'access wireless': ['access wireless ai'],
      'cintex wireless': ['cintex wireless ai'],
      'easy wireless': ['easy wireless ai'],
      'feelsafe wireless': ['feelsafe wireless ai'],
      'freeup': ['freeup ai'],
      'hotwire': ['hotwire ai'],
      'infiniti mobile': ['infiniti mobile ai'],
      'kroger wireless': ['kroger wireless ai'],
      'liberty wireless': ['liberty wireless ai'],
      'life wireless': ['life wireless ai'],
      'lycamobile': ['lycamobile ai'],
      'metro': ['metro ai'],
      'metro pcs': ['metro pcs ai'],
      'metropcs': ['metropcs ai'],
      'mint': ['mint ai'],
      'mint mobile': ['mint mobile ai'],
      'net10': ['net10 ai'],
      'page plus': ['page plus ai'],
      'pure talk': ['pure talk ai'],
      'q link': ['q link ai'],
      'red pocket': ['red pocket ai'],
      'republic': ['republic ai'],
      'republic wireless': ['republic wireless ai'],
      'ringplus': ['ringplus ai'],
      'roku': ['roku ai'],
      'roku mobile': ['roku mobile ai'],
      'safelink': ['safelink ai'],
      'simple mobile': ['simple mobile ai'],
      'speedtalk': ['speedtalk ai'],
      'standup': ['standup ai'],
      'straight talk': ['straight talk ai'],
      'tag mobile': ['tag mobile ai'],
      'terracom': ['terracom ai'],
      'ting': ['ting ai'],
      'tracfone': ['tracfone ai'],
      'true wireless': ['true wireless ai'],
      'ultra mobile': ['ultra mobile ai'],
      'united wireless': ['united wireless ai'],
      'unreal': ['unreal mobile ai'],
      'unreal mobile': ['unreal mobile ai'],
      'us mobile': ['us mobile ai'],
      'verizon': ['verizon ai'],
      'visible': ['visible ai'],
      'walmart family': ['walmart family ai'],
      'walmart family mobile': ['walmart family mobile ai'],
      'walmart wireless': ['walmart wireless ai'],
      'walmart mobile': ['walmart mobile ai'],
      'walmart prepaid': ['walmart prepaid ai'],
      'walmart prepaid wireless': ['walmart prepaid wireless ai'],
      'walmart prepaid mobile': ['walmart prepaid mobile ai'],
      'walmart prepaid phone': ['walmart prepaid phone ai'],
      'walmart prepaid cell': ['walmart prepaid cell ai'],
      'walmart prepaid cellular': ['walmart prepaid cellular ai'],
      'walmart prepaid service': ['walmart prepaid service ai'],
      'walmart prepaid plan': ['walmart prepaid plan ai'],
      'walmart prepaid account': ['walmart prepaid account ai'],
      'walmart prepaid balance': ['walmart prepaid balance ai'],
      'walmart prepaid refill': ['walmart prepaid refill ai'],
      'walmart prepaid top up': ['walmart prepaid top up ai'],
      'walmart prepaid add money': ['walmart prepaid add money ai'],
      'walmart prepaid add funds': ['walmart prepaid add funds ai'],
      'walmart prepaid add credit': ['walmart prepaid add credit ai'],
      'walmart prepaid add minutes': ['walmart prepaid add minutes ai'],
      'walmart prepaid add data': ['walmart prepaid add data ai'],
      'walmart prepaid add text': ['walmart prepaid add text ai'],
      'walmart prepaid add sms': ['walmart prepaid add sms ai'],
      'walmart prepaid add mms': ['walmart prepaid add mms ai'],
      'walmart prepaid add picture': ['walmart prepaid add picture ai'],
      'walmart prepaid add video': ['walmart prepaid add video ai'],
      'walmart prepaid add voice': ['walmart prepaid add voice ai'],
      'walmart prepaid add call': ['walmart prepaid add call ai'],
      'walmart prepaid add talk': ['walmart prepaid add talk ai'],
      'walmart prepaid add messaging': ['walmart prepaid add messaging ai'],
      'walmart prepaid add internet': ['walmart prepaid add internet ai'],
      'walmart prepaid add web': ['walmart prepaid add web ai'],
      'walmart prepaid add browsing': ['walmart prepaid add browsing ai'],
      'walmart prepaid add email': ['walmart prepaid add email ai'],
      'walmart prepaid add social': ['walmart prepaid add social ai'],
      'walmart prepaid add facebook': ['walmart prepaid add facebook ai'],
      'walmart prepaid add twitter': ['walmart prepaid add twitter ai'],
      'walmart prepaid add instagram': ['walmart prepaid add instagram ai'],
      'walmart prepaid add snapchat': ['walmart prepaid add snapchat ai'],
      'walmart prepaid add tiktok': ['walmart prepaid add tiktok ai'],
      'walmart prepaid add youtube': ['walmart prepaid add youtube ai'],
      'walmart prepaid add netflix': ['walmart prepaid add netflix ai'],
      'walmart prepaid add hulu': ['walmart prepaid add hulu ai'],
      'walmart prepaid add amazon': ['walmart prepaid add amazon ai'],
      'walmart prepaid add prime': ['walmart prepaid add prime ai'],
      'walmart prepaid add video': ['walmart prepaid add video ai'],
      'walmart prepaid add streaming': ['walmart prepaid add streaming ai'],
      'walmart prepaid add music': ['walmart prepaid add music ai'],
      'walmart prepaid add spotify': ['walmart prepaid add spotify ai'],
      'walmart prepaid add apple': ['walmart prepaid add apple ai'],
      'walmart prepaid add itunes': ['walmart prepaid add itunes ai'],
      'walmart prepaid add google': ['walmart prepaid add google ai'],
      'walmart prepaid add play': ['walmart prepaid add play ai'],
      'walmart prepaid add store': ['walmart prepaid add store ai'],
      'walmart prepaid add app': ['walmart prepaid add app ai'],
      'walmart prepaid add games': ['walmart prepaid add games ai'],
      'walmart prepaid add gaming': ['walmart prepaid add gaming ai'],
      'walmart prepaid add pokemon': ['walmart prepaid add pokemon ai'],
      'walmart prepaid add go': ['walmart prepaid add go ai'],
      'walmart prepaid add pokemon go': ['walmart prepaid add pokemon go ai'],
      'walmart prepaid add fortnite': ['walmart prepaid add fortnite ai'],
      'walmart prepaid add minecraft': ['walmart prepaid add minecraft ai'],
      'walmart prepaid add roblox': ['walmart prepaid add roblox ai'],
      'walmart prepaid add among': ['walmart prepaid add among ai'],
      'walmart prepaid add us': ['walmart prepaid add us ai'],
      'walmart prepaid add among us': ['walmart prepaid add among us ai'],
      'walmart prepaid add call': ['walmart prepaid add call ai'],
      'walmart prepaid add of': ['walmart prepaid add of ai'],
      'walmart prepaid add duty': ['walmart prepaid add duty ai'],
      'walmart prepaid add call of duty': ['walmart prepaid add call of duty ai'],
      'walmart prepaid add cod': ['walmart prepaid add cod ai'],
      'walmart prepaid add battlefield': ['walmart prepaid add battlefield ai'],
      'walmart prepaid add apex': ['walmart prepaid add apex ai'],
      'walmart prepaid add legends': ['walmart prepaid add legends ai'],
      'walmart prepaid add apex legends': ['walmart prepaid add apex legends ai'],
      'walmart prepaid add valorant': ['walmart prepaid add valorant ai'],
      'walmart prepaid add csgo': ['walmart prepaid add csgo ai'],
      'walmart prepaid add counter': ['walmart prepaid add counter ai'],
      'walmart prepaid add strike': ['walmart prepaid add strike ai'],
      'walmart prepaid add global': ['walmart prepaid add global ai'],
      'walmart prepaid add offensive': ['walmart prepaid add offensive ai'],
      'walmart prepaid add counter strike global offensive': ['walmart prepaid add counter strike global offensive ai'],
      'walmart prepaid add cs': ['walmart prepaid add cs ai'],
      'walmart prepaid add go': ['walmart prepaid add go ai'],
      'walmart prepaid add cs go': ['walmart prepaid add cs go ai'],
      'walmart prepaid add dota': ['walmart prepaid add dota ai'],
      'walmart prepaid add 2': ['walmart prepaid add 2 ai'],
      'walmart prepaid add dota 2': ['walmart prepaid add dota 2 ai'],
      'walmart prepaid add league': ['walmart prepaid add league ai'],
      'walmart prepaid add legends': ['walmart prepaid add legends ai'],
      'walmart prepaid add league of legends': ['walmart prepaid add league of legends ai'],
      'walmart prepaid add lol': ['walmart prepaid add lol ai'],
      'walmart prepaid add overwatch': ['walmart prepaid add overwatch ai'],
      'walmart prepaid add 2': ['walmart prepaid add 2 ai'],
      'walmart prepaid add overwatch 2': ['walmart prepaid add overwatch 2 ai'],
      'walmart prepaid add ow2': ['walmart prepaid add ow2 ai'],
      'walmart prepaid add world': ['walmart prepaid add world ai'],
      'walmart prepaid add of': ['walmart prepaid add of ai'],
      'walmart prepaid add warcraft': ['walmart prepaid add warcraft ai'],
      'walmart prepaid add world of warcraft': ['walmart prepaid add world of warcraft ai'],
      'walmart prepaid add wow': ['walmart prepaid add wow ai'],
      'walmart prepaid add hearthstone': ['walmart prepaid add hearthstone ai'],
      'walmart prepaid add heroes': ['walmart prepaid add heroes ai'],
      'walmart prepaid add of': ['walmart prepaid add of ai'],
      'walmart prepaid add storm': ['walmart prepaid add storm ai'],
      'walmart prepaid add heroes of the storm': ['walmart prepaid add heroes of the storm ai'],
      'walmart prepaid add hots': ['walmart prepaid add hots ai'],
      'walmart prepaid add starcraft': ['walmart prepaid add starcraft ai'],
      'walmart prepaid add 2': ['walmart prepaid add 2 ai'],
      'walmart prepaid add starcraft 2': ['walmart prepaid add starcraft 2 ai'],
      'walmart prepaid add sc2': ['walmart prepaid add sc2 ai'],
      'walmart prepaid add diablo': ['walmart prepaid add diablo ai'],
      'walmart prepaid add 3': ['walmart prepaid add 3 ai'],
      'walmart prepaid add diablo 3': ['walmart prepaid add diablo 3 ai'],
      'walmart prepaid add d3': ['walmart prepaid add d3 ai'],
      'walmart prepaid add 4': ['walmart prepaid add 4 ai'],
      'walmart prepaid add diablo 4': ['walmart prepaid add diablo 4 ai'],
      'walmart prepaid add d4': ['walmart prepaid add d4 ai'],
      'walmart prepaid add immortal': ['walmart prepaid add immortal ai'],
      'walmart prepaid add diablo immortal': ['walmart prepaid add diablo immortal ai'],
      'walmart prepaid add di': ['walmart prepaid add di ai'],
      'walmart prepaid add candy': ['walmart prepaid add candy ai'],
      'walmart prepaid add crush': ['walmart prepaid add crush ai'],
      'walmart prepaid add saga': ['walmart prepaid add saga ai'],
      'walmart prepaid add candy crush saga': ['walmart prepaid add candy crush saga ai'],
      'walmart prepaid add ccs': ['walmart prepaid add ccs ai'],
      'walmart prepaid add farm': ['walmart prepaid add farm ai'],
      'walmart prepaid add heroes': ['walmart prepaid add heroes ai'],
      'walmart prepaid add farm heroes saga': ['walmart prepaid add farm heroes saga ai'],
      'walmart prepaid add fhs': ['walmart prepaid add fhs ai'],
      'walmart prepaid add pet': ['walmart prepaid add pet ai'],
      'walmart prepaid add rescue': ['walmart prepaid add rescue ai'],
      'walmart prepaid add saga': ['walmart prepaid add saga ai'],
      'walmart prepaid add pet rescue saga': ['walmart prepaid add pet rescue saga ai'],
      'walmart prepaid add prs': ['walmart prepaid add prs ai'],
      'walmart prepaid add bubble': ['walmart prepaid add bubble ai'],
      'walmart prepaid add witch': ['walmart prepaid add witch ai'],
      'walmart prepaid add saga': ['walmart prepaid add saga ai'],
      'walmart prepaid add bubble witch saga': ['walmart prepaid add bubble witch saga ai'],
      'walmart prepaid add bws': ['walmart prepaid add bws ai'],
      'walmart prepaid add soda': ['walmart prepaid add soda ai'],
      'walmart prepaid add saga': ['walmart prepaid add saga ai'],
      'walmart prepaid add soda saga': ['walmart prepaid add soda saga ai'],
      'walmart prepaid add ss': ['walmart prepaid add ss ai'],
      'walmart prepaid add diamond': ['walmart prepaid add diamond ai'],
      'walmart prepaid add diablo': ['walmart prepaid add diablo ai'],
      'walmart prepaid add diamond diablo': ['walmart prepaid add diamond diablo ai'],
      'walmart prepaid add dd': ['walmart prepaid add dd ai'],
      'walmart prepaid add crush': ['walmart prepaid add crush ai'],
      'walmart prepaid add soda': ['walmart prepaid add soda ai'],
      'walmart prepaid add crush soda': ['walmart prepaid add crush soda ai'],
      'walmart prepaid add cs': ['walmart prepaid add cs ai'],
      'walmart prepaid add friends': ['walmart prepaid add friends ai'],
      'walmart prepaid add play': ['walmart prepaid add play ai'],
      'walmart prepaid add friends play': ['walmart prepaid add friends play ai'],
      'walmart prepaid add fp': ['walmart prepaid add fp ai'],
      'walmart prepaid add jellly': ['walmart prepaid add jellly ai'],
      'walmart prepaid add saga': ['walmart prepaid add jellly ai'],
      'walmart prepaid add jellly saga': ['walmart prepaid add jellly saga ai'],
      'walmart prepaid add js': ['walmart prepaid add js ai'],
      'walmart prepaid add blaster': ['walmart prepaid add blaster ai'],
      'walmart prepaid add saga': ['walmart prepaid add blaster ai'],
      'walmart prepaid add blaster saga': ['walmart prepaid add blaster saga ai'],
      'walmart prepaid add bs': ['walmart prepaid add bs ai'],
      'walmart prepaid add dreamworld': ['walmart prepaid add dreamworld ai'],
      'walmart prepaid add saga': ['walmart prepaid add dreamworld ai'],
      'walmart prepaid add dreamworld saga': ['walmart prepaid add dreamworld saga ai'],
      'walmart prepaid add dws': ['walmart prepaid add dws ai'],
      'walmart prepaid add allstars': ['walmart prepaid add allstars ai'],
      'walmart prepaid add saga': ['walmart prepaid add allstars ai'],
      'walmart prepaid add allstars saga': ['walmart prepaid add allstars saga ai'],
      'walmart prepaid add as': ['walmart prepaid add as ai'],
      'walmart prepaid add champions': ['walmart prepaid add champions ai'],
      'walmart prepaid add saga': ['walmart prepaid add champions ai'],
      'walmart prepaid add champions saga': ['walmart prepaid add champions saga ai'],
      'walmart prepaid add cs': ['walmart prepaid add cs ai'],
      'walmart prepaid add royale': ['walmart prepaid add royale ai'],
      'walmart prepaid add saga': ['walmart prepaid add royale ai'],
      'walmart prepaid add royale saga': ['walmart prepaid add royale saga ai'],
      'walmart prepaid add rs': ['walmart prepaid add rs ai'],
      'walmart prepaid add match': ['walmart prepaid add match ai'],
      'walmart prepaid add 3': ['walmart prepaid add 3 ai'],
      'walmart prepaid add match 3': ['walmart prepaid add match 3 ai'],
      'walmart prepaid add m3': ['walmart prepaid add m3 ai'],
      'walmart prepaid add puzzle': ['walmart prepaid add puzzle ai'],
      'walmart prepaid add puzzle game': ['walmart prepaid add puzzle game ai'],
      'walmart prepaid add pg': ['walmart prepaid add pg ai'],
      'walmart prepaid add casual': ['walmart prepaid add casual ai'],
      'walmart prepaid add casual game': ['walmart prepaid add casual game ai'],
      'walmart prepaid add cg': ['walmart prepaid add cg ai'],
      'walmart prepaid add mobile': ['walmart prepaid add mobile ai'],
      'walmart prepaid add mobile game': ['walmart prepaid add mobile game ai'],
      'walmart prepaid add mg': ['walmart prepaid add mg ai'],
      'walmart prepaid add android': ['walmart prepaid add android ai'],
      'walmart prepaid add android game': ['walmart prepaid add android game ai'],
      'walmart prepaid add ag': ['walmart prepaid add ag ai'],
      'walmart prepaid add ios': ['walmart prepaid add ios ai'],
      'walmart prepaid add ios game': ['walmart prepaid add ios game ai'],
      'walmart prepaid add ig': ['walmart prepaid add ig ai'],
      'walmart prepaid add iphone': ['walmart prepaid add iphone ai'],
      'walmart prepaid add iphone game': ['walmart prepaid add iphone game ai'],
      'walmart prepaid add ipg': ['walmart prepaid add ipg ai'],
      'walmart prepaid add ipad': ['walmart prepaid add ipad ai'],
      'walmart prepaid add ipad game': ['walmart prepaid add ipad game ai'],
      'walmart prepaid add ipg': ['walmart prepaid add ipg ai'],
      'walmart prepaid add tablet': ['walmart prepaid add tablet ai'],
      'walmart prepaid add tablet game': ['walmart prepaid add tablet game ai'],
      'walmart prepaid add tg': ['walmart prepaid add tg ai'],
      'walmart prepaid add samsung': ['walmart prepaid add samsung ai'],
      'walmart prepaid add samsung game': ['walmart prepaid add samsung game ai'],
      'walmart prepaid add sg': ['walmart prepaid add sg ai'],
      'walmart prepaid add galaxy': ['walmart prepaid add galaxy ai'],
      'walmart prepaid add galaxy game': ['walmart prepaid add galaxy game ai'],
      'walmart prepaid add gg': ['walmart prepaid add gg ai'],
      'walmart prepaid add note': ['walmart prepaid add note ai'],
      'walmart prepaid add note game': ['walmart prepaid add note game ai'],
      'walmart prepaid add ng': ['walmart prepaid add ng ai'],
      'walmart prepaid add s': ['walmart prepaid add s ai'],
      'walmart prepaid add s game': ['walmart prepaid add s game ai'],
      'walmart prepaid add sg': ['walmart prepaid add sg ai'],
      'walmart prepaid add s21': ['walmart prepaid add s21 ai'],
      'walmart prepaid add s21 game': ['walmart prepaid add s21 game ai'],
      'walmart prepaid add s21g': ['walmart prepaid add s21g ai'],
      'walmart prepaid add s22': ['walmart prepaid add s22 ai'],
      'walmart prepaid add s22 game': ['walmart prepaid add s22 game ai'],
      'walmart prepaid add s22g': ['walmart prepaid add s22g ai'],
      'walmart prepaid add s23': ['walmart prepaid add s23 ai'],
      'walmart prepaid add s23 game': ['walmart prepaid add s23 game ai'],
      'walmart prepaid add s23g': ['walmart prepaid add s23g ai'],
      'walmart prepaid add s24': ['walmart prepaid add s24 ai'],
      'walmart prepaid add s24 game': ['walmart prepaid add s24 game ai'],
      'walmart prepaid add s24g': ['walmart prepaid add s24g ai'],
      'walmart prepaid add a': ['walmart prepaid add a ai'],
      'walmart prepaid add series': ['walmart prepaid add a series ai'],
      'walmart prepaid add a series game': ['walmart prepaid add a series game ai'],
      'walmart prepaid add asg': ['walmart prepaid add asg ai'],
      'walmart prepaid add a12': ['walmart prepaid add a12 ai'],
      'walmart prepaid add a12 game': ['walmart prepaid add a12 game ai'],
      'walmart prepaid add a12g': ['walmart prepaid add a12g ai'],
      'walmart prepaid add a13': ['walmart prepaid add a13 ai'],
      'walmart prepaid add a13 game': ['walmart prepaid add a13 game ai'],
      'walmart prepaid add a13g': ['walmart prepaid add a13g ai'],
      'walmart prepaid add a14': ['walmart prepaid add a14 ai'],
      'walmart prepaid add a14 game': ['walmart prepaid add a14 game ai'],
      'walmart prepaid add a14g': ['walmart prepaid add a14g ai'],
      'walmart prepaid add a15': ['walmart prepaid add a15 ai'],
      'walmart prepaid add a15 game': ['walmart prepaid add a15 game ai'],
      'walmart prepaid add a15g': ['walmart prepaid add a15g ai'],
      'walmart prepaid add a16': ['walmart prepaid add a16 ai'],
      'walmart prepaid add a16 game': ['walmart prepaid add a16 game ai'],
      'walmart prepaid add a16g': ['walmart prepaid add a16g ai'],
      'walmart prepaid add a17': ['walmart prepaid add a17 ai'],
      'walmart prepaid add a17 game': ['walmart prepaid add a17 game ai'],
      'walmart prepaid add a17g': ['walmart prepaid add a17g ai'],
      'walmart prepaid add a18': ['walmart prepaid add a18 ai'],
      'walmart prepaid add a18 game': ['walmart prepaid add a18 game ai'],
      'walmart prepaid add a18g': ['walmart prepaid add a18g ai'],
      'walmart prepaid add a19': ['walmart prepaid add a19 ai'],
      'walmart prepaid add a19 game': ['walmart prepaid add a19 game ai'],
      'walmart prepaid add a19g': ['walmart prepaid add a19g ai'],
      'walmart prepaid add a20': ['walmart prepaid add a20 ai'],
      'walmart prepaid add a20 game': ['walmart prepaid add a20 game ai'],
      'walmart prepaid add a20g': ['walmart prepaid add a20g ai'],
      'walmart prepaid add a21': ['walmart prepaid add a21 ai'],
      'walmart prepaid add a21 game': ['walmart prepaid add a21 game ai'],
      'walmart prepaid add a21g': ['walmart prepaid add a21g ai'],
      'walmart prepaid add a22': ['walmart prepaid add a22 ai'],
      'walmart prepaid add a22 game': ['walmart prepaid add a22 game ai'],
      'walmart prepaid add a22g': ['walmart prepaid add a22g ai'],
      'walmart prepaid add a23': ['walmart prepaid add a23 ai'],
      'walmart prepaid add a23 game': ['walmart prepaid add a23 game ai'],
      'walmart prepaid add a23g': ['walmart prepaid add a23g ai'],
      'walmart prepaid add a24': ['walmart prepaid add a24 ai'],
      'walmart prepaid add a24 game': ['walmart prepaid add a24 game ai'],
      'walmart prepaid add a24g': ['walmart prepaid add a24g ai'],
      'walmart prepaid add a25': ['walmart prepaid add a25 ai'],
      'walmart prepaid add a25 game': ['walmart prepaid add a25 game ai'],
      'walmart prepaid add a25g': ['walmart prepaid add a25g ai'],
      'walmart prepaid add a26': ['walmart prepaid add a26 ai'],
      'walmart prepaid add a26 game': ['walmart prepaid add a26 game ai'],
      'walmart prepaid add a26g': ['walmart prepaid add a26g ai'],
      'walmart prepaid add a27': ['walmart prepaid add a27 ai'],
      'walmart prepaid add a27 game': ['walmart prepaid add a27 game ai'],
      'walmart prepaid add a27g': ['walmart prepaid add a27g ai'],
      'walmart prepaid add a28': ['walmart prepaid add a28 ai'],
      'walmart prepaid add a28 game': ['walmart prepaid add a28 game ai'],
      'walmart prepaid add a28g': ['walmart prepaid add a28g ai'],
      'walmart prepaid add a29': ['walmart prepaid add a29 ai'],
      'walmart prepaid add a29 game': ['walmart prepaid add a29 game ai'],
      'walmart prepaid add a29g': ['walmart prepaid add a29g ai'],
      'walmart prepaid add a30': ['walmart prepaid add a30 ai'],
      'walmart prepaid add a30 game': ['walmart prepaid add a30 game ai'],
      'walmart prepaid add a30g': ['walmart prepaid add a30g ai'],
      'walmart prepaid add a31': ['walmart prepaid add a31 ai'],
      'walmart prepaid add a31 game': ['walmart prepaid add a31 game ai'],
      'walmart prepaid add a31g': ['walmart prepaid add a31g ai'],
      'walmart prepaid add a32': ['walmart prepaid add a32 ai'],
      'walmart prepaid add a32 game': ['walmart prepaid add a32 game ai'],
      'walmart prepaid add a32g': ['walmart prepaid add a32g ai'],
      'walmart prepaid add a33': ['walmart prepaid add a33 ai'],
      'walmart prepaid add a33 game': ['walmart prepaid add a33 game ai'],
      'walmart prepaid add a33g': ['walmart prepaid add a33g ai'],
      'walmart prepaid add a34': ['walmart prepaid add a34 ai'],
      'walmart prepaid add a34 game': ['walmart prepaid add a34 game ai'],
      'walmart prepaid add a34g': ['walmart prepaid add a34g ai'],
      'walmart prepaid add a35': ['walmart prepaid add a35 ai'],
      'walmart prepaid add a35 game': ['walmart prepaid add a35 game ai'],
      'walmart prepaid add a35g': ['walmart prepaid add a35g ai'],
      'walmart prepaid add a36': ['walmart prepaid add a36 ai'],
      'walmart prepaid add a36 game': ['walmart prepaid add a36 game ai'],
      'walmart prepaid add a36g': ['walmart prepaid add a36g ai'],
      'walmart prepaid add a37': ['walmart prepaid add a37 ai'],
      'walmart prepaid add a37 game': ['walmart prepaid add a37 game ai'],
      'walmart prepaid add a37g': ['walmart prepaid add a37g ai'],
      'walmart prepaid add a38': ['walmart prepaid add a38 ai'],
      'walmart prepaid add a38 game': ['walmart prepaid add a38 game ai'],
      'walmart prepaid add a38g': ['walmart prepaid add a38g ai'],
      'walmart prepaid add a39': ['walmart prepaid add a39 ai'],
      'walmart prepaid add a39 game': ['walmart prepaid add a39 game ai'],
      'walmart prepaid add a39g': ['walmart prepaid add a39g ai'],
      'walmart prepaid add a40': ['walmart prepaid add a40 ai'],
      'walmart prepaid add a40 game': ['walmart prepaid add a40 game ai'],
      'walmart prepaid add a40g': ['walmart prepaid add a40g ai'],
      'walmart prepaid add a41': ['walmart prepaid add a41 ai'],
      'walmart prepaid add a41 game': ['walmart prepaid add a41 game ai'],
      'walmart prepaid add a41g': ['walmart prepaid add a41g ai'],
      'walmart prepaid add a42': ['walmart prepaid add a42 ai'],
      'walmart prepaid add a42 game': ['walmart prepaid add a42 game ai'],
      'walmart prepaid add a42g': ['walmart prepaid add a42g ai'],
      'walmart prepaid add a43': ['walmart prepaid add a43 ai'],
      'walmart prepaid add a43 game': ['walmart prepaid add a43 game ai'],
      'walmart prepaid add a43g': ['walmart prepaid add a43g ai'],
      'walmart prepaid add a44': ['walmart prepaid add a44 ai'],
      'walmart prepaid add a44 game': ['walmart prepaid add a44 game ai'],
      'walmart prepaid add a44g': ['walmart prepaid add a44g ai'],
      'walmart prepaid add a45': ['walmart prepaid add a45 ai'],
      'walmart prepaid add a45 game': ['walmart prepaid add a45 game ai'],
      'walmart prepaid add a45g': ['walmart prepaid add a45g ai'],
      'walmart prepaid add a46': ['walmart prepaid add a46 ai'],
      'walmart prepaid add a46 game': ['walmart prepaid add a46 game ai'],
      'walmart prepaid add a46g': ['walmart prepaid add a46g ai'],
      'walmart prepaid add a47': ['walmart prepaid add a47 ai'],
      'walmart prepaid add a47 game': ['walmart prepaid add a47 game ai'],
      'walmart prepaid add a47g': ['walmart prepaid add a47g ai'],
      'walmart prepaid add a48': ['walmart prepaid add a48 ai'],
      'walmart prepaid add a48 game': ['walmart prepaid add a48 game ai'],
      'walmart prepaid add a48g': ['walmart prepaid add a48g ai'],
      'walmart prepaid add a49': ['walmart prepaid add a49 ai'],
      'walmart prepaid add a49 game': ['walmart prepaid add a49 game ai'],
      'walmart prepaid add a49g': ['walmart prepaid add a49g ai'],
      'walmart prepaid add a50': ['walmart prepaid add a50 ai'],
      'walmart prepaid add a50 game': ['walmart prepaid add a50 game ai'],
      'walmart prepaid add a50g': ['walmart prepaid add a50g ai'],
      'walmart prepaid add a51': ['walmart prepaid add a51 ai'],
      'walmart prepaid add a51 game': ['walmart prepaid add a51 game ai'],
      'walmart prepaid add a51g': ['walmart prepaid add a51g ai'],
      'walmart prepaid add a52': ['walmart prepaid add a52 ai'],
      'walmart prepaid add a52 game': ['walmart prepaid add a52 game ai'],
      'walmart prepaid add a52g': ['walmart prepaid add a52g ai'],
      'walmart prepaid add a53': ['walmart prepaid add a53 ai'],
      'walmart prepaid add a53 game': ['walmart prepaid add a53 game ai'],
      'walmart prepaid add a53g': ['walmart prepaid add a53g ai'],
      'walmart prepaid add a54': ['walmart prepaid add a54 ai'],
      'walmart prepaid add a54 game': ['walmart prepaid add a54 game ai'],
      'walmart prepaid add a54g': ['walmart prepaid add a54g ai'],
      'walmart prepaid add a55': ['walmart prepaid add a55 ai'],
      'walmart prepaid add a55 game': ['walmart prepaid add a55 game ai'],
      'walmart prepaid add a55g': ['walmart prepaid add a55g ai'],
      'walmart prepaid add a56': ['walmart prepaid add a56 ai'],
      'walmart prepaid add a56 game': ['walmart prepaid add a56 game ai'],
      'walmart prepaid add a56g': ['walmart prepaid add a56g ai'],
      'walmart prepaid add a57': ['walmart prepaid add a57 ai'],
      'walmart prepaid add a57 game': ['walmart prepaid add a57 game ai'],
      'walmart prepaid add a57g': ['walmart prepaid add a57g ai'],
      'walmart prepaid add a58': ['walmart prepaid add a58 ai'],
      'walmart prepaid add a58 game': ['walmart prepaid add a58 game ai'],
      'walmart prepaid add a58g': ['walmart prepaid add a58g ai'],
      'walmart prepaid add a59': ['walmart prepaid add a59 ai'],
      'walmart prepaid add a59 game': ['walmart prepaid add a59 game ai'],
      'walmart prepaid add a59g': ['walmart prepaid add a59g ai'],
      'walmart prepaid add a60': ['walmart prepaid add a60 ai'],
      'walmart prepaid add a60 game': ['walmart prepaid add a60 game ai'],
      'walmart prepaid add a60g': ['walmart prepaid add a60g ai'],
      'walmart prepaid add a61': ['walmart prepaid add a61 ai'],
      'walmart prepaid add a61 game': ['walmart prepaid add a61 game ai'],
      'walmart prepaid add a61g': ['walmart prepaid add a61g ai'],
      'walmart prepaid add a62': ['walmart prepaid add a62 ai'],
      'walmart prepaid add a62 game': ['walmart prepaid add a62 game ai'],
      'walmart prepaid add a62g': ['walmart prepaid add a62g ai'],
      'walmart prepaid add a63': ['walmart prepaid add a63 ai'],
      'walmart prepaid add a63 game': ['walmart prepaid add a63 game ai'],
      'walmart prepaid add a63g': ['walmart prepaid add a63g ai'],
      'walmart prepaid add a64': ['walmart prepaid add a64 ai'],
      'walmart prepaid add a64 game': ['walmart prepaid add a64 game ai'],
      'walmart prepaid add a64g': ['walmart prepaid add a64g ai'],
      'walmart prepaid add a65': ['walmart prepaid add a65 ai'],
      'walmart prepaid add a65 game': ['walmart prepaid add a65 game ai'],
      'walmart prepaid add a65g': ['walmart prepaid add a65g ai'],
      'walmart prepaid add a66': ['walmart prepaid add a66 ai'],
      'walmart prepaid add a66 game': ['walmart prepaid add a66 game ai'],
      'walmart prepaid add a66g': ['walmart prepaid add a66g ai'],
      'walmart prepaid add a67': ['walmart prepaid add a67 ai'],
      'walmart prepaid add a67 game': ['walmart prepaid add a67 game ai'],
      'walmart prepaid add a67g': ['walmart prepaid add a67g ai'],
      'walmart prepaid add a68': ['walmart prepaid add a68 ai'],
      'walmart prepaid add a68 game': ['walmart prepaid add a68 game ai'],
      'walmart prepaid add a68g': ['walmart prepaid add a68g ai'],
      'walmart prepaid add a69': ['walmart prepaid add a69 ai'],
      'walmart prepaid add a69 game': ['walmart prepaid add a69 game ai'],
      'walmart prepaid add a69g': ['walmart prepaid add a69g ai'],
      'walmart prepaid add a70': ['walmart prepaid add a70 ai'],
      'walmart prepaid add a70 game': ['walmart prepaid add a70 game ai'],
      'walmart prepaid add a70g': ['walmart prepaid add a70g ai'],
      'walmart prepaid add a71': ['walmart prepaid add a71 ai'],
      'walmart prepaid add a71 game': ['walmart prepaid add a71 game ai'],
      'walmart prepaid add a71g': ['walmart prepaid add a71g ai'],
      'walmart prepaid add a72': ['walmart prepaid add a72 ai'],
      'walmart prepaid add a72 game': ['walmart prepaid add a72 game ai'],
      'walmart prepaid add a72g': ['walmart prepaid add a72g ai'],
      'walmart prepaid add a73': ['walmart prepaid add a73 ai'],
      'walmart prepaid add a73 game': ['walmart prepaid add a73 game ai'],
      'walmart prepaid add a73g': ['walmart prepaid add a73g ai'],
      'walmart prepaid add a74': ['walmart prepaid add a74 ai'],
      'walmart prepaid add a74 game': ['walmart prepaid add a74 game ai'],
      'walmart prepaid add a74g': ['walmart prepaid add a74g ai'],
      'walmart prepaid add a75': ['walmart prepaid add a75 ai'],
      'walmart prepaid add a75 game': ['walmart prepaid add a75 game ai'],
      'walmart prepaid add a75g': ['walmart prepaid add a75g ai'],
      'walmart prepaid add a76': ['walmart prepaid add a76 ai'],
      'walmart prepaid add a76 game': ['walmart prepaid add a76 game ai'],
      'walmart prepaid add a76g': ['walmart prepaid add a76g ai'],
      'walmart prepaid add a77': ['walmart prepaid add a77 ai'],
      'walmart prepaid add a77 game': ['walmart prepaid add a77 game ai'],
      'walmart prepaid add a77g': ['walmart prepaid add a77g ai'],
      'walmart prepaid add a78': ['walmart prepaid add a78 ai'],
      'walmart prepaid add a78 game': ['walmart prepaid add a78 game ai'],
      'walmart prepaid add a78g': ['walmart prepaid add a78g ai'],
      'walmart prepaid add a79': ['walmart prepaid add a79 ai'],
      'walmart prepaid add a79 game': ['walmart prepaid add a79 game ai'],
      'walmart prepaid add a79g': ['walmart prepaid add a79g ai'],
      'walmart prepaid add a80': ['walmart prepaid add a80 ai'],
      'walmart prepaid add a80 game': ['walmart prepaid add a80 game ai'],
      'walmart prepaid add a80g': ['walmart prepaid add a80g ai'],
      'walmart prepaid add a81': ['walmart prepaid add a81 ai'],
      'walmart prepaid add a81 game': ['walmart prepaid add a81 game ai'],
      'walmart prepaid add a81g': ['walmart prepaid add a81g ai'],
      'walmart prepaid add a82': ['walmart prepaid add a82 ai'],
      'walmart prepaid add a82 game': ['walmart prepaid add a82 game ai'],
      'walmart prepaid add a82g': ['walmart prepaid add a82g ai'],
      'walmart prepaid add a83': ['walmart prepaid add a83 ai'],
      'walmart prepaid add a83 game': ['walmart prepaid add a83 game ai'],
      'walmart prepaid add a83g': ['walmart prepaid add a83g ai'],
      'walmart prepaid add a84': ['walmart prepaid add a84 ai'],
      'walmart prepaid add a84 game': ['walmart prepaid add a84 game ai'],
      'walmart prepaid add a84g': ['walmart prepaid add a84g ai'],
      'walmart prepaid add a85': ['walmart prepaid add a85 ai'],
      'walmart prepaid add a85 game': ['walmart prepaid add a85 game ai'],
      'walmart prepaid add a85g': ['walmart prepaid add a85g ai'],
      'walmart prepaid add a86': ['walmart prepaid add a86 ai'],
      'walmart prepaid add a86 game': ['walmart prepaid add a86 game ai'],
      'walmart prepaid add a86g': ['walmart prepaid add a86g ai'],
      'walmart prepaid add a87': ['walmart prepaid add a87 ai'],
      'walmart prepaid add a87 game': ['walmart prepaid add a87 game ai'],
      'walmart prepaid add a87g': ['walmart prepaid add a87g ai'],
      'walmart prepaid add a88': ['walmart prepaid add a88 ai'],
      'walmart prepaid add a88 game': ['walmart prepaid add a88 game ai'],
      'walmart prepaid add a88g': ['walmart prepaid add a88g ai'],
      'walmart prepaid add a89': ['walmart prepaid add a89 ai'],
      'walmart prepaid add a89 game': ['walmart prepaid add a89 game ai'],
      'walmart prepaid add a89g': ['walmart prepaid add a89g ai'],
      'walmart prepaid add a90': ['walmart prepaid add a90 ai'],
      'walmart prepaid add a90 game': ['walmart prepaid add a90 game ai'],
      'walmart prepaid add a90g': ['walmart prepaid add a90g ai'],
      'walmart prepaid add a91': ['walmart prepaid add a91 ai'],
      'walmart prepaid add a91 game': ['walmart prepaid add a91 game ai'],
      'walmart prepaid add a91g': ['walmart prepaid add a91g ai'],
      'walmart prepaid add a92': ['walmart prepaid add a92 ai'],
      'walmart prepaid add a92 game': ['walmart prepaid add a92 game ai'],
      'walmart prepaid add a92g': ['walmart prepaid add a92g ai'],
      'walmart prepaid add a93': ['walmart prepaid add a93 ai'],
      'walmart prepaid add a93 game': ['walmart prepaid add a93 game ai'],
      'walmart prepaid add a93g': ['walmart prepaid add a93g ai'],
      'walmart prepaid add a94': ['walmart prepaid add a94 ai'],
      'walmart prepaid add a94 game': ['walmart prepaid add a94 game ai'],
      'walmart prepaid add a94g': ['walmart prepaid add a94g ai'],
      'walmart prepaid add a95': ['walmart prepaid add a95 ai'],
      'walmart prepaid add a95 game': ['walmart prepaid add a95 game ai'],
      'walmart prepaid add a95g': ['walmart prepaid add a95g ai'],
      'walmart prepaid add a96': ['walmart prepaid add a96 ai'],
      'walmart prepaid add a96 game': ['walmart prepaid add a96 game ai'],
      'walmart prepaid add a96g': ['walmart prepaid add a96g ai'],
      'walmart prepaid add a97': ['walmart prepaid add a97 ai'],
      'walmart prepaid add a97 game': ['walmart prepaid add a97 game ai'],
      'walmart prepaid add a97g': ['walmart prepaid add a97g ai'],
      'walmart prepaid add a98': ['walmart prepaid add a98 ai'],
      'walmart prepaid add a98 game': ['walmart prepaid add a98 game ai'],
      'walmart prepaid add a98g': ['walmart prepaid add a98g ai'],
      'walmart prepaid add a99': ['walmart prepaid add a99 ai'],
      'walmart prepaid add a99 game': ['walmart prepaid add a99 game ai'],
      'walmart prepaid add a99g': ['walmart prepaid add a99g ai'],
      'walmart prepaid add a100': ['walmart prepaid add a100 ai'],
      'walmart prepaid add a100 game': ['walmart prepaid add a100 game ai'],
      'walmart prepaid add a100g': ['walmart prepaid add a100g ai']
    };

    // Check if skill1 matches any of the mappings for skill2
    if (skillMappings[skill2]) {
      return skillMappings[skill2].includes(skill1);
    }

    // Check if skill2 matches any of the mappings for skill1
    if (skillMappings[skill1]) {
      return skillMappings[skill1].includes(skill2);
    }

    // Basic fuzzy matching
    const similarity = this.calculateSimilarity(skill1, skill2);
    return similarity > 0.8;
  }

  /**
   * Calculate similarity between two strings using Levenshtein distance
   */
  private static calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  static getSkillRecommendations(targetRole: string, missingSkills: string[]): Array<{
    skill: string;
    priority: 'high' | 'medium' | 'low';
    reason: string;
    recommendedAction: string;
  }> {
    const recommendations: Array<{
      skill: string;
      priority: 'high' | 'medium' | 'low';
      reason: string;
      recommendedAction: string;
    }> = [];

    missingSkills.forEach(skillName => {
      const roleSkills = this.getAllSkillsForRole(targetRole);
      const skill = roleSkills.find(s => s.name === skillName);
      
      let priority: 'high' | 'medium' | 'low' = 'medium';
      let reason = `This skill is important for a ${targetRole} role.`;
      let recommendedAction = `Look for courses on ${skillName} on platforms like Udemy or Coursera.`;

      if (skill) {
        if (skill.importance === 'critical') {
          priority = 'high';
          reason = `This is a critical skill for a ${targetRole} role.`;
        } else if (skill.importance === 'important') {
          priority = 'medium';
        } else {
          priority = 'low';
        }

        // Add specific recommendations based on skill type
        if (skill.category === 'technical') {
          recommendedAction = `Practice ${skillName} through hands-on projects and coding exercises.`;
        } else if (skill.category === 'framework') {
          recommendedAction = `Build a project using ${skillName} to gain practical experience.`;
        } else if (skill.category === 'tool') {
          recommendedAction = `Set up ${skillName} in a development environment and explore its features.`;
        } else if (skill.category === 'soft') {
          recommendedAction = `Develop ${skillName} through practice, courses, and real-world experience.`;
        }
      }

      recommendations.push({
        skill: skillName,
        priority,
        reason,
        recommendedAction
      });
    });

    return recommendations;
  }
}