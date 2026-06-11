// ============================================================
// Types
// ============================================================

export interface PlacementScore {
  overall: number;
  aptitude: number;
  dsa: number;
  coreSubjects: number;
  communication: number;
  resume: number;
}

export interface CompanyChance {
  company: string;
  chance: number;
}

export interface RecentActivity {
  type: string;
  score: number;
  date: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  college: string;
  branch: string;
  graduationYear: number;
  avatar: string;
  placementScore: PlacementScore;
  companyChances: CompanyChance[];
  streak: number;
  recentActivity: RecentActivity[];
}

export interface InterviewRound {
  name: string;
  description: string;
  duration: string;
}

export interface TopQuestion {
  id: string;
  question: string;
  category: "DSA" | "System Design" | "HR" | "Core Subject";
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
}

export interface CompanyTopic {
  name: string;
  completed: boolean;
}

export interface Company {
  name: string;
  slug: string;
  logo: string;
  avgPackage: string;
  difficulty: "Easy" | "Medium" | "Hard";
  interviewRounds: number;
  rounds: InterviewRound[];
  topQuestions: TopQuestion[];
  topics: CompanyTopic[];
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface Complexity {
  time: string;
  space: string;
}

export interface StarterCode {
  python: string;
  java: string;
  cpp: string;
  javascript: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  passed?: boolean;
}

export interface CodingProblem {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  companyTags: string[];
  constraints: string[];
  examples: Example[];
  solutionApproach: string;
  optimalComplexity: Complexity;
  starterCode: StarterCode;
  testCases: TestCase[];
}

export interface Resource {
  title: string;
  url: string;
  type: "article" | "video" | "practice";
}

export interface Week {
  weekNumber: number;
  phase: "Foundation" | "Core DSA" | "Advanced" | "Mock";
  topic: string;
  resourceCount: number;
  estimatedHours: number;
  completed: boolean;
  resources: Resource[];
}

export interface Roadmap {
  targetCompany: string;
  currentLevel: string;
  dailyHours: number;
  startDate: string;
  endDate: string;
  weeks: Week[];
}

export interface GapAnalysisResult {
  missingSkills: string[];
  weakAreas: string[];
  strengths: string[];
  overallMatch: number;
}

export interface SectionScore {
  summary: number;
  skills: number;
  experience: number;
  projects: number;
  education: number;
}

export interface Suggestion {
  section: string;
  bullet: string;
  suggestion: string;
}

export interface ResumeAnalysis {
  atsScore: number;
  sectionScores: SectionScore;
  missingKeywords: string[];
  suggestions: Suggestion[];
}

export interface FillerCount {
  umm: number;
  ah: number;
  like: number;
}

export interface InterviewSession {
  id: string;
  type: "HR" | "TECHNICAL" | "MANAGER";
  company: string;
  duration: number;
  overallScore: number;
  fillerCount: FillerCount;
  wpm: number;
  date: string;
}

export interface Topics {
  dsa: string[];
  core: string[];
  behavioral: string[];
  systemDesign: string[];
}

// ============================================================
// mockStudents
// ============================================================

export const mockStudents: Student[] = [
  {
    id: "S001",
    name: "Arjun Sharma",
    email: "arjun.sharma@vit.ac.in",
    college: "Vellore Institute of Technology",
    branch: "Computer Science & Engineering",
    graduationYear: 2026,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun",
    placementScore: {
      overall: 82,
      aptitude: 78,
      dsa: 85,
      coreSubjects: 80,
      communication: 76,
      resume: 91,
    },
    companyChances: [
      { company: "TCS", chance: 95 },
      { company: "Infosys", chance: 90 },
      { company: "Wipro", chance: 92 },
      { company: "Microsoft", chance: 65 },
      { company: "Amazon", chance: 58 },
      { company: "Google", chance: 42 },
    ],
    streak: 12,
    recentActivity: [
      { type: "Aptitude Test", score: 82, date: "2026-06-08" },
      { type: "DSA Practice", score: 78, date: "2026-06-07" },
      { type: "Mock Interview", score: 85, date: "2026-06-05" },
    ],
  },
  {
    id: "S002",
    name: "Priya Patel",
    email: "priya.patel@bmsce.ac.in",
    college: "BMS College of Engineering",
    branch: "Information Science & Engineering",
    graduationYear: 2026,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    placementScore: {
      overall: 76,
      aptitude: 81,
      dsa: 72,
      coreSubjects: 74,
      communication: 88,
      resume: 65,
    },
    companyChances: [
      { company: "TCS", chance: 88 },
      { company: "Infosys", chance: 85 },
      { company: "Wipro", chance: 80 },
      { company: "Microsoft", chance: 45 },
      { company: "Amazon", chance: 38 },
      { company: "Google", chance: 30 },
    ],
    streak: 8,
    recentActivity: [
      { type: "HR Mock Interview", score: 88, date: "2026-06-09" },
      { type: "Aptitude Test", score: 76, date: "2026-06-06" },
      { type: "Resume Review", score: 65, date: "2026-06-04" },
    ],
  },
  {
    id: "S003",
    name: "Rohit Verma",
    email: "rohit.verma@iiitd.ac.in",
    college: "IIIT Delhi",
    branch: "Computer Science & Engineering",
    graduationYear: 2025,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohit",
    placementScore: {
      overall: 91,
      aptitude: 88,
      dsa: 95,
      coreSubjects: 90,
      communication: 85,
      resume: 97,
    },
    companyChances: [
      { company: "TCS", chance: 99 },
      { company: "Infosys", chance: 97 },
      { company: "Wipro", chance: 98 },
      { company: "Microsoft", chance: 82 },
      { company: "Amazon", chance: 78 },
      { company: "Google", chance: 71 },
    ],
    streak: 45,
    recentActivity: [
      { type: "DSA Contest", score: 98, date: "2026-06-10" },
      { type: "System Design", score: 88, date: "2026-06-09" },
      { type: "Mock Interview", score: 92, date: "2026-06-08" },
    ],
  },
  {
    id: "S004",
    name: "Sneha Reddy",
    email: "sneha.reddy@bits-pilani.ac.in",
    college: "BITS Pilani",
    branch: "Electronics & Communication Engineering",
    graduationYear: 2026,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha",
    placementScore: {
      overall: 68,
      aptitude: 72,
      dsa: 58,
      coreSubjects: 82,
      communication: 74,
      resume: 55,
    },
    companyChances: [
      { company: "TCS", chance: 78 },
      { company: "Infosys", chance: 72 },
      { company: "Wipro", chance: 75 },
      { company: "Microsoft", chance: 28 },
      { company: "Amazon", chance: 22 },
      { company: "Google", chance: 18 },
    ],
    streak: 5,
    recentActivity: [
      { type: "Core Subjects Quiz", score: 82, date: "2026-06-10" },
      { type: "Aptitude Test", score: 68, date: "2026-06-07" },
      { type: "DSA Practice", score: 58, date: "2026-06-06" },
    ],
  },
  {
    id: "S005",
    name: "Vikram Singh",
    email: "vikram.singh@thapar.edu",
    college: "Thapar Institute of Engineering & Technology",
    branch: "Computer Science & Engineering",
    graduationYear: 2025,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
    placementScore: {
      overall: 87,
      aptitude: 84,
      dsa: 90,
      coreSubjects: 82,
      communication: 79,
      resume: 92,
    },
    companyChances: [
      { company: "TCS", chance: 96 },
      { company: "Infosys", chance: 93 },
      { company: "Wipro", chance: 94 },
      { company: "Microsoft", chance: 72 },
      { company: "Amazon", chance: 65 },
      { company: "Google", chance: 55 },
    ],
    streak: 23,
    recentActivity: [
      { type: "DSA Marathon", score: 94, date: "2026-06-10" },
      { type: "System Design Review", score: 78, date: "2026-06-08" },
      { type: "Technical Interview", score: 86, date: "2026-06-06" },
    ],
  },
];

// ============================================================
// mockCompanies
// ============================================================

export const mockCompanies: Company[] = [
  {
    name: "Google",
    slug: "google",
    logo: "🔵",
    avgPackage: "₹45 LPA",
    difficulty: "Hard",
    interviewRounds: 5,
    rounds: [
      { name: "Phone Screen", description: "45-min technical phone interview focused on algorithms and data structures.", duration: "45 min" },
      { name: "Coding Round 1", description: "Problem-solving using DSA on a shared editor.", duration: "60 min" },
      { name: "Coding Round 2", description: "Advanced algorithms with optimization focus.", duration: "60 min" },
      { name: "System Design", description: "Design a large-scale distributed system.", duration: "60 min" },
      { name: "Hiring Committee", description: "Behavioral & Googliness round with senior leadership.", duration: "45 min" },
    ],
    topQuestions: [
      { id: "GQ01", question: "Find the median of two sorted arrays in O(log(min(n,m)))", category: "DSA", difficulty: "Hard", topic: "Binary Search" },
      { id: "GQ02", question: "Design a URL shortener like bit.ly", category: "System Design", difficulty: "Medium", topic: "System Design" },
      { id: "GQ03", question: "Serialize and deserialize a binary tree", category: "DSA", difficulty: "Medium", topic: "Trees" },
      { id: "GQ04", question: "Why do you want to work at Google?", category: "HR", difficulty: "Easy", topic: "Behavioral" },
      { id: "GQ05", question: "Design a distributed key-value store", category: "System Design", difficulty: "Hard", topic: "System Design" },
    ],
    topics: [
      { name: "Arrays & Strings", completed: true },
      { name: "Linked Lists", completed: true },
      { name: "Trees & Graphs", completed: true },
      { name: "Dynamic Programming", completed: false },
      { name: "System Design", completed: false },
      { name: "Googleyness", completed: false },
    ],
  },
  {
    name: "Amazon",
    slug: "amazon",
    logo: "🟠",
    avgPackage: "₹35 LPA",
    difficulty: "Hard",
    interviewRounds: 4,
    rounds: [
      { name: "Online Assessment", description: "Coding challenges and workstyle assessment.", duration: "120 min" },
      { name: "Technical Round 1", description: "DSA problem-solving with an SDE.", duration: "60 min" },
      { name: "Technical Round 2", description: "System design + DSA round.", duration: "60 min" },
      { name: "Bar Raiser", description: "Leadership principles deep-dive with a Bar Raiser.", duration: "60 min" },
    ],
    topQuestions: [
      { id: "AQ01", question: "Design an e-commerce product page recommendation system", category: "System Design", difficulty: "Hard", topic: "System Design" },
      { id: "AQ02", question: "Longest substring without repeating characters", category: "DSA", difficulty: "Medium", topic: "Sliding Window" },
      { id: "AQ03", question: "Design a file storage system like Google Drive", category: "System Design", difficulty: "Hard", topic: "System Design" },
      { id: "AQ04", question: "Tell me about a time you disagreed with your manager", category: "HR", difficulty: "Easy", topic: "Leadership Principles" },
      { id: "AQ05", question: "Merge K sorted linked lists", category: "DSA", difficulty: "Hard", topic: "Heaps" },
    ],
    topics: [
      { name: "Arrays & Strings", completed: true },
      { name: "Stacks & Queues", completed: true },
      { name: "Trees", completed: true },
      { name: "Dynamic Programming", completed: false },
      { name: "System Design", completed: false },
      { name: "Leadership Principles", completed: false },
    ],
  },
  {
    name: "Microsoft",
    slug: "microsoft",
    logo: "🟦",
    avgPackage: "₹30 LPA",
    difficulty: "Hard",
    interviewRounds: 4,
    rounds: [
      { name: "Coding Round", description: "Two coding problems on data structures and algorithms.", duration: "60 min" },
      { name: "Technical Round", description: "Deep-dive into problem-solving and system design.", duration: "60 min" },
      { name: "Manager Round", description: "Technical + behavioral with hiring manager.", duration: "45 min" },
      { name: "AA Round", description: "Ask-Me-Anything with senior leadership.", duration: "30 min" },
    ],
    topQuestions: [
      { id: "MQ01", question: "Design a search autocomplete system", category: "System Design", difficulty: "Medium", topic: "Trie" },
      { id: "MQ02", question: "Reverse words in a string in-place", category: "DSA", difficulty: "Easy", topic: "Strings" },
      { id: "MQ03", question: "Design a task scheduler for Azure", category: "System Design", difficulty: "Hard", topic: "System Design" },
      { id: "MQ04", question: "Why Microsoft and how do you handle ambiguity?", category: "HR", difficulty: "Easy", topic: "Behavioral" },
      { id: "MQ05", question: "Lowest common ancestor of a binary tree", category: "DSA", difficulty: "Medium", topic: "Trees" },
    ],
    topics: [
      { name: "Arrays & Strings", completed: true },
      { name: "Recursion", completed: true },
      { name: "Trees & Graphs", completed: false },
      { name: "Dynamic Programming", completed: false },
      { name: "System Design", completed: false },
    ],
  },
  {
    name: "Meta",
    slug: "meta",
    logo: "🔷",
    avgPackage: "₹40 LPA",
    difficulty: "Hard",
    interviewRounds: 4,
    rounds: [
      { name: "Phone Screen", description: "DSA problem-solving over video call.", duration: "45 min" },
      { name: "Coding Round 1", description: "Two medium-hard DSA problems.", duration: "60 min" },
      { name: "Coding Round 2", description: "Advanced algorithms and optimization.", duration: "60 min" },
      { name: "System Design + Behavioral", description: "Design a scalable system with behavioral questions.", duration: "60 min" },
    ],
    topQuestions: [
      { id: "MEQ01", question: "Design a real-time chat application like WhatsApp", category: "System Design", difficulty: "Hard", topic: "System Design" },
      { id: "MEQ02", question: "Binary tree level order traversal", category: "DSA", difficulty: "Easy", topic: "Trees" },
      { id: "MEQ03", question: "Design a news feed algorithm", category: "System Design", difficulty: "Hard", topic: "System Design" },
      { id: "MEQ04", question: "Describe a project that had the most impact", category: "HR", difficulty: "Easy", topic: "Behavioral" },
      { id: "MEQ05", question: "Concatenation of consecutive binary numbers", category: "DSA", difficulty: "Medium", topic: "Bit Manipulation" },
    ],
    topics: [
      { name: "Arrays & Strings", completed: true },
      { name: "Trees", completed: true },
      { name: "Dynamic Programming", completed: false },
      { name: "System Design", completed: false },
      { name: "Behavioral", completed: false },
    ],
  },
  {
    name: "Adobe",
    slug: "adobe",
    logo: "🔴",
    avgPackage: "₹28 LPA",
    difficulty: "Medium",
    interviewRounds: 4,
    rounds: [
      { name: "Online Assessment", description: "Aptitude + coding test.", duration: "90 min" },
      { name: "Technical Round 1", description: "DSA and problem-solving.", duration: "60 min" },
      { name: "Technical Round 2", description: "System design + Core CS concepts.", duration: "60 min" },
      { name: "HR Round", description: "Cultural fit and expectations.", duration: "30 min" },
    ],
    topQuestions: [
      { id: "ADQ01", question: "Design a photo editing layer system", category: "System Design", difficulty: "Medium", topic: "System Design" },
      { id: "ADQ02", question: "Find the maximum sum subarray (Kadane's Algorithm)", category: "DSA", difficulty: "Easy", topic: "Arrays" },
      { id: "ADQ03", question: "Design a collaborative document editing system", category: "System Design", difficulty: "Hard", topic: "System Design" },
      { id: "ADQ04", question: "Where do you see yourself in 5 years?", category: "HR", difficulty: "Easy", topic: "Behavioral" },
      { id: "ADQ05", question: "LRU Cache implementation", category: "DSA", difficulty: "Medium", topic: "Design" },
    ],
    topics: [
      { name: "Arrays", completed: true },
      { name: "Linked Lists", completed: true },
      { name: "Operating Systems", completed: false },
      { name: "DBMS", completed: false },
      { name: "System Design", completed: false },
    ],
  },
  {
    name: "Virtusa",
    slug: "virtusa",
    logo: "🟣",
    avgPackage: "₹8 LPA",
    difficulty: "Easy",
    interviewRounds: 3,
    rounds: [
      { name: "Aptitude Test", description: "Quantitative, logical and verbal reasoning.", duration: "60 min" },
      { name: "Technical Interview", description: "Core CS fundamentals and basic coding.", duration: "45 min" },
      { name: "HR Interview", description: "Soft skills and company fit.", duration: "30 min" },
    ],
    topQuestions: [
      { id: "VQ01", question: "Difference between C++ and Java", category: "Core Subject", difficulty: "Easy", topic: "OOP" },
      { id: "VQ02", question: "Write a program to check if a number is palindrome", category: "DSA", difficulty: "Easy", topic: "Numbers" },
      { id: "VQ03", question: "Explain normalization in DBMS", category: "Core Subject", difficulty: "Easy", topic: "DBMS" },
      { id: "VQ04", question: "Tell us about yourself", category: "HR", difficulty: "Easy", topic: "Behavioral" },
      { id: "VQ05", question: "What is deadlock and how do you prevent it?", category: "Core Subject", difficulty: "Medium", topic: "OS" },
    ],
    topics: [
      { name: "Aptitude", completed: true },
      { name: "Coding Basics", completed: true },
      { name: "DBMS", completed: true },
      { name: "Operating Systems", completed: false },
      { name: "OOP Concepts", completed: true },
    ],
  },
  {
    name: "Infosys",
    slug: "infosys",
    logo: "🟢",
    avgPackage: "₹9 LPA",
    difficulty: "Easy",
    interviewRounds: 3,
    rounds: [
      { name: "Online Aptitude Test", description: "Quantitative ability, logical reasoning and verbal skills.", duration: "90 min" },
      { name: "Technical Interview", description: "CS fundamentals, projects and basic coding.", duration: "45 min" },
      { name: "HR Interview", description: "Communication, attitude and general awareness.", duration: "30 min" },
    ],
    topQuestions: [
      { id: "IQ01", question: "Explain SQL joins with examples", category: "Core Subject", difficulty: "Easy", topic: "DBMS" },
      { id: "IQ02", question: "Reverse a linked list iteratively and recursively", category: "DSA", difficulty: "Easy", topic: "Linked Lists" },
      { id: "IQ03", question: "What is the difference between abstract class and interface?", category: "Core Subject", difficulty: "Easy", topic: "OOP" },
      { id: "IQ04", question: "Describe your biggest achievement", category: "HR", difficulty: "Easy", topic: "Behavioral" },
      { id: "IQ05", question: "What is ACID property in databases?", category: "Core Subject", difficulty: "Medium", topic: "DBMS" },
    ],
    topics: [
      { name: "Aptitude", completed: true },
      { name: "DBMS", completed: true },
      { name: "OOP", completed: true },
      { name: "CN & OS", completed: false },
      { name: "Coding", completed: true },
    ],
  },
  {
    name: "TCS",
    slug: "tcs",
    logo: "🔵",
    avgPackage: "₹7.5 LPA",
    difficulty: "Easy",
    interviewRounds: 3,
    rounds: [
      { name: "TCS NQT", description: "National Qualifier Test — aptitude, reasoning and coding.", duration: "120 min" },
      { name: "Technical Interview", description: "Programming concepts, project discussion and fundamentals.", duration: "45 min" },
      { name: "HR Interview", description: "Communication skills, attitude and location preference.", duration: "30 min" },
    ],
    topQuestions: [
      { id: "TQ01", question: "Write a program to find factorial using recursion", category: "DSA", difficulty: "Easy", topic: "Recursion" },
      { id: "TQ02", question: "Explain the OSI model layers", category: "Core Subject", difficulty: "Easy", topic: "Networking" },
      { id: "TQ03", question: "What is polymorphism with a real-world example?", category: "Core Subject", difficulty: "Easy", topic: "OOP" },
      { id: "TQ04", question: "Why do you want to join TCS?", category: "HR", difficulty: "Easy", topic: "Behavioral" },
      { id: "TQ05", question: "Difference between TCP and UDP", category: "Core Subject", difficulty: "Easy", topic: "Networking" },
    ],
    topics: [
      { name: "Aptitude", completed: true },
      { name: "C Programming", completed: true },
      { name: "OOP Concepts", completed: true },
      { name: "Networking", completed: false },
      { name: "DBMS", completed: true },
    ],
  },
  {
    name: "Wipro",
    slug: "wipro",
    logo: "🟢",
    avgPackage: "₹6.5 LPA",
    difficulty: "Easy",
    interviewRounds: 3,
    rounds: [
      { name: "Wipro NLTH", description: "Aptitude test, written communication and coding.", duration: "120 min" },
      { name: "Technical Interview", description: "Fundamentals of programming and projects.", duration: "45 min" },
      { name: "HR Interview", description: "Communication, flexibility and team fit.", duration: "30 min" },
    ],
    topQuestions: [
      { id: "WQ01", question: "Write a program to check for prime number", category: "DSA", difficulty: "Easy", topic: "Numbers" },
      { id: "WQ02", question: "What are the four pillars of OOP?", category: "Core Subject", difficulty: "Easy", topic: "OOP" },
      { id: "WQ03", question: "Explain normal forms in DBMS up to 3NF", category: "Core Subject", difficulty: "Medium", topic: "DBMS" },
      { id: "WQ04", question: "Describe a time you worked in a team", category: "HR", difficulty: "Easy", topic: "Behavioral" },
      { id: "WQ05", question: "What is the difference between stack and queue?", category: "DSA", difficulty: "Easy", topic: "Data Structures" },
    ],
    topics: [
      { name: "Aptitude", completed: true },
      { name: "Coding", completed: true },
      { name: "OOP", completed: true },
      { name: "DBMS", completed: false },
      { name: "Communication", completed: true },
    ],
  },
];

// ============================================================
// mockCodingProblems
// ============================================================

export const mockCodingProblems: CodingProblem[] = [
  {
    id: "CP001",
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers that add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. Return the answer in any order.",
    difficulty: "Easy",
    topic: "Arrays",
    companyTags: ["Google", "Amazon", "Microsoft", "Adobe", "Meta"],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists",
    ],
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]", explanation: "nums[1] + nums[2] == 6, we return [1, 2]." },
    ],
    solutionApproach: "Use a hash map to store each element's index as you iterate. For each element, check if target - current element exists in the map. If yes, return both indices. This gives O(n) time and O(n) space.",
    optimalComplexity: { time: "O(n)", space: "O(n)" },
    starterCode: {
      python: "def twoSum(nums: List[int], target: int) -> List[int]:\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n        return {};\n    }\n};",
      javascript: "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    // Write your code here\n};",
    },
    testCases: [
      { input: "[2,7,11,15]\n9", expectedOutput: "[0,1]" },
      { input: "[3,2,4]\n6", expectedOutput: "[1,2]" },
      { input: "[3,3]\n6", expectedOutput: "[0,1]" },
    ],
  },
  {
    id: "CP002",
    title: "Valid Parentheses",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. A string is valid if open brackets are closed in the correct order and every close bracket has a corresponding open bracket of the same type.",
    difficulty: "Easy",
    topic: "Stacks",
    companyTags: ["Google", "Amazon", "Microsoft", "Meta", "Adobe"],
    constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'"],
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
      { input: 's = "([)]"', output: "false" },
    ],
    solutionApproach: "Use a stack. When an opening bracket is encountered, push it. When a closing bracket is encountered, check if the top of the stack matches. If not, return false. At the end, return true if the stack is empty.",
    optimalComplexity: { time: "O(n)", space: "O(n)" },
    starterCode: {
      python: 'def isValid(s: str) -> bool:\n    # Write your code here\n    pass',
      java: "class Solution {\n    public boolean isValid(String s) {\n        // Write your code here\n        return false;\n    }\n}",
      cpp: "class Solution {\npublic:\n    bool isValid(string s) {\n        // Write your code here\n        return false;\n    }\n};",
      javascript: "/**\n * @param {string} s\n * @return {boolean}\n */\nvar isValid = function(s) {\n    // Write your code here\n};",
    },
    testCases: [
      { input: "()", expectedOutput: "true" },
      { input: "()[]{}", expectedOutput: "true" },
      { input: "(]", expectedOutput: "false" },
      { input: "([)]", expectedOutput: "false" },
    ],
  },
  {
    id: "CP003",
    title: "Reverse a Linked List",
    description: "Given the head of a singly linked list, reverse the list and return the reversed list. You may reverse the list iteratively or recursively. The linked list is represented by the head pointer and each node has a val and next pointer.",
    difficulty: "Easy",
    topic: "Linked Lists",
    companyTags: ["Google", "Amazon", "Microsoft", "Meta", "Infosys", "TCS"],
    constraints: ["0 <= number of nodes <= 5000", "-5000 <= Node.val <= 5000"],
    examples: [
      { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" },
      { input: "head = [1,2]", output: "[2,1]" },
      { input: "head = []", output: "[]" },
    ],
    solutionApproach: "Use three pointers: prev, current, and next. Iteratively reverse the next pointer of each node to point to the previous node. Return prev as the new head. For recursion, reverse the rest of the list and fix the head pointer.",
    optimalComplexity: { time: "O(n)", space: "O(1) iterative, O(n) recursive" },
    starterCode: {
      python: "def reverseList(head: Optional[ListNode]) -> Optional[ListNode]:\n    # Write your code here\n    pass",
      java: "class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Write your code here\n        return null;\n    }\n}",
      cpp: "class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // Write your code here\n        return nullptr;\n    }\n};",
      javascript: "/**\n * @param {ListNode} head\n * @return {ListNode}\n */\nvar reverseList = function(head) {\n    // Write your code here\n};",
    },
    testCases: [
      { input: "[1,2,3,4,5]", expectedOutput: "[5,4,3,2,1]" },
      { input: "[1,2]", expectedOutput: "[2,1]" },
      { input: "[]", expectedOutput: "[]" },
    ],
  },
  {
    id: "CP004",
    title: "Maximum Subarray Sum",
    description: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum. This is a classic Kadane's algorithm problem that tests your ability to identify optimal sub-structure.",
    difficulty: "Medium",
    topic: "Arrays",
    companyTags: ["Google", "Amazon", "Microsoft", "Adobe", "Infosys"],
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    examples: [
      { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "The subarray [4,-1,2,1] has the largest sum of 6." },
      { input: "nums = [1]", output: "1" },
      { input: "nums = [5,4,-1,7,8]", output: "23" },
    ],
    solutionApproach: "Use Kadane's algorithm. Maintain two variables: current sum and max sum. Iterate through the array, add each element to current sum. If current sum exceeds max sum, update it. If current sum becomes negative, reset it to 0.",
    optimalComplexity: { time: "O(n)", space: "O(1)" },
    starterCode: {
      python: "def maxSubArray(nums: List[int]) -> int:\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int maxSubArray(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Write your code here\n        return 0;\n    }\n};",
      javascript: "/**\n * @param {number[]} nums\n * @return {number}\n */\nvar maxSubArray = function(nums) {\n    // Write your code here\n};",
    },
    testCases: [
      { input: "[-2,1,-3,4,-1,2,1,-5,4]", expectedOutput: "6" },
      { input: "[1]", expectedOutput: "1" },
      { input: "[5,4,-1,7,8]", expectedOutput: "23" },
    ],
  },
  {
    id: "CP005",
    title: "Longest Substring Without Repeating Characters",
    description: "Given a string s, find the length of the longest substring without repeating characters. A substring is a contiguous sequence of characters within the string. Your algorithm must handle both lowercase and uppercase letters as distinct characters.",
    difficulty: "Medium",
    topic: "Sliding Window",
    companyTags: ["Google", "Amazon", "Microsoft", "Meta", "Adobe"],
    constraints: ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces"],
    examples: [
      { input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: "1", explanation: 'The answer is "b", with the length of 1.' },
      { input: 's = "pwwkew"', output: "3", explanation: 'The answer is "wke", with the length of 3.' },
    ],
    solutionApproach: "Use a sliding window with a hash set or hash map. Maintain two pointers (left and right). Expand the right pointer, adding characters to the set. If a duplicate is found, move the left pointer forward until the duplicate is removed, tracking the maximum window size.",
    optimalComplexity: { time: "O(n)", space: "O(min(m,n)) where m is the charset size" },
    starterCode: {
      python: "def lengthOfLongestSubstring(s: str) -> int:\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your code here\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Write your code here\n        return 0;\n    }\n};",
      javascript: "/**\n * @param {string} s\n * @return {number}\n */\nvar lengthOfLongestSubstring = function(s) {\n    // Write your code here\n};",
    },
    testCases: [
      { input: "abcabcbb", expectedOutput: "3" },
      { input: "bbbbb", expectedOutput: "1" },
      { input: "pwwkew", expectedOutput: "3" },
    ],
  },
  {
    id: "CP006",
    title: "Merge Two Sorted Lists",
    description: "You are given the heads of two sorted linked lists, list1 and list2. Merge the two lists into one sorted linked list and return its head. The list should be made by splicing together the nodes of the first two lists.",
    difficulty: "Easy",
    topic: "Linked Lists",
    companyTags: ["Google", "Amazon", "Microsoft", "Meta", "Adobe", "Infosys", "TCS"],
    constraints: ["0 <= number of nodes <= 50", "-100 <= Node.val <= 100", "Both lists are sorted in non-decreasing order"],
    examples: [
      { input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]" },
      { input: "list1 = [], list2 = []", output: "[]" },
      { input: "list1 = [], list2 = [0]", output: "[0]" },
    ],
    solutionApproach: "Use a dummy node to simplify edge cases. Compare values from both lists and attach the smaller node to the result. Move the pointer forward in the list from which the node was taken. When one list is exhausted, attach the remainder of the other.",
    optimalComplexity: { time: "O(n + m)", space: "O(1)" },
    starterCode: {
      python: "def mergeTwoLists(list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:\n    # Write your code here\n    pass",
      java: "class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        // Write your code here\n        return null;\n    }\n}",
      cpp: "class Solution {\npublic:\n    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n        // Write your code here\n        return nullptr;\n    }\n};",
      javascript: "/**\n * @param {ListNode} list1\n * @param {ListNode} list2\n * @return {ListNode}\n */\nvar mergeTwoLists = function(list1, list2) {\n    // Write your code here\n};",
    },
    testCases: [
      { input: "[1,2,4]\n[1,3,4]", expectedOutput: "[1,1,2,3,4,4]" },
      { input: "[]\n[]", expectedOutput: "[]" },
      { input: "[]\n[0]", expectedOutput: "[0]" },
    ],
  },
  {
    id: "CP007",
    title: "Binary Tree Level Order Traversal",
    description: "Given the root of a binary tree, return the level order traversal of its nodes' values. That is, from left to right, level by level. Level order traversal is a fundamental tree traversal algorithm that visits nodes layer by layer.",
    difficulty: "Medium",
    topic: "Trees",
    companyTags: ["Google", "Amazon", "Microsoft", "Meta", "Adobe"],
    constraints: ["0 <= number of nodes <= 2000", "-1000 <= Node.val <= 1000"],
    examples: [
      { input: "root = [3,9,20,null,null,15,7]", output: "[[3],[9,20],[15,7]]" },
      { input: "root = [1]", output: "[[1]]" },
      { input: "root = []", output: "[]" },
    ],
    solutionApproach: "Use a queue for BFS traversal. Start by pushing the root into the queue. For each level, process all nodes currently in the queue, adding their children. Collect values for each level and append to the result.",
    optimalComplexity: { time: "O(n)", space: "O(n)" },
    starterCode: {
      python: "def levelOrder(root: Optional[TreeNode]) -> List[List[int]]:\n    # Write your code here\n    pass",
      java: "class Solution {\n    public List<List<Integer>> levelOrder(TreeNode root) {\n        // Write your code here\n        return new ArrayList<>();\n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<vector<int>> levelOrder(TreeNode* root) {\n        // Write your code here\n        return {};\n    }\n};",
      javascript: "/**\n * @param {TreeNode} root\n * @return {number[][]}\n */\nvar levelOrder = function(root) {\n    // Write your code here\n};",
    },
    testCases: [
      { input: "[3,9,20,null,null,15,7]", expectedOutput: "[[3],[9,20],[15,7]]" },
      { input: "[1]", expectedOutput: "[[1]]" },
      { input: "[]", expectedOutput: "[]" },
    ],
  },
  {
    id: "CP008",
    title: "LRU Cache",
    description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class with get(key) and put(key, value) functions. Both operations must run in O(1) average time complexity. When the cache reaches capacity, it should evict the least recently used item.",
    difficulty: "Hard",
    topic: "Design",
    companyTags: ["Google", "Amazon", "Microsoft", "Meta", "Adobe"],
    constraints: ["1 <= capacity <= 3000", "0 <= key <= 10^4", "0 <= value <= 10^5", "At most 2 * 10^5 calls will be made to get and put"],
    examples: [
      { input: 'LRUCache(2); put(1,1); put(2,2); get(1); put(3,3); get(2); put(4,4); get(1); get(3); get(4)', output: "[null,null,null,1,null,-1,null,-1,3,4]" },
    ],
    solutionApproach: "Use a doubly linked list and a hash map. The linked list maintains the order of usage with the most recently used at the head. The hash map provides O(1) access to nodes. On get, move the node to the head. On put, add to head and evict from tail if capacity exceeded.",
    optimalComplexity: { time: "O(1) per operation", space: "O(capacity)" },
    starterCode: {
      python: "class LRUCache:\n    def __init__(self, capacity: int):\n        # Write your code here\n        pass\n\n    def get(self, key: int) -> int:\n        # Write your code here\n        pass\n\n    def put(self, key: int, value: int) -> None:\n        # Write your code here\n        pass",
      java: "class LRUCache {\n    public LRUCache(int capacity) {\n        // Write your code here\n    }\n    \n    public int get(int key) {\n        // Write your code here\n        return -1;\n    }\n    \n    public void put(int key, int value) {\n        // Write your code here\n    }\n}",
      cpp: "class LRUCache {\npublic:\n    LRUCache(int capacity) {\n        // Write your code here\n    }\n    \n    int get(int key) {\n        // Write your code here\n        return -1;\n    }\n    \n    void put(int key, int value) {\n        // Write your code here\n    }\n};",
      javascript: "/**\n * @param {number} capacity\n */\nvar LRUCache = function(capacity) {\n    // Write your code here\n};\n\nLRUCache.prototype.get = function(key) {\n    // Write your code here\n};\n\nLRUCache.prototype.put = function(key, value) {\n    // Write your code here\n};",
    },
    testCases: [
      { input: "2\nput(1,1)\nput(2,2)\nget(1)\nput(3,3)\nget(2)\nput(4,4)\nget(1)\nget(3)\nget(4)", expectedOutput: "[null,null,null,1,null,-1,null,-1,3,4]" },
    ],
  },
  {
    id: "CP009",
    title: "Kth Largest Element in an Array",
    description: "Given an integer array nums and an integer k, return the kth largest element in the array. Note that it is the kth largest element in sorted order, not the kth distinct element. Solve it without sorting the entire array.",
    difficulty: "Medium",
    topic: "Heaps",
    companyTags: ["Google", "Amazon", "Microsoft", "Meta"],
    constraints: ["1 <= k <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    examples: [
      { input: "nums = [3,2,1,5,6,4], k = 2", output: "5" },
      { input: "nums = [3,2,3,1,2,4,5,5,6], k = 4", output: "4" },
    ],
    solutionApproach: "Use a min-heap of size k. Iterate through the array, adding elements to the heap. Once the heap size exceeds k, pop the smallest element. At the end, the top of the heap is the kth largest element. Alternatively, use quickselect for O(n) average time.",
    optimalComplexity: { time: "O(n log k)", space: "O(k)" },
    starterCode: {
      python: "def findKthLargest(nums: List[int], k: int) -> int:\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int findKthLargest(int[] nums, int k) {\n        // Write your code here\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int findKthLargest(vector<int>& nums, int k) {\n        // Write your code here\n        return 0;\n    }\n};",
      javascript: "/**\n * @param {number[]} nums\n * @param {number} k\n * @return {number}\n */\nvar findKthLargest = function(nums, k) {\n    // Write your code here\n};",
    },
    testCases: [
      { input: "[3,2,1,5,6,4]\n2", expectedOutput: "5" },
      { input: "[3,2,3,1,2,4,5,5,6]\n4", expectedOutput: "4" },
    ],
  },
  {
    id: "CP010",
    title: "Clone Graph",
    description: "Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph. Each node in the graph contains a val and a list of its neighbors. The graph is connected, so you can reach all nodes from the given node.",
    difficulty: "Medium",
    topic: "Graphs",
    companyTags: ["Google", "Amazon", "Microsoft", "Meta"],
    constraints: ["0 <= number of nodes <= 100", "1 <= Node.val <= 100", "Node.val is unique"],
    examples: [
      { input: "adjList = [[2,4],[1,3],[2,4],[1,3]]", output: "[[2,4],[1,3],[2,4],[1,3]]", explanation: "There are 4 nodes in the graph." },
    ],
    solutionApproach: "Use a hash map to track cloned nodes. Perform DFS or BFS from the given node. For each node visited, create a clone and recursively clone its neighbors. The hash map ensures cycles are handled and nodes are not cloned multiple times.",
    optimalComplexity: { time: "O(V + E)", space: "O(V)" },
    starterCode: {
      python: 'def cloneGraph(node: Optional["Node"]) -> Optional["Node"]:\n    # Write your code here\n    pass',
      java: 'class Solution {\n    public Node cloneGraph(Node node) {\n        // Write your code here\n        return null;\n    }\n}',
      cpp: "class Solution {\npublic:\n    Node* cloneGraph(Node* node) {\n        // Write your code here\n        return nullptr;\n    }\n};",
      javascript: "/**\n * @param {Node} node\n * @return {Node}\n */\nvar cloneGraph = function(node) {\n    // Write your code here\n};",
    },
    testCases: [
      { input: "[[2,4],[1,3],[2,4],[1,3]]", expectedOutput: "[[2,4],[1,3],[2,4],[1,3]]" },
    ],
  },
  {
    id: "CP011",
    title: "Number of Islands",
    description: "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are surrounded by water.",
    difficulty: "Medium",
    topic: "Graphs",
    companyTags: ["Google", "Amazon", "Microsoft", "Meta", "Adobe"],
    constraints: ["m == grid.length", "n == grid[i].length", "1 <= m, n <= 300", "grid[i][j] is '0' or '1'"],
    examples: [
      { input: 'grid = [\n  ["1","1","1","1","0"],\n  ["1","1","0","1","0"],\n  ["1","1","0","0","0"],\n  ["0","0","0","0","0"]\n]', output: "1" },
      { input: 'grid = [\n  ["1","1","0","0","0"],\n  ["1","1","0","0","0"],\n  ["0","0","1","0","0"],\n  ["0","0","0","1","1"]\n]', output: "3" },
    ],
    solutionApproach: "Perform DFS or BFS traversal. Iterate through every cell in the grid. When land ('1') is found, increment island count and perform DFS to mark all connected land as visited by changing them to '0'. This counts each connected component as one island.",
    optimalComplexity: { time: "O(m * n)", space: "O(m * n)" },
    starterCode: {
      python: "def numIslands(grid: List[List[str]]) -> int:\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int numIslands(char[][] grid) {\n        // Write your code here\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        // Write your code here\n        return 0;\n    }\n};",
      javascript: "/**\n * @param {character[][]} grid\n * @return {number}\n */\nvar numIslands = function(grid) {\n    // Write your code here\n};",
    },
    testCases: [
      { input: '[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', expectedOutput: "1" },
      { input: '[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', expectedOutput: "3" },
    ],
  },
  {
    id: "CP012",
    title: "Longest Palindromic Substring",
    description: "Given a string s, return the longest palindromic substring in s. A palindrome reads the same forwards and backwards. If there are multiple valid answers, return any of them. You need to efficiently find the longest one without checking every possible substring.",
    difficulty: "Medium",
    topic: "Strings",
    companyTags: ["Google", "Amazon", "Microsoft", "Meta", "Adobe"],
    constraints: ["1 <= s.length <= 1000", "s consists of only digits and English letters"],
    examples: [
      { input: 's = "babad"', output: '"bab"', explanation: '"aba" is also a valid answer.' },
      { input: 's = "cbbd"', output: '"bb"' },
    ],
    solutionApproach: "Expand around center. Treat each position (and each gap between positions) as a potential palindrome center. Expand outward while characters match. Track the longest palindrome found. This avoids the O(n^3) brute force approach.",
    optimalComplexity: { time: "O(n^2)", space: "O(1)" },
    starterCode: {
      python: "def longestPalindrome(s: str) -> str:\n    # Write your code here\n    pass",
      java: "class Solution {\n    public String longestPalindrome(String s) {\n        // Write your code here\n        return \"\";\n    }\n}",
      cpp: "class Solution {\npublic:\n    string longestPalindrome(string s) {\n        // Write your code here\n        return \"\";\n    }\n};",
      javascript: "/**\n * @param {string} s\n * @return {string}\n */\nvar longestPalindrome = function(s) {\n    // Write your code here\n};",
    },
    testCases: [
      { input: "babad", expectedOutput: "bab" },
      { input: "cbbd", expectedOutput: "bb" },
    ],
  },
  {
    id: "CP013",
    title: "Trapping Rain Water",
    description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining. The elevation map is represented by an array where each element is the height of a vertical bar.",
    difficulty: "Hard",
    topic: "Arrays",
    companyTags: ["Google", "Amazon", "Microsoft", "Meta", "Adobe"],
    constraints: ["n == height.length", "1 <= n <= 2 * 10^4", "0 <= height[i] <= 10^5"],
    examples: [
      { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6", explanation: "The elevation map traps 6 units of rainwater." },
      { input: "height = [4,2,0,3,2,5]", output: "9" },
    ],
    solutionApproach: "Use the two-pointer technique. Maintain left and right pointers, tracking max heights on both sides. At each step, compute water trapped based on the smaller max height. Move the pointer with the smaller height inward. This eliminates the need for extra space.",
    optimalComplexity: { time: "O(n)", space: "O(1)" },
    starterCode: {
      python: "def trap(height: List[int]) -> int:\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int trap(int[] height) {\n        // Write your code here\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int trap(vector<int>& height) {\n        // Write your code here\n        return 0;\n    }\n};",
      javascript: "/**\n * @param {number[]} height\n * @return {number}\n */\nvar trap = function(height) {\n    // Write your code here\n};",
    },
    testCases: [
      { input: "[0,1,0,2,1,0,1,3,2,1,2,1]", expectedOutput: "6" },
      { input: "[4,2,0,3,2,5]", expectedOutput: "9" },
    ],
  },
  {
    id: "CP014",
    title: "Coin Change",
    description: "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins needed to make up that amount. If that amount cannot be made up by any combination of the coins, return -1. You may assume that you have an infinite number of each kind of coin.",
    difficulty: "Medium",
    topic: "Dynamic Programming",
    companyTags: ["Google", "Amazon", "Microsoft", "Meta", "Adobe"],
    constraints: ["1 <= coins.length <= 12", "1 <= coins[i] <= 2^31 - 1", "0 <= amount <= 10^4"],
    examples: [
      { input: "coins = [1,2,5], amount = 11", output: "3", explanation: "11 = 5 + 5 + 1" },
      { input: "coins = [2], amount = 3", output: "-1" },
    ],
    solutionApproach: "Use a bottom-up dynamic programming approach. Create a dp array of size amount+1 initialized to a large value. dp[0] = 0. For each amount from 1 to amount, try each coin and take the minimum. dp[i] = min(dp[i], dp[i - coin] + 1) if coin <= i.",
    optimalComplexity: { time: "O(amount * number of coins)", space: "O(amount)" },
    starterCode: {
      python: "def coinChange(coins: List[int], amount: int) -> int:\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int coinChange(int[] coins, int amount) {\n        // Write your code here\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        // Write your code here\n        return 0;\n    }\n};",
      javascript: "/**\n * @param {number[]} coins\n * @param {number} amount\n * @return {number}\n */\nvar coinChange = function(coins, amount) {\n    // Write your code here\n};",
    },
    testCases: [
      { input: "[1,2,5]\n11", expectedOutput: "3" },
      { input: "[2]\n3", expectedOutput: "-1" },
    ],
  },
  {
    id: "CP015",
    title: "Course Schedule",
    description: "There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai. Return true if it is possible to finish all courses, otherwise return false. This is equivalent to finding if a cycle exists in a directed graph.",
    difficulty: "Medium",
    topic: "Graphs",
    companyTags: ["Google", "Amazon", "Microsoft", "Meta"],
    constraints: ["1 <= numCourses <= 2000", "0 <= prerequisites.length <= 5000", "prerequisites[i].length == 2", "0 <= ai, bi < numCourses"],
    examples: [
      { input: "numCourses = 2, prerequisites = [[1,0]]", output: "true", explanation: "To take course 1 you need to have taken course 0. So it is possible." },
      { input: "numCourses = 2, prerequisites = [[1,0],[0,1]]", output: "false", explanation: "There is a cycle, so it is impossible." },
    ],
    solutionApproach: "Use Kahn's algorithm (topological sort using BFS) or DFS with cycle detection. For Kahn's algorithm, compute indegree of each node. Enqueue nodes with indegree 0. Process them, reducing indegree of neighbors. If all nodes are processed, there is no cycle.",
    optimalComplexity: { time: "O(V + E)", space: "O(V + E)" },
    starterCode: {
      python: "def canFinish(numCourses: int, prerequisites: List[List[int]]) -> bool:\n    # Write your code here\n    pass",
      java: "class Solution {\n    public boolean canFinish(int numCourses, int[][] prerequisites) {\n        // Write your code here\n        return false;\n    }\n}",
      cpp: "class Solution {\npublic:\n    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {\n        // Write your code here\n        return false;\n    }\n};",
      javascript: "/**\n * @param {number} numCourses\n * @param {number[][]} prerequisites\n * @return {boolean}\n */\nvar canFinish = function(numCourses, prerequisites) {\n    // Write your code here\n};",
    },
    testCases: [
      { input: "2\n[[1,0]]", expectedOutput: "true" },
      { input: "2\n[[1,0],[0,1]]", expectedOutput: "false" },
    ],
  },
  {
    id: "CP016",
    title: "Binary Search",
    description: "Given an array of integers nums which is sorted in ascending order and an integer target, implement binary search to find the index of target in nums. Return the index if found, otherwise return -1. Your algorithm must run in O(log n) time.",
    difficulty: "Easy",
    topic: "Binary Search",
    companyTags: ["Google", "Amazon", "Microsoft", "Infosys", "TCS", "Wipro"],
    constraints: ["1 <= nums.length <= 10^4", "-10^4 < nums[i], target < 10^4", "nums is sorted in ascending order"],
    examples: [
      { input: "nums = [-1,0,3,5,9,12], target = 9", output: "4" },
      { input: "nums = [-1,0,3,5,9,12], target = 2", output: "-1" },
    ],
    solutionApproach: "Initialize left and right pointers. While left <= right, calculate mid. If nums[mid] == target, return mid. If target < nums[mid], move right to mid - 1. If target > nums[mid], move left to mid + 1. Return -1 if not found.",
    optimalComplexity: { time: "O(log n)", space: "O(1)" },
    starterCode: {
      python: "def search(nums: List[int], target: int) -> int:\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int search(int[] nums, int target) {\n        // Write your code here\n        return -1;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        // Write your code here\n        return -1;\n    }\n};",
      javascript: "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number}\n */\nvar search = function(nums, target) {\n    // Write your code here\n};",
    },
    testCases: [
      { input: "[-1,0,3,5,9,12]\n9", expectedOutput: "4" },
      { input: "[-1,0,3,5,9,12]\n2", expectedOutput: "-1" },
    ],
  },
  {
    id: "CP017",
    title: "Climbing Stairs",
    description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top? This is essentially computing the nth Fibonacci number.",
    difficulty: "Easy",
    topic: "Dynamic Programming",
    companyTags: ["Google", "Amazon", "Microsoft", "Adobe", "Infosys"],
    constraints: ["1 <= n <= 45"],
    examples: [
      { input: "n = 2", output: "2", explanation: "There are two ways: 1+1 or 2." },
      { input: "n = 3", output: "3", explanation: "Three ways: 1+1+1, 1+2, 2+1." },
    ],
    solutionApproach: "Use dynamic programming with the recurrence dp[i] = dp[i-1] + dp[i-2] for i >= 2, with base cases dp[0] = 1 and dp[1] = 1. Optimize to O(1) space by using only two variables instead of an array.",
    optimalComplexity: { time: "O(n)", space: "O(1)" },
    starterCode: {
      python: "def climbStairs(n: int) -> int:\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int climbStairs(int n) {\n        // Write your code here\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int climbStairs(int n) {\n        // Write your code here\n        return 0;\n    }\n};",
      javascript: "/**\n * @param {number} n\n * @return {number}\n */\nvar climbStairs = function(n) {\n    // Write your code here\n};",
    },
    testCases: [
      { input: "2", expectedOutput: "2" },
      { input: "3", expectedOutput: "3" },
    ],
  },
  {
    id: "CP018",
    title: "Maximum Product Subarray",
    description: "Given an integer array nums, find a contiguous non-empty subarray within the array that has the largest product, and return the product. This problem is similar to maximum subarray sum but trickier because a negative number can flip the sign of the product.",
    difficulty: "Medium",
    topic: "Arrays",
    companyTags: ["Google", "Amazon", "Microsoft", "Meta"],
    constraints: ["1 <= nums.length <= 2 * 10^4", "-10 <= nums[i] <= 10", "The product of any subarray fits in a 32-bit integer"],
    examples: [
      { input: "nums = [2,3,-2,4]", output: "6", explanation: "[2,3] has the largest product 6." },
      { input: "nums = [-2,0,-1]", output: "0" },
    ],
    solutionApproach: "Track both maximum and minimum products ending at each position. When we encounter a negative number, swap max and min before multiplying. The result is the maximum product seen so far. This handles sign flips correctly.",
    optimalComplexity: { time: "O(n)", space: "O(1)" },
    starterCode: {
      python: "def maxProduct(nums: List[int]) -> int:\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int maxProduct(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int maxProduct(vector<int>& nums) {\n        // Write your code here\n        return 0;\n    }\n};",
      javascript: "/**\n * @param {number[]} nums\n * @return {number}\n */\nvar maxProduct = function(nums) {\n    // Write your code here\n};",
    },
    testCases: [
      { input: "[2,3,-2,4]", expectedOutput: "6" },
      { input: "[-2,0,-1]", expectedOutput: "0" },
    ],
  },
  {
    id: "CP019",
    title: "Serialize and Deserialize Binary Tree",
    description: "Design an algorithm to serialize a binary tree into a string and deserialize that string back into the original tree structure. Serialization is the process of converting a data structure into a format that can be stored or transmitted. Your solution should work for any binary tree, not just BSTs.",
    difficulty: "Hard",
    topic: "Trees",
    companyTags: ["Google", "Amazon", "Microsoft", "Meta", "Adobe"],
    constraints: ["0 <= number of nodes <= 10^4", "-1000 <= Node.val <= 1000"],
    examples: [
      { input: "root = [1,2,3,null,null,4,5]", output: "Serialize to string, deserialize back to the same tree" },
    ],
    solutionApproach: "Use preorder traversal for serialization. For each node, append its value followed by a delimiter. Use a marker (like '#') for null nodes. For deserialization, split the string by the delimiter and recursively build the tree using the same preorder order.",
    optimalComplexity: { time: "O(n)", space: "O(n)" },
    starterCode: {
      python: "class Codec:\n    def serialize(self, root: Optional[TreeNode]) -> str:\n        # Write your code here\n        pass\n\n    def deserialize(self, data: str) -> Optional[TreeNode]:\n        # Write your code here\n        pass",
      java: "public class Codec {\n    public String serialize(TreeNode root) {\n        // Write your code here\n        return \"\";\n    }\n\n    public TreeNode deserialize(String data) {\n        // Write your code here\n        return null;\n    }\n}",
      cpp: "class Codec {\npublic:\n    string serialize(TreeNode* root) {\n        // Write your code here\n        return \"\";\n    }\n\n    TreeNode* deserialize(string data) {\n        // Write your code here\n        return nullptr;\n    }\n};",
      javascript: "/**\n * Encodes a tree to a single string.\n */\nvar serialize = function(root) {\n    // Write your code here\n};\n\n/**\n * Decodes your encoded data to tree.\n */\nvar deserialize = function(data) {\n    // Write your code here\n};",
    },
    testCases: [
      { input: "[1,2,3,null,null,4,5]", expectedOutput: "[1,2,3,null,null,4,5]" },
    ],
  },
  {
    id: "CP020",
    title: "Find Median from Data Stream",
    description: "Design a data structure that supports adding integers from a data stream and finding the median of all added elements at any time. Implement the MedianFinder class with addNum(num) and findMedian() methods. The median is the middle value in an ordered list. If the list has an even number of elements, the median is the average of the two middle values.",
    difficulty: "Hard",
    topic: "Heaps",
    companyTags: ["Google", "Amazon", "Microsoft", "Meta"],
    constraints: ["-10^5 <= num <= 10^5", "At most 5 * 10^4 calls will be made", "findMedian will be called only when there is at least one element"],
    examples: [
      { input: 'addNum(1); addNum(2); findMedian(); addNum(3); findMedian()', output: "[null,null,1.5,null,2.0]" },
    ],
    solutionApproach: "Use two heaps: a max-heap for the smaller half and a min-heap for the larger half. Maintain the invariant that the max-heap size is either equal to or one greater than the min-heap size. The median is either the top of the max-heap or the average of both tops.",
    optimalComplexity: { time: "O(log n) for addNum, O(1) for findMedian", space: "O(n)" },
    starterCode: {
      python: "class MedianFinder:\n    def __init__(self):\n        # Write your code here\n        pass\n\n    def addNum(self, num: int) -> None:\n        # Write your code here\n        pass\n\n    def findMedian(self) -> float:\n        # Write your code here\n        pass",
      java: "class MedianFinder {\n    public MedianFinder() {\n        // Write your code here\n    }\n    \n    public void addNum(int num) {\n        // Write your code here\n    }\n    \n    public double findMedian() {\n        // Write your code here\n        return 0.0;\n    }\n}",
      cpp: "class MedianFinder {\npublic:\n    MedianFinder() {\n        // Write your code here\n    }\n    \n    void addNum(int num) {\n        // Write your code here\n    }\n    \n    double findMedian() {\n        // Write your code here\n        return 0.0;\n    }\n};",
      javascript: "var MedianFinder = function() {\n    // Write your code here\n};\n\nMedianFinder.prototype.addNum = function(num) {\n    // Write your code here\n};\n\nMedianFinder.prototype.findMedian = function() {\n    // Write your code here\n};",
    },
    testCases: [
      { input: "addNum(1)\naddNum(2)\nfindMedian\naddNum(3)\nfindMedian", expectedOutput: "[null,null,1.5,null,2.0]" },
    ],
  },
];

// ============================================================
// mockRoadmap
// ============================================================

export const mockRoadmap: Roadmap = {
  targetCompany: "Amazon",
  currentLevel: "Intermediate",
  dailyHours: 4,
  startDate: "2026-06-01",
  endDate: "2026-09-28",
  weeks: [
    {
      weekNumber: 1,
      phase: "Foundation",
      topic: "Arrays & Strings Review",
      resourceCount: 5,
      estimatedHours: 28,
      completed: true,
      resources: [
        { title: "Arrays in Python - GeeksforGeeks", url: "https://www.geeksforgeeks.org/array-python-set-1-introduction-functions/", type: "article" },
        { title: "String Algorithms - NeetCode", url: "https://neetcode.io/courses/advanced-algorithms/0", type: "video" },
        { title: "Two Sum - LeetCode", url: "https://leetcode.com/problems/two-sum/", type: "practice" },
        { title: "Sliding Window Technique", url: "https://www.geeksforgeeks.org/window-sliding-technique/", type: "article" },
        { title: "Longest Substring Without Repeating Characters", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", type: "practice" },
      ],
    },
    {
      weekNumber: 2,
      phase: "Foundation",
      topic: "Hash Maps & Stacks",
      resourceCount: 4,
      estimatedHours: 28,
      completed: true,
      resources: [
        { title: "Hash Table Basics - CS50", url: "https://www.youtube.com/watch?v=nvzVHwrrub0", type: "video" },
        { title: "Valid Parentheses - LeetCode", url: "https://leetcode.com/problems/valid-parentheses/", type: "practice" },
        { title: "Group Anagrams - LeetCode", url: "https://leetcode.com/problems/group-anagrams/", type: "practice" },
        { title: "Monotonic Stack Pattern", url: "https://leetcode.com/discuss/study-guide/2347639/A-comprehensive-guide-and-template-for-monotonic-stack-based-problems", type: "article" },
      ],
    },
    {
      weekNumber: 3,
      phase: "Foundation",
      topic: "Linked Lists",
      resourceCount: 5,
      estimatedHours: 28,
      completed: true,
      resources: [
        { title: "Linked List Mastery - TakeUForward", url: "https://takeuforward.org/linked-list/top-linkedlist-interview-questions-structured-path-with-video-solutions/", type: "article" },
        { title: "Reverse Linked List - LeetCode", url: "https://leetcode.com/problems/reverse-linked-list/", type: "practice" },
        { title: "Merge Two Sorted Lists - LeetCode", url: "https://leetcode.com/problems/merge-two-sorted-lists/", type: "practice" },
        { title: "Linked List Cycle Detection", url: "https://www.youtube.com/watch?v=agkyC-rE8bg", type: "video" },
        { title: "Copy List with Random Pointer", url: "https://leetcode.com/problems/copy-list-with-random-pointer/", type: "practice" },
      ],
    },
    {
      weekNumber: 4,
      phase: "Foundation",
      topic: "Recursion & Backtracking",
      resourceCount: 4,
      estimatedHours: 28,
      completed: false,
      resources: [
        { title: "Recursion in 100 Seconds", url: "https://www.youtube.com/watch?v=rf60MejMz3E", type: "video" },
        { title: "Subsets - LeetCode", url: "https://leetcode.com/problems/subsets/", type: "practice" },
        { title: "Permutations - LeetCode", url: "https://leetcode.com/problems/permutations/", type: "practice" },
        { title: "Backtracking Pattern Guide", url: "https://leetcode.com/discuss/study-guide/1405817/Backtracking-algorithm-%3A-a-comprehensive-guide", type: "article" },
      ],
    },
    {
      weekNumber: 5,
      phase: "Core DSA",
      topic: "Trees - Part 1 (Binary Trees & BST)",
      resourceCount: 5,
      estimatedHours: 28,
      completed: false,
      resources: [
        { title: "Binary Trees Overview - FreeCodeCamp", url: "https://www.youtube.com/watch?v=6oL-0TdVy28", type: "video" },
        { title: "Binary Tree Level Order Traversal", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/", type: "practice" },
        { title: "Validate Binary Search Tree", url: "https://leetcode.com/problems/validate-binary-search-tree/", type: "practice" },
        { title: "Lowest Common Ancestor of BST", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/", type: "practice" },
        { title: "Tree Traversal Techniques - GeeksforGeeks", url: "https://www.geeksforgeeks.org/tree-traversals-inorder-preorder-and-postorder/", type: "article" },
      ],
    },
    {
      weekNumber: 6,
      phase: "Core DSA",
      topic: "Trees - Part 2 (Advanced Trees)",
      resourceCount: 4,
      estimatedHours: 28,
      completed: false,
      resources: [
        { title: "Serialize and Deserialize Binary Tree", url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/", type: "practice" },
        { title: "Binary Tree Maximum Path Sum", url: "https://leetcode.com/problems/binary-tree-maximum-path-sum/", type: "practice" },
        { title: "Construct Binary Tree from Preorder and Inorder", url: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/", type: "practice" },
        { title: "AVL Trees Explanation", url: "https://www.youtube.com/watch?v=TbvhGcf6UJU", type: "video" },
      ],
    },
    {
      weekNumber: 7,
      phase: "Core DSA",
      topic: "Graphs - Part 1",
      resourceCount: 5,
      estimatedHours: 28,
      completed: false,
      resources: [
        { title: "Graph Theory Introduction - MIT OCW", url: "https://www.youtube.com/watch?v=L0rlFk7bI5E", type: "video" },
        { title: "Number of Islands - LeetCode", url: "https://leetcode.com/problems/number-of-islands/", type: "practice" },
        { title: "Clone Graph - LeetCode", url: "https://leetcode.com/problems/clone-graph/", type: "practice" },
        { title: "DFS vs BFS Guide", url: "https://www.geeksforgeeks.org/difference-between-bfs-and-dfs/", type: "article" },
        { title: "Course Schedule - LeetCode", url: "https://leetcode.com/problems/course-schedule/", type: "practice" },
      ],
    },
    {
      weekNumber: 8,
      phase: "Core DSA",
      topic: "Graphs - Part 2 & Heaps",
      resourceCount: 4,
      estimatedHours: 28,
      completed: false,
      resources: [
        { title: "Dijkstra's Algorithm - Codeforces", url: "https://codeforces.com/blog/entry/54090", type: "article" },
        { title: "Kth Largest Element - LeetCode", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/", type: "practice" },
        { title: "Priority Queue Pattern", url: "https://leetcode.com/discuss/study-guide/2347639/A-comprehensive-guide-and-template-for-monotonic-stack-based-problems", type: "article" },
        { title: "Find Median from Data Stream", url: "https://leetcode.com/problems/find-median-from-data-stream/", type: "practice" },
      ],
    },
    {
      weekNumber: 9,
      phase: "Core DSA",
      topic: "Dynamic Programming - Part 1",
      resourceCount: 5,
      estimatedHours: 28,
      completed: false,
      resources: [
        { title: "DP for Beginners - FreeCodeCamp", url: "https://www.youtube.com/watch?v=oBt53YbR9Kk", type: "video" },
        { title: "Climbing Stairs - LeetCode", url: "https://leetcode.com/problems/climbing-stairs/", type: "practice" },
        { title: "Coin Change - LeetCode", url: "https://leetcode.com/problems/coin-change/", type: "practice" },
        { title: "Longest Increasing Subsequence", url: "https://leetcode.com/problems/longest-increasing-subsequence/", type: "practice" },
        { title: "DP Patterns Guide", url: "https://leetcode.com/discuss/study-guide/458695/Dynamic-Programming-Patterns", type: "article" },
      ],
    },
    {
      weekNumber: 10,
      phase: "Core DSA",
      topic: "Dynamic Programming - Part 2",
      resourceCount: 4,
      estimatedHours: 28,
      completed: false,
      resources: [
        { title: "0/1 Knapsack Pattern", url: "https://www.youtube.com/watch?v=fJbIuhs24zQ", type: "video" },
        { title: "Edit Distance - LeetCode", url: "https://leetcode.com/problems/edit-distance/", type: "practice" },
        { title: "Maximum Product Subarray", url: "https://leetcode.com/problems/maximum-product-subarray/", type: "practice" },
        { title: "Palindrome Partitioning II", url: "https://leetcode.com/problems/palindrome-partitioning-ii/", type: "practice" },
      ],
    },
    {
      weekNumber: 11,
      phase: "Advanced",
      topic: "System Design Fundamentals",
      resourceCount: 5,
      estimatedHours: 28,
      completed: false,
      resources: [
        { title: "System Design Primer - GitHub", url: "https://github.com/donnemartin/system-design-primer", type: "article" },
        { title: "Design a URL Shortener", url: "https://www.youtube.com/watch?v=JQDHz72OA5I", type: "video" },
        { title: "Design a Distributed Cache", url: "https://medium.com/system-design-blog/designing-a-distributed-cache-system-5e0a2b1f1c5b", type: "article" },
        { title: "Load Balancers Explained", url: "https://www.youtube.com/watch?v=K0Ta65OqQkY", type: "video" },
        { title: "Design a Rate Limiter", url: "https://leetcode.com/problems/design-hit-counter/", type: "practice" },
      ],
    },
    {
      weekNumber: 12,
      phase: "Advanced",
      topic: "System Design for Amazon",
      resourceCount: 4,
      estimatedHours: 28,
      completed: false,
      resources: [
        { title: "Amazon System Design - Design E-Commerce", url: "https://www.youtube.com/watch?v=EpASu_1dScE", type: "video" },
        { title: "Design a File Storage System", url: "https://leetcode.com/discuss/interview-question/system-design/124726/Design-Google-Drive", type: "article" },
        { title: "Design a Real-Time Chat System", url: "https://systemdesign.one/chat-system-design/", type: "article" },
        { title: "CAP Theorem & Consistency Models", url: "https://www.youtube.com/watch?v=H13uGIMpUWk", type: "video" },
      ],
    },
    {
      weekNumber: 13,
      phase: "Advanced",
      topic: "Amazon Leadership Principles (LP)",
      resourceCount: 4,
      estimatedHours: 28,
      completed: false,
      resources: [
        { title: "Amazon LP Guide - InterviewBit", url: "https://www.interviewbit.com/amazon-interview-questions/", type: "article" },
        { title: "STAR Method for Behavioral", url: "https://www.youtube.com/watch?v=8QfSnuL8Ny0", type: "video" },
        { title: "Tell me about a time you failed", url: "https://leetcode.com/discuss/interview-question/367063/Amazon-or-Behavioral-Questions", type: "practice" },
        { title: "LP Question Bank", url: "https://www.amazon.jobs/content/en/our-workplace/leadership-principles", type: "article" },
      ],
    },
    {
      weekNumber: 14,
      phase: "Advanced",
      topic: "Core CS Subjects Review",
      resourceCount: 5,
      estimatedHours: 28,
      completed: false,
      resources: [
        { title: "OS Concepts - FreeCodeCamp", url: "https://www.youtube.com/watch?v=BupW7e1Qp2E", type: "video" },
        { title: "DBMS Normalization - GeeksforGeeks", url: "https://www.geeksforgeeks.org/normalization-process-in-dbms/", type: "article" },
        { title: "Networking Basics - CN Notes", url: "https://www.javatpoint.com/computer-network-tutorial", type: "article" },
        { title: "OOP Design Patterns", url: "https://www.youtube.com/watch?v=v9ejT8FO-7I", type: "video" },
        { title: "SQL Practice - HackerRank", url: "https://www.hackerrank.com/domains/sql", type: "practice" },
      ],
    },
    {
      weekNumber: 15,
      phase: "Mock",
      topic: "Mock Interview Week 1",
      resourceCount: 5,
      estimatedHours: 28,
      completed: false,
      resources: [
        { title: "Amazon Mock Interview - Pramp", url: "https://www.pramp.com/", type: "practice" },
        { title: "LeetCode Amazon Tagged Questions", url: "https://leetcode.com/tag/amazon/", type: "practice" },
        { title: "System Design Mock - Interviewing.io", url: "https://interviewing.io/", type: "practice" },
        { title: "Amazon LP STAR Stories Preparation", url: "https://www.youtube.com/watch?v=4tDkBQMgVxI", type: "video" },
        { title: "Time Management in Coding Interviews", url: "https://leetcode.com/discuss/career/216596/How-to-manage-time-during-coding-interviews", type: "article" },
      ],
    },
    {
      weekNumber: 16,
      phase: "Mock",
      topic: "Mock Interview Week 2 & Final Revision",
      resourceCount: 5,
      estimatedHours: 28,
      completed: false,
      resources: [
        { title: "Full Length Amazon Mock", url: "https://www.youtube.com/watch?v=QKZpJj2Wzvo", type: "video" },
        { title: "Top 50 Amazon Questions - LeetCode", url: "https://leetcode.com/list/xi4ci4ig/", type: "practice" },
        { title: "System Design Deep Dive", url: "https://github.com/donnemartin/system-design-primer", type: "article" },
        { title: "Confidence Building Tips", url: "https://www.youtube.com/watch?v=3LNX9KKUUjI", type: "video" },
        { title: "Final Review - Cheat Sheet", url: "https://leetcode.com/discuss/study-guide/1098600/TOPICS-WISE-DSA-CHEAT-SHEET", type: "article" },
      ],
    },
  ],
};

// ============================================================
// mockGapAnalysisResult
// ============================================================

export const mockGapAnalysisResult: GapAnalysisResult = {
  missingSkills: [
    "Docker",
    "Kubernetes",
    "AWS Lambda",
    "System Design",
    "Microservices",
    "Redis",
    "GraphQL",
    "CI/CD",
    "Kafka",
    "Terraform",
  ],
  weakAreas: [
    "Dynamic Programming",
    "Graphs",
    "System Design",
    "OS Concepts",
    "Network Protocols",
    "Concurrency",
  ],
  strengths: [
    "React",
    "Node.js",
    "Python",
    "JavaScript",
    "REST APIs",
    "SQL",
    "Git",
    "HTML/CSS",
  ],
  overallMatch: 62,
};

// ============================================================
// mockResumeAnalysis
// ============================================================

export const mockResumeAnalysis: ResumeAnalysis = {
  atsScore: 74,
  sectionScores: {
    summary: 68,
    skills: 82,
    experience: 71,
    projects: 79,
    education: 88,
  },
  missingKeywords: [
    "Kubernetes",
    "Docker",
    "CI/CD",
    "Terraform",
    "Microservices",
    "GraphQL",
    "Redis",
    "AWS",
    "System Design",
    "TypeScript",
    "Agile",
    "Unit Testing",
  ],
  suggestions: [
    {
      section: "summary",
      bullet: "Weak opening statement",
      suggestion: "Replace 'Looking for opportunities in software development' with a results-driven summary highlighting 3+ years of experience and key technologies like React and Node.js.",
    },
    {
      section: "skills",
      bullet: "Missing cloud technologies",
      suggestion: "Add AWS, Docker, and CI/CD tools to your skills section. These are frequently required by top recruiters.",
    },
    {
      section: "experience",
      bullet: "Bullet points lack quantifiable impact",
      suggestion: "Add numbers and metrics to each bullet point. For example, 'Improved API response time by 40% using Redis caching' instead of 'Worked on API optimization'.",
    },
    {
      section: "experience",
      bullet: "No mention of agile methodology",
      suggestion: "Include experience working in Agile/Scrum teams. Mention sprint planning, stand-ups, or tools like Jira.",
    },
    {
      section: "projects",
      bullet: "Projects lack technical depth",
      suggestion: "For each project, describe the architecture, challenges faced, and technologies used. Include GitHub links and live demo URLs where possible.",
    },
    {
      section: "projects",
      bullet: "No collaborative projects",
      suggestion: "Add at least one collaborative project that demonstrates your ability to work with a team, use version control, and follow code review practices.",
    },
    {
      section: "education",
      bullet: "Missing relevant coursework",
      suggestion: "List relevant coursework like Data Structures, Algorithms, Operating Systems, and DBMS to strengthen your academic profile.",
    },
    {
      section: "summary",
      bullet: "No career narrative",
      suggestion: "Tailor your summary to the role you are applying for. If targeting SDE at Amazon, emphasize problem-solving, scalability, and leadership principles.",
    },
  ],
};

// ============================================================
// mockInterviewSessions
// ============================================================

export const mockInterviewSessions: InterviewSession[] = [
  {
    id: "IS001",
    type: "TECHNICAL",
    company: "Amazon",
    duration: 2700,
    overallScore: 78,
    fillerCount: { umm: 12, ah: 8, like: 5 },
    wpm: 145,
    date: "2026-06-08",
  },
  {
    id: "IS002",
    type: "HR",
    company: "TCS",
    duration: 1800,
    overallScore: 85,
    fillerCount: { umm: 5, ah: 3, like: 2 },
    wpm: 132,
    date: "2026-06-05",
  },
  {
    id: "IS003",
    type: "MANAGER",
    company: "Microsoft",
    duration: 2400,
    overallScore: 71,
    fillerCount: { umm: 15, ah: 10, like: 7 },
    wpm: 158,
    date: "2026-06-01",
  },
];

// ============================================================
// mockTopics
// ============================================================

export const mockTopics: Topics = {
  dsa: [
    "Arrays",
    "Strings",
    "Linked Lists",
    "Stacks & Queues",
    "Trees & Binary Search Trees",
    "Graphs",
    "Dynamic Programming",
    "Recursion & Backtracking",
    "Greedy Algorithms",
    "Heaps & Priority Queues",
    "Tries",
    "Bit Manipulation",
    "Sliding Window",
    "Two Pointers",
    "Binary Search",
    "Matrix",
    "Segment Trees",
    "Disjoint Set Union",
  ],
  core: [
    "Operating Systems",
    "Computer Networks",
    "Database Management Systems",
    "Object-Oriented Programming",
    "Software Engineering",
    "Computer Architecture",
    "Compiler Design",
    "Distributed Systems",
    "Cryptography",
    "Web Technologies",
  ],
  behavioral: [
    "Tell Me About Yourself",
    "Why This Company?",
    "Strengths & Weaknesses",
    "Conflict Resolution",
    "Leadership Experience",
    "Teamwork & Collaboration",
    "Failure Stories",
    "Achievement Highlights",
    "Time Management",
    "Adaptability & Flexibility",
    "Customer Obsession (Amazon)",
    "Ownership & Bias for Action",
  ],
  systemDesign: [
    "Design a URL Shortener",
    "Design a Chat System",
    "Design a Social Media Feed",
    "Design a Distributed Cache",
    "Design a Rate Limiter",
    "Design a File Storage System",
    "Design a Recommendation System",
    "Design a Ride-Sharing Service",
    "Design a Video Streaming Platform",
    "Design a Key-Value Store",
    "Design a Real-Time Gaming Leaderboard",
    "Design a Notification System",
  ],
};
