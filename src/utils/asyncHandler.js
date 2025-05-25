const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };

/*
const asyncHandler = () =>{}
const asyncHandler = () => {() =>{}}   //1
const asyncHandler = () => asyn () =>{} // 2 both 1&2 are almost same diffrence is syntex
*/
/*
const asyncHandler = (fn) => async(req, res, next) =>{
    try {
        await fn(req, res, next)
    } catch (err) {
        res.status(err.code || 500).json({
            success:false,
            message: err.message
        })
    }
}
*/
