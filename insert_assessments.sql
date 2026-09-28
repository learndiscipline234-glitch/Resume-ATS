insert into public.skill_assessments (id, skill_name, role, difficulty, time_limit_sec, questions)
values
  (
    '22222222-0000-0000-0000-000000000001',
    'JavaScript',
    'Frontend Developer',
    'intermediate',
    120,
    '[{"question":"What does typeof null return?","options":["null","undefined","object","number"],"correct":2},{"question":"Which method creates a new array by calling a function on every element?","options":[".forEach()",".map()",".filter()",".reduce()"],"correct":1},{"question":"What is a closure?","options":["A way to close browser tabs","A function with access to its outer scope","A loop type","An error handler"],"correct":1},{"question":"What does the spread operator (...) do?","options":["Combines two strings","Expands iterables into individual elements","Creates a deep copy","Declares a variable"],"correct":1},{"question":"Which is NOT a valid way to declare a variable in modern JS?","options":["let x = 1","const x = 1","var x = 1","int x = 1"],"correct":3}]'::jsonb
  ),
  (
    '22222222-0000-0000-0000-000000000002',
    'React',
    'Frontend Developer',
    'intermediate',
    120,
    '[{"question":"What hook is used for side effects?","options":["useState","useEffect","useReducer","useMemo"],"correct":1},{"question":"What is the virtual DOM?","options":["A copy of the real DOM in memory","A CSS framework","A React component","A browser API"],"correct":0},{"question":"How do you correctly update state?","options":["state.value = 5","this.state = {value:5}","setState({value:5}) or setter function","state = 5"],"correct":2},{"question":"What does React.memo() do?","options":["Stores data in localStorage","Prevents unnecessary re-renders","Creates a memo UI","Allocates memory"],"correct":1},{"question":"Purpose of keys in React lists?","options":["Styling elements","Helps React identify changed items","Sorting items","Creating unique URLs"],"correct":1}]'::jsonb
  ),
  (
    '22222222-0000-0000-0000-000000000003',
    'Python',
    'Software Developer',
    'beginner',
    90,
    '[{"question":"Which keyword defines a function in Python?","options":["function","func","def","define"],"correct":2},{"question":"What is a list comprehension?","options":["A way to understand lists","A concise way to create lists","A sorting algorithm","A debugging tool"],"correct":1},{"question":"What does pip stand for?","options":["Python Install Package","Pip Installs Packages","Package Index Python","Python Interface Platform"],"correct":1},{"question":"Which is an immutable data type?","options":["list","dict","set","tuple"],"correct":3},{"question":"Output of print(type([]))?","options":["<class array>","<class list>","<class tuple>","<class set>"],"correct":1}]'::jsonb
  ),
  (
    '22222222-0000-0000-0000-000000000004',
    'SQL',
    'Database Developer',
    'intermediate',
    120,
    '[{"question":"Which clause filters groups?","options":["WHERE","HAVING","FILTER","GROUP BY"],"correct":1},{"question":"Which JOIN returns all rows from both tables?","options":["INNER JOIN","LEFT JOIN","RIGHT JOIN","FULL OUTER JOIN"],"correct":3},{"question":"What does ACID stand for?","options":["Atomicity Consistency Isolation Durability","Add Create Insert Delete","Access Control Index Data","Automatic Concurrent Isolated Distributed"],"correct":0},{"question":"How do you add a column to an existing table?","options":["INSERT INTO","ADD COLUMN","ALTER TABLE ... ADD","UPDATE TABLE"],"correct":2},{"question":"What is a primary key?","options":["First column in a table","Unique identifier for each row","Most important data","An encryption key"],"correct":1}]'::jsonb
  ),
  (
    '22222222-0000-0000-0000-000000000005',
    'Docker',
    'DevOps Engineer',
    'intermediate',
    120,
    '[{"question":"What is a Docker image?","options":["A running container instance","A read-only template to create containers","A Docker network","A volume mount"],"correct":1},{"question":"Which command lists running containers?","options":["docker images","docker ps","docker run","docker build"],"correct":1},{"question":"What is docker-compose used for?","options":["Building images","Managing multi-container applications","Pushing to registry","Creating volumes"],"correct":1},{"question":"What is a Dockerfile?","options":["A configuration file for compose","A script to build a Docker image","A network config","A volume definition"],"correct":1},{"question":"Which flag detaches a container to run in background?","options":["-i","-t","-d","-p"],"correct":2}]'::jsonb
  ),
  (
    '22222222-0000-0000-0000-000000000006',
    'Machine Learning',
    'AI/ML Engineer',
    'advanced',
    150,
    '[{"question":"What is overfitting?","options":["Model performs well on training but poorly on unseen data","Model is too simple","Model has high bias","Model needs more data"],"correct":0},{"question":"Which algorithm is best for classification with linearly separable data?","options":["K-Means","Linear Regression","Support Vector Machine","DBSCAN"],"correct":2},{"question":"What does the learning rate control?","options":["Number of epochs","Step size in gradient descent","Model architecture","Data batch size"],"correct":1},{"question":"What is cross-validation used for?","options":["Feature engineering","Estimating model performance on unseen data","Data augmentation","Hyperparameter search"],"correct":1},{"question":"What is the vanishing gradient problem?","options":["Gradients become too large","Gradients become too small to effectively update weights","Loss increases during training","Overfitting in deep networks"],"correct":1}]'::jsonb
  )
on conflict (id) do nothing;
