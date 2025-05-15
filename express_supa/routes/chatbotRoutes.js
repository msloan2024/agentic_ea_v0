const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const { encrypt } = require('../config/encryption');

router.get("/chatbot-admin", async (req, res) => {
    if (!req.session.user || req.session.user.role !== "Admin") {
        return res.redirect("/"); // Redirect if not an admin
    }
    try {
        // Retrieve data from user_data and chatbots tables
        const { data: chatbotData, error } = await supabase
            .from("chatbots")
            .select("* ");

        if (error) {
            console.error("Error fetching data from Supabase:", error);
            return res.redirect("/dashboard");
        }

        // Render the chatbot-admin view with data from Supabase
        res.render("chatbot-admin", {
            chatbotData
        });
    } catch (err) {
        console.error("Error fetching user data:", err);
        res.redirect("/dashboard");
    }
});

router.post("/add-chatbot", async (req, res) => {
    if (!req.session.user || req.session.user.role !== "Admin") {
        return res.redirect("/"); // Redirect if not an admin
    }
    const { 
        name, 
        clientId, 
        clientKey, 
        modelName,
        previewUrl, 
        actionType, 
        fullConvoConfig, 
        keywordConfig, 
        customConfig } = req.body;

    const encryptionDetails = encrypt(clientKey);

    try {
        const { data, error } = await supabase
            .from('chatbots')
            .insert({ 
                name: name, 
                client_id: clientId,
                client_key: encryptionDetails.content,
                iv: encryptionDetails.iv,
                authTag: encryptionDetails.authTag, 
                model_name: modelName,
                preview_url: previewUrl, 
                action_type: actionType,
                full_convo_config: fullConvoConfig,
                keyword_config: JSON.parse(keywordConfig)
            })

        if (error) throw error;

        req.flash("success", "Chatbot added successfully!");
        res.redirect("/chatbot-admin"); // Redirect back to User Admin page
    } catch (error) {
        console.error("Error adding chatbot:", error.message);
        req.flash("error", "Failed to add chatbot.");
        res.redirect("/chatbot-admin");
    }
});

router.post("/edit-chatbot/:id", async (req, res) => {
    if (!req.session.user || req.session.user.role !== "Admin") {
        return res.redirect("/"); // Redirect if not an admin
    }
    const { id } = req.params;
    const { 
        name, 
        clientId, 
        modelName, 
        previewUrl,
        actionType, 
        fullConvoConfig, 
        keywordConfig, 
        customConfig 
    } = req.body;

    try {
        const { data, error } = await supabase
            .from("chatbots")
            .update({ 
                name: name, 
                client_id: clientId,
                model_name: modelName,
                preview_url: previewUrl,
                action_type: actionType,
                full_convo_config: JSON.parse(fullConvoConfig),
                keyword_config: JSON.parse(keywordConfig),
                // custom_config: customConfig
            })
            .eq("id", id);

        if (error) throw error;

        req.flash("success", "Chatbot updated successfully!");
        res.redirect("/chatbot-admin"); // Redirect back to Chatbot Admin page
    } catch (error) {
        console.error("Error updating chatbot:", error.message);
        req.flash("error", "Failed to update chatbot.");
        res.redirect("/chatbot-admin");
    }
});

module.exports = router;