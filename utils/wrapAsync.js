// higher order function for error
//don't need it in express version 
module.exports = (fn) => {
    return (req,res,next) => {
        fn(req,res,next).catch(next);
    }
}
