import { Question, RoundType } from "./types";

export const QUESTIONS: Question[] = [
  // Round 1: THINK AGAIN (Self-Awareness & Habits)
  {
    id: 1,
    round: RoundType.THINK_AGAIN,
    text: "Which of the following is most likely to cause an energy crash after a meal?",
    options: [
      "Whole wheat bread",
      "White rice with chicken curry",
      "Kottu with chicken and vegetables",
      "A banana with peanut butter"
    ],
    correctAnswer: 1,
    explanation: "White rice and refined carbohydrates cause blood sugar to spike and then crash. Foods with fiber and protein, like whole wheat bread or banana with peanut butter, provide longer-lasting energy.",
    imagePrompt: "Image of white rice with curry showing a sugar spike vs a banana with peanut butter showing stable energy."
  },
  {
    id: 2,
    round: RoundType.THINK_AGAIN,
    text: "Which food is best for muscle recovery after exercise?",
    options: [
      "Fish curry with rice",
      "Coconut roti with sambol",
      "Lean chicken with salad",
      "Watalappam (sweet dessert)"
    ],
    correctAnswer: 2,
    explanation: "Protein-rich foods like lean chicken help repair muscle after exercise. Watalappam, while delicious, is high in sugars and fats and not ideal for recovery.",
    imagePrompt: "Image of lean chicken with salad vs Watalappam with calories and nutrients labeled."
  },
  {
    id: 3,
    round: RoundType.THINK_AGAIN,
    text: "Which of the following provides the best balance of protein, carbs, and fats?",
    options: [
      "Hoppers with coconut milk",
      "Rice and dhal with a side of curry",
      "Fried chicken with chips",
      "Fresh fruit salad"
    ],
    correctAnswer: 1,
    explanation: "Rice and dhal provide a good balance of carbs and protein, essential for muscle repair. Hoppers are nutritious but lack sufficient protein for muscle maintenance.",
    imagePrompt: "Image of rice and dhal with curry vs fried chicken with chips showing protein-carb-fat balance."
  },
  {
    id: 4,
    round: RoundType.THINK_AGAIN,
    text: "What is the best way to ensure your diet supports long-term health?",
    options: [
      "Eating more refined sugars",
      "Balancing carbs, protein, and fats",
      "Drinking soft drinks",
      "Fasting regularly"
    ],
    correctAnswer: 1,
    explanation: "Balancing macros (protein, carbs, fats) is key to long-term health. Extremes like fasting or refined sugars can be harmful in the long run.",
    imagePrompt: "Image of balanced meal (protein, carbs, fats) vs extreme diets (sugary foods)."
  },
  {
    id: 5,
    round: RoundType.THINK_AGAIN,
    text: "How many times this week did you order takeout or fast food?",
    options: [
      "1–2 times",
      "3–4 times",
      "5+ times",
      "I never order takeout"
    ],
    correctAnswer: 2,
    explanation: "Ordering takeout, especially fast food, often includes high-calorie and unhealthy ingredients that contribute to weight gain and low energy.",
    imagePrompt: "Image of fast food (pizza, burger) with calorie breakdown. Bar chart comparing home-cooked meals vs fast food calories."
  },
  // Round 2: REALITY CHECK (Sri Lankan Food Habits)
  {
    id: 6,
    round: RoundType.REALITY_CHECK,
    text: "Which of these meals is likely higher in calories?",
    options: [
      "A plate of Kottu Roti",
      "A bowl of string hoppers with sambol",
      "A small serving of rice and curry with chicken",
      "A plate of vegetable curry with rice"
    ],
    correctAnswer: 0,
    explanation: "Kottu Roti is typically high in oil, carbs, and fats. It’s energy-dense, whereas rice and curry with protein is more balanced.",
    imagePrompt: "Kottu roti with oil splashes vs rice and curry with chicken, showing calorie comparison."
  },
  {
    id: 7,
    round: RoundType.REALITY_CHECK,
    text: "Which of these snacks is the most calorie-dense?",
    options: [
      "Nuts and seeds",
      "Fresh fruit",
      "Chocolate biscuits",
      "Vegetable salad"
    ],
    correctAnswer: 2,
    explanation: "Nuts are healthy but calorie-dense. Eating them in large portions can contribute to weight gain. Chocolate biscuits are loaded with added sugar and fat.",
    imagePrompt: "Image of nuts and seeds vs chocolate biscuits, with calories labeled."
  },
  {
    id: 8,
    round: RoundType.REALITY_CHECK,
    text: "Which drink is most likely contributing to weight gain?",
    options: [
      "Fresh fruit juice with added sugar",
      "Black coffee",
      "Green tea",
      "Water"
    ],
    correctAnswer: 0,
    explanation: "Fruit juice with added sugar has empty calories that contribute to weight gain, even though it may seem healthy. Drinking water or green tea is a better choice.",
    imagePrompt: "Image of fruit juice with sugar vs water and green tea, with sugar content highlighted."
  },
  {
    id: 9,
    round: RoundType.REALITY_CHECK,
    text: "Which is the better option for a quick energy boost at work?",
    options: [
      "A sugary energy drink",
      "A handful of mixed nuts with a piece of fruit",
      "A chocolate bar",
      "A second cup of coffee"
    ],
    correctAnswer: 1,
    explanation: "A handful of mixed nuts and fruit provides natural energy and sustained focus without the crash that comes from sugary snacks or drinks.",
    imagePrompt: "Mixed nuts and fruit vs sugary drinks. Energy chart showing steady energy from nuts and fruit."
  },
  {
    id: 10,
    round: RoundType.REALITY_CHECK,
    text: "What is the healthiest snack option during a long workday?",
    options: [
      "Cookies",
      "A piece of fruit with a small handful of almonds",
      "Chips",
      "Pastries"
    ],
    correctAnswer: 1,
    explanation: "Fruit paired with a handful of almonds offers a balance of fiber, vitamins, and healthy fats that fuel energy throughout the day without excess calories.",
    imagePrompt: "Fruit and almonds vs cookies, chips, and pastries."
  },
  // Round 3: MACRO INTELLIGENCE (Macronutrient Awareness)
  {
    id: 11,
    round: RoundType.MACRO_INTELLIGENCE,
    text: "What’s the main role of protein in your diet?",
    options: [
      "To provide quick energy",
      "To build and repair muscles",
      "To increase fat storage",
      "To keep you hydrated"
    ],
    correctAnswer: 1,
    explanation: "Protein is essential for muscle repair and growth. It helps with tissue recovery and maintains healthy immune function.",
    imagePrompt: "Image of protein-rich foods (chicken, eggs, lentils) with muscle-building icons."
  },
  {
    id: 12,
    round: RoundType.MACRO_INTELLIGENCE,
    text: "Which macronutrient should you prioritize if your goal is to lose fat and preserve muscle?",
    options: [
      "Carbohydrates",
      "Protein",
      "Fats",
      "Fiber"
    ],
    correctAnswer: 1,
    explanation: "To preserve muscle while losing fat, prioritize protein. It helps maintain muscle mass even when you are in a calorie deficit.",
    imagePrompt: "Image of lean protein sources (chicken, beans) with muscle-building icons."
  },
  {
    id: 13,
    round: RoundType.MACRO_INTELLIGENCE,
    text: "What’s the best way to balance macros for a healthy fat-loss goal?",
    options: [
      "High protein, moderate fats, low carbs",
      "High carbs, moderate protein, low fats",
      "Balanced protein, carbs, fats",
      "Low protein, high fats"
    ],
    correctAnswer: 0,
    explanation: "For fat loss, a high-protein diet helps preserve muscle mass while maintaining energy levels. Moderate fats and lower carbs provide a sustainable calorie deficit.",
    imagePrompt: "Pie chart showing the ideal macro split for fat loss."
  },
  {
    id: 14,
    round: RoundType.MACRO_INTELLIGENCE,
    text: "How much protein do you need if you’re active and want to maintain muscle mass?",
    options: [
      "0.8g per kg body weight",
      "1.2g per kg body weight",
      "1.6g–2.2g per kg body weight",
      "3g per kg body weight"
    ],
    correctAnswer: 2,
    explanation: "For active individuals, 1.6g–2.2g per kg body weight is the ideal range for muscle maintenance and recovery.",
    imagePrompt: "Infographic showing the protein range based on body weight."
  },
  {
    id: 15,
    round: RoundType.MACRO_INTELLIGENCE,
    text: "Which of the following is a good source of healthy fats?",
    options: [
      "Butter",
      "Coconut oil",
      "Avocado",
      "Fried chicken"
    ],
    correctAnswer: 2,
    explanation: "Avocados are rich in healthy monounsaturated fats, which help with brain function and heart health.",
    imagePrompt: "Image of avocado vs butter and fried foods with healthy fats icons."
  }
];
