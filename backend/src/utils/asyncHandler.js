const asyncHandler = (requestHandler) => {
    // asyncHandler is a higher-order function
    // It takes a requestHandler function (your controller) as input

    return (req, res, next) => {
        // It returns a new middleware function
        // req → request object
        // res → response object
        // next → function to pass control to next middleware

        Promise.resolve(requestHandler(req, res, next))
        // Execute the original requestHandler
        // Wrap it inside Promise.resolve() so even non-async functions work

        .catch((err) => next(err))
        // If any error happens inside requestHandler,
        // it automatically passes the error to Express error middleware
    }
}

export { asyncHandler }

// const asyncHandler=(fn)=>async(req,res,next)=>{// fn is the controller function which we want to wrap with asyncHandler
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success:false,
//             message:error.message || "Internal Server Error"
//         })
//     }
// }