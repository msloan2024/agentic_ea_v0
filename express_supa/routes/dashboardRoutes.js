const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');

router.get("/dashboard", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/"); // Redirect to login if not logged in
    }
    const chatbots = await supabase
            .from("chatbots")
            .select("id, name")
            .in("id", req.session.user.allowed_chatbots);
    res.render("dashboard", { user: req.session.user, role: req.session.user.role, chatbots: chatbots.data });
});



module.exports = router;