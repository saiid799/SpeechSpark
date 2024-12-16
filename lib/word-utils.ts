import { Question, WordForm } from "@/types/word-learning";

export function generateWordForms(
  forms: WordForm[],
  learningLanguage: string,
  nativeLanguage: string,
  wordIndex: number
): Question[] {
  const questions: Question[] = [];

  // Generate translation questions
  forms.forEach((form, index) => {
    // Recognition question (native to learning language)
    questions.push({
      id: `recognition-${index}`,
      wordIndex,
      question: `How do you say "${form.translation}" in ${learningLanguage}?`,
      options: generateOptions(forms, form.form, true),
      correctAnswer: form.form,
      questionLanguage: "native",
      answerLanguage: "learning",
    });

    // Understanding question (learning to native language)
    questions.push({
      id: `understanding-${index}`,
      wordIndex,
      question: `What does "${form.form}" mean in ${nativeLanguage}?`,
      options: generateOptions(forms, form.translation, false),
      correctAnswer: form.translation,
      questionLanguage: "learning",
      answerLanguage: "native",
    });
  });

  return shuffleArray(questions);
}

function generateOptions(
  forms: WordForm[],
  correctAnswer: string,
  useForm: boolean
): string[] {
  const options = [correctAnswer];
  const allOptions = forms
    .map((f) => (useForm ? f.form : f.translation))
    .filter((o) => o !== correctAnswer);

  while (options.length < 4 && allOptions.length > 0) {
    const randomIndex = Math.floor(Math.random() * allOptions.length);
    options.push(allOptions[randomIndex]);
    allOptions.splice(randomIndex, 1);
  }

  return shuffleArray(options);
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
