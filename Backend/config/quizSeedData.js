// Backend/config/quizSeedData.js

export default [
  {
    title: 'HTML Fundamentals',
    description: 'Learn the fundamentals of HTML markup',
    questions: [
      {
        questionText: 'What does HTML stand for?',
        questionType: 'multiple-choice',
        options: [
          { text: 'Hyper Text Markup Language', isCorrect: true },
          { text: 'Home Tool Markup Language', isCorrect: false },
          { text: 'Hyperlinks and Text Markup Language', isCorrect: false },
          { text: 'Hyperlinking Text Mark Language', isCorrect: false }
        ],
        points: 1
      },
      {
        questionText: 'Which tag is used to create a hyperlink in HTML?',
        questionType: 'multiple-choice',
        options: [
          { text: '<a>', isCorrect: true },
          { text: '<link>', isCorrect: false },
          { text: '<href>', isCorrect: false },
          { text: '<hyper>', isCorrect: false }
        ],
        points: 1
      }
    ]
  },
  {
    title: 'CSS Basics',
    description: 'Style your web pages with CSS',
    questions: [
      {
        questionText: 'What does CSS stand for?',
        questionType: 'multiple-choice',
        options: [
          { text: 'Cascading Style Sheets', isCorrect: true },
          { text: 'Creative Style System', isCorrect: false },
          { text: 'Computer Style Sheet', isCorrect: false },
          { text: 'Colorful Style Sheets', isCorrect: false }
        ],
        points: 1
      },
      {
        questionText: 'Which property is used to change the background color?',
        questionType: 'multiple-choice',
        options: [
          { text: 'color', isCorrect: false },
          { text: 'background-color', isCorrect: true },
          { text: 'bgcolor', isCorrect: false },
          { text: 'background', isCorrect: false }
        ],
        points: 1
      }
    ]
  },
  {
    title: 'JavaScript Essentials',
    description: 'Make your pages interactive with JavaScript',
    questions: [
      {
        questionText: 'Which keyword declares a variable in JavaScript?',
        questionType: 'multiple-choice',
        options: [
          { text: 'var', isCorrect: true },
          { text: 'let', isCorrect: true },
          { text: 'const', isCorrect: true },
          { text: 'All of the above', isCorrect: true }
        ],
        points: 1
      },
      {
        questionText: 'What is the output of 2 + "2" in JavaScript?',
        questionType: 'multiple-choice',
        options: [
          { text: '4', isCorrect: false },
          { text: '22', isCorrect: true },
          { text: 'NaN', isCorrect: false },
          { text: 'undefined', isCorrect: false }
        ],
        points: 1
      }
    ]
  }
];
