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
        nivel_forca, popularidade, status_heroi, vitorias, derrotas, ultimo_batalhar, poderes 
    } = req.body;

    const query = `
        INSERT INTO heroi (imagem_heroi, nome_real, nome_heroi, sexo, altura, peso, data_nasc, local_nasc,
                            nivel_forca, popularidade, status_heroi, vitorias, derrotas, ultimo_batalhar)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)                    
    `;

    const values = [
        imagem_heroi, nome_real, nome_heroi, sexo, altura, peso,
        data_nasc, local_nasc, nivel_forca, popularidade, status_heroi,
        vitorias || 0, derrotas || 0, ultimo_batalhar || false
    ];

    db.query(query, values, (error, resultado) => {
        if (error) {
            console.error("Erro ao cadastrar herói:", error);
            return res.status(500).json({ message: "Erro ao cadastrar herói." });
        }

        const id_heroi = resultado.insertId;

        if (poderes && poderes.length > 0) {
            const poderQuery = `
                INSERT INTO poderes (nome_poder, fk_id_heroi_poder)
                VALUES (?, ?)
            `;

            poderes.forEach(poder => {
                db.query(poderQuery, [poder, id_heroi], (err, result) => {
                    if (err) {
                        console.error("Erro ao inserir poder: ", err);
                    }
                });
            });
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
        imagem_heroi, nome_real, nome_heroi, altura, peso,
        nivel_forca, popularidade, status_heroi, vitorias, derrotas, ultimo_batalhar, poderes
    } = req.body;

    const query = `
        UPDATE heroi
        SET imagem_heroi = ?, nome_real = ?, nome_heroi = ?, altura = ?,
            peso = ?, nivel_forca = ?, popularidade = ?,
            status_heroi = ?, vitorias = ?, derrotas = ?, ultimo_batalhar = ?
        WHERE id_heroi = ?
    `;

    const values = [
        imagem_heroi, nome_real, nome_heroi, altura, peso,
        nivel_forca, popularidade, status_heroi, vitorias, derrotas, ultimo_batalhar, idHeroi
    ];

    db.query(query, values, (error, resultado) => {
        if (error) {
            console.error("Erro ao atualizar herói: ", error);
            return res.status(500).json({ message: "Erro ao atualizar herói." });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ message: "Herói não encontrado." });
        }

        const deletePoderQuery = `
            DELETE FROM poderes WHERE fk_id_heroi_poder = ?
        `;

        db.query(deletePoderQuery, [idHeroi], (error) => {
            if (error) {
                console.error("Erro ao deletar poderes antigos: ", error);
                return res.status(500).json({ message: "Erro ao deletar poderes antigos." });
            }

            if (poderes && Array.isArray(poderes)) {
                const insertPoderesQuery = `
                    INSERT INTO poderes (nome_poder, fk_id_heroi_poder)
                    VALUES (?, ?)
                `;
            
                poderes.forEach(poder => {
                    db.query(insertPoderesQuery, [poder, idHeroi], (error) => {
                        if (error) {
                            console.error("Erro ao adicionar poder: ", error);
                            return res.status(500).json({ message: "Erro ao adicionar poder." });
                        }
                    });
                });
            }

            res.status(200).json({ message: "Herói atualizado com sucesso." });
        });
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

//CRIMES
app.get('/api/crimes', (req, res) => {
    const { nome_heroi, severidade, data } = req.query;

    let query = `
        SELECT c.id_crime, c.nome_crime, c.descricao_crime, c.data_crime, c.severidade_crime,
            h.id_heroi, h.imagem_heroi, h.nome_heroi
        FROM herois.crimes c
        JOIN herois.heroi_crime hc ON c.id_crime = hc.fk_id_crime_hc
        JOIN herois.heroi h ON hc.fk_id_heroi_hc = h.id_heroi
    `;

    let conditions = [];

    if (nome_heroi) {
        conditions.push(`h.nome_heroi LIKE '%${nome_heroi}%'`);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    if (severidade && data) {
        query += ` ORDER BY severidade_crime ${severidade}, data_crime ${data}`;
    } else if (severidade) {
        query += ` ORDER BY severidade_crime ${severidade}`;
    } else if (data) {
        query += ` ORDER BY data_crime ${data}`;
    }

    db.query(query, (error, resultado) => {
        if (error) {
            console.error("Erro ao listar crimes: ", error);
            return res.status(500).json({ message: "Erro ao listar crimes." });
        }

        const crimes = resultado.reduce((acc, row) => {
            const crime = acc.find(c => c.id_crime === row.id_crime);
            const heroi = {
                id_heroi: row.id_heroi,
                nome_heroi: row.nome_heroi,
                imagem_heroi: row.imagem_heroi
            };

            if (crime) {
                crime.herois.push(heroi);
            } else {
                acc.push({
                    id_crime: row.id_crime,
                    nome_crime: row.nome_crime,
                    descricao_crime: row.descricao_crime,
                    data_crime: row.data_crime,
                    severidade_crime: row.severidade_crime,
                    herois: [heroi]
                });
            }

            return acc;
        }, []);

        res.json(crimes);
    });
});

//Pegar um crime específico
app.get('/api/crimes/:id', async (req, res) => {
    const id_crime = req.params.id;
    
    const query = `
        SELECT c.id_crime, c.nome_crime, c.descricao_crime, c.data_crime, c.severidade_crime,
            h.id_heroi, h.imagem_heroi, h.nome_heroi
        FROM crimes c
        LEFT JOIN heroi_crime hc ON c.id_crime = hc.fk_id_crime_hc
        LEFT JOIN heroi h ON hc.fk_id_heroi_hc = h.id_heroi
        WHERE c.id_crime = ?
    `;

    db.query(query, [id_crime], (error, resultado) => {
        if (error) {
            console.error("Erro ao buscar o crime: ", error);
            return res.status(500).json({ message: "Erro ao buscar o crime." });
        }

        if (resultado.length === 0) {
            return res.status(404).json({ message: "Crime não encontrado." });
        }

        const crime = {
            id_crime: resultado[0].id_crime,
            nome_crime: resultado[0].nome_crime,
            descricao_crime: resultado[0].descricao_crime,
            data_crime: resultado[0].data_crime,
            severidade_crime: resultado[0].severidade_crime,
            herois: resultado.map(row => ({
                id_heroi: row.id_heroi,
                nome_heroi: row.nome_heroi,
                imagem_heroi: row.imagem_heroi
            }))
        };

        res.json(crime);
    });

});

app.delete('/api/crimes/:id', (req, res) => {
    const idCrime = req.params.id;

    const query = 'DELETE FROM crimes WHERE id_crime = ?';
    
    db.query(query, [idCrime], (error, resultado) => {

        if (error) {
            console.error("Erro ao excluir crime:", error);
            return res.status(500).send({ message: "Erro ao excluir crime." });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).send({ message: "Crime não encontrado." });
        }

        res.status(200).send({ message: 'Crime excluído com sucesso' });
    });
});

app.post('/api/crimes', (req, res) => {

    const { nome_crime, descricao_crime, data_crime, severidade_crime, id_heroi } = req.body;

    const query = `
        INSERT INTO crimes (nome_crime, descricao_crime, data_crime, severidade_crime)
        VALUES (?, ?, ?, ?)
    `;

    db.query(query, [nome_crime, descricao_crime, data_crime, severidade_crime], (error, resultado) => {
        if (error) {
            console.error("Erro ao cadastrar crime: ", error);
            return res.status(500).json({ message: "Erro ao cadastrar crime." });
        }

        const crimeId = resultado.insertId; //Pega o ID do último registro inserido
        const heroiQuery = `
            INSERT INTO heroi_crime (fk_id_heroi_hc, fk_id_crime_hc)
            VALUES (?, ?)
        `;

        db.query(heroiQuery, [id_heroi, crimeId], (err) => {
            if (err) {
                console.error("Erro ao associar crime ao herói: ", err);
                return res.status(500).json({ message: "Erro ao associar crime ao herói." });
            }

            const popularidadeQuery = `
                SELECT popularidade FROM heroi WHERE id_heroi = ?
            `;

            db.query(popularidadeQuery, [id_heroi], (erro, result) => {
                if (erro) {
                    console.error("Erro ao buscar popularidade de herói: ", erro);
                    return res.status(500).json({ message: "Erro ao buscar popularidade de herói." });
                }

                const popularidadeAtual = result[0].popularidade;
                const novaPopularidade = Math.max(0, popularidadeAtual - (severidade_crime * 3));

                const updatePopularidadeQuery = `
                    UPDATE heroi SET popularidade = ? WHERE id_heroi = ?
                `;

                db.query(updatePopularidadeQuery, [novaPopularidade, id_heroi], (x) => {
                    if (x) {
                        console.error("Erro ao atualizar popularidade do herói: ", x);
                        return res.status(500).json({ message: "Erro ao atualizar a popularidade." });
                    }

                    res.status(201).json({ message: "Crime cadastrado com sucesso." });
                });
            });
        });
    });
});

// Endpoint para cadastrar uma nova missão
app.post('/api/missoes', (req, res) => {
    const { nome_missao, descricao_missao, resultado, recompensa, nivel_dificuldade, herois_responsaveis } = req.body;

    console.log(req.body);

    const query = `
        INSERT INTO herois.missoes (nome_missao, descricao_missao, resultado, recompensa, nivel_dificuldade)
        VALUES (?, ?, ?, ?, ?)
    `;

    const values = [
        nome_missao, descricao_missao, resultado, recompensa, nivel_dificuldade
    ];

    db.query(query, values, (error, result) => {
        if (error) {
            console.error("Erro ao cadastrar missão:", error);
            return res.status(500).json({ message: "Erro ao cadastrar missão." });
        }

        const idMissao = result.insertId;

        const queryHeroisResp = `
            INSERT INTO herois.heroi_missao (fk_id_heroi_hm, fk_id_missao_hm)
            VALUES ?
        `;

        const heroiValues = herois_responsaveis.map(idHeroi => [idHeroi, idMissao]);

        db.query(queryHeroisResp, [heroiValues], (errorHerois) => {
            if (errorHerois) {
                console.error("Erro ao associar heróis à missão: ", errorHerois);
                return res.status(500).json({ message: "Erro ao associar heróis à missão." });
            }
           
            res.status(201).json({ message: "Missão cadastrada com sucesso." });
        });
    });
});

app.get('/api/missoes', (req, res) => {
    const { nome, nivel_dificuldade} = req.query;

    let query = `
        SELECT m.*, GROUP_CONCAT(h.nome_heroi SEPARATOR ', ') AS herois_responsaveis, GROUP_CONCAT(h.imagem_heroi SEPARATOR ',') AS imagens_herois
        FROM herois.missoes AS m
        LEFT JOIN herois.heroi_missao as hm ON m.id_missao = hm.fk_id_missao_hm
        LEFT JOIN herois.heroi as h ON hm.fk_id_heroi_hm = h.id_heroi
    `;

    let conditions = [];

    if (nivel_dificuldade) {
        conditions.push(`m.nivel_dificuldade = '${nivel_dificuldade}'`);
    }

    if (nome) {
        conditions.push(`h.nome_heroi LIKE '%${nome}%'`);
    }
    
    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += `
        GROUP BY m.id_missao, m.nome_missao, m.descricao_missao, m.resultado, m.recompensa, m.nivel_dificuldade
        ORDER BY m.id_missao
    `;

    db.query(query, (error, resultado) => {
        if (error) {
            console.error("Erro ao listar missões: ", error);
            return res.status(500).json({ message: "Erro ao listar missões." });
        }
        res.json(resultado);
    });
});

app.get('/api/missoes/:id', (req, res) => {
    const missionId = req.params.id;

    const query = `SELECT * FROM missoes WHERE id_missao = ?`;

    db.query(query, [missionId], (error, result) => {
        if (error) {
            console.error("Erro ao buscar missão:", error);
            return res.status(500).json({ message: "Erro ao buscar missão." });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "Missão não encontrada." });
        }

        res.json(result[0]);
    });
});

app.delete('/api/missoes/:id', (req, res) => {
    const idMissao = req.params.id;

    const query = 'DELETE FROM missoes WHERE id_missao = ?';
    
    db.query(query, [idMissao], (error, resultado) => {

        if (error) {
            console.error("Erro ao excluir missao:", error);
            return res.status(500).send({ message: "Erro ao excluir missão." });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).send({ message: "Missão não encontrada." });
        }

        res.status(200).send({ message: 'Missão excluída com sucesso' });
    });
});

app.put('/api/missoes/:id', (req, res) => {
    const idMissao = req.params.id;

    const {
        nome_missao, descricao_missao, resultado, recompensa, nivel_dificuldade
    } = req.body;

    const query = `
        UPDATE missoes
        SET nome_missao = ?, descricao_missao = ?, resultado = ?, recompensa = ?, nivel_dificuldade = ?
        WHERE id_missao = ?
    `;

    const values = [
        nome_missao, descricao_missao, resultado, recompensa, nivel_dificuldade, idMissao
    ];

    db.query(query, values, (error, resultado) => {
        if (error) {
            console.error("Erro ao atualizar missão: ", error);
            return res.status(500).json({ message: "Erro ao atualizar missão." });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ message: "Missão não encontrada." });
        }

         res.status(200).json({ message: "Missão atualizada com sucesso." });
    });
});

app.put('/api/batalha/:id', async (req, res) => {
    const idHeroi = req.params.id;

    const {
        imagem_heroi, nome_real, nome_heroi, altura, peso,
        nivel_forca, popularidade, status_heroi, vitorias, derrotas, ultimo_batalhar
    } = req.body;

    const query = `
        UPDATE heroi
        SET imagem_heroi = ?, nome_real = ?, nome_heroi = ?, altura = ?,
            peso = ?, nivel_forca = ?, popularidade = ?,
            status_heroi = ?, vitorias = ?, derrotas = ?, ultimo_batalhar = ?
        WHERE id_heroi = ?
    `;

    const values = [
        imagem_heroi, nome_real, nome_heroi, altura, peso,
        nivel_forca, popularidade, status_heroi, vitorias, derrotas, ultimo_batalhar, idHeroi
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

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
