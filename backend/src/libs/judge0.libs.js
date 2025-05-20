import axios from "axios"

export const getJudge0LanguageId = (language)=>{
    const languageMap = {
        "PYTHON":71,
        "JAVA":62,
        "JAVASCRIPT":63,
    }   

    return languageMap[language.toUpperCase()]
}

// Pooling which hits the endpoint in every given seconds

const sleep = (ms)=> new Promise((resolve)=> setTimeout(resolve, ms))

export const poolBatchResults = async(tokens)=>{
    while(true){
        const {data} = await axios.get(`${process.env.JUDGE0_API_URL}`,{
            params:{
                tokens:tokens.join(","),
                base64_encoded:false,
            }
        })

        const results = data.submissions
        console.log(results);

        const isAllDone = results.every(
            (r)=> r.status.id !== 1 && r.status.id !== 2
        )

        if(isAllDone) return results
        await sleep(1000)
    }
}



export const submitBatch = async (submissions)=>{
    const {data} = await axios.post(`${process.env.JUDGE0_API_URL}/submissions/?base64_encoded=false&wait=false`,{
        submissions
    })

    console.log("submission batch from judge0 libs", data)

    return data
}


