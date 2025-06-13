


export const createPlayList = async (req,res)=>{
    try {
        const {name, description} = req.body;
        const userId = req.user.id;

        const playlist = await db.playlist.create({
            
        })


    } catch (error) {
        
    }
}