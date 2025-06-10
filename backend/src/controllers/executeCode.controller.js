import { db } from "../libs/db.js";
import { getLanguageName, pollBatchResults, submitBatch } from "../libs/judge0.libs.js"

export const executeCode = async (req, res) => {
    try {
        const { source_code, language_id, stdin, expected_outputs, problemId } = req.body;

        const userId = req.user.id;

        //validating test cases

        if (
            !Array.isArray(stdin) ||
            stdin.length === 0 ||
            !Array.isArray(expected_outputs) ||
            expected_outputs.length !== stdin.length
        ) {
            return res.status(400).json({ error: "Invalid or missing test cases" })
        }

        const submissions = stdin.map((input) => ({
            source_code,
            language_id,
            stdin: input,
        }))

        const submitResponse = await submitBatch(submissions)

        const tokens = submitResponse.map((res) => res.token)

        const results = await pollBatchResults(tokens)

        console.log("---Results")
        console.log(results);

        let allPassed = true

        const detailedResults = results.map((result, i) => {
            const stdout = result.stdout?.trim()
            const expected_output = expected_outputs[i]?.trim()
            const passed = stdout === expected_output;

            if (!passed) allPassed = false


            return {
                testCase: i + 1,
                passed,
                stdout,
                expected: expected_output,
                stderr: result.stderr || null,
                compileOutput: result.compile_output || null,
                status: result.status.description,
                memory: result.memory ? `${result.memory} KB` : undefined,
                time: result.time ? `${result.time} s` : undefined
            }

            // console.log(`Testcase #${i+1}`)
            // console.log(`Input ${stdin[i]}`)
            // console.log(`Expected Output for Test Case ${expected_output}`)
            // console.log(`Actual Output  ${stdout}`)

            // console.log(`Matched : ${passed}`)

        })

        console.log(detailedResults);

        // storing the submission summary 

        const submission = await db.submission.create({
            data: {
                userId,
                problemId,
                sourceCode: source_code,
                language: getLanguageName(language_id),
                stdin: stdin.join("\n"),
                stdout: JSON.stringify(detailedResults.map((r) => r.stdout)),
                stderr: detailedResults.map((r) => r.stderr)
                    ? JSON.stringify(detailedResults.map((r) => r.stderr))
                    : null,
                compileOutput: detailedResults.map((r) => r.compileOutput)
                    ? JSON.stringify(detailedResults.map((r) => r.compileOutput))
                    : null,
                status: allPassed ? "Accepted" : "Wrong Answer",
                memory: detailedResults.map((r) => r.memory)
                    ? JSON.stringify(detailedResults.map((r) => r.memory))
                    : null,
                time: detailedResults.map((r) => r.time)
                    ? JSON.stringify(detailedResults.map((r) => r.time))
                    : null,
            }
        })


        // if all passed == true mark problem solved for the current user 
        if (allPassed) {
            await db.problemSolved.upsert({
                where: {
                    userId_problemId: {
                        userId, problemId
                    }
                },
                update: {},
                create: {
                    userId, problemId
                }
            })
        }

        const testCaseResults = detailedResults.map((result) => ({
            submissionId: submission.id,
            testCase: result.testCase,
            passed: result.passed,
            stdout: result.stdout,
            expected: result.expected,
            stderr: result.stderr,
            compileOutput: result.compile_output || null,
            status: result.status,
            memory: result.memory,
            time: result.time
        }))

        await db.TestCaseResult.createMany({
            data: testCaseResults
        })

        const submissionWithTestCase = await db.submission.findUnique({
            where: {
                id: submission.id
            },
            include: {
                testCase: true
            }
        })



        res.status(200).json({
            success: true,
            message: "Code Executed! Successfully",
            submission: submissionWithTestCase
        })

    } catch (error) {
         console.error("Execution Error:", error)
        return res.status(500).json({ error: "Error Executing code" })
    }

}