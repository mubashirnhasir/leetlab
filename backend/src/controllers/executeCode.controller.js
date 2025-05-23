import {pollBatchResults, submitBatch} from "../libs/judge0.libs.js"

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

        const tokens = submitResponse.map((res)=> res.token)

        const results = await pollBatchResults(tokens)

        console.log("---Results")
        console.log(results);
        

        res.status(200).json({
            message:"Code Executed successfully"
        })

    } catch (error) {
        return res.status(500).json({error:"Error Executing code"})
    }

}