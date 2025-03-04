const express = require('express');
const cors = require('cors');
const pool = require('./database');
const { translateText } = require('./translate');

const app = express();
app.use(express.json());
app.use(cors());

// Endpoint para enviar un mensaje
app.post('/messages', async (req, res) => {
    const { sender, message, targetLang } = req.body;
    if (!sender || !message || !targetLang) {
        return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    try {
        // Traducir el mensaje desde español al idioma destino
        const translatedMessage = await translateText(message, targetLang);
        if (!translatedMessage) {
            return res.status(500).json({ error: "Error en la traducción del mensaje" });
        }

        // Guardar el mensaje en la base de datos
        const result = await pool.query(
            "INSERT INTO messages (sender, message, translated, language) VALUES ($1, $2, $3, $4) RETURNING id",
            [sender, message, translatedMessage, targetLang]
        );

        res.json({ id: result.rows[0].id, sender, message, translated: translatedMessage, language: targetLang });
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