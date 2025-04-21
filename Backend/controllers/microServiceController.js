export const generateQuiz = async (req, res) => {
    const { courseId, topic } = req.body;
    
    // Get course content from DB
    const course = await Course.findById(courseId)
      .select('syllabus');
      
    // Call AI Service (example using OpenAI)
    const prompt = `Generate 5 MCQ questions about ${topic} based on: ${course.syllabus}`;
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }]
    });
    
    // Parse response and save to DB
    const quiz = await Quiz.create({
      course: courseId,
      questions: parseQuestions(response.choices[0].message.content)
    });
    
    res.json(quiz);
  };
  