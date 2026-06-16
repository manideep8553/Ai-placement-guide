import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

export async function seedAssessments() {
  const aptitudeAssessment = await prisma.assessment.create({
    data: {
      title: 'Aptitude Assessment',
      description: 'Test your quantitative aptitude, logical reasoning, and verbal ability skills. Essential for clearing the first round of most campus placements.',
      type: 'APTITUDE',
      duration: 45,
      totalQuestions: 35,
      totalMarks: 35,
      passingMarks: 18,
      questions: {
        create: [
          ...aptitudeQuantQuestions(),
          ...aptitudeReasoningQuestions(),
          ...aptitudeVerbalQuestions(),
        ]
      }
    }
  })
  console.log('Created Aptitude Assessment:', aptitudeAssessment.id)

  const technicalAssessment = await prisma.assessment.create({
    data: {
      title: 'Technical Assessment',
      description: 'Comprehensive technical test covering DBMS, OOP, Operating Systems, Computer Networks, and SQL. Core subject knowledge evaluation.',
      type: 'TECHNICAL',
      duration: 50,
      totalQuestions: 35,
      totalMarks: 35,
      passingMarks: 20,
      questions: {
        create: [
          ...technicalDbmsQuestions(),
          ...technicalOopQuestions(),
          ...technicalOsQuestions(),
          ...technicalCnQuestions(),
          ...technicalSqlQuestions(),
        ]
      }
    }
  })
  console.log('Created Technical Assessment:', technicalAssessment.id)

  const codingAssessment = await prisma.assessment.create({
    data: {
      title: 'Coding Assessment',
      description: 'Data Structures & Algorithms multiple choice questions followed by hands-on coding problems. Supports Java, Python, JavaScript, and C++.',
      type: 'CODING',
      duration: 90,
      totalQuestions: 35,
      totalMarks: 60,
      passingMarks: 30,
      questions: {
        create: [
          ...codingDsaMcqQuestions(),
          ...codingProblemsData(),
        ]
      }
    }
  })
  console.log('Created Coding Assessment:', codingAssessment.id)

  const fullAssessment = await prisma.assessment.create({
    data: {
      title: 'Full Placement Test',
      description: 'Complete placement simulation covering aptitude, technical, coding, and verbal sections. Mirrors the actual campus placement pattern.',
      type: 'FULL_PLACEMENT',
      duration: 90,
      totalQuestions: 40,
      totalMarks: 40,
      passingMarks: 22,
      questions: {
        create: [
          ...fullPlacementQuestions(),
        ]
      }
    }
  })
  console.log('Created Full Placement Test:', fullAssessment.id)

  const productAssessment = await prisma.assessment.create({
    data: {
      title: 'Product Company Assessment',
      description: 'Designed for top product-based companies. Covers System Design, advanced DSA, product sense, and problem-solving at scale.',
      type: 'PRODUCT_COMPANY',
      duration: 75,
      totalQuestions: 35,
      totalMarks: 35,
      passingMarks: 22,
      questions: {
        create: [
          ...productSystemDesignQuestions(),
          ...productDsaQuestions(),
          ...productSenseQuestions(),
          ...productAdvancedQuestions(),
        ]
      }
    }
  })
  console.log('Created Product Company Assessment:', productAssessment.id)
}

function mcq(text: string, options: { label: string; value: string }[], correctAnswer: string, explanation: string, difficulty: string, topic: string, marks = 1) {
  return {
    questionType: 'MCQ',
    questionData: { text, options, correctAnswer, explanation },
    difficulty,
    topic,
    marks,
  }
}

function codingQ(title: string, description: string, constraints: string, sampleInput: string, sampleOutput: string, testCases: { input: string; expected: string }[], starterCode: any, difficulty: string, topic: string) {
  return {
    questionType: 'CODING',
    questionData: { title, description, constraints, sampleInput, sampleOutput, testCases, starterCode },
    difficulty,
    topic,
    marks: 5,
  }
}

// ============ APTITUDE: QUANTITATIVE (15 questions) ============
function aptitudeQuantQuestions() {
  const qs = [
    mcq('A train 150 m long passes a pole in 15 seconds. What is the speed of the train in km/h?',
      [{label: 'A', value: '30 km/h'}, {label: 'B', value: '36 km/h'}, {label: 'C', value: '45 km/h'}, {label: 'D', value: '54 km/h'}],
      'B', 'Speed = Distance/Time = 150/15 = 10 m/s = 10 × 18/5 = 36 km/h', 'EASY', 'Quantitative Aptitude'),
    mcq('If the simple interest on a sum of money for 2 years at 5% per annum is Rs. 500, what is the sum?',
      [{label: 'A', value: 'Rs. 4000'}, {label: 'B', value: 'Rs. 5000'}, {label: 'C', value: 'Rs. 6000'}, {label: 'D', value: 'Rs. 5500'}],
      'B', 'SI = P×R×T/100 => 500 = P×5×2/100 => P = 500×100/10 = Rs. 5000', 'EASY', 'Quantitative Aptitude'),
    mcq('A bag contains 4 red, 5 blue, and 6 green balls. Two balls are drawn at random. What is the probability that both are blue?',
      [{label: 'A', value: '2/21'}, {label: 'B', value: '5/21'}, {label: 'C', value: '4/21'}, {label: 'D', value: '1/21'}],
      'A', 'Total = 15. P(both blue) = C(5,2)/C(15,2) = 10/105 = 2/21', 'MEDIUM', 'Quantitative Aptitude'),
    mcq('If x² + 1/x² = 34, find x + 1/x, where x > 0.',
      [{label: 'A', value: '4'}, {label: 'B', value: '6'}, {label: 'C', value: '8'}, {label: 'D', value: '10'}],
      'B', '(x + 1/x)² = x² + 1/x² + 2 = 34 + 2 = 36, so x + 1/x = 6', 'MEDIUM', 'Quantitative Aptitude'),
    mcq('A shopkeeper sells an item at a 20% discount on the marked price and still makes a 10% profit. If the marked price is Rs. 500, what is the cost price?',
      [{label: 'A', value: 'Rs. 360.36'}, {label: 'B', value: 'Rs. 363.63'}, {label: 'C', value: 'Rs. 375.00'}, {label: 'D', value: 'Rs. 400.00'}],
      'B', 'SP = 500 × 0.8 = 400. CP = SP/1.1 = 400/1.1 = Rs. 363.63', 'MEDIUM', 'Quantitative Aptitude'),
    mcq('The ratio of ages of A and B is 3:5. After 8 years, the ratio becomes 5:7. Find A\'s present age.',
      [{label: 'A', value: '10 years'}, {label: 'B', value: '12 years'}, {label: 'C', value: '15 years'}, {label: 'D', value: '18 years'}],
      'B', 'Let ages be 3x and 5x. (3x+8)/(5x+8) = 5/7 => 21x+56 = 25x+40 => 4x=16 => x=4. A = 3×4 = 12', 'EASY', 'Quantitative Aptitude'),
    mcq('How many three-digit numbers are divisible by 7?',
      [{label: 'A', value: '128'}, {label: 'B', value: '129'}, {label: 'C', value: '130'}, {label: 'D', value: '127'}],
      'A', 'First = 105, Last = 994. n = (994-105)/7 + 1 = 889/7 + 1 = 127 + 1 = 128', 'MEDIUM', 'Quantitative Aptitude'),
    mcq('A can do a piece of work in 10 days, B can do it in 15 days. They work together for 3 days, then A leaves. How many more days will B take to finish?',
      [{label: 'A', value: '6.5 days'}, {label: 'B', value: '7.5 days'}, {label: 'C', value: '8 days'}, {label: 'D', value: '5.5 days'}],
      'B', 'A+B 3 day work = 3(1/10+1/15) = 3(5/30) = 1/2. Remaining = 1/2. B takes (1/2)/(1/15) = 7.5 days', 'HARD', 'Quantitative Aptitude'),
    mcq('What is the compound interest on Rs. 10,000 at 10% per annum for 2 years compounded annually?',
      [{label: 'A', value: 'Rs. 2100'}, {label: 'B', value: 'Rs. 2000'}, {label: 'C', value: 'Rs. 2200'}, {label: 'D', value: 'Rs. 2050'}],
      'A', 'A = 10000(1.1)² = 12100. CI = 12100-10000 = Rs. 2100', 'EASY', 'Quantitative Aptitude'),
    mcq('A boat goes 30 km upstream and 44 km downstream in 10 hours. In 13 hours, it goes 40 km upstream and 55 km downstream. Find the speed of the stream.',
      [{label: 'A', value: '2 km/h'}, {label: 'B', value: '3 km/h'}, {label: 'C', value: '4 km/h'}, {label: 'D', value: '5 km/h'}],
      'B', 'Let speed in still water = x, stream = y. 30/(x-y)+44/(x+y)=10, 40/(x-y)+55/(x+y)=13. Solving: x-y=10, x+y=22 => x=16, y=3', 'HARD', 'Quantitative Aptitude'),
    mcq('The average of 25 numbers is 36. If the average of the first 13 numbers is 32 and the average of the last 13 numbers is 39, find the 13th number.',
      [{label: 'A', value: '21'}, {label: 'B', value: '23'}, {label: 'C', value: '25'}, {label: 'D', value: '27'}],
      'B', 'Sum of 25 = 900. First13 sum = 416. Last13 sum = 507. 13th = 416+507-900 = 23', 'HARD', 'Quantitative Aptitude'),
    mcq('A man sold two horses for Rs. 20,000 each. On one he gained 20% and on the other he lost 20%. Find the overall gain or loss percentage.',
      [{label: 'A', value: '4% gain'}, {label: 'B', value: '4% loss'}, {label: 'C', value: 'No gain no loss'}, {label: 'D', value: '2% loss'}],
      'B', 'CP1 = 20000/1.2 = 16666.67, CP2 = 20000/0.8 = 25000. Total CP = 41666.67, Total SP = 40000. Loss = 4%', 'MEDIUM', 'Quantitative Aptitude'),
    mcq('If log₂(x² - 4x + 7) = 2, find x.',
      [{label: 'A', value: '1 or 3'}, {label: 'B', value: '2 or 4'}, {label: 'C', value: '0 or 4'}, {label: 'D', value: '1 or 2'}],
      'A', 'x² - 4x + 7 = 2² = 4 => x² - 4x + 3 = 0 => (x-1)(x-3) = 0 => x = 1 or 3', 'MEDIUM', 'Quantitative Aptitude'),
    mcq('A pipe can fill a tank in 12 hours. Another pipe can empty it in 15 hours. How long will they take to fill the tank if both are opened?',
      [{label: 'A', value: '60 hours'}, {label: 'B', value: '50 hours'}, {label: 'C', value: '45 hours'}, {label: 'D', value: '55 hours'}],
      'A', 'Net = 1/12 - 1/15 = (5-4)/60 = 1/60. Time = 60 hours', 'EASY', 'Quantitative Aptitude'),
    mcq('A train 250 m long running at 72 km/h crosses a platform in 30 seconds. Find the length of the platform.',
      [{label: 'A', value: '350 m'}, {label: 'B', value: '400 m'}, {label: 'C', value: '450 m'}, {label: 'D', value: '300 m'}],
      'A', 'Speed = 72×5/18 = 20 m/s. Total distance = 20×30 = 600 m. Platform = 600-250 = 350 m', 'MEDIUM', 'Quantitative Aptitude'),
  ]
  return qs.map((q, i) => ({ ...q, orderIndex: i + 1 }))
}

// ============ APTITUDE: LOGICAL REASONING (10 questions) ============
function aptitudeReasoningQuestions() {
  const qs = [
    mcq('Find the missing number: 2, 6, 18, 54, ?',
      [{label: 'A', value: '108'}, {label: 'B', value: '162'}, {label: 'C', value: '144'}, {label: 'D', value: '180'}],
      'B', 'Each term is multiplied by 3: 54×3 = 162', 'EASY', 'Logical Reasoning'),
    mcq('If FISH is coded as EHRG, then how is BIRD coded?',
      [{label: 'A', value: 'AHQC'}, {label: 'B', value: 'CJSE'}, {label: 'C', value: 'AHRC'}, {label: 'D', value: 'CHSE'}],
      'A', 'Each letter is replaced by the previous letter. B→A, I→H, R→Q, D→C => AHQC', 'MEDIUM', 'Logical Reasoning'),
    mcq('All pens are books. All books are tables. Which conclusion is definitely true?',
      [{label: 'A', value: 'All tables are pens'}, {label: 'B', value: 'All pens are tables'}, {label: 'C', value: 'Some tables are not books'}, {label: 'D', value: 'No pens are tables'}],
      'B', 'If all pens are books and all books are tables, then all pens are tables by transitivity.', 'EASY', 'Logical Reasoning'),
    mcq('In a row of 40 students facing north, Ravi is 15th from the left. How many students are to his right?',
      [{label: 'A', value: '24'}, {label: 'B', value: '25'}, {label: 'C', value: '26'}, {label: 'D', value: '15'}],
      'B', 'Students to right = 40 - 15 = 25', 'EASY', 'Logical Reasoning'),
    mcq('Find the odd one out: 4, 9, 16, 25, 36, 49, 56',
      [{label: 'A', value: '9'}, {label: 'B', value: '25'}, {label: 'C', value: '49'}, {label: 'D', value: '56'}],
      'D', 'All are perfect squares except 56', 'EASY', 'Logical Reasoning'),
    mcq('A man walks 5 km east, turns right and walks 3 km, turns right and walks 5 km. How far is he from the starting point?',
      [{label: 'A', value: '5 km'}, {label: 'B', value: '3 km'}, {label: 'C', value: '8 km'}, {label: 'D', value: '2 km'}],
      'B', 'The east-west movement cancels out (5 east, 5 west). He ends 3 km south of start.', 'MEDIUM', 'Logical Reasoning'),
    mcq('Statement: All engineers are smart. Some smart people are rich. Conclusion I: Some engineers are rich. Conclusion II: Some rich people are smart.',
      [{label: 'A', value: 'Only I follows'}, {label: 'B', value: 'Only II follows'}, {label: 'C', value: 'Both follow'}, {label: 'D', value: 'Neither follows'}],
      'B', 'I does not follow (no direct link). II follows (some smart are rich = some rich are smart).', 'MEDIUM', 'Logical Reasoning'),
    mcq('Complete the analogy: Book : Chapter :: Tree : ?',
      [{label: 'A', value: 'Root'}, {label: 'B', value: 'Branch'}, {label: 'C', value: 'Leaf'}, {label: 'D', value: 'Forest'}],
      'B', 'A book is composed of chapters; a tree is composed of branches.', 'EASY', 'Logical Reasoning'),
    mcq('If today is Thursday, what day will it be after 72 days?',
      [{label: 'A', value: 'Saturday'}, {label: 'B', value: 'Sunday'}, {label: 'C', value: 'Monday'}, {label: 'D', value: 'Friday'}],
      'A', '72 mod 7 = 2 (remainder). Thursday + 2 = Saturday', 'EASY', 'Logical Reasoning'),
    mcq('6 persons A, B, C, D, E, F sit in a circle. A is between F and B, C is between E and D. Who is opposite A?',
      [{label: 'A', value: 'B'}, {label: 'B', value: 'C'}, {label: 'C', value: 'D'}, {label: 'D', value: 'E'}],
      'B', 'Arranging: F-A-B and E-C-D in alternate positions. C is opposite A.', 'HARD', 'Logical Reasoning'),
  ]
  return qs.map((q, i) => ({ ...q, orderIndex: i + 16 }))
}

// ============ APTITUDE: VERBAL ABILITY (10 questions) ============
function aptitudeVerbalQuestions() {
  const qs = [
    mcq('Choose the synonym of "Ubiquitous":',
      [{label: 'A', value: 'Rare'}, {label: 'B', value: 'Omnipresent'}, {label: 'C', value: 'Unique'}, {label: 'D', value: 'Scarce'}],
      'B', 'Ubiquitous means present everywhere, synonymous with omnipresent.', 'MEDIUM', 'Verbal Ability'),
    mcq('Select the correct spelling:',
      [{label: 'A', value: 'Accommodate'}, {label: 'B', value: 'Acomodate'}, {label: 'C', value: 'Accomodate'}, {label: 'D', value: 'Acommodate'}],
      'A', 'Accommodate has two c\'s and two m\'s.', 'EASY', 'Verbal Ability'),
    mcq('The committee _____ divided on the issue of budget allocation.',
      [{label: 'A', value: 'are'}, {label: 'B', value: 'is'}, {label: 'C', value: 'were'}, {label: 'D', value: 'have been'}],
      'B', 'Committee is a collective noun treated as singular in American English.', 'MEDIUM', 'Verbal Ability'),
    mcq('Find the antonym of "Ephemeral":',
      [{label: 'A', value: 'Temporary'}, {label: 'B', value: 'Fleeting'}, {label: 'C', value: 'Permanent'}, {label: 'D', value: 'Brief'}],
      'C', 'Ephemeral means short-lived; permanent is its opposite.', 'MEDIUM', 'Verbal Ability'),
    mcq('Choose the correct preposition: He is proficient _____ Java programming.',
      [{label: 'A', value: 'at'}, {label: 'B', value: 'in'}, {label: 'C', value: 'on'}, {label: 'D', value: 'with'}],
      'B', 'Proficient in is the correct idiom.', 'EASY', 'Verbal Ability'),
    mcq('Identify the figure of speech: "The world is a stage."',
      [{label: 'A', value: 'Simile'}, {label: 'B', value: 'Metaphor'}, {label: 'C', value: 'Personification'}, {label: 'D', value: 'Hyperbole'}],
      'B', 'A direct comparison without using "like" or "as" is a metaphor.', 'EASY', 'Verbal Ability'),
    mcq('Rearrange to form a meaningful sentence: P: the project Q: completed R: the team S: successfully T: before the deadline',
      [{label: 'A', value: 'R-P-Q-S-T'}, {label: 'B', value: 'R-Q-P-S-T'}, {label: 'C', value: 'R-P-S-Q-T'}, {label: 'D', value: 'R-P-Q-T-S'}],
      'A', 'The team completed the project successfully before the deadline.', 'MEDIUM', 'Verbal Ability'),
    mcq('Choose the word that best fills the blank: The _____ of the research was questioned by many scientists.',
      [{label: 'A', value: 'veracity'}, {label: 'B', value: 'voracity'}, {label: 'C', value: 'velocity'}, {label: 'D', value: 'versatility'}],
      'A', 'Veracity means truthfulness or accuracy, fitting the context.', 'HARD', 'Verbal Ability'),
    mcq('Select the grammatically correct sentence:',
      [{label: 'A', value: 'Neither the manager nor his colleagues was present.'}, {label: 'B', value: 'Neither the manager nor his colleagues were present.'}, {label: 'C', value: 'Neither the manager nor his colleagues is present.'}, {label: 'D', value: 'Neither the manager nor his colleagues has been present.'}],
      'B', 'With "neither...nor", the verb agrees with the nearest subject (colleagues = plural).', 'HARD', 'Verbal Ability'),
    mcq('What is the meaning of the idiom "To burn the midnight oil"?',
      [{label: 'A', value: 'To waste time'}, {label: 'B', value: 'To work late into the night'}, {label: 'C', value: 'To get angry'}, {label: 'D', value: 'To start a fire'}],
      'B', 'Burning the midnight oil means working or studying late at night.', 'EASY', 'Verbal Ability'),
  ]
  return qs.map((q, i) => ({ ...q, orderIndex: i + 26 }))
}

// ============ TECHNICAL: DBMS (8 questions) ============
function technicalDbmsQuestions() {
  const qs = [
    mcq('Which of the following is a valid normal form?',
      [{label: 'A', value: '1NF'}, {label: 'B', value: '0NF'}, {label: 'C', value: '5NF'}, {label: 'D', value: 'Both A and C'}],
      'D', '1NF and 5NF (and up to BCNF/4NF/5NF) are valid normal forms.', 'EASY', 'DBMS'),
    mcq('What is the full form of ACID in databases?',
      [{label: 'A', value: 'Atomicity, Consistency, Isolation, Durability'}, {label: 'B', value: 'Accuracy, Consistency, Integrity, Durability'}, {label: 'C', value: 'Atomicity, Consistency, Integrity, Durability'}, {label: 'D', value: 'Accuracy, Consistency, Isolation, Durability'}],
      'A', 'ACID stands for Atomicity, Consistency, Isolation, Durability.', 'EASY', 'DBMS'),
    mcq('Which SQL command is used to remove a table from the database?',
      [{label: 'A', value: 'DELETE'}, {label: 'B', value: 'DROP'}, {label: 'C', value: 'REMOVE'}, {label: 'D', value: 'TRUNCATE'}],
      'B', 'DROP TABLE removes the table structure and data permanently.', 'EASY', 'DBMS'),
    mcq('What is a primary key?',
      [{label: 'A', value: 'A key that uniquely identifies each record'}, {label: 'B', value: 'A key that references another table'}, {label: 'C', value: 'A key that can have NULL values'}, {label: 'D', value: 'A key used for indexing'}],
      'A', 'A primary key uniquely identifies each row and cannot be NULL.', 'EASY', 'DBMS'),
    mcq('Which of the following is a type of JOIN in SQL?',
      [{label: 'A', value: 'INNER JOIN'}, {label: 'B', value: 'OUTER JOIN'}, {label: 'C', value: 'CROSS JOIN'}, {label: 'D', value: 'All of the above'}],
      'D', 'INNER, OUTER (LEFT, RIGHT, FULL), and CROSS are all valid JOIN types.', 'MEDIUM', 'DBMS'),
    mcq('What is a transaction in DBMS?',
      [{label: 'A', value: 'A set of operations that form a logical unit of work'}, {label: 'B', value: 'A single SQL query'}, {label: 'C', value: 'A way to backup data'}, {label: 'D', value: 'A database object'}],
      'A', 'A transaction is a logical unit of work comprising one or more SQL operations.', 'MEDIUM', 'DBMS'),
    mcq('What does the SQL HAVING clause do?',
      [{label: 'A', value: 'Filters rows before GROUP BY'}, {label: 'B', value: 'Filters groups after GROUP BY'}, {label: 'C', value: 'Filters columns in SELECT'}, {label: 'D', value: 'Orders the result set'}],
      'B', 'HAVING is used to filter groups created by GROUP BY, like WHERE but for groups.', 'MEDIUM', 'DBMS'),
    mcq('What is the difference between DELETE and TRUNCATE?',
      [{label: 'A', value: 'DELETE can be rolled back, TRUNCATE cannot'}, {label: 'B', value: 'TRUNCATE can be rolled back, DELETE cannot'}, {label: 'C', value: 'Both can be rolled back'}, {label: 'D', value: 'Neither can be rolled back'}],
      'A', 'DELETE is DML (can be rolled back), TRUNCATE is DDL (cannot be rolled back in most DBMS).', 'HARD', 'DBMS'),
  ]
  return qs.map((q, i) => ({ ...q, orderIndex: i + 1 }))
}

// ============ TECHNICAL: OOP (7 questions) ============
function technicalOopQuestions() {
  const qs = [
    mcq('Which of the following is not a pillar of OOP?',
      [{label: 'A', value: 'Encapsulation'}, {label: 'B', value: 'Inheritance'}, {label: 'C', value: 'Polymorphism'}, {label: 'D', value: 'Compilation'}],
      'D', 'The four pillars of OOP are: Encapsulation, Inheritance, Polymorphism, and Abstraction.', 'EASY', 'OOP'),
    mcq('What is method overloading?',
      [{label: 'A', value: 'Multiple methods with same name but different parameters'}, {label: 'B', value: 'Multiple methods with same name and same parameters'}, {label: 'C', value: 'A method calling itself'}, {label: 'D', value: 'A method that overrides a parent method'}],
      'A', 'Method overloading allows multiple methods with the same name but different parameter lists.', 'EASY', 'OOP'),
    mcq('What is a constructor?',
      [{label: 'A', value: 'A method that destroys an object'}, {label: 'B', value: 'A special method called when an object is instantiated'}, {label: 'C', value: 'A method that returns the object state'}, {label: 'D', value: 'A static method of a class'}],
      'B', 'A constructor is called automatically when an object is created to initialize it.', 'EASY', 'OOP'),
    mcq('Which access modifier makes a member accessible only within the same class?',
      [{label: 'A', value: 'public'}, {label: 'B', value: 'protected'}, {label: 'C', value: 'private'}, {label: 'D', value: 'default'}],
      'C', 'Private members are accessible only within the class they are defined.', 'MEDIUM', 'OOP'),
    mcq('What is polymorphism?',
      [{label: 'A', value: 'The ability of an object to take many forms'}, {label: 'B', value: 'The ability to protect data'}, {label: 'C', value: 'The ability to inherit from multiple classes'}, {label: 'D', value: 'The ability to create multiple objects'}],
      'A', 'Polymorphism allows objects of different types to respond to the same method call.', 'MEDIUM', 'OOP'),
    mcq('What is an abstract class?',
      [{label: 'A', value: 'A class that cannot be instantiated and may contain abstract methods'}, {label: 'B', value: 'A class that has only static methods'}, {label: 'C', value: 'A class that can be instantiated directly'}, {label: 'D', value: 'A class with only private members'}],
      'A', 'Abstract classes cannot be instantiated and serve as base classes for other classes.', 'MEDIUM', 'OOP'),
    mcq('Which concept allows a subclass to provide a specific implementation of a method already defined in its superclass?',
      [{label: 'A', value: 'Method Overloading'}, {label: 'B', value: 'Method Overriding'}, {label: 'C', value: 'Method Hiding'}, {label: 'D', value: 'Method Chaining'}],
      'B', 'Method overriding allows a subclass to provide its own implementation of a parent class method.', 'MEDIUM', 'OOP'),
  ]
  return qs.map((q, i) => ({ ...q, orderIndex: i + 9 }))
}

// ============ TECHNICAL: OS (7 questions) ============
function technicalOsQuestions() {
  const qs = [
    mcq('Which scheduling algorithm is non-preemptive?',
      [{label: 'A', value: 'Round Robin'}, {label: 'B', value: 'FCFS'}, {label: 'C', value: 'SRTF'}, {label: 'D', value: 'Priority Scheduling (Preemptive)'}],
      'B', 'FCFS (First Come First Served) is non-preemptive.', 'EASY', 'Operating Systems'),
    mcq('What is a deadlock?',
      [{label: 'A', value: 'A process that never terminates'}, {label: 'B', value: 'A set of processes each waiting for a resource held by another'}, {label: 'C', value: 'A process in infinite loop'}, {label: 'D', value: 'A process that consumes too much memory'}],
      'B', 'Deadlock occurs when two or more processes are each waiting for resources held by the others.', 'MEDIUM', 'Operating Systems'),
    mcq('What is virtual memory?',
      [{label: 'A', value: 'Memory that physically exists on the RAM'}, {label: 'B', value: 'A technique that uses disk space as an extension of RAM'}, {label: 'C', value: 'A type of cache memory'}, {label: 'D', value: 'Memory used by virtual machines'}],
      'B', 'Virtual memory allows the system to use disk space to simulate additional RAM.', 'MEDIUM', 'Operating Systems'),
    mcq('Which of the following is a page replacement algorithm?',
      [{label: 'A', value: 'FCFS'}, {label: 'B', value: 'LRU'}, {label: 'C', value: 'SJF'}, {label: 'D', value: 'Priority'}],
      'B', 'LRU (Least Recently Used) is a page replacement algorithm.', 'EASY', 'Operating Systems'),
    mcq('What is a semaphore?',
      [{label: 'A', value: 'A hardware device'}, {label: 'B', value: 'A synchronization primitive'}, {label: 'C', value: 'A type of process'}, {label: 'D', value: 'A memory management unit'}],
      'B', 'A semaphore is a variable used for controlling access to shared resources in concurrent systems.', 'MEDIUM', 'Operating Systems'),
    mcq('What is the optimal page replacement algorithm?',
      [{label: 'A', value: 'FIFO'}, {label: 'B', value: 'LRU'}, {label: 'C', value: 'Optimal (Belady\'s)'}, {label: 'D', value: 'Clock'}],
      'C', 'The Optimal algorithm (Belady\'s) replaces the page that will not be used for the longest time. It is theoretical.', 'HARD', 'Operating Systems'),
    mcq('Which system call creates a new process in Unix?',
      [{label: 'A', value: 'exec()'}, {label: 'B', value: 'fork()'}, {label: 'C', value: 'wait()'}, {label: 'D', value: 'exit()'}],
      'B', 'fork() creates a new process by duplicating the calling process.', 'EASY', 'Operating Systems'),
  ]
  return qs.map((q, i) => ({ ...q, orderIndex: i + 16 }))
}

// ============ TECHNICAL: CN (7 questions) ============
function technicalCnQuestions() {
  const qs = [
    mcq('What does TCP stand for?',
      [{label: 'A', value: 'Transmission Control Protocol'}, {label: 'B', value: 'Transfer Control Protocol'}, {label: 'C', value: 'Transmission Communication Protocol'}, {label: 'D', value: 'Transport Control Protocol'}],
      'A', 'TCP stands for Transmission Control Protocol.', 'EASY', 'Computer Networks'),
    mcq('Which layer of OSI model is responsible for routing?',
      [{label: 'A', value: 'Data Link Layer'}, {label: 'B', value: 'Network Layer'}, {label: 'C', value: 'Transport Layer'}, {label: 'D', value: 'Application Layer'}],
      'B', 'The Network Layer (Layer 3) handles routing and forwarding.', 'EASY', 'Computer Networks'),
    mcq('What is the default port for HTTP?',
      [{label: 'A', value: '443'}, {label: 'B', value: '80'}, {label: 'C', value: '8080'}, {label: 'D', value: '21'}],
      'B', 'HTTP uses port 80 by default.', 'EASY', 'Computer Networks'),
    mcq('What is a MAC address?',
      [{label: 'A', value: 'A 32-bit IP address'}, {label: 'B', value: 'A 48-bit unique hardware identifier'}, {label: 'C', value: 'A 64-bit network address'}, {label: 'D', value: 'A routing protocol address'}],
      'B', 'MAC (Media Access Control) address is a 48-bit unique identifier assigned to network interfaces.', 'MEDIUM', 'Computer Networks'),
    mcq('Which protocol is used for email transmission?',
      [{label: 'A', value: 'FTP'}, {label: 'B', value: 'SMTP'}, {label: 'C', value: 'HTTP'}, {label: 'D', value: 'SNMP'}],
      'B', 'SMTP (Simple Mail Transfer Protocol) is used for sending emails.', 'MEDIUM', 'Computer Networks'),
    mcq('What is the difference between TCP and UDP?',
      [{label: 'A', value: 'TCP is connectionless, UDP is connection-oriented'}, {label: 'B', value: 'TCP is connection-oriented, UDP is connectionless'}, {label: 'C', value: 'Both are connection-oriented'}, {label: 'D', value: 'Both are connectionless'}],
      'B', 'TCP is connection-oriented (reliable, ordered), UDP is connectionless (faster, no guarantee).', 'MEDIUM', 'Computer Networks'),
    mcq('What is CIDR notation?',
      [{label: 'A', value: 'A method for IP address allocation using subnet masks in slash notation'}, {label: 'B', value: 'A routing protocol'}, {label: 'C', value: 'A type of network cable'}, {label: 'D', value: 'A DNS record type'}],
      'A', 'CIDR (Classless Inter-Domain Routing) uses notation like 192.168.1.0/24 for subnetting.', 'HARD', 'Computer Networks'),
  ]
  return qs.map((q, i) => ({ ...q, orderIndex: i + 23 }))
}

// ============ TECHNICAL: SQL (6 questions) ============
function technicalSqlQuestions() {
  const qs = [
    mcq('Which SQL statement is used to retrieve data from a database?',
      [{label: 'A', value: 'SELECT'}, {label: 'B', value: 'GET'}, {label: 'C', value: 'FETCH'}, {label: 'D', value: 'READ'}],
      'A', 'SELECT is used to query data from a database.', 'EASY', 'SQL'),
    mcq('What is a foreign key?',
      [{label: 'A', value: 'A key that uniquely identifies a row'}, {label: 'B', value: 'A field that references the primary key of another table'}, {label: 'C', value: 'A key that can have duplicate values'}, {label: 'D', value: 'A key used for full-text search'}],
      'B', 'A foreign key is a column that creates a link between two tables by referencing a primary key.', 'EASY', 'SQL'),
    mcq('Which aggregate function returns the number of rows?',
      [{label: 'A', value: 'SUM()'}, {label: 'B', value: 'AVG()'}, {label: 'C', value: 'COUNT()'}, {label: 'D', value: 'MAX()'}],
      'C', 'COUNT() returns the number of rows that match a specified condition.', 'EASY', 'SQL'),
    mcq('What is the purpose of a JOIN clause?',
      [{label: 'A', value: 'To combine rows from two or more tables based on a related column'}, {label: 'B', value: 'To add new rows to a table'}, {label: 'C', value: 'To delete rows from a table'}, {label: 'D', value: 'To create a new table'}],
      'A', 'JOIN combines columns from multiple tables based on a related column.', 'MEDIUM', 'SQL'),
    mcq('What does the GROUP BY clause do?',
      [{label: 'A', value: 'Sorts the result set'}, {label: 'B', value: 'Groups rows that have the same values'}, {label: 'C', value: 'Filters rows based on a condition'}, {label: 'D', value: 'Limits the number of rows returned'}],
      'B', 'GROUP BY groups rows with the same values into summary rows.', 'MEDIUM', 'SQL'),
    mcq('What is a subquery?',
      [{label: 'A', value: 'A query that runs before the main query'}, {label: 'B', value: 'A nested query inside another query'}, {label: 'C', value: 'A query that returns no results'}, {label: 'D', value: 'A query with multiple SELECT statements'}],
      'B', 'A subquery (inner query) is a query nested within another SQL query.', 'MEDIUM', 'SQL'),
  ]
  return qs.map((q, i) => ({ ...q, orderIndex: i + 30 }))
}

// ============ CODING: DSA MCQ (25 questions) ============
function codingDsaMcqQuestions() {
  const qs = [
    mcq('What is the time complexity of binary search?',
      [{label: 'A', value: 'O(n)'}, {label: 'B', value: 'O(log n)'}, {label: 'C', value: 'O(n²)'}, {label: 'D', value: 'O(n log n)'}],
      'B', 'Binary search divides the search space in half each iteration, giving O(log n) time complexity.', 'EASY', 'DSA'),
    mcq('Which data structure uses FIFO (First In First Out)?',
      [{label: 'A', value: 'Stack'}, {label: 'B', value: 'Queue'}, {label: 'C', value: 'Tree'}, {label: 'D', value: 'Graph'}],
      'B', 'Queue follows FIFO principle, while Stack follows LIFO.', 'EASY', 'DSA'),
    mcq('What is the worst-case time complexity of quicksort?',
      [{label: 'A', value: 'O(n log n)'}, {label: 'B', value: 'O(n²)'}, {label: 'C', value: 'O(n)'}, {label: 'D', value: 'O(log n)'}],
      'B', 'Quicksort has O(n²) worst case (when pivot is always smallest/largest), but O(n log n) average.', 'MEDIUM', 'DSA'),
    mcq('Which traversal visits the root before its subtrees?',
      [{label: 'A', value: 'Inorder'}, {label: 'B', value: 'Preorder'}, {label: 'C', value: 'Postorder'}, {label: 'D', value: 'Level order'}],
      'B', 'Preorder traversal: Root → Left → Right.', 'EASY', 'DSA'),
    mcq('What is the space complexity of recursive Fibonacci?',
      [{label: 'A', value: 'O(1)'}, {label: 'B', value: 'O(n)'}, {label: 'C', value: 'O(2ⁿ)'}, {label: 'D', value: 'O(log n)'}],
      'B', 'Recursive call stack depth is n, so space complexity is O(n).', 'MEDIUM', 'DSA'),
    mcq('Which data structure is best for implementing LRU cache?',
      [{label: 'A', value: 'Array'}, {label: 'B', value: 'HashMap + Doubly Linked List'}, {label: 'C', value: 'Stack'}, {label: 'D', value: 'Binary Tree'}],
      'B', 'HashMap provides O(1) lookup, doubly linked list provides O(1) removal/insertion at ends.', 'HARD', 'DSA'),
    mcq('What is a balanced binary tree?',
      [{label: 'A', value: 'A tree where every node has two children'}, {label: 'B', value: 'A tree where the height difference of left and right subtrees is at most 1 for all nodes'}, {label: 'C', value: 'A tree with all leaf nodes at the same level'}, {label: 'D', value: 'A tree that is sorted'}],
      'B', 'A balanced tree maintains the height difference constraint to ensure O(log n) operations.', 'MEDIUM', 'DSA'),
    mcq('What is the time complexity of inserting into a hash table?',
      [{label: 'A', value: 'O(n)'}, {label: 'B', value: 'O(1) average'}, {label: 'C', value: 'O(log n)'}, {label: 'D', value: 'O(n²)'}],
      'B', 'Hash table insertion is O(1) on average, but O(n) worst case due to collisions.', 'EASY', 'DSA'),
    mcq('Which algorithm finds the shortest path in an unweighted graph?',
      [{label: 'A', value: 'Dijkstra'}, {label: 'B', value: 'BFS'}, {label: 'C', value: 'DFS'}, {label: 'D', value: 'Bellman-Ford'}],
      'B', 'BFS explores level by level, guaranteeing the shortest path in unweighted graphs.', 'MEDIUM', 'DSA'),
    mcq('What is a priority queue typically implemented with?',
      [{label: 'A', value: 'Array'}, {label: 'B', value: 'Heap'}, {label: 'C', value: 'Hash Table'}, {label: 'D', value: 'Linked List'}],
      'B', 'Priority queues are typically implemented using a heap for O(log n) insert/delete operations.', 'EASY', 'DSA'),
    mcq('What is the output of preorder traversal of a BST?',
      [{label: 'A', value: 'Sorted ascending order'}, {label: 'B', value: 'Root first, then left, then right'}, {label: 'C', value: 'Left, Root, Right'}, {label: 'D', value: 'Right, Root, Left'}],
      'B', 'Preorder: Root → Left → Right. Inorder gives sorted order in BST.', 'EASY', 'DSA'),
    mcq('Which sorting algorithm is stable?',
      [{label: 'A', value: 'Quick Sort'}, {label: 'B', value: 'Merge Sort'}, {label: 'C', value: 'Heap Sort'}, {label: 'D', value: 'Selection Sort'}],
      'B', 'Merge sort is stable (preserves relative order of equal elements).', 'MEDIUM', 'DSA'),
    mcq('What does DFS stand for?',
      [{label: 'A', value: 'Depth First Search'}, {label: 'B', value: 'Deep First Search'}, {label: 'C', value: 'Depth Fast Search'}, {label: 'D', value: 'Deep Fast Search'}],
      'A', 'DFS stands for Depth First Search.', 'EASY', 'DSA'),
    mcq('What is the minimum number of stacks needed to implement a queue?',
      [{label: 'A', value: '1'}, {label: 'B', value: '2'}, {label: 'C', value: '3'}, {label: 'D', value: '4'}],
      'B', 'Two stacks are needed: one for enqueue, one for dequeue operations.', 'MEDIUM', 'DSA'),
    mcq('What is the time complexity of finding the median of two sorted arrays?',
      [{label: 'A', value: 'O(n+m)'}, {label: 'B', value: 'O(log(min(n,m)))'}, {label: 'C', value: 'O(n²)'}, {label: 'D', value: 'O(1)'}],
      'B', 'Using binary search, we can find median in O(log(min(n,m))) time.', 'HARD', 'DSA'),
    mcq('What is the difference between a Stack and a Queue?',
      [{label: 'A', value: 'Stack is LIFO, Queue is FIFO'}, {label: 'B', value: 'Stack is FIFO, Queue is LIFO'}, {label: 'C', value: 'Both are LIFO'}, {label: 'D', value: 'Both are FIFO'}],
      'A', 'Stack: Last In First Out. Queue: First In First Out.', 'EASY', 'DSA'),
    mcq('In a complete binary tree, what is the maximum number of nodes at level h (root at level 0)?',
      [{label: 'A', value: '2ʰ'}, {label: 'B', value: '2ʰ⁺¹'}, {label: 'C', value: '2ʰ - 1'}, {label: 'D', value: '2ʰ⁺¹ - 1'}],
      'A', 'At level h, a binary tree can have at most 2ʰ nodes.', 'MEDIUM', 'DSA'),
    mcq('Which data structure is used for implementing recursion?',
      [{label: 'A', value: 'Queue'}, {label: 'B', value: 'Stack'}, {label: 'C', value: 'Array'}, {label: 'D', value: 'Linked List'}],
      'B', 'The call stack, implemented as a stack, manages function calls and returns in recursion.', 'EASY', 'DSA'),
    mcq('What is the time complexity of Dijkstra\'s algorithm?',
      [{label: 'A', value: 'O(V+E)'}, {label: 'B', value: 'O(V²) or O((V+E)log V) with heap'}, {label: 'C', value: 'O(V·E)'}, {label: 'D', value: 'O(E log V)'}],
      'B', 'Dijkstra: O(V²) with array, O((V+E)log V) with binary heap.', 'MEDIUM', 'DSA'),
    mcq('What is a trie data structure used for?',
      [{label: 'A', value: 'Sorting numbers'}, {label: 'B', value: 'Efficient string search and prefix matching'}, {label: 'C', value: 'Graph traversal'}, {label: 'D', value: 'Matrix multiplication'}],
      'B', 'Tries are tree-like structures optimized for string storage, search, and prefix queries.', 'HARD', 'DSA'),
    mcq('What is the worst-case time complexity of linear search?',
      [{label: 'A', value: 'O(log n)'}, {label: 'B', value: 'O(n)'}, {label: 'C', value: 'O(1)'}, {label: 'D', value: 'O(n²)'}],
      'B', 'Linear search checks each element, so worst case is O(n).', 'EASY', 'DSA'),
    mcq('Which algorithm is used for topological sorting?',
      [{label: 'A', value: 'Dijkstra'}, {label: 'B', value: 'DFS-based algorithm'}, {label: 'C', value: 'Kruskal'}, {label: 'D', value: 'Floyd-Warshall'}],
      'B', 'Topological sorting uses DFS or Kahn\'s algorithm (BFS-based).', 'MEDIUM', 'DSA'),
    mcq('What is a segment tree used for?',
      [{label: 'A', value: 'Range queries and updates'}, {label: 'B', value: 'Graph traversal'}, {label: 'C', value: 'String matching'}, {label: 'D', value: 'Sorting'}],
      'A', 'Segment trees efficiently answer range queries (sum, min, max) with point/range updates.', 'HARD', 'DSA'),
    mcq('What is the time complexity of merge sort?',
      [{label: 'A', value: 'O(n)'}, {label: 'B', value: 'O(n log n)'}, {label: 'C', value: 'O(n²)'}, {label: 'D', value: 'O(log n)'}],
      'B', 'Merge sort always runs in O(n log n) time with O(n) space.', 'EASY', 'DSA'),
    mcq('What data structure is typically used for BFS?',
      [{label: 'A', value: 'Stack'}, {label: 'B', value: 'Queue'}, {label: 'C', value: 'Heap'}, {label: 'D', value: 'Hash Table'}],
      'B', 'BFS uses a queue to process vertices level by level.', 'EASY', 'DSA'),
  ]
  return qs.map((q, i) => ({ ...q, orderIndex: i + 1 }))
}

// ============ CODING: CODING PROBLEMS (10 problems) ============
function codingProblemsData() {
  const starterCode = {
    python: 'def solution(arr):\n    # Write your code here\n    pass\n',
    java: 'public class Solution {\n    public static int[] solution(int[] arr) {\n        // Write your code here\n        return new int[]{};\n    }\n}\n',
    javascript: 'function solution(arr) {\n    // Write your code here\n    return [];\n}\n',
    cpp: '#include <vector>\nusing namespace std;\n\nvector<int> solution(vector<int>& arr) {\n    // Write your code here\n    return {};\n}\n'
  }

  return [
    codingQ('Two Sum',
      'Given an array of integers nums and an integer target, return indices of the two numbers that add up to target. You may assume that each input has exactly one solution and you may not use the same element twice.',
      '2 ≤ nums.length ≤ 10⁴\n-10⁹ ≤ nums[i] ≤ 10⁹\n-10⁹ ≤ target ≤ 10⁹',
      'nums = [2,7,11,15], target = 9',
      '[0, 1]',
      [{input: '([2,7,11,15], 9)', expected: '[0,1]'}, {input: '([3,2,4], 6)', expected: '[1,2]'}, {input: '([3,3], 6)', expected: '[0,1]'}],
      { ...starterCode }, 'EASY', 'DSA'),
    codingQ('Valid Parentheses',
      'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid. An input string is valid if open brackets are closed in the correct order.',
      '1 ≤ s.length ≤ 10⁴\ns consists of parentheses only',
      's = "()[]{}"',
      'true',
      [{input: '("()[]{}")', expected: 'true'}, {input: '("(]")', expected: 'false'}, {input: '("({[]})")', expected: 'true'}],
      { ...starterCode }, 'EASY', 'DSA'),
    codingQ('Merge Two Sorted Lists',
      'Merge two sorted linked lists and return it as a sorted list. The list should be made by splicing together the nodes of the first two lists.',
      '0 ≤ list length ≤ 50\n-100 ≤ Node.val ≤ 100',
      'l1 = [1,2,4], l2 = [1,3,4]',
      '[1,1,2,3,4,4]',
      [{input: '([1,2,4], [1,3,4])', expected: '[1,1,2,3,4,4]'}, {input: '([], [0])', expected: '[0]'}, {input: '([], [])', expected: '[]'}],
      { ...starterCode }, 'EASY', 'DSA'),
    codingQ('Maximum Subarray',
      'Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.',
      '1 ≤ nums.length ≤ 10⁵\n-10⁴ ≤ nums[i] ≤ 10⁴',
      'nums = [-2,1,-3,4,-1,2,1,-5,4]',
      '6',
      [{input: '([-2,1,-3,4,-1,2,1,-5,4])', expected: '6'}, {input: '([1])', expected: '1'}, {input: '([-1])', expected: '-1'}],
      { ...starterCode }, 'MEDIUM', 'DSA'),
    codingQ('Reverse Linked List',
      'Reverse a singly linked list and return the head of the reversed list.',
      '0 ≤ list length ≤ 5000\n-5000 ≤ Node.val ≤ 5000',
      'head = [1,2,3,4,5]',
      '[5,4,3,2,1]',
      [{input: '([1,2,3,4,5])', expected: '[5,4,3,2,1]'}, {input: '([1,2])', expected: '[2,1]'}, {input: '([])', expected: '[]'}],
      { ...starterCode }, 'EASY', 'DSA'),
    codingQ('Longest Substring Without Repeating Characters',
      'Given a string s, find the length of the longest substring without repeating characters.',
      '0 ≤ s.length ≤ 5×10⁴\ns consists of English letters, digits, symbols, and spaces',
      's = "abcabcbb"',
      '3',
      [{input: '("abcabcbb")', expected: '3'}, {input: '("bbbbb")', expected: '1'}, {input: '("pwwkew")', expected: '3'}],
      { ...starterCode }, 'MEDIUM', 'DSA'),
    codingQ('Binary Tree Level Order Traversal',
      'Given the root of a binary tree, return the level order traversal of its nodes\' values (left to right, level by level).',
      '0 ≤ tree nodes ≤ 2000\n-1000 ≤ Node.val ≤ 1000',
      'root = [3,9,20,null,null,15,7]',
      '[[3],[9,20],[15,7]]',
      [{input: '([3,9,20,null,null,15,7])', expected: '[[3],[9,20],[15,7]]'}, {input: '([1])', expected: '[[1]]'}, {input: '([])', expected: '[]'}],
      { ...starterCode }, 'MEDIUM', 'DSA'),
    codingQ('LRU Cache',
      'Design a data structure that follows the constraints of an LRU (Least Recently Used) cache. Implement get and put operations in O(1) average time.',
      '1 ≤ capacity ≤ 3000\n-10⁴ ≤ key, value ≤ 10⁴',
      'LRUCache lRUCache = new LRUCache(2); lRUCache.put(1,1); lRUCache.put(2,2); lRUCache.get(1); lRUCache.put(3,3); lRUCache.get(2);',
      '[null, null, null, 1, null, -1]',
      [{input: '([2], [put(1,1)], [put(2,2)], [get(1)], [put(3,3)], [get(2)])', expected: '[null,null,null,1,null,-1]'}],
      { ...starterCode, python: 'class LRUCache:\n    def __init__(self, capacity: int):\n        pass\n    def get(self, key: int) -> int:\n        pass\n    def put(self, key: int, value: int) -> None:\n        pass\n',
        java: 'import java.util.*;\nclass LRUCache {\n    public LRUCache(int capacity) {}\n    public int get(int key) { return -1; }\n    public void put(int key, int value) {}\n}\n',
        javascript: 'class LRUCache {\n    constructor(capacity) {}\n    get(key) { return -1; }\n    put(key, value) {}\n}\n',
        cpp: '#include <unordered_map>\nusing namespace std;\nclass LRUCache {\npublic:\n    LRUCache(int capacity) {}\n    int get(int key) { return -1; }\n    void put(int key, int value) {}\n};\n' }, 'HARD', 'DSA'),
    codingQ('Clone Graph',
      'Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph. Each node contains a val and a list of neighbors.',
      '0 ≤ nodes ≤ 100\n1 ≤ Node.val ≤ 100',
      'adjList = [[2,4],[1,3],[2,4],[1,3]]',
      '[[2,4],[1,3],[2,4],[1,3]]',
      [{input: '([[2,4],[1,3],[2,4],[1,3]])', expected: '[[2,4],[1,3],[2,4],[1,3]]'}, {input: '([[]])', expected: '[[]]'}, {input: '([])', expected: '[]'}],
      { ...starterCode }, 'MEDIUM', 'DSA'),
    codingQ('Serialize and Deserialize Binary Tree',
      'Design an algorithm to serialize and deserialize a binary tree. Serialization is converting a tree to a string, and deserialization converts the string back to the tree.',
      '0 ≤ tree nodes ≤ 10⁴\n-1000 ≤ Node.val ≤ 1000',
      'root = [1,2,3,null,null,4,5]',
      '[1,2,3,null,null,4,5]',
      [{input: '([1,2,3,null,null,4,5])', expected: '[1,2,3,null,null,4,5]'}, {input: '([])', expected: '[]'}, {input: '([1])', expected: '[1]'}],
      { ...starterCode, python: '# Definition for a binary tree node.\n# class TreeNode(object):\n#     def __init__(self, x):\n#         self.val = x\n#         self.left = None\n#         self.right = None\n\nclass Codec:\n    def serialize(self, root):\n        pass\n    def deserialize(self, data):\n        pass\n',
        java: '// Definition for a binary tree node.\n// public class TreeNode {\n//     int val;\n//     TreeNode left;\n//     TreeNode right;\n//     TreeNode(int x) { val = x; }\n// }\n\npublic class Codec {\n    public String serialize(TreeNode root) {}\n    public TreeNode deserialize(String data) {}\n}\n',
        javascript: '// Definition for a binary tree node.\n// function TreeNode(val) {\n//     this.val = val;\n//     this.left = this.right = null;\n// }\n\nvar serialize = function(root) {};\nvar deserialize = function(data) {};\n',
        cpp: '// Definition for a binary tree node.\n// struct TreeNode {\n//     int val;\n//     TreeNode *left;\n//     TreeNode *right;\n//     TreeNode(int x) : val(x), left(NULL), right(NULL) {}\n// };\n\nclass Codec {\npublic:\n    string serialize(TreeNode* root) {}\n    TreeNode* deserialize(string data) {}\n};\n' }, 'HARD', 'DSA'),
  ].map((q, i) => ({ ...q, orderIndex: i + 26 }))
}

// ============ FULL PLACEMENT (40 questions) ============
function fullPlacementQuestions() {
  const quant = aptitudeQuantQuestions().slice(0, 8)
  const reason = aptitudeReasoningQuestions().slice(0, 5)
  const verbal = aptitudeVerbalQuestions().slice(0, 5)
  const dbms = technicalDbmsQuestions().slice(0, 4)
  const oop = technicalOopQuestions().slice(0, 4)
  const os = technicalOsQuestions().slice(0, 4)
  const cn = technicalCnQuestions().slice(0, 4)
  const sql = technicalSqlQuestions().slice(0, 3)
  const dsa = codingDsaMcqQuestions().slice(0, 3)
  return [...quant, ...reason, ...verbal, ...dbms, ...oop, ...os, ...cn, ...sql, ...dsa].map((q, i) => ({
    ...q,
    orderIndex: i + 1,
    questionData: JSON.parse(JSON.stringify(q.questionData)),
  }))
}

// ============ PRODUCT: SYSTEM DESIGN (10 questions) ============
function productSystemDesignQuestions() {
  const qs = [
    mcq('What is the primary purpose of a load balancer?',
      [{label: 'A', value: 'To encrypt network traffic'}, {label: 'B', value: 'To distribute incoming traffic across multiple servers'}, {label: 'C', value: 'To store user sessions'}, {label: 'D', value: 'To manage database connections'}],
      'B', 'A load balancer distributes incoming traffic across multiple servers for high availability and reliability.', 'MEDIUM', 'System Design'),
    mcq('What is microservices architecture?',
      [{label: 'A', value: 'A monolithic application design'}, {label: 'B', value: 'An architecture that structures an app as a collection of loosely coupled services'}, {label: 'C', value: 'A database design pattern'}, {label: 'D', value: 'A frontend development approach'}],
      'B', 'Microservices break down an application into small, independent, loosely coupled services.', 'MEDIUM', 'System Design'),
    mcq('What is CAP theorem?',
      [{label: 'A', value: 'A distributed system can have Consistency, Availability, and Partition tolerance but only two can be guaranteed simultaneously'}, {label: 'B', value: 'A system can have all three: Consistency, Availability, Partition tolerance'}, {label: 'C', value: 'A theorem about CPU performance'}, {label: 'D', value: 'A theorem about database indexing'}],
      'A', 'CAP theorem states that a distributed system can only guarantee two of: Consistency, Availability, Partition Tolerance.', 'HARD', 'System Design'),
    mcq('What is caching and why is it used?',
      [{label: 'A', value: 'A technique to permanently store all data'}, {label: 'B', value: 'Storing frequently accessed data in a fast-access layer to reduce latency'}, {label: 'C', value: 'A method to compress data'}, {label: 'D', value: 'A security mechanism'}],
      'B', 'Caching stores frequently accessed data in a high-speed storage layer to reduce database load and improve response times.', 'EASY', 'System Design'),
    mcq('What is a CDN?',
      [{label: 'A', value: 'A Content Delivery Network - distributed servers that deliver content based on geographic location'}, {label: 'B', value: 'A Central Database Network'}, {label: 'C', value: 'A Code Deployment Network'}, {label: 'D', value: 'A Cryptographic Data Network'}],
      'A', 'A CDN is a distributed network of servers that delivers web content to users based on their geographic location.', 'EASY', 'System Design'),
    mcq('What is sharding in databases?',
      [{label: 'A', value: 'Backing up data'}, {label: 'B', value: 'Horizontal partitioning of data across multiple databases'}, {label: 'C', value: 'Encrypting database contents'}, {label: 'D', value: 'Creating database indexes'}],
      'B', 'Sharding splits a large database into smaller, faster, more manageable parts called shards across multiple servers.', 'HARD', 'System Design'),
    mcq('What is eventual consistency?',
      [{label: 'A', value: 'A consistency model where updates are immediately visible to all nodes'}, {label: 'B', value: 'A consistency model where updates propagate and become visible over time'}, {label: 'C', value: 'A model where data is never consistent'}, {label: 'D', value: 'A database locking mechanism'}],
      'B', 'In eventual consistency, updates are propagated asynchronously and all nodes become consistent over time.', 'HARD', 'System Design'),
    mcq('What is a message queue used for?',
      [{label: 'A', value: 'Storing database records'}, {label: 'B', value: 'Asynchronous communication between services'}, {label: 'C', value: 'Synchronous request-response'}, {label: 'D', value: 'File transfer'}],
      'B', 'Message queues enable asynchronous communication, decoupling services and improving reliability.', 'MEDIUM', 'System Design'),
    mcq('What is the difference between SQL and NoSQL databases?',
      [{label: 'A', value: 'SQL is schema-based and relational; NoSQL is schema-flexible and non-relational'}, {label: 'B', value: 'SQL is faster than NoSQL'}, {label: 'C', value: 'NoSQL cannot handle structured data'}, {label: 'D', value: 'SQL cannot scale horizontally'}],
      'A', 'SQL databases are relational with fixed schemas; NoSQL databases offer flexible schemas and horizontal scaling.', 'MEDIUM', 'System Design'),
    mcq('What is a reverse proxy?',
      [{label: 'A', value: 'A server that forwards requests from clients to backend servers'}, {label: 'B', value: 'A proxy that clients use to access the internet'}, {label: 'C', value: 'A database proxy'}, {label: 'D', value: 'A caching layer'}],
      'A', 'A reverse proxy sits between clients and backend servers, forwarding requests and providing security, load balancing, and caching.', 'MEDIUM', 'System Design'),
  ]
  return qs.map((q, i) => ({ ...q, orderIndex: i + 1 }))
}

// ============ PRODUCT: DSA ADVANCED (10 questions) ============
function productDsaQuestions() {
  const qs = [
    mcq('What is the time complexity of the Floyd-Warshall algorithm?',
      [{label: 'A', value: 'O(V³)'}, {label: 'B', value: 'O(V²)'}, {label: 'C', value: 'O(V·E)'}, {label: 'D', value: 'O(E log V)'}],
      'A', 'Floyd-Warshall has O(V³) time complexity for finding shortest paths between all pairs.', 'HARD', 'DSA'),
    mcq('Which data structure is used to implement a disjoint set (Union-Find)?',
      [{label: 'A', value: 'Array'}, {label: 'B', value: 'Tree'}, {label: 'C', value: 'Graph'}, {label: 'D', value: 'Hash Table'}],
      'B', 'Union-Find is typically implemented as a forest of trees where each node points to its parent.', 'MEDIUM', 'DSA'),
    mcq('What is the time complexity of counting sort?',
      [{label: 'A', value: 'O(n+k) where k is the range of input'}, {label: 'B', value: 'O(n log n)'}, {label: 'C', value: 'O(n²)'}, {label: 'D', value: 'O(log n)'}],
      'A', 'Counting sort runs in O(n+k) time where k is the range of input values, making it linear when k = O(n).', 'HARD', 'DSA'),
    mcq('What is a Suffix Array used for?',
      [{label: 'A', value: 'Efficient string searching and substring queries'}, {label: 'B', value: 'Graph traversal'}, {label: 'C', value: 'Matrix operations'}, {label: 'D', value: 'Sorting numbers'}],
      'A', 'Suffix arrays enable efficient substring search, longest common prefix, and other string operations.', 'HARD', 'DSA'),
    mcq('Which algorithm finds the Minimum Spanning Tree?',
      [{label: 'A', value: 'Dijkstra'}, {label: 'B', value: 'Kruskal'}, {label: 'C', value: 'Floyd-Warshall'}, {label: 'D', value: 'Bellman-Ford'}],
      'B', 'Kruskal\'s algorithm finds the Minimum Spanning Tree by adding edges in increasing weight order.', 'MEDIUM', 'DSA'),
    mcq('What is a Red-Black Tree?',
      [{label: 'A', value: 'A self-balancing binary search tree with color properties'}, {label: 'B', value: 'A tree that stores colors'}, {label: 'C', value: 'A red-black color scheme'}, {label: 'D', value: 'A type of graph'}],
      'A', 'A Red-Black tree is a self-balancing BST where each node has a color (red/black) to maintain balance.', 'HARD', 'DSA'),
    mcq('What is the time complexity of KMP string matching?',
      [{label: 'A', value: 'O(n+m)'}, {label: 'B', value: 'O(n×m)'}, {label: 'C', value: 'O(n²)'}, {label: 'D', value: 'O(log n)'}],
      'A', 'KMP (Knuth-Morris-Pratt) runs in O(n+m) time where n is text length and m is pattern length.', 'HARD', 'DSA'),
    mcq('What is a Fenwick Tree (Binary Indexed Tree) used for?',
      [{label: 'A', value: 'Prefix sum queries and point updates'}, {label: 'B', value: 'Graph traversal'}, {label: 'C', value: 'String matching'}, {label: 'D', value: 'Shortest path finding'}],
      'A', 'Fenwick Tree efficiently handles prefix sum queries and point updates in O(log n) time.', 'HARD', 'DSA'),
    mcq('What is the space complexity of the sieve of Eratosthenes?',
      [{label: 'A', value: 'O(n)'}, {label: 'B', value: 'O(√n)'}, {label: 'C', value: 'O(n log log n)'}, {label: 'D', value: 'O(1)'}],
      'A', 'Sieve of Eratosthenes uses a boolean array of size n, giving O(n) space complexity.', 'MEDIUM', 'DSA'),
    mcq('What is topological ordering?',
      [{label: 'A', value: 'A linear ordering of vertices in a DAG where each vertex appears before its descendants'}, {label: 'B', value: 'Sorting vertices by their degree'}, {label: 'C', value: 'Arranging vertices in a circle'}, {label: 'D', value: 'A random ordering of vertices'}],
      'A', 'Topological ordering is a linear ordering of vertices in a DAG such that for every edge u→v, u comes before v.', 'MEDIUM', 'DSA'),
  ]
  return qs.map((q, i) => ({ ...q, orderIndex: i + 11 }))
}

// ============ PRODUCT: PRODUCT SENSE (8 questions) ============
function productSenseQuestions() {
  const qs = [
    mcq('What does A/B testing measure?',
      [{label: 'A', value: 'The performance of two different versions of a product feature'}, {label: 'B', value: 'The security of a system'}, {label: 'C', value: 'The code quality'}, {label: 'D', value: 'The database performance'}],
      'A', 'A/B testing compares two versions of a feature to determine which performs better based on user metrics.', 'MEDIUM', 'Product Sense'),
    mcq('What is a KPI in product management?',
      [{label: 'A', value: 'A key performance indicator used to measure product success'}, {label: 'B', value: 'A kernel programming interface'}, {label: 'C', value: 'A knowledge processing index'}, {label: 'D', value: 'A key process integration'}],
      'A', 'KPIs are quantifiable metrics used to evaluate the success of a product or business.', 'EASY', 'Product Sense'),
    mcq('What does DAU stand for?',
      [{label: 'A', value: 'Daily Active Users'}, {label: 'B', value: 'Data Access Unit'}, {label: 'C', value: 'Digital Authentication User'}, {label: 'D', value: 'Daily Application Update'}],
      'A', 'DAU (Daily Active Users) measures the number of unique users who interact with a product daily.', 'EASY', 'Product Sense'),
    mcq('What is a funnel analysis?',
      [{label: 'A', value: 'Analyzing user drop-off at each stage of a process'}, {label: 'B', value: 'Analyzing database queries'}, {label: 'C', value: 'A network analysis technique'}, {label: 'D', value: 'A code review process'}],
      'A', 'Funnel analysis tracks users through a sequence of steps to identify where they drop off.', 'MEDIUM', 'Product Sense'),
    mcq('What is Net Promoter Score (NPS)?',
      [{label: 'A', value: 'A metric measuring customer loyalty and satisfaction'}, {label: 'B', value: 'A networking protocol score'}, {label: 'C', value: 'A code performance metric'}, {label: 'D', value: 'A database optimization score'}],
      'A', 'NPS measures customer experience and predicts business growth based on how likely customers are to recommend the product.', 'MEDIUM', 'Product Sense'),
    mcq('What is product-market fit?',
      [{label: 'A', value: 'When a product satisfies a strong market demand'}, {label: 'B', value: 'When a product is priced correctly'}, {label: 'C', value: 'When a product has good design'}, {label: 'D', value: 'When a product is marketed well'}],
      'A', 'Product-market fit is when a product meets the needs of a large, profitable market.', 'EASY', 'Product Sense'),
    mcq('What is a retention rate?',
      [{label: 'A', value: 'The percentage of users who continue using a product over time'}, {label: 'B', value: 'The rate at which data is stored'}, {label: 'C', value: 'The speed of user acquisition'}, {label: 'D', value: 'The number of new features added'}],
      'A', 'Retention rate measures how many users continue to engage with a product over a specific period.', 'MEDIUM', 'Product Sense'),
    mcq('What is the ICE framework used for?',
      [{label: 'A', value: 'Prioritizing features based on Impact, Confidence, and Ease'}, {label: 'B', value: 'Database indexing'}, {label: 'C', value: 'Code compilation'}, {label: 'D', value: 'System security'}],
      'A', 'ICE framework scores features by Impact, Confidence, and Ease to prioritize product decisions.', 'HARD', 'Product Sense'),
  ]
  return qs.map((q, i) => ({ ...q, orderIndex: i + 21 }))
}

// ============ PRODUCT: ADVANCED TOPICS (7 questions) ============
function productAdvancedQuestions() {
  const qs = [
    mcq('What is a Bloom filter?',
      [{label: 'A', value: 'A space-efficient probabilistic data structure for set membership testing'}, {label: 'B', value: 'A type of network filter'}, {label: 'C', value: 'An image processing filter'}, {label: 'D', value: 'A database indexing technique'}],
      'A', 'A Bloom filter is a space-efficient probabilistic data structure that can tell if an element is definitely not in a set or possibly in it.', 'HARD', 'Advanced'),
    mcq('What is MapReduce?',
      [{label: 'A', value: 'A programming model for processing large datasets in parallel'}, {label: 'B', value: 'A database schema'}, {label: 'C', value: 'A network protocol'}, {label: 'D', value: 'A frontend framework'}],
      'A', 'MapReduce is a programming model for processing large datasets in a distributed, parallel manner.', 'HARD', 'Advanced'),
    mcq('What is a gossip protocol?',
      [{label: 'A', value: 'A communication protocol where nodes periodically exchange information with random peers'}, {label: 'B', value: 'A protocol for encrypted messaging'}, {label: 'C', value: 'A social media protocol'}, {label: 'D', value: 'A database query protocol'}],
      'A', 'Gossip protocols are used in distributed systems for nodes to share information with random peers periodically.', 'HARD', 'Advanced'),
    mcq('What is a consensus algorithm?',
      [{label: 'A', value: 'An algorithm used to achieve agreement among distributed nodes on a single data value'}, {label: 'B', value: 'An algorithm for sorting data'}, {label: 'C', value: 'A voting system'}, {label: 'D', value: 'A data compression algorithm'}],
      'A', 'Consensus algorithms (like Paxos, Raft) help distributed nodes agree on a single value despite failures.', 'HARD', 'Advanced'),
    mcq('What is the difference between synchronous and asynchronous replication?',
      [{label: 'A', value: 'Sync: data written to all replicas before confirming. Async: data confirmed before all replicas are updated'}, {label: 'B', value: 'Sync is faster than async'}, {label: 'C', value: 'Async is always consistent'}, {label: 'D', value: 'There is no difference'}],
      'A', 'Synchronous replication ensures all replicas are updated before acknowledgment, while async prioritizes speed over consistency.', 'MEDIUM', 'Advanced'),
    mcq('What is rate limiting and how is it implemented?',
      [{label: 'A', value: 'Controlling the rate of requests to a service using token bucket, leaky bucket, or sliding window algorithms'}, {label: 'B', value: 'Limiting database size'}, {label: 'C', value: 'Restricting user access'}, {label: 'D', value: 'Limiting code execution time'}],
      'A', 'Rate limiting controls request traffic using algorithms like token bucket or sliding window to prevent system overload.', 'MEDIUM', 'Advanced'),
    mcq('What is idempotency in API design?',
      [{label: 'A', value: 'Making multiple identical requests produce the same result as a single request'}, {label: 'B', value: 'Ensuring all requests are unique'}, {label: 'C', value: 'Limiting API access'}, {label: 'D', value: 'Encrypting API responses'}],
      'A', 'An idempotent API ensures that multiple identical requests have the same effect as a single request.', 'MEDIUM', 'Advanced'),
  ]
  return qs.map((q, i) => ({ ...q, orderIndex: i + 29 }))
}

async function main() {
  console.log('Seeding assessments...')
  await seedAssessments()
  console.log('Assessment seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
