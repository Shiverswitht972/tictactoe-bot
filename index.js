// index.js
// Simple Telegram bot for Tic-Tac-Toe Mini App
// This file goes in the ROOT of your GitHub repository

const BOT_TOKEN = process.env.BOT_TOKEN;
const APP_URL = process.env.APP_URL;

// Main handler function
module.exports = async (req, res) => {
    // Handle GET requests (for testing)
    if (req.method === 'GET') {
        return res.status(200).send('Bot is running! ✅');
    }

    // Handle POST requests from Telegram
    if (req.method !== 'POST') {
        return res.status(405).send('Method not allowed');
    }

    try {
        const update = req.body;

        // Handle messages
        if (update.message) {
            await handleMessage(update.message);
        }

        // Handle button clicks
        if (update.callback_query) {
            await handleCallback(update.callback_query);
        }

        res.status(200).json({ ok: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(200).json({ ok: true });
    }
};

// Handle incoming messages
async function handleMessage(message) {
    const chatId = message.chat.id;
    const text = message.text || '';
    const name = message.from.first_name || 'Player';

    if (text.startsWith('/start')) {
        await sendWelcome(chatId, name);
    } else if (text === '/help') {
        await sendHelp(chatId);
    } else {
        await sendQuickReply(chatId, name);
    }
}

// Handle button clicks
async function handleCallback(callback) {
    const chatId = callback.message.chat.id;
    const data = callback.data;

    // Acknowledge the click
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: callback.id })
    });

    if (data === 'how_to_play') {
        await sendHelp(chatId);
    }
}

// Send welcome message
async function sendWelcome(chatId, name) {
    const text = 
        `🎮 *Welcome to Tic-Tac-Toe, ${name}!*\n\n` +
        `Challenge your friends to the classic game — right inside Telegram!\n\n` +
        `✨ *Features:*\n` +
        `• Play vs Computer (Easy or Hard)\n` +
        `• 2 Player mode\n` +
        `• 🔥 Challenge friends online!\n\n` +
        `Tap the button below to start! 👇`;

    await sendTelegram(chatId, text, {
        inline_keyboard: [
            [{ text: '🎮 Play Now', web_app: { url: APP_URL } }],
            [
                { text: '❓ How to Play', callback_data: 'how_to_play' },
                { text: '🎯 Challenge Friend', web_app: { url: APP_URL } }
            ]
        ]
    });
}

// Send help message
async function sendHelp(chatId) {
    const text =
        `📖 *How to Play*\n\n` +
        `• The board is 3x3\n` +
        `• You are X, opponent is O\n` +
        `• Get 3 in a row to win!\n\n` +
        `*Game Modes:*\n` +
        `🤖 Easy AI — Good for practice\n` +
        `🧠 Hard AI — Unbeatable!\n` +
        `👥 2 Player — Pass & play\n` +
        `🌐 Online — Challenge any friend\n\n` +
        `*To challenge online:*\n` +
        `1. Tap Play Now\n` +
        `2. Tap "Challenge a Friend"\n` +
        `3. Share the link!\n\n` +
        `Ready? 👇`;

    await sendTelegram(chatId, text, {
        inline_keyboard: [
            [{ text: '🎮 Play Now', web_app: { url: APP_URL } }]
        ]
    });
}

// Send quick reply for unknown messages
async function sendQuickReply(chatId, name) {
    await sendTelegram(chatId, `Hey ${name}! 👋\n\nTap below to play! 🎮`, {
        inline_keyboard: [
            [{ text: '🎮 Play Now', web_app: { url: APP_URL } }]
        ]
    });
}

// Helper to send messages to Telegram
async function sendTelegram(chatId, text, keyboard) {
    const body = {
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
    };

    if (keyboard) {
        body.reply_markup = keyboard;
    }

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
}
