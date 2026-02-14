import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { MathQuestionSubmissionModel2 } from "../modelsv2/mathQuestionSubmission2.js";

export const getSolvedQuestions = asyncHandler(async(req, res) => { 
    // this endpoint will return the number of questions sovled by user and take 
    //  userId and ChapterNumber as parameters 
    console.log("getSolvedQuestionsByChapter ran")
     const  userId  = String(req.userId)  // , now using postman to test, if using middleware then uncomment this and remove userId from req.query
    const chapterNumber = String(req.query.chapterNumber)
    console.log(userId, chapterNumber)
    const response = await MathQuestionSubmissionModel2.aggregate([
        { $match: { userId, chapterNumber, isCorrect:"true"}},
        { $group: { _id: "$questionNumber" } }
      ])
      const arr = []
    response.map((obj) => { 
        arr.push(obj._id)

    })
return res.status(200).json( new apiResponse(200 ,arr ,"solved questions given")  ) 
})



/* 
output structure for db query made in controller getMathAnalytics: 
{
  solvedStats: [
    { _id: "Easy", solvedCount: 42 },
    { _id: "Medium", solvedCount: 31 },
    { _id: "Hard", solvedCount: 19 }
  ],

  accuracyStats: [
    {
      chapterNumber: "3",
      topic: "ALGEBRA",
      level: "Hard",
      totalAttempts: 18,
      correctAttempts: 11,
      accuracy: 0.61
    }
  ],

  firstAttempts: [  list of first-attempt question docs  ],

  firstAttemptAccuracy: [
    { accuracy: 0.54 }
  ],

  firstAttemptTimeStats: [
    {
      avgTimeAll: 42.3,
      avgTimeCorrect: 38.1,
      avgTimeWrong: 49.6
    }
  ],

  sessionStats: [
    {
      hintRate: 0.37,
      explanationRate: 0.29
    }
  ],

  avgTimeStats: [
    {
      _id: {
        chapterNumber: "3",
        topic: "ALGEBRA",
        level: "Hard"
      },
      avgTimeAll: 44,
      avgTimeCorrect: 39,
      avgTimeWrong: 52
    }
  ]









*/
/* 
accuracy stats has objects with chapterNumber and difficulty




*/








export const getMathAnalytics = asyncHandler(async(req, res) => { 
    const {userId} = req
   

   const response = await MathQuestionSubmissionModel2.aggregate([
    
      // 1) base filter
      { $match: { userId: userId /*, exam: "SAT", section: "MATH" optional */ } },
    
      // 2) normalize fields (booleans + numeric seconds fields)
      {
        $addFields: {
          isCorrectBool: { $eq: ["$isCorrect", "true"] },
          isHintViewedBool: { $in: ["$isHintViewed", ["Yes", "yes", "YES"]] },
          isAnswerViewedBool: { $in: ["$isAnswerViewed", ["Yes", "yes", "YES"]] },
          retryCountNum: { $toInt: "$retryCount" },
    
          // Use the new single-second fields as numbers (per your design)
          timeSecAnswerNum: { $toInt: "$timeTakenInSecondsAnswer" },
          timeSecHintNum: { $toInt: "$timeTakenInSecondsHint" }
        }
      },
    
      // 3) facet — all analytics in parallel
      {
        $facet: {
    
          /* ------------------------------------------------
             accuracyByChapter
             - simple accuracy per chapterNumber
          ------------------------------------------------ */
          accuracyByChapter: [
            {
              $group: {
                _id: "$chapterNumber",
                totalAttempts: { $sum: 1 },
                correctAttempts: { $sum: { $cond: ["$isCorrectBool", 1, 0] } }
              }
            },
            {
              $project: {
                chapterNumber: "$_id",
                totalAttempts: 1,
                correctAttempts: 1,
                accuracy: {
                  $cond: [
                    { $eq: ["$totalAttempts", 0] },
                    0,
                    { $divide: ["$correctAttempts", "$totalAttempts"] }
                  ]
                },
                _id: 0
              }
            },
            { $sort: { chapterNumber: 1 } }
          ],
    
          /* ------------------------------------------------
             chapterLevelAccuracy
             - per chapter, accuracy for each level (Easy/Medium/Hard)
             - output: array of objects: { chapterNumber, levelAccuracies: [ {level, totalAttempts, correctAttempts, accuracy}, ... ] }
          ------------------------------------------------ */
          chapterLevelAccuracy: [
            {
              $group: {
                _id: { chapterNumber: "$chapterNumber", level: "$level" },
                totalAttempts: { $sum: 1 },
                correctAttempts: { $sum: { $cond: ["$isCorrectBool", 1, 0] } }
              }
            },
            {
              $project: {
                chapterNumber: "$_id.chapterNumber",
                level: "$_id.level",
                totalAttempts: 1,
                correctAttempts: 1,
                accuracy: {
                  $cond: [
                    { $eq: ["$totalAttempts", 0] },
                    0,
                    { $divide: ["$correctAttempts", "$totalAttempts"] }
                  ]
                },
                _id: 0
              }
            },
            {
              $group: {
                _id: "$chapterNumber",
                levelAccuracies: {
                  $push: {
                    level: "$level",
                    totalAttempts: "$totalAttempts",
                    correctAttempts: "$correctAttempts",
                    accuracy: "$accuracy"
                  }
                }
              }
            },
            {
              $project: {
                chapterNumber: "$_id",
                levelAccuracies: 1,
                _id: 0
              }
            },
            { $sort: { chapterNumber: 1 } }
          ],
    
          /* ------------------------------------------------
             firstAttemptAccuracy
             - take oldest submission per (chapterNumber, questionNumber)
             - compute overall first-attempt accuracy
          ------------------------------------------------ */
          firstAttemptAccuracy: [
            { $sort: { createdAt: 1 } },
            {
              $group: {
                _id: { chapterNumber: "$chapterNumber", questionNumber: "$questionNumber" },
                firstIsCorrect: { $first: "$isCorrectBool" }
              }
            },
            {
              $group: {
                _id: null,
                totalFirstAttempts: { $sum: 1 },
                correctFirstAttempts: { $sum: { $cond: ["$firstIsCorrect", 1, 0] } }
              }
            },
            {
              $project: {
                totalFirstAttempts: 1,
                correctFirstAttempts: 1,
                firstAttemptAccuracy: {
                  $cond: [
                    { $eq: ["$totalFirstAttempts", 0] },
                    0,
                    { $divide: ["$correctFirstAttempts", "$totalFirstAttempts"] }
                  ]
                },
                _id: 0
              }
            }
          ],
    
          /* ------------------------------------------------
             firstAttemptTimeStats
             - avg time (seconds) for first-attempt questions using timeTakenInSecondsAnswer
             - returns avgTimeAll / avgTimeCorrect / avgTimeWrong
          ------------------------------------------------ */
          firstAttemptTimeStats: [
            { $sort: { createdAt: 1 } },
            {
              $group: {
                _id: { chapterNumber: "$chapterNumber", questionNumber: "$questionNumber" },
                firstDoc: { $first: "$$ROOT" }
              }
            },
            {
              $group: {
                _id: null,
                avgTimeAll: { $avg: "$firstDoc.timeSecAnswerNum" },
                avgTimeCorrect: {
                  $avg: {
                    $cond: ["$firstDoc.isCorrectBool", "$firstDoc.timeSecAnswerNum", null]
                  }
                },
                avgTimeWrong: {
                  $avg: {
                    $cond: ["$firstDoc.isCorrectBool", null, "$firstDoc.timeSecAnswerNum"]
                  }
                }
              }
            },
            {
              $project: {
                avgTimeAll: 1,
                avgTimeCorrect: 1,
                avgTimeWrong: 1,
                _id: 0
              }
            }
          ],
    
          /* ------------------------------------------------
             sessionStats
             - group by attemptId (session)
             - compute hintRelianceRate (sessions with any hint viewed / total sessions)
             - compute answerExplanationRate (sessions with any answer viewed / total)
          ------------------------------------------------ */
          sessionStats: [
            {
              $group: {
                _id: "$attemptId",
                hintViewedInSession: { $max: "$isHintViewedBool" },
                answerViewedInSession: { $max: "$isAnswerViewedBool" }
              }
            },
            {
              $group: {
                _id: null,
                totalSessions: { $sum: 1 },
                hintSessions: { $sum: { $cond: ["$hintViewedInSession", 1, 0] } },
                answerSessions: { $sum: { $cond: ["$answerViewedInSession", 1, 0] } }
              }
            },
            {
              $project: {
                hintRelianceRate: {
                  $cond: [
                    { $eq: ["$totalSessions", 0] },
                    0,
                    { $divide: ["$hintSessions", "$totalSessions"] }
                  ]
                },
                answerExplanationRate: {
                  $cond: [
                    { $eq: ["$totalSessions", 0] },
                    0,
                    { $divide: ["$answerSessions", "$totalSessions"] }
                  ]
                },
                _id: 0
              }
            }
          ],
    
          /* ------------------------------------------------
             avgTimeByChapter
             - per chapter average time (seconds) for all / correct / wrong using timeTakenInSecondsAnswer
          ------------------------------------------------ */
          avgTimeByChapter: [
            {
              $group: {
                _id: "$chapterNumber",
                avgTimeAll: { $avg: "$timeSecAnswerNum" },
                avgTimeCorrect: { $avg: { $cond: ["$isCorrectBool", "$timeSecAnswerNum", null] } },
                avgTimeWrong: { $avg: { $cond: ["$isCorrectBool", null, "$timeSecAnswerNum"] } }
              }
            },
            {
              $project: {
                chapterNumber: "$_id",
                avgTimeAll: 1,
                avgTimeCorrect: 1,
                avgTimeWrong: 1,
                _id: 0
              }
            },
            { $sort: { chapterNumber: 1 } }
          ],
    
          /* ------------------------------------------------
             avgTimeByChapterByLevel
             - per chapter object containing an array of level-level avg times using timeTakenInSecondsAnswer
          ------------------------------------------------ */
          avgTimeByChapterByLevel: [
            {
              $group: {
                _id: { chapterNumber: "$chapterNumber", level: "$level" },
                avgTimeAll: { $avg: "$timeSecAnswerNum" },
                avgTimeCorrect: { $avg: { $cond: ["$isCorrectBool", "$timeSecAnswerNum", null] } },
                avgTimeWrong: { $avg: { $cond: ["$isCorrectBool", null, "$timeSecAnswerNum"] } }
              }
            },
            {
              $project: {
                chapterNumber: "$_id.chapterNumber",
                level: "$_id.level",
                avgTimeAll: 1,
                avgTimeCorrect: 1,
                avgTimeWrong: 1,
                _id: 0
              }
            },
            {
              $group: {
                _id: "$chapterNumber",
                levelTimeStats: {
                  $push: {
                    level: "$level",
                    avgTimeAll: "$avgTimeAll",
                    avgTimeCorrect: "$avgTimeCorrect",
                    avgTimeWrong: "$avgTimeWrong"
                  }
                }
              }
            },
            {
              $project: {
                chapterNumber: "$_id",
                levelTimeStats: 1,
                _id: 0
              }
            },
            { $sort: { chapterNumber: 1 } }
          ], 

          /* ------------------------------------------------
   overallAccuracy
   - accuracy across all attempts (correct / total)
------------------------------------------------ */
overallAccuracy: [
  {
    $group: {
      _id: null,
      totalAttempts: { $sum: 1 },
      correctAttempts: {
        $sum: { $cond: ["$isCorrectBool", 1, 0] }
      }
    }
  },
  {
    $project: {
      totalAttempts: 1,
      correctAttempts: 1,
      accuracy: {
        $cond: [
          { $eq: ["$totalAttempts", 0] },
          0,
          { $divide: ["$correctAttempts", "$totalAttempts"] }
        ]
      },
      _id: 0
    }
  }
],

/* ------------------------------------------------
   overallTimeStats
   - avg time (seconds) for all / correct / wrong
------------------------------------------------ */
overallTimeStats: [
  {
    $group: {
      _id: null,
      avgTimeAll: { $avg: "$timeSecAnswerNum" },
      avgTimeCorrect: {
        $avg: {
          $cond: ["$isCorrectBool", "$timeSecAnswerNum", null]
        }
      },
      avgTimeWrong: {
        $avg: {
          $cond: ["$isCorrectBool", null, "$timeSecAnswerNum"]
        }
      }
    }
  },
  {
    $project: {
      avgTimeAll: 1,
      avgTimeCorrect: 1,
      avgTimeWrong: 1,
      _id: 0
    }
  }
],

/* ------------------------------------------------
   solvedQuestionsStats
   - unique solved questions (count once even if solved many times)
------------------------------------------------ */
solvedQuestionsStats: [
  {
    // collapse all submissions of same question
    $group: {
      _id: {
        chapterNumber: "$chapterNumber",
        questionNumber: "$questionNumber"
      },
      solved: { $max: "$isCorrectBool" },
      level: { $first: "$level" }
    }
  },
  {
    // keep only solved questions
    $match: { solved: true }
  },
  {
    $group: {
      _id: null,
      totalSolved: { $sum: 1 },
      solvedEasy: {
        $sum: { $cond: [{ $eq: ["$level", "Easy"] }, 1, 0] }
      },
      solvedMedium: {
        $sum: { $cond: [{ $eq: ["$level", "Medium"] }, 1, 0] }
      },
      solvedHard: {
        $sum: { $cond: [{ $eq: ["$level", "Hard"] }, 1, 0] }
      }
    }
  },
  {
    $project: {
      totalSolved: 1,
      solvedEasy: 1,
      solvedMedium: 1,
      solvedHard: 1,
      _id: 0
    }
  }
]

    
        } // end facet
      }
    
    ]);
    
      if(!response){ 
        console.log("getMathAnalytics failed")
      }
      return res.status(200).json(new apiResponse(200, response, "success: getMathAnalytics"))
    
})