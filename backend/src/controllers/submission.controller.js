import { db } from "../libs/db.js";

export const getAllSubmission = async (req, res) => {
    try {
        const userId = req.user.id;

        const submissions = await db.submission.findMany({
            where: {
                userId: userId
            }
        })


        res.status(200).json({
            success: true,
            message: "Submission fetched successfully",
            submissions
        })

    } catch (error) {
        console.error("Fetched Submission Error", error);
        res.status(500).json({ error: "Failed to fetched submissions" })
    }
}

export const getSubmissionsForProblem = async (req, res) => {
    try {
        const userId = req.user.id;
        const problemId = req.params.problemId;

        const submissions = await db.submission.findMany({
            where: {
                userId: userId,
                problemId: problemId
            }
        })


        res.status(200).json({
            success: true,
            message: "Submissions for Problem fetched successfully",
            submissions
        })

    } catch (error) {
        console.error("Fetching Submission Error", error);
        res.status(500).json({ error: "Failed to fetched a submissions" })
    }
}

export const getAllTheSubmissionsForProblem = async (req, res) => {

    try {
        const problemId = req.params.problemId
    const submissions = await db.submission.findMany({
        where:{
            problemId:problemId
        }
    })

    res.status(200).json({
            success: true,
            message: "All Submissions for problem fetched successfully",
            count:submissions
        })


    } catch (error) {
          console.error("Fetching Submission Error", error);
        res.status(500).json({ error: "Failed to fetched all submissions of problem" })
    }


}