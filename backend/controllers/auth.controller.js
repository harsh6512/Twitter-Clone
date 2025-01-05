const signup=async(req,res)=>{
    res.json({
        data:"this is the signup endpoint"
    })
}

const login=async(req,res)=>{
    res.json({
        data:"this is the login endpoint"
    })
}

const logout=async(req,res)=>{
    res.json({
        data:"this is the signup endpoint"
    })
}

export {
    login,
    logout,
    signup
}