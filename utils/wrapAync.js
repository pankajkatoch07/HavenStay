// higher order function for error

module.exports = (fn) => {
    return (req,res,next) => {
        fn(req,res,next).catch(next);
    }
}
