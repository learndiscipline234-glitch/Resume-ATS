/**
 * DevOps Engineer Skill Database
 * Comprehensive list of skills for DevOps and Site Reliability Engineering roles
 */

import { RoleSkillSet, SkillData } from '../../ai/types';

const devopsEngineerSkills: SkillData[] = [
  // Programming & Scripting Languages
  { name: 'Python', category: 'languages', demandLevel: 'high', importance: 'critical', relatedSkills: ['Automation', 'Scripting'], aliases: ['Python3'] },
  { name: 'Bash', category: 'languages', demandLevel: 'high', importance: 'critical', relatedSkills: ['Shell Scripting', 'Linux'], aliases: ['Shell', 'Bash Scripting'] },
  { name: 'Go', category: 'languages', demandLevel: 'high', importance: 'important', relatedSkills: ['Kubernetes', 'Docker', 'Microservices'], aliases: ['Golang'] },
  { name: 'JavaScript', category: 'languages', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Node.js', 'Automation'], aliases: ['JS'] },
  { name: 'PowerShell', category: 'languages', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Windows', 'Automation'], aliases: [] },
  { name: 'Ruby', category: 'languages', demandLevel: 'low', importance: 'nice-to-have', relatedSkills: ['Chef', 'Puppet'], aliases: [] },

  // Containerization & Orchestration
  { name: 'Docker', category: 'tools', demandLevel: 'high', importance: 'critical', relatedSkills: ['Containers', 'Kubernetes', 'Microservices'], aliases: [] },
  { name: 'Kubernetes', category: 'tools', demandLevel: 'high', importance: 'critical', relatedSkills: ['Docker', 'Container Orchestration', 'Helm'], aliases: ['K8s'] },
  { name: 'Helm', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['Kubernetes', 'Package Management'], aliases: [] },
  { name: 'Docker Compose', category: 'tools', demandLevel: 'medium', importance: 'important', relatedSkills: ['Docker', 'Multi-Container'], aliases: [] },
  { name: 'Podman', category: 'tools', demandLevel: 'low', importance: 'nice-to-have', relatedSkills: ['Containers', 'Docker'], aliases: [] },

  // Cloud Platforms
  { name: 'AWS', category: 'tools', demandLevel: 'high', importance: 'critical', relatedSkills: ['EC2', 'S3', 'CloudFormation'], aliases: ['Amazon Web Services'] },
  { name: 'Azure', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['Cloud', 'Microsoft', 'Azure DevOps'], aliases: ['Microsoft Azure'] },
  { name: 'GCP', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['Cloud', 'Google Cloud'], aliases: ['Google Cloud Platform'] },
  { name: 'DigitalOcean', category: 'tools', demandLevel: 'low', importance: 'nice-to-have', relatedSkills: ['Cloud', 'VPS'], aliases: [] },

  // Infrastructure as Code (IaC)
  { name: 'Terraform', category: 'tools', demandLevel: 'high', importance: 'critical', relatedSkills: ['IaC', 'Cloud', 'Infrastructure'], aliases: [] },
  { name: 'Ansible', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['Configuration Management', 'Automation'], aliases: [] },
  { name: 'CloudFormation', category: 'tools', demandLevel: 'medium', importance: 'important', relatedSkills: ['AWS', 'IaC'], aliases: ['AWS CloudFormation'] },
  { name: 'Pulumi', category: 'tools', demandLevel: 'low', importance: 'nice-to-have', relatedSkills: ['IaC', 'Cloud'], aliases: [] },
  { name: 'Chef', category: 'tools', demandLevel: 'low', importance: 'nice-to-have', relatedSkills: ['Configuration Management', 'Ruby'], aliases: [] },
  { name: 'Puppet', category: 'tools', demandLevel: 'low', importance: 'nice-to-have', relatedSkills: ['Configuration Management'], aliases: [] },

  // CI/CD Tools
  { name: 'Jenkins', category: 'tools', demandLevel: 'high', importance: 'critical', relatedSkills: ['CI/CD', 'Automation', 'Pipelines'], aliases: [] },
  { name: 'GitLab CI', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['CI/CD', 'GitLab', 'Pipelines'], aliases: ['GitLab CI/CD'] },
  { name: 'GitHub Actions', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['CI/CD', 'GitHub', 'Workflows'], aliases: [] },
  { name: 'CircleCI', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['CI/CD', 'Automation'], aliases: [] },
  { name: 'Travis CI', category: 'tools', demandLevel: 'low', importance: 'nice-to-have', relatedSkills: ['CI/CD', 'Automation'], aliases: [] },
  { name: 'Azure DevOps', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['CI/CD', 'Azure', 'Microsoft'], aliases: [] },
  { name: 'ArgoCD', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['GitOps', 'Kubernetes', 'CD'], aliases: [] },

  // Version Control
  { name: 'Git', category: 'tools', demandLevel: 'high', importance: 'critical', relatedSkills: ['Version Control', 'GitHub', 'GitLab'], aliases: [] },
  { name: 'GitHub', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['Git', 'Collaboration'], aliases: [] },
  { name: 'GitLab', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['Git', 'CI/CD'], aliases: [] },
  { name: 'Bitbucket', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Git', 'Atlassian'], aliases: [] },

  // Monitoring & Observability
  { name: 'Prometheus', category: 'tools', demandLevel: 'high', importance: 'critical', relatedSkills: ['Monitoring', 'Metrics', 'Grafana'], aliases: [] },
  { name: 'Grafana', category: 'tools', demandLevel: 'high', importance: 'critical', relatedSkills: ['Monitoring', 'Visualization', 'Prometheus'], aliases: [] },
  { name: 'ELK Stack', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['Logging', 'Elasticsearch', 'Kibana'], aliases: ['Elasticsearch', 'Logstash', 'Kibana'] },
  { name: 'Datadog', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Monitoring', 'APM'], aliases: [] },
  { name: 'New Relic', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Monitoring', 'APM'], aliases: [] },
  { name: 'Splunk', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Logging', 'Analytics'], aliases: [] },
  { name: 'Jaeger', category: 'tools', demandLevel: 'low', importance: 'nice-to-have', relatedSkills: ['Tracing', 'Microservices'], aliases: [] },

  // Operating Systems & Linux
  { name: 'Linux', category: 'technical', demandLevel: 'high', importance: 'critical', relatedSkills: ['Ubuntu', 'CentOS', 'System Administration'], aliases: [] },
  { name: 'Ubuntu', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['Linux', 'Debian'], aliases: [] },
  { name: 'CentOS', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Linux', 'RHEL'], aliases: ['Red Hat'] },
  { name: 'Windows Server', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Windows', 'Microsoft'], aliases: [] },

  // Networking
  { name: 'Networking', category: 'technical', demandLevel: 'high', importance: 'critical', relatedSkills: ['TCP/IP', 'DNS', 'Load Balancing'], aliases: [] },
  { name: 'TCP/IP', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['Networking', 'Protocols'], aliases: [] },
  { name: 'DNS', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['Networking', 'Domain Management'], aliases: [] },
  { name: 'Load Balancing', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['Nginx', 'HAProxy', 'Networking'], aliases: [] },
  { name: 'VPN', category: 'technical', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Networking', 'Security'], aliases: [] },
  { name: 'Nginx', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['Web Server', 'Reverse Proxy', 'Load Balancing'], aliases: [] },
  { name: 'HAProxy', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Load Balancing', 'Proxy'], aliases: [] },

  // Databases
  { name: 'PostgreSQL', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['SQL', 'Database'], aliases: ['Postgres'] },
  { name: 'MySQL', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['SQL', 'Database'], aliases: [] },
  { name: 'MongoDB', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['NoSQL', 'Database'], aliases: ['Mongo'] },
  { name: 'Redis', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['Caching', 'In-Memory Database'], aliases: [] },
  { name: 'Elasticsearch', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Search', 'ELK Stack'], aliases: [] },

  // Security
  { name: 'Security', category: 'technical', demandLevel: 'high', importance: 'critical', relatedSkills: ['SSL/TLS', 'Firewall', 'IAM'], aliases: ['Cybersecurity'] },
  { name: 'SSL/TLS', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['Security', 'Certificates'], aliases: [] },
  { name: 'IAM', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['Security', 'Access Control'], aliases: ['Identity and Access Management'] },
  { name: 'Vault', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Secrets Management', 'Security'], aliases: ['HashiCorp Vault'] },
  { name: 'Firewall', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['Security', 'Networking'], aliases: [] },

  // Service Mesh & API Gateway
  { name: 'Istio', category: 'tools', demandLevel: 'low', importance: 'nice-to-have', relatedSkills: ['Service Mesh', 'Kubernetes'], aliases: [] },
  { name: 'Kong', category: 'tools', demandLevel: 'low', importance: 'nice-to-have', relatedSkills: ['API Gateway', 'Microservices'], aliases: [] },

  // DevOps Practices
  { name: 'CI/CD', category: 'technical', demandLevel: 'high', importance: 'critical', relatedSkills: ['Jenkins', 'GitLab CI', 'Automation'], aliases: ['Continuous Integration', 'Continuous Deployment'] },
  { name: 'GitOps', category: 'technical', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Git', 'ArgoCD', 'Kubernetes'], aliases: [] },
  { name: 'Microservices', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['Docker', 'Kubernetes', 'Architecture'], aliases: [] },
  { name: 'Agile', category: 'soft_skills', demandLevel: 'high', importance: 'important', relatedSkills: ['Scrum', 'Sprint Planning'], aliases: ['Agile Methodology'] },
  { name: 'Site Reliability Engineering', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['Monitoring', 'Incident Response'], aliases: ['SRE'] },

  // Soft Skills
  { name: 'Problem Solving', category: 'soft_skills', demandLevel: 'high', importance: 'critical', relatedSkills: ['Troubleshooting', 'Debugging'], aliases: [] },
  { name: 'Communication', category: 'soft_skills', demandLevel: 'high', importance: 'critical', relatedSkills: ['Collaboration', 'Documentation'], aliases: [] },
  { name: 'Collaboration', category: 'soft_skills', demandLevel: 'high', importance: 'important', relatedSkills: ['Teamwork', 'Communication'], aliases: ['Teamwork'] },
  { name: 'Incident Response', category: 'soft_skills', demandLevel: 'high', importance: 'important', relatedSkills: ['Troubleshooting', 'On-Call'], aliases: [] },
  { name: 'Documentation', category: 'soft_skills', demandLevel: 'high', importance: 'important', relatedSkills: ['Technical Writing', 'Communication'], aliases: [] },
];

export const devopsEngineerSkillSet: RoleSkillSet = {
  role: 'devops_engineer',
  displayName: 'DevOps Engineer',
  description: 'DevOps and Site Reliability Engineering roles requiring automation, cloud infrastructure, CI/CD, and system administration',
  skills: devopsEngineerSkills
};
