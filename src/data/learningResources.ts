/**
 * Learning resources mapped to skills.
 * Each skill has a free resource and an optional paid resource.
 */

export interface LearningResource {
  type: 'free' | 'paid';
  title: string;
  url: string;
  platform: string;
}

export interface SkillResources {
  free?: LearningResource;
  paid?: LearningResource;
}

export const learningResources: Record<string, SkillResources> = {
  // Languages
  JavaScript: {
    free: { type: 'free', title: 'JavaScript.info', url: 'https://javascript.info', platform: 'javascript.info' },
    paid: { type: 'paid', title: 'The Complete JavaScript Course', url: 'https://www.udemy.com/course/the-complete-javascript-course/', platform: 'Udemy' },
  },
  TypeScript: {
    free: { type: 'free', title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html', platform: 'typescriptlang.org' },
    paid: { type: 'paid', title: 'Understanding TypeScript', url: 'https://www.udemy.com/course/understanding-typescript/', platform: 'Udemy' },
  },
  Python: {
    free: { type: 'free', title: 'Python.org Tutorial', url: 'https://docs.python.org/3/tutorial/', platform: 'python.org' },
    paid: { type: 'paid', title: 'Complete Python Bootcamp', url: 'https://www.udemy.com/course/complete-python-bootcamp/', platform: 'Udemy' },
  },
  Java: {
    free: { type: 'free', title: 'Java Tutorial – W3Schools', url: 'https://www.w3schools.com/java/', platform: 'W3Schools' },
    paid: { type: 'paid', title: 'Java Masterclass', url: 'https://www.udemy.com/course/java-the-complete-java-developer-course/', platform: 'Udemy' },
  },
  'C#': {
    free: { type: 'free', title: 'C# Documentation', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/', platform: 'Microsoft Learn' },
    paid: { type: 'paid', title: 'C# Basics for Beginners', url: 'https://www.udemy.com/course/csharp-tutorial-for-beginners/', platform: 'Udemy' },
  },
  Go: {
    free: { type: 'free', title: 'A Tour of Go', url: 'https://go.dev/tour/', platform: 'go.dev' },
    paid: { type: 'paid', title: 'Go: The Complete Developer\'s Guide', url: 'https://www.udemy.com/course/go-the-complete-developers-guide/', platform: 'Udemy' },
  },
  Rust: {
    free: { type: 'free', title: 'The Rust Book', url: 'https://doc.rust-lang.org/book/', platform: 'rust-lang.org' },
    paid: { type: 'paid', title: 'Ultimate Rust Crash Course', url: 'https://www.udemy.com/course/ultimate-rust-crash-course/', platform: 'Udemy' },
  },
  // Frontend
  React: {
    free: { type: 'free', title: 'React Official Docs', url: 'https://react.dev/learn', platform: 'react.dev' },
    paid: { type: 'paid', title: 'React – The Complete Guide', url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/', platform: 'Udemy' },
  },
  'Vue.js': {
    free: { type: 'free', title: 'Vue.js Guide', url: 'https://vuejs.org/guide/introduction.html', platform: 'vuejs.org' },
    paid: { type: 'paid', title: 'Vue – The Complete Guide', url: 'https://www.udemy.com/course/vuejs-2-the-complete-guide/', platform: 'Udemy' },
  },
  Angular: {
    free: { type: 'free', title: 'Angular Docs', url: 'https://angular.dev/overview', platform: 'angular.dev' },
    paid: { type: 'paid', title: 'Angular – The Complete Guide', url: 'https://www.udemy.com/course/the-complete-guide-to-angular-2/', platform: 'Udemy' },
  },
  'Next.js': {
    free: { type: 'free', title: 'Next.js Learn', url: 'https://nextjs.org/learn', platform: 'nextjs.org' },
    paid: { type: 'paid', title: 'Next.js & React – The Complete Guide', url: 'https://www.udemy.com/course/nextjs-react-the-complete-guide/', platform: 'Udemy' },
  },
  HTML: {
    free: { type: 'free', title: 'MDN HTML Guide', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML', platform: 'MDN' },
    paid: { type: 'paid', title: 'Web Design for Beginners', url: 'https://www.udemy.com/course/web-design-for-beginners-real-world-coding-in-html-css/', platform: 'Udemy' },
  },
  CSS: {
    free: { type: 'free', title: 'MDN CSS Guide', url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS', platform: 'MDN' },
    paid: { type: 'paid', title: 'Advanced CSS and Sass', url: 'https://www.udemy.com/course/advanced-css-and-sass/', platform: 'Udemy' },
  },
  'Tailwind CSS': {
    free: { type: 'free', title: 'Tailwind CSS Docs', url: 'https://tailwindcss.com/docs', platform: 'tailwindcss.com' },
    paid: { type: 'paid', title: 'Tailwind CSS From Scratch', url: 'https://www.udemy.com/course/tailwind-from-scratch/', platform: 'Udemy' },
  },
  // Backend
  'Node.js': {
    free: { type: 'free', title: 'Node.js Docs', url: 'https://nodejs.org/en/docs', platform: 'nodejs.org' },
    paid: { type: 'paid', title: 'Node.js – The Complete Guide', url: 'https://www.udemy.com/course/nodejs-the-complete-guide/', platform: 'Udemy' },
  },
  Express: {
    free: { type: 'free', title: 'Express.js Guide', url: 'https://expressjs.com/en/guide/routing.html', platform: 'expressjs.com' },
    paid: { type: 'paid', title: 'Node with Express', url: 'https://www.udemy.com/course/the-complete-nodejs-developer-course-2/', platform: 'Udemy' },
  },
  Django: {
    free: { type: 'free', title: 'Django Official Tutorial', url: 'https://docs.djangoproject.com/en/stable/intro/tutorial01/', platform: 'djangoproject.com' },
    paid: { type: 'paid', title: 'Python Django – The Practical Guide', url: 'https://www.udemy.com/course/python-django-the-practical-guide/', platform: 'Udemy' },
  },
  'Spring Boot': {
    free: { type: 'free', title: 'Spring Quickstart', url: 'https://spring.io/quickstart', platform: 'spring.io' },
    paid: { type: 'paid', title: 'Spring Boot 3 & Spring 6', url: 'https://www.udemy.com/course/spring-hibernate-tutorial/', platform: 'Udemy' },
  },
  FastAPI: {
    free: { type: 'free', title: 'FastAPI Tutorial', url: 'https://fastapi.tiangolo.com/tutorial/', platform: 'fastapi.tiangolo.com' },
    paid: { type: 'paid', title: 'FastAPI – The Complete Course', url: 'https://www.udemy.com/course/fastapi-the-complete-course/', platform: 'Udemy' },
  },
  // Databases
  SQL: {
    free: { type: 'free', title: 'SQLZoo', url: 'https://sqlzoo.net', platform: 'sqlzoo.net' },
    paid: { type: 'paid', title: 'The Complete SQL Bootcamp', url: 'https://www.udemy.com/course/the-complete-sql-bootcamp/', platform: 'Udemy' },
  },
  PostgreSQL: {
    free: { type: 'free', title: 'PostgreSQL Tutorial', url: 'https://www.postgresqltutorial.com', platform: 'postgresqltutorial.com' },
    paid: { type: 'paid', title: 'SQL & PostgreSQL for Beginners', url: 'https://www.udemy.com/course/sql-and-postgresql/', platform: 'Udemy' },
  },
  MongoDB: {
    free: { type: 'free', title: 'MongoDB University', url: 'https://learn.mongodb.com', platform: 'learn.mongodb.com' },
    paid: { type: 'paid', title: 'MongoDB – The Complete Developer\'s Guide', url: 'https://www.udemy.com/course/mongodb-the-complete-developers-guide/', platform: 'Udemy' },
  },
  Redis: {
    free: { type: 'free', title: 'Redis University', url: 'https://university.redis.com', platform: 'university.redis.com' },
    paid: { type: 'paid', title: 'Redis Bootcamp', url: 'https://www.udemy.com/course/redis-bootcamp-for-beginners/', platform: 'Udemy' },
  },
  // DevOps & Cloud
  Docker: {
    free: { type: 'free', title: 'Docker Get Started', url: 'https://docs.docker.com/get-started/', platform: 'docs.docker.com' },
    paid: { type: 'paid', title: 'Docker & Kubernetes: The Practical Guide', url: 'https://www.udemy.com/course/docker-kubernetes-the-practical-guide/', platform: 'Udemy' },
  },
  Kubernetes: {
    free: { type: 'free', title: 'Kubernetes Basics', url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/', platform: 'kubernetes.io' },
    paid: { type: 'paid', title: 'Kubernetes for the Absolute Beginners', url: 'https://www.udemy.com/course/learn-kubernetes/', platform: 'Udemy' },
  },
  AWS: {
    free: { type: 'free', title: 'AWS Training', url: 'https://aws.amazon.com/training/digital/', platform: 'aws.amazon.com' },
    paid: { type: 'paid', title: 'AWS Certified Solutions Architect', url: 'https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/', platform: 'Udemy' },
  },
  'CI/CD': {
    free: { type: 'free', title: 'GitHub Actions Docs', url: 'https://docs.github.com/en/actions', platform: 'GitHub Docs' },
    paid: { type: 'paid', title: 'DevOps Beginners to Advanced', url: 'https://www.udemy.com/course/devsecops/', platform: 'Udemy' },
  },
  Terraform: {
    free: { type: 'free', title: 'Terraform Tutorials', url: 'https://developer.hashicorp.com/terraform/tutorials', platform: 'HashiCorp' },
    paid: { type: 'paid', title: 'Terraform for Beginners', url: 'https://www.udemy.com/course/terraform-beginner-to-advanced/', platform: 'Udemy' },
  },
  Ansible: {
    free: { type: 'free', title: 'Ansible Getting Started', url: 'https://docs.ansible.com/ansible/latest/getting_started/', platform: 'ansible.com' },
    paid: { type: 'paid', title: 'Ansible for the Absolute Beginner', url: 'https://www.udemy.com/course/learn-ansible/', platform: 'Udemy' },
  },
  // API & Architecture
  'REST API': {
    free: { type: 'free', title: 'REST API Tutorial', url: 'https://restfulapi.net', platform: 'restfulapi.net' },
    paid: { type: 'paid', title: 'REST APIs with Flask and Python', url: 'https://www.udemy.com/course/rest-api-flask-and-python/', platform: 'Udemy' },
  },
  GraphQL: {
    free: { type: 'free', title: 'GraphQL Learn', url: 'https://graphql.org/learn/', platform: 'graphql.org' },
    paid: { type: 'paid', title: 'GraphQL with React', url: 'https://www.udemy.com/course/graphql-with-react-course/', platform: 'Udemy' },
  },
  // Testing
  Jest: {
    free: { type: 'free', title: 'Jest Docs', url: 'https://jestjs.io/docs/getting-started', platform: 'jestjs.io' },
    paid: { type: 'paid', title: 'JavaScript Unit Testing', url: 'https://www.udemy.com/course/javascript-unit-testing-the-practical-guide/', platform: 'Udemy' },
  },
  Testing: {
    free: { type: 'free', title: 'Testing Library Docs', url: 'https://testing-library.com/docs/', platform: 'testing-library.com' },
    paid: { type: 'paid', title: 'React Testing Library & Jest', url: 'https://www.udemy.com/course/react-testing-library/', platform: 'Udemy' },
  },
  // Version Control
  Git: {
    free: { type: 'free', title: 'Pro Git Book', url: 'https://git-scm.com/book/en/v2', platform: 'git-scm.com' },
    paid: { type: 'paid', title: 'Git & GitHub Bootcamp', url: 'https://www.udemy.com/course/git-and-github-bootcamp/', platform: 'Udemy' },
  },
  // ML / AI
  'Machine Learning': {
    free: { type: 'free', title: 'ML Crash Course – Google', url: 'https://developers.google.com/machine-learning/crash-course', platform: 'Google' },
    paid: { type: 'paid', title: 'Machine Learning A-Z', url: 'https://www.udemy.com/course/machinelearning/', platform: 'Udemy' },
  },
  'Deep Learning': {
    free: { type: 'free', title: 'fast.ai Practical Deep Learning', url: 'https://course.fast.ai', platform: 'fast.ai' },
    paid: { type: 'paid', title: 'Deep Learning A-Z', url: 'https://www.udemy.com/course/deeplearning/', platform: 'Udemy' },
  },
  TensorFlow: {
    free: { type: 'free', title: 'TensorFlow Tutorials', url: 'https://www.tensorflow.org/tutorials', platform: 'tensorflow.org' },
    paid: { type: 'paid', title: 'TensorFlow Developer Certificate', url: 'https://www.udemy.com/course/tensorflow-developer-certificate-machine-learning-zero-to-mastery/', platform: 'Udemy' },
  },
  PyTorch: {
    free: { type: 'free', title: 'PyTorch Tutorials', url: 'https://pytorch.org/tutorials/', platform: 'pytorch.org' },
    paid: { type: 'paid', title: 'PyTorch for Deep Learning', url: 'https://www.udemy.com/course/pytorch-for-deep-learning-and-computer-vision/', platform: 'Udemy' },
  },
  'Scikit-learn': {
    free: { type: 'free', title: 'Scikit-learn User Guide', url: 'https://scikit-learn.org/stable/user_guide.html', platform: 'scikit-learn.org' },
    paid: { type: 'paid', title: 'Python for Data Science and ML', url: 'https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/', platform: 'Udemy' },
  },
  Pandas: {
    free: { type: 'free', title: 'Pandas Getting Started', url: 'https://pandas.pydata.org/docs/getting_started/', platform: 'pandas.pydata.org' },
    paid: { type: 'paid', title: 'Data Analysis with Pandas', url: 'https://www.udemy.com/course/data-analysis-with-pandas/', platform: 'Udemy' },
  },
  NumPy: {
    free: { type: 'free', title: 'NumPy Quickstart', url: 'https://numpy.org/doc/stable/user/quickstart.html', platform: 'numpy.org' },
    paid: { type: 'paid', title: 'NumPy & Pandas Masterclass', url: 'https://www.udemy.com/course/numpy-pandas-masterclass/', platform: 'Udemy' },
  },
  // Data
  'Data Visualization': {
    free: { type: 'free', title: 'Observable Plot Docs', url: 'https://observablehq.com/plot/', platform: 'observablehq.com' },
    paid: { type: 'paid', title: 'Data Visualization with Python', url: 'https://www.udemy.com/course/data-visualization-with-python-and-matplotlib/', platform: 'Udemy' },
  },
  Tableau: {
    free: { type: 'free', title: 'Tableau Public Training', url: 'https://www.tableau.com/learn/training', platform: 'tableau.com' },
    paid: { type: 'paid', title: 'Tableau 2024 A-Z', url: 'https://www.udemy.com/course/tableau10/', platform: 'Udemy' },
  },
  // Soft skills
  'Problem Solving': {
    free: { type: 'free', title: 'LeetCode Practice', url: 'https://leetcode.com/problemset/', platform: 'LeetCode' },
    paid: { type: 'paid', title: 'Master the Coding Interview', url: 'https://www.udemy.com/course/master-the-coding-interview-data-structures-algorithms/', platform: 'Udemy' },
  },
  Agile: {
    free: { type: 'free', title: 'Agile Alliance Resources', url: 'https://www.agilealliance.org/agile101/', platform: 'agilealliance.org' },
    paid: { type: 'paid', title: 'Agile Crash Course', url: 'https://www.udemy.com/course/agile-crash-course/', platform: 'Udemy' },
  },
  // Product
  'Product Management': {
    free: { type: 'free', title: 'Product School Blog', url: 'https://productschool.com/blog', platform: 'productschool.com' },
    paid: { type: 'paid', title: 'Become a Product Manager', url: 'https://www.udemy.com/course/become-a-product-manager-learn-the-skills-get-a-job/', platform: 'Udemy' },
  },
  Jira: {
    free: { type: 'free', title: 'Jira Software Guides', url: 'https://www.atlassian.com/software/jira/guides', platform: 'Atlassian' },
    paid: { type: 'paid', title: 'Jira Fundamentals', url: 'https://university.atlassian.com/student/path/815443-jira-fundamentals', platform: 'Atlassian University' },
  },
};

/**
 * Get learning resources for a skill, with a generic fallback.
 */
export function getResourcesForSkill(skill: string): SkillResources {
  // Direct match
  if (learningResources[skill]) return learningResources[skill];

  // Case-insensitive match
  const key = Object.keys(learningResources).find(
    k => k.toLowerCase() === skill.toLowerCase()
  );
  if (key) return learningResources[key];

  // Generic fallback
  const encoded = encodeURIComponent(skill);
  return {
    free: {
      type: 'free',
      title: `Search "${skill}" on freeCodeCamp`,
      url: `https://www.freecodecamp.org/news/search/?query=${encoded}`,
      platform: 'freeCodeCamp',
    },
    paid: {
      type: 'paid',
      title: `"${skill}" courses on Udemy`,
      url: `https://www.udemy.com/courses/search/?q=${encoded}`,
      platform: 'Udemy',
    },
  };
}
