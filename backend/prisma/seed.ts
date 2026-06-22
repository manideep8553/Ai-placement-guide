import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })
const PASSWORD = bcrypt.hashSync('password123', 10)

const starterCode = {
  python: 'def solution(nums, target):\n    # Write your code here\n    pass\n',
  java: 'public class Solution {\n    public int[] solution(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n}\n',
  cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> solution(vector<int>& nums, int target) {\n        // Write your code here\n        return {};\n    }\n};\n',
  javascript: 'function solution(nums, target) {\n    // Write your code here\n    return [];\n}\n',
  c: '/**\n * Note: The returned array must be malloced, assume caller calls free().\n */\nint* solution(int* nums, int numsSize, int target, int* returnSize) {\n    // Write your code here\n    *returnSize = 0;\n    return NULL;\n}\n',
}

const funcSignatures = {
  python: 'def solution(nums: List[int], target: int) -> List[int]',
  java: 'public int[] solution(int[] nums, int target)',
  cpp: 'vector<int> solution(vector<int>& nums, int target)',
  javascript: 'function solution(nums, target)',
  c: 'int* solution(int* nums, int numsSize, int target, int* returnSize)',
}

interface ProblemDefinition {
  title: string
  difficulty: string
  topic: string
  company: string[]
  description: string
  constraints: string[]
  examples: { input: string; output: string; explanation: string }[]
  solutionApproach: string
  optimalComplexity: { time: string; space: string }
  testCases: { input: string; expectedOutput: string; isHidden: boolean; description: string }[]
}

const problemDefinitions: ProblemDefinition[] = [
  {
    title: 'Two Sum',
    difficulty: 'Easy',
    topic: 'Arrays',
    company: ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple'],
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers that add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.',
    constraints: ['2 ≤ nums.length ≤ 10^4', '-10^9 ≤ nums[i] ≤ 10^9', '-10^9 ≤ target ≤ 10^9'],
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'nums[1] + nums[2] = 2 + 4 = 6' },
    ],
    solutionApproach: 'Use a hash map to store seen elements. For each element, check if target - nums[i] exists in the map.',
    optimalComplexity: { time: 'O(n)', space: 'O(n)' },
    testCases: [
      { input: '2 4 7 11 15\n9', expectedOutput: '0 1\n', isHidden: false, description: 'Basic case' },
      { input: '3 2 4\n6', expectedOutput: '1 2\n', isHidden: false, description: 'Numbers in middle' },
      { input: '3 3\n6', expectedOutput: '0 1\n', isHidden: false, description: 'Duplicate values' },
      { input: '1 5 8 12\n9', expectedOutput: '0 2\n', isHidden: true, description: 'Non-adjacent pair' },
      { input: '-3 4 3 90\n0', expectedOutput: '0 2\n', isHidden: true, description: 'Negative numbers' },
      { input: '0 4 3 0\n0', expectedOutput: '0 3\n', isHidden: true, description: 'Zeros' },
    ],
  },
  {
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    topic: 'Stack',
    company: ['Amazon', 'Microsoft', 'Google', 'Meta'],
    description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets, and open brackets must be closed in the correct order.',
    constraints: ['1 ≤ s.length ≤ 10^4', 's consists of parentheses only "()[]{}"'],
    examples: [
      { input: 's = "()"', output: 'true', explanation: 'Simple valid parentheses' },
      { input: 's = "()[]{}"', output: 'true', explanation: 'Multiple bracket types' },
      { input: 's = "(]"', output: 'false', explanation: 'Mismatched brackets' },
    ],
    solutionApproach: 'Use a stack. Push opening brackets, pop and check matching for closing brackets.',
    optimalComplexity: { time: 'O(n)', space: 'O(n)' },
    testCases: [
      { input: '()\n', expectedOutput: 'true\n', isHidden: false, description: 'Simple valid' },
      { input: '()[]{}\n', expectedOutput: 'true\n', isHidden: false, description: 'All types valid' },
      { input: '(]\n', expectedOutput: 'false\n', isHidden: false, description: 'Mismatched' },
      { input: '([)]\n', expectedOutput: 'false\n', isHidden: true, description: 'Wrong order' },
      { input: '{[]}\n', expectedOutput: 'true\n', isHidden: true, description: 'Nested valid' },
      { input: '(\n', expectedOutput: 'false\n', isHidden: true, description: 'Unclosed bracket' },
    ],
  },
  {
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    topic: 'Linked List',
    company: ['Google', 'Amazon', 'Microsoft', 'Adobe'],
    description: 'Given the head of a singly linked list, reverse the list and return the reversed list.',
    constraints: ['0 ≤ number of nodes ≤ 5000', '-5000 ≤ Node.val ≤ 5000'],
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]', explanation: 'Reverse the entire linked list' },
      { input: 'head = [1,2]', output: '[2,1]', explanation: 'Two element list' },
    ],
    solutionApproach: 'Use three pointers: prev, current, and next. Iterate through the list reversing the next pointer of each node.',
    optimalComplexity: { time: 'O(n)', space: 'O(1)' },
    testCases: [
      { input: '1 2 3 4 5\n', expectedOutput: '5 4 3 2 1\n', isHidden: false, description: 'Standard case' },
      { input: '1 2\n', expectedOutput: '2 1\n', isHidden: false, description: 'Two elements' },
      { input: '\n', expectedOutput: '\n', isHidden: false, description: 'Empty list' },
      { input: '1\n', expectedOutput: '1\n', isHidden: true, description: 'Single element' },
      { input: '1 2 3 4 5 6 7 8 9 10\n', expectedOutput: '10 9 8 7 6 5 4 3 2 1\n', isHidden: true, description: 'Long list' },
    ],
  },
  {
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    company: ['Amazon', 'Microsoft', 'Google', 'Apple'],
    description: 'Given an integer array nums, find the subarray with the largest sum and return its sum.',
    constraints: ['1 ≤ nums.length ≤ 10^5', '-10^4 ≤ nums[i] ≤ 10^4'],
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' },
      { input: 'nums = [1]', output: '1', explanation: 'Single element' },
    ],
    solutionApproach: 'Use Kadane\'s algorithm: maintain current sum and max sum. Reset current to 0 when it becomes negative.',
    optimalComplexity: { time: 'O(n)', space: 'O(1)' },
    testCases: [
      { input: '-2 1 -3 4 -1 2 1 -5 4\n', expectedOutput: '6\n', isHidden: false, description: 'Standard Kadane case' },
      { input: '1\n', expectedOutput: '1\n', isHidden: false, description: 'Single element' },
      { input: '-1 -2 -3 -4\n', expectedOutput: '-1\n', isHidden: false, description: 'All negative' },
      { input: '5 4 -1 7 8\n', expectedOutput: '23\n', isHidden: true, description: 'Mixed with large sum' },
      { input: '-2 -1\n', expectedOutput: '-1\n', isHidden: true, description: 'All negative two elements' },
    ],
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    topic: 'Sliding Window',
    company: ['Google', 'Amazon', 'Microsoft', 'Meta'],
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    constraints: ['0 ≤ s.length ≤ 5 * 10^4', 's consists of English letters, digits, symbols and spaces'],
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with the length of 1.' },
    ],
    solutionApproach: 'Use sliding window with a hash set. Expand right pointer and if duplicate found, move left pointer forward.',
    optimalComplexity: { time: 'O(n)', space: 'O(min(m, n))' },
    testCases: [
      { input: 'abcabcbb\n', expectedOutput: '3\n', isHidden: false, description: 'Standard case' },
      { input: 'bbbbb\n', expectedOutput: '1\n', isHidden: false, description: 'All same chars' },
      { input: '\n', expectedOutput: '0\n', isHidden: false, description: 'Empty string' },
      { input: 'pwwkew\n', expectedOutput: '3\n', isHidden: true, description: 'Multiple windows' },
      { input: 'au\n', expectedOutput: '2\n', isHidden: true, description: 'Two unique chars' },
    ],
  },
  {
    title: 'Merge Two Sorted Lists',
    difficulty: 'Easy',
    topic: 'Linked List',
    company: ['Microsoft', 'Adobe', 'Amazon'],
    description: 'Merge two sorted linked lists and return it as a sorted list. The list should be made by splicing together the nodes of the first two lists.',
    constraints: ['0 ≤ number of nodes ≤ 50', '-100 ≤ Node.val ≤ 100', 'Both lists are sorted in non-decreasing order'],
    examples: [
      { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]', explanation: 'Merged sorted list' },
    ],
    solutionApproach: 'Use a dummy node to simplify merge logic. Compare values and attach the smaller node to result.',
    optimalComplexity: { time: 'O(n+m)', space: 'O(1)' },
    testCases: [
      { input: '1 2 4\n1 3 4\n', expectedOutput: '1 1 2 3 4 4\n', isHidden: false, description: 'Standard merge' },
      { input: '\n\n', expectedOutput: '\n', isHidden: false, description: 'Both empty' },
      { input: '1 2 3\n\n', expectedOutput: '1 2 3\n', isHidden: false, description: 'One empty' },
      { input: '1\n2\n', expectedOutput: '1 2\n', isHidden: true, description: 'Single each' },
      { input: '1 3 5 7 9\n2 4 6 8 10\n', expectedOutput: '1 2 3 4 5 6 7 8 9 10\n', isHidden: true, description: 'Interleaved' },
    ],
  },
  {
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'Medium',
    topic: 'Tree',
    company: ['Amazon', 'Google', 'Microsoft'],
    description: 'Given the root of a binary tree, return the level order traversal of its nodes values (i.e., from left to right, level by level).',
    constraints: ['0 ≤ number of nodes ≤ 2000', '-1000 ≤ Node.val ≤ 1000'],
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]', explanation: 'Level by level traversal' },
    ],
    solutionApproach: 'Use BFS with a queue. Process nodes level by level.',
    optimalComplexity: { time: 'O(n)', space: 'O(n)' },
    testCases: [
      { input: '3 9 20 null null 15 7\n', expectedOutput: '[[3],[9,20],[15,7]]\n', isHidden: false, description: 'Standard tree' },
      { input: '1\n', expectedOutput: '[[1]]\n', isHidden: false, description: 'Single node' },
      { input: '\n', expectedOutput: '[]\n', isHidden: false, description: 'Empty tree' },
      { input: '1 2 3 4 5 6 7\n', expectedOutput: '[[1],[2,3],[4,5,6,7]]\n', isHidden: true, description: 'Full binary tree' },
    ],
  },
  {
    title: 'LRU Cache',
    difficulty: 'Medium',
    topic: 'Design',
    company: ['Google', 'Amazon', 'Microsoft', 'Meta'],
    description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class with get(key) and put(key, value) methods. Both operations should run in O(1) average time.',
    constraints: ['1 ≤ capacity ≤ 3000', '0 ≤ key ≤ 10^4', '0 ≤ value ≤ 10^5', 'At most 2 * 10^5 calls will be made'],
    examples: [
      { input: 'LRUCache(2); put(1,1); put(2,2); get(1); put(3,3); get(2); put(4,4); get(1); get(3); get(4)', output: '[null,null,null,1,null,-1,null,-1,3,4]', explanation: 'LRU cache operations with capacity 2' },
    ],
    solutionApproach: 'Combine a doubly linked list with a hash map. The linked list tracks usage order; the map provides O(1) access.',
    optimalComplexity: { time: 'O(1)', space: 'O(capacity)' },
    testCases: [
      { input: '2\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2\nput 4 4\nget 1\nget 3\nget 4\n', expectedOutput: '1 -1 -1 3 4\n', isHidden: false, description: 'Standard LRU operations' },
      { input: '1\nput 1 1\nget 1\n', expectedOutput: '1\n', isHidden: false, description: 'Capacity 1' },
      { input: '3\nput 1 1\nput 2 2\nput 3 3\nput 4 4\nget 4\nget 3\nget 2\nget 1\n', expectedOutput: '4 3 2 -1\n', isHidden: true, description: 'Eviction order test' },
    ],
  },
  {
    title: 'Number of Islands',
    difficulty: 'Medium',
    topic: 'Graph',
    company: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    description: 'Given an m x n 2D binary grid which represents a map of "1"s (land) and "0"s (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.',
    constraints: ['1 ≤ m, n ≤ 300', 'grid[i][j] is "0" or "1"'],
    examples: [
      { input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', output: '1', explanation: 'One large island' },
      { input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: '3', explanation: 'Three separate islands' },
    ],
    solutionApproach: 'Use DFS. When you find a "1", increment count and perform DFS to mark all connected land as visited.',
    optimalComplexity: { time: 'O(m*n)', space: 'O(m*n)' },
    testCases: [
      { input: '4 5\n11110\n11010\n11000\n00000\n', expectedOutput: '1\n', isHidden: false, description: 'One island' },
      { input: '4 5\n11000\n11000\n00100\n00011\n', expectedOutput: '3\n', isHidden: false, description: 'Three islands' },
      { input: '1 1\n0\n', expectedOutput: '0\n', isHidden: false, description: 'No land' },
      { input: '3 3\n111\n101\n111\n', expectedOutput: '1\n', isHidden: true, description: 'Donut island' },
      { input: '1 1\n1\n', expectedOutput: '1\n', isHidden: true, description: 'Single cell' },
    ],
  },
  {
    title: 'Top K Frequent Elements',
    difficulty: 'Medium',
    topic: 'Heap',
    company: ['Amazon', 'Meta', 'Microsoft', 'Google'],
    description: 'Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.',
    constraints: ['1 ≤ nums.length ≤ 10^5', '-10^4 ≤ nums[i] ≤ 10^4', 'k is in the range [1, the number of unique elements]', 'It is guaranteed that the answer is unique'],
    examples: [
      { input: 'nums = [1,1,1,2,2,3], k = 2', output: '[1,2]', explanation: '1 appears 3 times, 2 appears 2 times' },
    ],
    solutionApproach: 'Use a min-heap of size k, or the quickselect algorithm for O(n) average time.',
    optimalComplexity: { time: 'O(n log k)', space: 'O(n)' },
    testCases: [
      { input: '1 1 1 2 2 3\n2\n', expectedOutput: '1 2\n', isHidden: false, description: 'Standard case' },
      { input: '1\n1\n', expectedOutput: '1\n', isHidden: false, description: 'Single element' },
      { input: '1 2 3 4 5 6 7 8 9 10\n3\n', expectedOutput: '1 2 3\n', isHidden: true, description: 'All unique frequencies' },
      { input: '4 1 -1 2 -1 2 3\n2\n', expectedOutput: '-1 2\n', isHidden: true, description: 'Negative numbers' },
    ],
  },
  {
    title: 'Course Schedule',
    difficulty: 'Medium',
    topic: 'Graph',
    company: ['Google', 'Meta', 'Amazon'],
    description: 'There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take ai. Return true if you can finish all courses. Otherwise, return false.',
    constraints: ['1 ≤ numCourses ≤ 2000', '0 ≤ prerequisites.length ≤ 5000', '0 ≤ ai, bi < numCourses'],
    examples: [
      { input: 'numCourses = 2, prerequisites = [[1,0]]', output: 'true', explanation: 'To take course 1, take course 0 first. Possible.' },
      { input: 'numCourses = 2, prerequisites = [[1,0],[0,1]]', output: 'false', explanation: 'Cycle detected' },
    ],
    solutionApproach: 'Use topological sort (Kahn\'s algorithm) or detect cycle in directed graph via DFS.',
    optimalComplexity: { time: 'O(V+E)', space: 'O(V+E)' },
    testCases: [
      { input: '2\n1 0\n', expectedOutput: 'true\n', isHidden: false, description: 'Simple dependency' },
      { input: '2\n1 0\n0 1\n', expectedOutput: 'false\n', isHidden: false, description: 'Cycle' },
      { input: '1\n\n', expectedOutput: 'true\n', isHidden: false, description: 'No prerequisites' },
      { input: '4\n1 0\n2 1\n3 2\n', expectedOutput: 'true\n', isHidden: true, description: 'Linear chain' },
      { input: '3\n1 0\n0 2\n2 1\n', expectedOutput: 'false\n', isHidden: true, description: 'Three node cycle' },
    ],
  },
  {
    title: 'Serialize and Deserialize Binary Tree',
    difficulty: 'Hard',
    topic: 'Tree',
    company: ['Google', 'Amazon', 'Microsoft'],
    description: 'Design an algorithm to serialize and deserialize a binary tree. Serialization is the process of converting a data structure or object into a sequence of bits so that it can be stored. Deserialization is the reverse process.',
    constraints: ['0 ≤ number of nodes ≤ 10^4', '-1000 ≤ Node.val ≤ 1000'],
    examples: [
      { input: 'root = [1,2,3,null,null,4,5]', output: '[1,2,3,null,null,4,5]', explanation: 'Tree round-trips through serialization' },
    ],
    solutionApproach: 'Use preorder traversal with a marker for null nodes. Rebuild using the same order.',
    optimalComplexity: { time: 'O(n)', space: 'O(n)' },
    testCases: [
      { input: '1 2 3 null null 4 5\n', expectedOutput: '1 2 3 null null 4 5\n', isHidden: false, description: 'Standard tree' },
      { input: '\n', expectedOutput: '\n', isHidden: false, description: 'Empty tree' },
      { input: '1\n', expectedOutput: '1\n', isHidden: false, description: 'Single node' },
      { input: '1 2 null 3 null 4 null\n', expectedOutput: '1 2 null 3 null 4 null\n', isHidden: true, description: 'Left-skewed tree' },
    ],
  },
  {
    title: 'Sliding Window Maximum',
    difficulty: 'Hard',
    topic: 'Sliding Window',
    company: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    description: 'You are given an array of integers nums and an integer k. There is a sliding window of size k moving from the very left to the very right. You can only see the k numbers in the window. Each time the sliding window moves right by one position. Return the max of each sliding window.',
    constraints: ['1 ≤ nums.length ≤ 10^5', '-10^4 ≤ nums[i] ≤ 10^4', '1 ≤ k ≤ nums.length'],
    examples: [
      { input: 'nums = [1,3,-1,-3,5,3,6,7], k = 3', output: '[3,3,5,5,6,7]', explanation: 'Window maximums' },
    ],
    solutionApproach: 'Use a deque to maintain indices of elements in decreasing order. The front is always the max.',
    optimalComplexity: { time: 'O(n)', space: 'O(k)' },
    testCases: [
      { input: '1 3 -1 -3 5 3 6 7\n3\n', expectedOutput: '3 3 5 5 6 7\n', isHidden: false, description: 'Standard case' },
      { input: '1\n1\n', expectedOutput: '1\n', isHidden: false, description: 'Single element' },
      { input: '1 -1\n1\n', expectedOutput: '1 -1\n', isHidden: false, description: 'Window size 1' },
      { input: '9 8 7 6 5 4 3 2 1\n3\n', expectedOutput: '9 8 7 6 5 4 3\n', isHidden: true, description: 'Decreasing sequence' },
    ],
  },
  {
    title: 'Median of Two Sorted Arrays',
    difficulty: 'Hard',
    topic: 'Binary Search',
    company: ['Google', 'Amazon', 'Microsoft', 'Apple'],
    description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log(m+n)).',
    constraints: ['0 ≤ m, n ≤ 1000', '1 ≤ m+n ≤ 2000', '-10^6 ≤ nums1[i], nums2[i] ≤ 10^6'],
    examples: [
      { input: 'nums1 = [1,3], nums2 = [2]', output: '2.0', explanation: 'Median is 2.0' },
      { input: 'nums1 = [1,2], nums2 = [3,4]', output: '2.5', explanation: 'Median is (2+3)/2 = 2.5' },
    ],
    solutionApproach: 'Use binary search on the smaller array to find the correct partition point.',
    optimalComplexity: { time: 'O(log(min(m,n)))', space: 'O(1)' },
    testCases: [
      { input: '1 3\n2\n', expectedOutput: '2.0\n', isHidden: false, description: 'Odd total' },
      { input: '1 2\n3 4\n', expectedOutput: '2.5\n', isHidden: false, description: 'Even total' },
      { input: '\n1\n', expectedOutput: '1.0\n', isHidden: false, description: 'One array empty' },
      { input: '0 0\n0 0\n', expectedOutput: '0.0\n', isHidden: true, description: 'All zeros' },
      { input: '1\n2 3 4 5 6\n', expectedOutput: '3.5\n', isHidden: true, description: 'Uneven sizes' },
    ],
  },
  {
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    topic: 'Two Pointers',
    company: ['Amazon', 'Google', 'Microsoft', 'Apple'],
    description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    constraints: ['1 ≤ n ≤ 2 * 10^4', '0 ≤ height[i] ≤ 10^5'],
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6', explanation: 'Trapped water is 6 units' },
    ],
    solutionApproach: 'Use two pointers tracking max heights from both ends. Move the smaller pointer inward.',
    optimalComplexity: { time: 'O(n)', space: 'O(1)' },
    testCases: [
      { input: '0 1 0 2 1 0 1 3 2 1 2 1\n', expectedOutput: '6\n', isHidden: false, description: 'Standard case' },
      { input: '4 2 0 3 2 5\n', expectedOutput: '9\n', isHidden: false, description: 'Another standard case' },
      { input: '1 2 3 4 5\n', expectedOutput: '0\n', isHidden: false, description: 'Increasing no water' },
      { input: '5 4 3 2 1\n', expectedOutput: '0\n', isHidden: true, description: 'Decreasing no water' },
      { input: '0 0 0 0\n', expectedOutput: '0\n', isHidden: true, description: 'Flat no water' },
    ],
  },
]

async function main() {
  await prisma.assessmentAnswer.deleteMany()
  await prisma.assessmentAttempt.deleteMany()
  await prisma.assessmentQuestion.deleteMany()
  await prisma.assessment.deleteMany()
  await prisma.companyChance.deleteMany()
  await prisma.placementScore.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.testCase.deleteMany()
  await prisma.codingSubmission.deleteMany()
  await prisma.codingSession.deleteMany()
  await prisma.interviewMessage.deleteMany()
  await prisma.interviewSession.deleteMany()
  await prisma.roadmapWeek.deleteMany()
  await prisma.roadmap.deleteMany()
  await prisma.gapAnalysis.deleteMany()
  await prisma.resume.deleteMany()
  await prisma.problem.deleteMany()
  await prisma.user.deleteMany()

  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: 'user-1', email: 'rahul@college.edu', name: 'Rahul Kumar',
        passwordHash: PASSWORD, college: 'IIT Bombay', branch: 'CSE', graduationYear: 2025,
        profile: { create: { currentLevel: 'Intermediate', targetCompany: 'Google', leetcodeUsername: 'rahul_k', githubUsername: 'rahulk' } }
      }
    }),
    prisma.user.create({
      data: {
        id: 'user-2', email: 'priya@college.edu', name: 'Priya Sharma',
        passwordHash: PASSWORD, college: 'NIT Trichy', branch: 'IT', graduationYear: 2025,
        profile: { create: { currentLevel: 'Advanced', targetCompany: 'Microsoft', leetcodeUsername: 'priya_s', githubUsername: 'priyasharma' } }
      }
    }),
    prisma.user.create({
      data: {
        id: 'user-3', email: 'amit@college.edu', name: 'Amit Patel',
        passwordHash: PASSWORD, college: 'BITS Pilani', branch: 'ECE', graduationYear: 2026,
        profile: { create: { currentLevel: 'Beginner', targetCompany: 'TCS', leetcodeUsername: 'amit_p', githubUsername: 'amitpatel' } }
      }
    }),
    prisma.user.create({
      data: {
        id: 'user-4', email: 'sneha@college.edu', name: 'Sneha Reddy',
        passwordHash: PASSWORD, college: 'IIIT Hyderabad', branch: 'CSE', graduationYear: 2025,
        profile: { create: { currentLevel: 'Advanced', targetCompany: 'Amazon', leetcodeUsername: 'sneha_r', githubUsername: 'snehareddy' } }
      }
    }),
    prisma.user.create({
      data: {
        id: 'user-5', email: 'vikram@college.edu', name: 'Vikram Singh',
        passwordHash: PASSWORD, college: 'VIT Vellore', branch: 'CSE', graduationYear: 2026,
        profile: { create: { currentLevel: 'Intermediate', targetCompany: 'Infosys', leetcodeUsername: 'vikram_s', githubUsername: 'vikramsingh' } }
      }
    }),
  ])

  console.log(`Created ${users.length} users`)

  await prisma.placementScore.create({
    data: {
      userId: 'user-1', aptitude: 78, dsa: 65, coreSubjects: 72, communication: 80, resumeScore: 85, overall: 74,
      companyChances: {
        create: [
          { companyName: 'TCS', chancePercent: 92 },
          { companyName: 'Infosys', chancePercent: 85 },
          { companyName: 'Wipro', chancePercent: 78 },
          { companyName: 'Microsoft', chancePercent: 55 },
          { companyName: 'Amazon', chancePercent: 42 },
          { companyName: 'Google', chancePercent: 28 },
        ]
      }
    }
  })

  const problems = []
  for (const p of problemDefinitions) {
    const problem = await prisma.problem.create({
      data: {
        title: p.title,
        difficulty: p.difficulty,
        topic: p.topic,
        companyTags: p.company,
        description: p.description,
        solutionApproach: p.solutionApproach,
        optimalComplexity: p.optimalComplexity,
        starterCode: starterCode,
        funcSignature: funcSignatures,
        constraints: p.constraints,
        examples: p.examples,
      },
    })
    problems.push(problem)

    for (let i = 0; i < p.testCases.length; i++) {
      const tc = p.testCases[i]
      await prisma.testCase.create({
        data: {
          problemId: problem.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden,
          orderIndex: i,
          description: tc.description,
        },
      })
    }
  }

  console.log(`Created ${problems.length} problems with test cases`)

  console.log('Seeding assessment data...')
  const { seedAssessments } = await import('./seed-assessments')
  await seedAssessments()
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
