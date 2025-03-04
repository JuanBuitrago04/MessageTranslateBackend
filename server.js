const express = require('express');
const cors = require('cors');
const pool = require('./database');
const { translateText } = require('./translate');

const app = express();
app.use(express.json());
app.use(cors());

// Endpoint para enviar un mensaje
app.post('/messages', async (req, res) => {
    const { sender, message, targetLang, timestamp } = req.body;
    if (!sender || !message || !targetLang) {
        return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    try {
        console.log("Traduciendo mensaje...");
        const translatedMessage = await translateText(message, targetLang);
        if (!translatedMessage) {
            console.error("Error: No se pudo traducir el mensaje");
            return res.status(500).json({ error: "Error en la traducción del mensaje" });
        }

        console.log("Guardando mensaje en la base de datos...");
        const result = await pool.query(
            "INSERT INTO messages (sender, message, translated, language, timestamp) VALUES ($1, $2, $3, $4, $5) RETURNING id",
            [sender, message, translatedMessage, targetLang, timestamp || new Date().toISOString()]
        );

        console.log("Mensaje guardado correctamente");
        res.json({
            id: result.rows[0].id,
            sender,
            message,
            translated: translatedMessage,
            language: targetLang,
            timestamp: timestamp || new Date().toISOString()
        });
    } catch (error) {
        console.error("Error al guardar el mensaje:", error);
        res.status(500).json({ error: "Error al guardar el mensaje" });
    }
});

// Endpoint para obtener todos los mensajes
app.get('/messages', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM messages ORDER BY id DESC");
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener los mensajes:", error);
        res.status(500).json({ error: "Error al obtener los mensajes" });
    }
});

// Endpoint para limpiar el chat
app.delete('/messages', async (req, res) => {
    try {
        await pool.query("DELETE FROM messages");
        res.json({ message: "Chat limpiado correctamente" });
    } catch (error) {
        console.error("Error al limpiar mensajes:", error);
        res.status(500).json({ error: "Error al limpiar mensajes" });
    }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));