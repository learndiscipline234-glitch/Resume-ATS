/**
 * Data Scientist Skill Database
 * Comprehensive list of skills for data science roles
 */

import { RoleSkillSet, SkillData } from '../../ai/types';

const dataScientistSkills: SkillData[] = [
  // Programming Languages
  { name: 'Python', category: 'languages', demandLevel: 'high', importance: 'critical', relatedSkills: ['Pandas', 'NumPy', 'Scikit-learn'], aliases: ['Python3'] },
  { name: 'R', category: 'languages', demandLevel: 'high', importance: 'important', relatedSkills: ['ggplot2', 'dplyr', 'Statistics'], aliases: ['R Programming'] },
  { name: 'SQL', category: 'languages', demandLevel: 'high', importance: 'critical', relatedSkills: ['PostgreSQL', 'MySQL', 'Data Warehousing'], aliases: ['Structured Query Language'] },
  { name: 'Scala', category: 'languages', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Spark', 'Big Data'], aliases: [] },
  { name: 'Julia', category: 'languages', demandLevel: 'low', importance: 'nice-to-have', relatedSkills: ['Scientific Computing'], aliases: [] },

  // Data Science Libraries & Frameworks
  { name: 'Pandas', category: 'frameworks', demandLevel: 'high', importance: 'critical', relatedSkills: ['Python', 'NumPy', 'Data Analysis'], aliases: [] },
  { name: 'NumPy', category: 'frameworks', demandLevel: 'high', importance: 'critical', relatedSkills: ['Python', 'Pandas', 'Scientific Computing'], aliases: [] },
  { name: 'Scikit-learn', category: 'frameworks', demandLevel: 'high', importance: 'critical', relatedSkills: ['Machine Learning', 'Python'], aliases: ['sklearn'] },
  { name: 'TensorFlow', category: 'frameworks', demandLevel: 'high', importance: 'important', relatedSkills: ['Deep Learning', 'Keras', 'Neural Networks'], aliases: ['TF'] },
  { name: 'PyTorch', category: 'frameworks', demandLevel: 'high', importance: 'important', relatedSkills: ['Deep Learning', 'Neural Networks'], aliases: [] },
  { name: 'Keras', category: 'frameworks', demandLevel: 'medium', importance: 'important', relatedSkills: ['TensorFlow', 'Deep Learning'], aliases: [] },
  { name: 'XGBoost', category: 'frameworks', demandLevel: 'high', importance: 'important', relatedSkills: ['Machine Learning', 'Gradient Boosting'], aliases: [] },
  { name: 'LightGBM', category: 'frameworks', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Machine Learning', 'Gradient Boosting'], aliases: [] },
  { name: 'CatBoost', category: 'frameworks', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Machine Learning', 'Gradient Boosting'], aliases: [] },

  // Machine Learning & AI
  { name: 'Machine Learning', category: 'technical', demandLevel: 'high', importance: 'critical', relatedSkills: ['Scikit-learn', 'Statistics', 'Python'], aliases: ['ML'] },
  { name: 'Deep Learning', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['Neural Networks', 'TensorFlow', 'PyTorch'], aliases: ['DL'] },
  { name: 'Natural Language Processing', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['NLTK', 'spaCy', 'Transformers'], aliases: ['NLP'] },
  { name: 'Computer Vision', category: 'technical', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['OpenCV', 'CNN', 'Image Processing'], aliases: ['CV'] },
  { name: 'Time Series Analysis', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['ARIMA', 'Prophet', 'Forecasting'], aliases: [] },
  { name: 'Reinforcement Learning', category: 'technical', demandLevel: 'low', importance: 'nice-to-have', relatedSkills: ['Deep Learning', 'Q-Learning'], aliases: ['RL'] },

  // Statistics & Mathematics
  { name: 'Statistics', category: 'technical', demandLevel: 'high', importance: 'critical', relatedSkills: ['Probability', 'Hypothesis Testing', 'R'], aliases: ['Statistical Analysis'] },
  { name: 'Probability', category: 'technical', demandLevel: 'high', importance: 'critical', relatedSkills: ['Statistics', 'Bayesian Methods'], aliases: ['Probability Theory'] },
  { name: 'Linear Algebra', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['Mathematics', 'Machine Learning'], aliases: [] },
  { name: 'Calculus', category: 'technical', demandLevel: 'medium', importance: 'important', relatedSkills: ['Mathematics', 'Optimization'], aliases: [] },
  { name: 'Bayesian Statistics', category: 'technical', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Statistics', 'Probability'], aliases: ['Bayesian Methods'] },
  { name: 'A/B Testing', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['Statistics', 'Hypothesis Testing'], aliases: ['Split Testing'] },

  // Data Visualization
  { name: 'Matplotlib', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['Python', 'Data Visualization'], aliases: [] },
  { name: 'Seaborn', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['Matplotlib', 'Python', 'Visualization'], aliases: [] },
  { name: 'Plotly', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Python', 'Interactive Visualization'], aliases: [] },
  { name: 'Tableau', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['Data Visualization', 'BI'], aliases: [] },
  { name: 'Power BI', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['Data Visualization', 'Microsoft'], aliases: ['PowerBI'] },
  { name: 'ggplot2', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['R', 'Data Visualization'], aliases: [] },
  { name: 'D3.js', category: 'tools', demandLevel: 'low', importance: 'nice-to-have', relatedSkills: ['JavaScript', 'Web Visualization'], aliases: ['D3'] },

  // Big Data & Distributed Computing
  { name: 'Spark', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['Big Data', 'PySpark', 'Scala'], aliases: ['Apache Spark'] },
  { name: 'PySpark', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['Spark', 'Python', 'Big Data'], aliases: [] },
  { name: 'Hadoop', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Big Data', 'MapReduce', 'HDFS'], aliases: ['Apache Hadoop'] },
  { name: 'Hive', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Hadoop', 'SQL', 'Big Data'], aliases: ['Apache Hive'] },
  { name: 'Kafka', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Streaming', 'Big Data'], aliases: ['Apache Kafka'] },

  // Databases
  { name: 'PostgreSQL', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['SQL', 'Database'], aliases: ['Postgres'] },
  { name: 'MySQL', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['SQL', 'Database'], aliases: [] },
  { name: 'MongoDB', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['NoSQL', 'Database'], aliases: ['Mongo'] },
  { name: 'Redis', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Caching', 'In-Memory Database'], aliases: [] },
  { name: 'Snowflake', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['Data Warehousing', 'Cloud'], aliases: [] },
  { name: 'BigQuery', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['GCP', 'Data Warehousing'], aliases: ['Google BigQuery'] },

  // Cloud Platforms
  { name: 'AWS', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['Cloud', 'S3', 'SageMaker'], aliases: ['Amazon Web Services'] },
  { name: 'Azure', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Cloud', 'Microsoft'], aliases: ['Microsoft Azure'] },
  { name: 'GCP', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Cloud', 'BigQuery'], aliases: ['Google Cloud Platform'] },
  { name: 'SageMaker', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['AWS', 'Machine Learning'], aliases: ['AWS SageMaker'] },

  // MLOps & Deployment
  { name: 'Docker', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['Containers', 'Deployment'], aliases: [] },
  { name: 'Kubernetes', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Docker', 'Orchestration'], aliases: ['K8s'] },
  { name: 'MLflow', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['MLOps', 'Model Management'], aliases: [] },
  { name: 'Airflow', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Workflow', 'Data Pipeline'], aliases: ['Apache Airflow'] },
  { name: 'Git', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['Version Control', 'GitHub'], aliases: [] },

  // Data Engineering
  { name: 'ETL', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['Data Pipeline', 'Data Warehousing'], aliases: ['Extract Transform Load'] },
  { name: 'Data Warehousing', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['SQL', 'Snowflake', 'ETL'], aliases: [] },
  { name: 'Data Pipeline', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['ETL', 'Airflow', 'Spark'], aliases: [] },
  { name: 'Data Modeling', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['Database Design', 'SQL'], aliases: [] },

  // Soft Skills
  { name: 'Problem Solving', category: 'soft_skills', demandLevel: 'high', importance: 'critical', relatedSkills: ['Critical Thinking', 'Analysis'], aliases: [] },
  { name: 'Communication', category: 'soft_skills', demandLevel: 'high', importance: 'critical', relatedSkills: ['Presentation', 'Storytelling'], aliases: [] },
  { name: 'Data Storytelling', category: 'soft_skills', demandLevel: 'high', importance: 'important', relatedSkills: ['Communication', 'Visualization'], aliases: [] },
  { name: 'Business Acumen', category: 'soft_skills', demandLevel: 'high', importance: 'important', relatedSkills: ['Domain Knowledge', 'Strategy'], aliases: [] },
  { name: 'Collaboration', category: 'soft_skills', demandLevel: 'high', importance: 'important', relatedSkills: ['Teamwork', 'Communication'], aliases: ['Teamwork'] },
];

export const dataScientistSkillSet: RoleSkillSet = {
  role: 'data_scientist',
  displayName: 'Data Scientist',
  description: 'Data science roles requiring statistical analysis, machine learning, data visualization, and business insights',
  skills: dataScientistSkills
};
