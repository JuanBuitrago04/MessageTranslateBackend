import express from 'express';
import cors from 'cors';
import { pool } from './database.js';
import { translateText } from './translate.js';

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
        const [result] = await pool.query(
            "INSERT INTO messages (sender, message, translated, language) VALUES (?, ?, ?, ?)",
            [sender, message, translatedMessage, targetLang]
        );

        res.json({ id: result.insertId, sender, message, translatedMessage, targetLang });
    } catch (error) {
        console.error("Error al guardar el mensaje:", error);
        res.status(500).json({ error: "Error al guardar el mensaje" });
    }
});

// Endpoint para obtener todos los mensajes
app.get('/messages', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM messages ORDER BY id DESC");
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener los mensajes:", error);
        res.status(500).json({ error: "Error al obtener los mensajes" });
    }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
