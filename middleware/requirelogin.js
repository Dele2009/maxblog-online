const requireLogin = (req, res, next) => {
    // Check if user is authenticated
    if (req.session.user) {
        // User is authenticated, proceed to next middleware
        next();
    } else {
        // User is not authenticated, redirect to login page
        res.redirect('/user/log-in');
    }
};

module.exports = requireLogin