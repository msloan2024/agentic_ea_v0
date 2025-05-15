const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');

// User Admin route
router.get("/user-admin", async (req, res) => {
    if (!req.session.user || req.session.user.role !== "Admin") {
        return res.redirect("/"); // Redirect if not an admin
    }

    try {
        // Retrieve data from user_data and chatbots tables
        const { data: userData, error: userError } = await supabase
            .from("user_data")
            .select("* ");

        const { data: chatbotsData, error: chatbotsError } = await supabase
            .from("chatbots")
            .select("*");

        if (userError || chatbotsError) {
            console.error("Error fetching data from Supabase:", userError || chatbotsError);
            return res.redirect("/dashboard");
        }

        // Render the user-admin view with data from Supabase
        res.render("user-admin", {
            userData,
            chatbotsData,
        });
    } catch (err) {
        console.error("Error fetching user data:", err);
        res.redirect("/dashboard");
    }
});

router.post("/add-user", async (req, res) => {
    if (!req.session.user || req.session.user.role !== "Admin") {
        return res.redirect("/"); // Redirect if not an admin
    }
    const { email, password, role, allowedChatbots } = req.body;
    const allowedChatbotsArray = Array.isArray(allowedChatbots) 
            ? allowedChatbots.map(String)
            : [String(allowedChatbots)]; 

    try {
        // Sign up the new user in Supabase Authentication
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    role: role, 
                    allowed_chatbots: allowedChatbotsArray
                }
            }
        });

        if (error) throw error;

        req.flash("success", "User added successfully!");
        res.redirect("/user-admin"); // Redirect back to User Admin page
    } catch (error) {
        console.error("Error adding user:", error.message);
        req.flash("error", "Failed to add user.");
        res.redirect("/user-admin");
    }
});

router.post("/edit-user/:id", async (req, res) => {
    if (!req.session.user || req.session.user.role !== "Admin") {
        return res.redirect("/"); // Redirect if not an admin
    }
    const id = req.params.id;
    const { role, allowedChatbots } = req.body;
    const allowedChatbotsArray = Array.isArray(allowedChatbots) 
            ? allowedChatbots.map(String)
            : [String(allowedChatbots)]; 

    try {
        // Update the user in the "user_data" table
        const { data, error } = await supabase
            .from("user_data")
            .update({ role, allowed_chatbots: allowedChatbotsArray })
            .eq("user_id", id);

        if (error) throw error;

         // Refresh session data if the user is editing themselves
         if (req.session.user && req.session.user.user_id === id) {
            req.session.user.role = role;
            req.session.user.allowed_chatbots = allowedChatbotsArray;
        }

        req.flash("success", "User updated successfully!");
        res.redirect("/user-admin");
    } catch (error) {
        console.error("Error updating user:", error.message);
        req.flash("error", "Failed to update user.");
        res.redirect("/user-admin");
    }
});

module.exports = router;