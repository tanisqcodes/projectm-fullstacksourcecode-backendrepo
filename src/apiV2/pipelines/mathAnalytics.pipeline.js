/*
pipelines to create :
# SAT Math Analytics – Single Master List

*Assumed fields:*
`isCorrect`, `timeTaken` (continuous), `expectedTime`, `retryCount`, `isHintViewed`, `isAnswerExplanationViewed`, question metadata (topic, level, etc.)

---
 - question solved: whole , easy ones , hard ones , medium ones
## Core Performance

1. **Accuracy**, testing awaited
   `accuracy = correct / totalAttempts`, 

2. **First-Attempt Accuracy**, testing awaited
   `firstAttemptAccuracy = count(isCorrect == true && retryCount == 0) / count(retryCount == 0)`, done

3. **Average Solve Time** 
   `avgSolveTime = avg(timeTaken)` 

4. **Time Efficiency Ratio**
   `timeEfficiency = timeTaken / expectedTime`

---

## Speed & Struggle

5. **Speed Bucket**
   `fast: timeEfficiency < 0.6`
   `onPace: 0.6 ≤ timeEfficiency ≤ 1.2`
   `slow: 1.2 < timeEfficiency ≤ 2`
   `verySlow: timeEfficiency > 2`

6. **Struggle Index**
   `struggleIndex = avg(timeEfficiency where isCorrect == false)`

7. **Overthinking Rate**
   `overthinkingRate = count(isCorrect && timeEfficiency > 1.5) / totalAttempts`

---

## Error Signals

8. **Careless Mistake Rate**
   `carelessRate = count(!isCorrect && timeEfficiency < 0.6) / totalAttempts`

9. **Conceptual Weakness Rate**
   `conceptWeaknessRate = count(!isCorrect && timeEfficiency > 1.2) / totalAttempts`

10. **Guessing Rate (MCQ)**
    `guessRate = count(!isCorrect && timeEfficiency < 0.4) / totalAttempts`

---

## Help & Learning Behavior

11. **Hint Dependency Rate**
    `hintRate = count(isHintViewed) / totalAttemptsIds`    // output will be percentage , done

12. **Answer Explanation Reliance**
    `explanationRate = count(isAnswerExplanationViewed) / totalAttemptsIds`  // output will be percentage, done

13. **Productive Struggle Rate**
    `productiveStruggle = count(isCorrect && isHintViewed) / totalAttempts`    ??

---

## Retry & Improvement

14. **Retry Rate**
    `retryRate = count(retryCount > 0) / totalAttempts`

15. **Retry Effectiveness**
    `retrySuccessRate = count(isCorrect && retryCount > 0) / count(retryCount > 0)`

16. **Learning Gain**
    `learningGain = avg(timeEfficiency at retryCount == 0) - avg(timeEfficiency at retryCount > 0)`

---

## Confidence & Readiness

17. **Confidence Score (Proxy)**
    `confidenceScore = count(isCorrect && !isHintViewed && timeEfficiency < 1) / totalAttempts`

18. **Speed Readiness Score**
    `speedReadiness = count(timeEfficiency ≤ 1) / totalAttempts`

19. **Exam Readiness Score**
    `examReadiness = (accuracy * 0.5) + (confidenceScore * 0.3) + ((1 - hintRate) * 0.2)`

---

## Aggregations (apply to all above)

* By `topic`
* By `subtopic`
* By `difficulty level`
* Over time (trend)

---

**Design rule:** store raw signals, derive everything here via aggregation.








my stuff: 
- total number of questions solved: total number of easy medium , hard solved
- accuracy 
- first attempt accuracy

context: - chaptersList
model structure , example submission
, questionResponse Structure
- topic list


/   * 
each submission is when user presses the submit , no matter the type of question or whether it is correct or not
list of topics: 
list of subtopics which are same as Chapters,
i want to write a single query fetching for 
1. total number of questions user has solved, number of easy solved , number of medium solved, number of hard solved
2. i want to find the accuracy by calculating the total questions solved by user / total number of attempts by the user, do this for whole chapters, each chapter, for each level: "Easy, Medium , Hard", also for topic 
3. i want to find the number of questions user has attempted for the first time 
by selecting only one submission per each unique chapterNumber and questionNumber , and selecting only the most oldest ones by time and finding first time accuracy by calculating correct/(correct + incorrect) for first time attempted questions
4. i want to find the average time taken to solve for first attempt questions as you have found them above, then find average time taken to solve, 
 when correct and average time taken to solve when incorrect , each 3 for first attempt questions
5. find the list of questions attempted for the first time using the similar structure exaplained before
and tell their accuracy by each topic, chapter 
6. i also want you to find hint checking for rate for each unique attemptId like multipe submissions 
can have same attemptId , which is sessionId for questionSolving , attemptId does not reset when you get one mcq wrong and press
on try again, if two submissions have same attemptId and one has isHintViewed yes, choose that 
using which we can find in how many percentage sessions hint was viewed
7. explanationRate = count(isAnswerExplanationViewed) / totalAttemptsIds` , 
find answerRelianceRate, in case of multiple submissions having same attemptId 
and some having false and some true isAnswerViewed , then choose true ones
8. i want you to find average time taken to solve a all questions , give me this data by 
each chapter , each topic , each difficulty level , inside these each 3 give me a) for all questions whether right or wrong  
b) for correct submissions c) for wrong submissions

*   /





*/
import { MathsQuestionSubmissionModel } from "../../models/mathsQuestionSubmissions";
import { MathQuestionSubmissionModel2 } from "../modelsv2/mathQuestionSubmission2";
export const questionsSolved = async(userId) => { 
    // this method will tell how many easy, hard , medium questions has been solved
  const response = await MathQuestionSubmissionModel2.aggregate([
        {
          $match: {
            isCorrect: true
          }
        },
        {
          $group: {
            _id: {
              chapterNumber: "$chapterNumber",
              questionNumber: "$questionNumber"
            },
            difficulty: { $first: "$difficulty" }
          }
        },
        {
          $group: {
            _id: null,
            totalSolved: { $sum: 1 },
            easySolved: {
              $sum: {
                $cond: [{ $eq: ["$difficulty", "easy"] }, 1, 0]
              }
            },
            mediumSolved: {
              $sum: {
                $cond: [{ $eq: ["$difficulty", "medium"] }, 1, 0]
              }
            },
            hardSolved: {
              $sum: {
                $cond: [{ $eq: ["$difficulty", "hard"] }, 1, 0]
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            totalSolved: 1,
            easySolved: 1,
            mediumSolved: 1,
            hardSolved: 1
          }
        }
      ])
      return response;
      
} 


export const findAccuracy = async (userId) => { 
    const totalQuestions = await MathQuestionSubmissionModel2.CountDocuments({ 
        userId 
    }) 
    const rightQuestions = await MathQuestionSubmissionModel2.countDocument({ 
        userId, 
        isCorrect: true
    })
    return (rightQuestions/totalQuestions)
} 


export const findFirstTimeAccuracy = async(userId, chapterNumberpar , questionNumberpar) => { 



   
   
    const response = await MathQuestionSubmissionModel2.aggregate([
        {
            $match : { 
              //  isCorrect: true,
               retryCount : "0",
               userId: userId,
             //  chapterNumber: chapterNumberpar , 
              // questionNumber: questionNumberpar

    
            }
         }, 
         { 
            $sort: { createdAt: 1 } 
         } ,{
            $group : {  
                _id: { 
                    chapterNumber: "$chapterNumber",  
                    questionNumber: "$questionNumber"
                }, 
                isCorrect : { $first : "$isCorrect"} 

                  //  doc: { $first : "$$ROOT"}
                
            } 
         }, { 
               $group: { 
                _id: { 
                    isCorrect: "$isCorrect"
                },
                count : { $sum : 1} 
               } 

         } 
        
    ]) 
    // console.log(response) 
     /* [
        { _id: true,  count: 42 },
        { _id: false, count: 18 }
      ] */ 
     // in this you will get number of right submission for each question where 
    //retry count === 0,,,,  and you get number of wrong submissions for each question where retryCount === 0
        return response 

}
 
export const averageSolveTime = async(userId) => { 
    const response = await MathQuestionSubmissionModel2.aggregate([
        {  
            $match: { 
                isCorrect: true , 
               userId: userId

            }



        }, { 
          $facet: { 
            branchA : [ 
              { 
                  $sort: {createdAt: 1}
              }, { 

              }







             ] ,
            branchB : [
 { 

 }




            ]
          }
              
            

        }, { 



        }
    ])
}