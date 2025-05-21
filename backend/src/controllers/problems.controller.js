import bcrypt from "bcryptjs"
import { db } from '../libs/db.js'
import { UserRole } from "../generated/prisma/index.js"
import jwt from "jsonwebtoken"
import { getJudge0LanguageId, pollBatchResults, submitBatch } from "../libs/judge0.libs.js"



// export const createProblem = async (req, res) => {
//     //going to get the all data from request body
//     const { title, description, difficulty, tags, examples, constraints, hints, testcases, codeSnippets, referenceSolutions } = req.body
//      console.log("Body received:", req.body);
//     // going to check the user role and access 
//     if (req.user.role !== "ADMIN") {
//         return res.status(403).json({ error: "You are not allowed to create a problem" })
//     }

//     // Loop through each solution for different languages

//     try {
//         for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
//             const languageId = getJudge0LanguageId(language)
//             if (!languageId) {
//                 return res.status(400).json({ error: `Language ${language} is not supported` })
//             }

//             const submissions = testcases.map(({ input, output }) => ({
//                 source_code: solutionCode,
//                 language_id: languageId,
//                 stdin: input,
//                 expected_output: output
//             }))


//             const submissionResults = await submitBatch(submissions)

//             const tokens = submissionResults.map((res) => res.token)

//             const results = await pollBatchResults(tokens)

//             for (let i = 0; i < results.length; i++) {
                
//                 const results = results[i];
//                 console.log("From inside results",results);

//                 if (results.status.id !== 3) {
//                     return res.status(400).json({
//                         error: `Test ${i + 1} failed for language ${language}`
//                     })
//                 }
//             }
//         }

//         const newProblem = await db.problem.create({
//             data: {
//                 title, description, difficulty, tags, examples, constraints, hints, testcases, codeSnippets, referenceSolutions, userId: req.user.id
//             }
//         })

//         return res.status(201).json({
//             success: true,
//             message: "Message Created Successfully",
//             problem: newProblem,
//         });


//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             error: "Error While Creating Problem",
//         });
//     }

// }



export const createProblem = async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints, // ✅ correct spelling
    hints,
    testcases,
    codeSnippets,
    referenceSolutions
  } = req.body;

  console.log("Body received:", req.body);

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "You are not allowed to create a problem" });
  }

  try {
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languageId = getJudge0LanguageId(language);
      if (!languageId) {
        return res.status(400).json({ error: `Language ${language} is not supported` });
      }

      const submissions = testcases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output
      }));

      const submissionResults = await submitBatch(submissions);
      const tokens = submissionResults.map((res) => res.token);
      const results = await pollBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        const result = results[i]; // ✅ fix: don't reassign the array
        console.log("From inside results", result);

        if (result.status.id !== 3) {
          return res.status(400).json({
            error: `Test ${i + 1} failed for language ${language}`
          });
        }
      }
    }

    const newProblem = await db.problem.create({
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints, // ✅ correct field name
        hints,
        testcases,
        codeSnippets,
        referenceSolutions,
        userId: req.user.id
      }
    });

    return res.status(201).json({
      success: true,
      message: "Message Created Successfully",
      problem: newProblem
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error While Creating Problem" });
  }
};


export const getAllProblems = async (req, res) => { }

export const getSingleProblem = async (req, res) => { }

export const updateProblem = async (req, res) => { }

export const deleteProblem = async (req, res) => { }



export const getAllProblemsSolvedByUser = (req, res) => { }