/** Example payload for “Import JSON” — shown in admin for copy/paste. */
export const SAMPLE_QUIZ_IMPORT_JSON = `{
  "sections": [
    {
      "slug": "sample-section",
      "label": "Sample section",
      "coverImageUrl": "https://images.unsplash.com/photo-1544716278-ca5e3f16abd8?auto=format&fit=crop&w=1600&q=80",
      "quizzes": [
        {
          "slug": "sample-quiz",
          "title": "Sample quiz",
          "description": "Optional quiz subtitle shown on listings.",
          "emoji": "📚",
          "published": true,
          "questions": [
            {
              "order": 0,
              "text": "What is 2 + 2?",
              "description": "Shown after the user answers (wrong or right).",
              "options": [
                { "text": "3", "isCorrect": false },
                { "text": "4", "isCorrect": true },
                { "text": "5", "isCorrect": false },
                { "text": "22", "isCorrect": false }
              ]
            }
          ]
        }
      ]
    }
  ]
}`;
