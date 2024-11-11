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
app.use(express.json());

app.post('/api/herois', (req, res) => {
    const { 
        imagem_heroi, nome_real, nome_heroi, sexo, altura, peso, data_nasc, local_nasc,
        nivel_forca, popularidade, status_heroi, vitorias, derrotas 
    } = req.body;

    const query = `
        INSERT INTO heroi (imagem_heroi, nome_real, nome_heroi, sexo, altura, peso, data_nasc, local_nasc,
                            nivel_forca, popularidade, status_heroi, vitorias, derrotas)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)                    
    `;

    const values = [
        imagem_heroi, nome_real, nome_heroi, sexo, altura, peso,
        data_nasc, local_nasc, nivel_forca, popularidade, status_heroi,
        vitorias || 0, derrotas || 0
    ];

    db.query(query, values, (error, resultado) => {
        if (error) {
            console.error("Erro ao cadastrar herói:", error);
            return res.status(500).json({ message: "Erro ao cadastrar herói." });
        }

        res.status(201).json({ message: "Herói cadastrado com sucesso." });
    });

});

app.get('/api/herois', (req, res) => {
    const { nome, status, popularidade } = req.query;
    let query = `
        SELECT h.*, p.nome_poder
        FROM heroi as h
        LEFT JOIN poderes as p ON h.id_heroi = p.fk_id_heroi_poder
    `;

    let conditions = [];

    if (nome) {
        conditions.push(`(nome_heroi LIKE '%${nome}%' OR nome_real LIKE '%${nome}%')`);
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

        const herois = resultado.reduce((acc, row) => {
            const heroi = acc.find(h => h.id_heroi === row.id_heroi);
            const poder = { nome_poder: row.nome_poder, descricao_poder: row.descricao_poder };
            
            if (heroi) {
                if (poder.nome_poder) heroi.poderes.push(poder);
            } else {
                acc.push({
                    ...row,
                    poderes: poder.nome_poder ? [poder] : []
                });
            }
            return acc;
        }, []);
        
        res.json(herois);
    });
});

//Pegar info de um herói específico para colocar na edição
app.get('/api/herois/:id', (req, res) => {
    const idHeroi = req.params.id;

    const query = `
        SELECT h.*, p.nome_poder
        FROM heroi AS h
        LEFT JOIN poderes AS p ON h.id_heroi = p.fk_id_heroi_poder
        WHERE h.id_heroi = ?
    `;

    db.query(query, [idHeroi], (error, resultado) => {
        if (error) {
            console.error("Erro ao buscar herói: ", error);
            return res.status(500).json({ message: "Erro ao buscar herói." });
        }

        if (resultado.length === 0) {
            return res.status(404).json({ message: "Herói não encontrado." });
        }
        
        const heroi = {
            ...resultado[0],
            poderes: resultado
                .filter(row => row.nome_poder)
                .map(row => ({
                    nome_poder: row.nome_poder
                }))
        };

        res.status(200).json(heroi);
    });

});

app.put('/api/herois/:id', (req, res) => {
    const idHeroi = req.params.id;

    const {
        imagem_heroi, nome_real, nome_heroi, sexo, altura, peso, data_nasc, local_nasc,
        nivel_forca, popularidade, status_heroi, vitorias, derrotas
    } = req.body;

    const query = `
        UPDATE heroi
        SET imagem_heroi = ?, nome_real = ?, nome_heroi = ?, sexo = ?, altura = ?,
            peso = ?, data_nasc = ?, local_nasc = ?, nivel_forca = ?, popularidade = ?,
            status_heroi = ?, vitorias = ?, derrotas = ?
        WHERE id_heroi = ?
    `;

    const values = [
        imagem_heroi, nome_real, nome_heroi, sexo, altura, peso, data_nasc, local_nasc,
        nivel_forca, popularidade, status_heroi, vitorias, derrotas, idHeroi
    ];

    db.query(query, values, (error, resultado) => {
        if (error) {
            console.error("Erro ao atualizar herói: ", error);
            return res.status(500).json({ message: "Erro ao atualizar herói." });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ message: "Herói não encontrado." });
        }

        res.status(200).json({ message: "Herói atualizado com sucesso." });

    });

});

app.delete('/api/herois/:id', (req, res) => {
    const idHeroi = req.params.id;

    const query = 'DELETE FROM heroi WHERE id_heroi = ?';
    
    db.query(query, [idHeroi], (error, resultado) => {

        if (error) {
            console.error("Erro ao excluir herói:", error);
            return res.status(500).send({ message: "Erro ao excluir herói." });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).send({ message: "Herói não encontrado." });
        }

        res.status(200).send({ message: 'Herói excluído com sucesso' });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
