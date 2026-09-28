/**
 * AI/ML Engineer Skill Database
 */

import { RoleSkillSet, SkillData } from '../../ai/types';

const aimlEngineerSkills: SkillData[] = [
  // Core ML/AI
  { name: 'Python', category: 'languages', demandLevel: 'high', importance: 'critical', relatedSkills: ['TensorFlow', 'PyTorch'], aliases: [] },
  { name: 'Machine Learning', category: 'technical', demandLevel: 'high', importance: 'critical', relatedSkills: ['Python', 'Scikit-learn'], aliases: ['ML'] },
  { name: 'Deep Learning', category: 'technical', demandLevel: 'high', importance: 'critical', relatedSkills: ['Neural Networks', 'TensorFlow'], aliases: ['DL'] },
  { name: 'TensorFlow', category: 'frameworks', demandLevel: 'high', importance: 'critical', relatedSkills: ['Python', 'Keras'], aliases: ['TF'] },
  { name: 'PyTorch', category: 'frameworks', demandLevel: 'high', importance: 'critical', relatedSkills: ['Python', 'Deep Learning'], aliases: [] },
  { name: 'Keras', category: 'frameworks', demandLevel: 'medium', importance: 'important', relatedSkills: ['TensorFlow', 'Neural Networks'], aliases: [] },
  { name: 'Scikit-learn', category: 'frameworks', demandLevel: 'high', importance: 'important', relatedSkills: ['Python', 'ML'], aliases: ['sklearn'] },
  { name: 'NLP', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['NLTK', 'spaCy', 'Transformers'], aliases: ['Natural Language Processing'] },
  { name: 'Computer Vision', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['OpenCV', 'CNN'], aliases: ['CV'] },
  { name: 'Neural Networks', category: 'technical', demandLevel: 'high', importance: 'critical', relatedSkills: ['Deep Learning', 'CNN', 'RNN'], aliases: ['NN'] },
  
  // Data Science
  { name: 'Data Science', category: 'technical', demandLevel: 'high', importance: 'critical', relatedSkills: ['Python', 'Statistics'], aliases: [] },
  { name: 'Pandas', category: 'frameworks', demandLevel: 'high', importance: 'important', relatedSkills: ['Python', 'NumPy'], aliases: [] },
  { name: 'NumPy', category: 'frameworks', demandLevel: 'high', importance: 'important', relatedSkills: ['Python', 'Data Science'], aliases: [] },
  { name: 'Matplotlib', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Python', 'Visualization'], aliases: [] },
  { name: 'Statistics', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['Data Science', 'ML'], aliases: [] },
  
  // MLOps & Deployment
  { name: 'MLOps', category: 'technical', demandLevel: 'medium', importance: 'important', relatedSkills: ['Docker', 'Kubernetes'], aliases: [] },
  { name: 'Docker', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['Kubernetes', 'Deployment'], aliases: [] },
  { name: 'AWS', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['Cloud', 'SageMaker'], aliases: [] },
  { name: 'Git', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['Version Control'], aliases: [] },
];

export const aimlEngineerSkillSet: RoleSkillSet = {
  role: 'aiml_engineer',
  displayName: 'AI/ML Engineer',
  description: 'Artificial Intelligence and Machine Learning engineering roles',
  skills: aimlEngineerSkills
};
