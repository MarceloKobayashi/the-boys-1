require('dotenv').config();

const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const PORT = 3000;

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
});

db.connect((err) => {
    if (err) throw err;
    console.log("Conexão ao banco bem sucedida!");
});

//Permitir requisições
app.use(cors({ origin: 'http://127.0.0.1:5500' }));

app.get('/api/herois', (req, res) => {
    const { nome, status, popularidade } = req.query;
    let query = 'SELECT * FROM heroi';

    let conditions = [];

    if (nome) {
        conditions.push(`nome_heroi LIKE '%${nome}%'`);
    }

    if (status) {
        conditions.push(`status_heroi = '${status}'`);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    if (popularidade) {
        query += ` ORDER BY popularidade ${popularidade}`;
    }

    db.query(query, (error, resultado) => {
        if (error) throw error;
        res.json(resultado);
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
