import bcrypt from "bcryptjs"
import { db } from '../libs/db.js'
import jwt from "jsonwebtoken"
import { getJudge0LanguageId, pollBatchResults, submitBatch } from "../libs/judge0.libs.js"



export const createProblem = async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
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
        const result = results[i];
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
        constraints,
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

export const getAllProblems = async (req, res) => {
  try {
    const problems = await db.problem.findMany()

    if (!problems) {
      return res.status(404).json({
        error: "No Problems Found"
      })
    }

    res.status(200).json({
      success: true,
      message: "Problems Fetched Successfully",
      problems
    })


  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error While Fetching the Problems" });
  }


}

export const getSingleProblem = async (req, res) => {
  const { id } = req.params;

  try {
    const problem = await db.problem.findUnique({
      where: {
        id
      }
    })

    if (!problem) {
      return res.status(404).json({
        error: "No Problem Found"
      })
    }

    res.status(200).json({
      success: true,
      message: "Problem Fetched Successfully",
      problem
    })

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error While Fetching the Problem by id" });
  }


}

export const updateProblem = async (req, res) => {

  const { id } = req.params;


  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
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

    if (referenceSolutions && testcases) {
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
          const result = results[i];
          console.log("From inside results", result);
          if (result.status.id !== 3) {
            return res.status(400).json({
              error: `Test ${i + 1} failed for language ${language}`
            });
          }
        }
      }
    }

    const updated = await db.problem.update({
       where: { id },
      data:{
        ...(title  !== undefined && { title }),
        ...(description  !== undefined && { description }),
        ...(difficulty  !== undefined && { difficulty }),
        ...(tags  !== undefined && { tags }),
        ...(examples  !== undefined && { examples }),
        ...(constraints  !== undefined && { constraints }),
        ...(hints  !== undefined && { hints }),
        ...(testcases  !== undefined && { testcases }),
        ...(codeSnippets  !== undefined && { codeSnippets }),
        ...(referenceSolutions  !== undefined && { referenceSolutions }),
      }
    })

    return res.status(201).json({
      success: true,
      message: "Updated Problem Successfully",
      problem: updated
    });

  } catch (error) {
       console.error("Error updating problem:", error);
    return res.status(500).json({ error: "Error while updating problem" });
  }

}

export const deleteProblem = async (req, res) => {
  try {
    const { id } = req.params

    const problem = await db.problem.findUnique({
      where: {
        id
      }
    })

    if (!problem) {
      return res.status(404).json({
        error: "Can't delete the problem, Problem not found"
      })
    }

    await db.problem.delete({ where: { id } })

    res.status(200).json({
      success: true,
      message: "Problem deleted successfully"
    })

  } catch (error) {
    res.status(500).json({ message: 'Error deleting problem' });
  }

}


export const getAllProblemsSolvedByUser = (req, res) => { }