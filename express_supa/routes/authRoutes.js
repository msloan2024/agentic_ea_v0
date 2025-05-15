const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');

router.get("/", (req, res) => {
    res.render("login");
});

// Login route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Sign in with email and password
        const login_response = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (login_response.error) {
            req.flash("error", "Invalid login credentials. Please try again.");
            return res.redirect("/"); // Reload login page with error message
        }
        const user_id = login_response.data.user.id;

        try {
            const user_response = await supabase.from('user_data')
                .select('*')
                .eq('user_id', user_id);
    
            if (user_response.error) {
                req.flash("error", "Error querying user_data table. Please try again.");
                return res.redirect("/"); // Reload login page with error message
            }
            req.session.user = user_response.data[0]; // Store user info in session
        }
        catch (err) {
            console.error(err);
            req.flash("error", "An error occurred while querying the user_data table.");
            return res.redirect("/"); // Reload login page with error message
        }
         
    } catch (err) {
        console.error(err);
        req.flash("error", "An error occurred while processing your request.");
        return res.redirect("/"); // Reload login page with error message
    }
    
    return res.redirect("/dashboard");
});

// Logout route
router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error during session destruction:", err);
        }
        res.redirect("/"); // Redirect to login page after logout
    });
});

module.exports = router;