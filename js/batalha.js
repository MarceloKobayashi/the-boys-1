//Carrega os heróis registrados
async function carregarHerois() {
    try {
        const response = await fetch("http://localhost:3000/api/herois");
        if (response.ok) {
            const herois = await response.json();
            preencherSelect("select-heroi1", herois, "heroi1-imagem", "heroi1-nome", "heroi1-dados");
            preencherSelect("select-heroi2", herois, "heroi2-imagem", "heroi2-nome", "heroi2-dados");
        } else {
            console.error("Erro ao buscar heróis: ", response.statusText);
        }
    } catch (error) {
        console.error("Erro ao buscar heróis: ", error);
    }
}

//Preenche os selects com os heróis registrados
function preencherSelect(selectId, herois, imagemId, nomeId, dadosId) {
    const select = document.getElementById(selectId);
    select.innerHTML = "";

    const opcaoPadrao = document.createElement("option");
    opcaoPadrao.value = "";
    opcaoPadrao.textContent = "Selecione seu herói";
    opcaoPadrao.selected = true;
    opcaoPadrao.disabled = true;
    select.appendChild(opcaoPadrao);

    herois.forEach((heroi) => {
        const option = document.createElement("option");
        option.value = heroi.id_heroi;
        option.textContent = heroi.nome_heroi;
        option.dataset.imagem = heroi.imagem_heroi;

        option.dataset.forca = heroi.nivel_forca;
        option.dataset.popularidade = heroi.popularidade;
        option.dataset.vitorias = heroi.vitorias;
        option.dataset.derrotas = heroi.derrotas;

        select.appendChild(option);
    });

    mostraHeroi(selectId, imagemId, nomeId, dadosId);

    select.addEventListener("change", () => {
        mostraHeroi(selectId, imagemId, nomeId, dadosId);
    });
}

//Mostra o herói selecionado com suas informações e foto
function mostraHeroi(selectId, imagemId, nomeId, dadosId) {
    const select = document.getElementById(selectId);
    const opcaoEscolhida = select.options[select.selectedIndex];

    if (!opcaoEscolhida.value) {
        const imagemDiv = document.getElementById(imagemId);
        imagemDiv.innerHTML = `<img src="https://st3.depositphotos.com/3581215/18899/v/450/depositphotos_188994514-stock-illustration-vector-illustration-male-silhouette-profile.jpg" class="imagem-heroi-padrao">`;

        const nomeDiv = document.getElementById(nomeId);
        nomeDiv.innerHTML = "<h3>Não selecionado</h3>";
        
        const dadosDiv = document.getElementById(dadosId);
        dadosDiv.innerHTML = `
            <div id="heroi1-dados">
            <div class="dados-linha">
                <p><strong>Força:</strong> ??????</p>
                <p><strong>Popularidade:</strong> ??????</p>
            </div>
            <div class="dados-linha">
                <p><strong>Vitórias:</strong> ??</p>
                <p><strong>Derrotas:</strong> ??</p>
            </div>
        </div>
        `;
        return;
    }

    const imagemUrl = opcaoEscolhida.dataset.imagem;
    const nomeHeroi = opcaoEscolhida.text;
    const forca = opcaoEscolhida.dataset.forca;
    const popularidade = opcaoEscolhida.dataset.popularidade;
    const vitorias = opcaoEscolhida.dataset.vitorias;
    const derrotas = opcaoEscolhida.dataset.derrotas;

    const imagemDiv = document.getElementById(imagemId);
    const nomeDiv = document.getElementById(nomeId);
    const dadosDiv = document.getElementById(dadosId)

    imagemDiv.innerHTML = `<img src="${imagemUrl}" alt="${nomeHeroi}" class="imagem-heroi-padrao">`;
    nomeDiv.innerHTML = `<h3 id="nome-heroi">${nomeHeroi}</h3>`;
    dadosDiv.innerHTML = `
        <div id="heroi1-dados">
            <div class="dados-linha">
                <p><strong>Força:</strong> ${forca}/100</p>
                <p><strong>Popularidade:</strong> ${popularidade}/100</p>
            </div>
            <div class="dados-linha">
                <p><strong>Vitórias:</strong> ${vitorias}</p>
                <p><strong>Derrotas:</strong> ${derrotas}</p>
            </div>
        </div>
    `;
}

//Pega os heróis selecionados para batalhar
document.getElementById("btn-batalhar").addEventListener("click", async () => {

    const heroi1Id = document.getElementById("select-heroi1").value;
    const heroi2Id = document.getElementById("select-heroi2").value;

    if (!heroi1Id || !heroi2Id) {
        alert("Selecione dois heróis para a luta.");
        return;
    }

    if (heroi1Id === heroi2Id) {
        alert("Selecione dois heróis diferentes para a luta.");
        return;
    }

    const [heroi1, heroi2] = await Promise.all([
        fetch(`http://localhost:3000/api/herois/${heroi1Id}`).then(res => res.json()),
        fetch(`http://localhost:3000/api/herois/${heroi2Id}`).then(res => res.json())
    ]);

    heroi1.vida = 10;
    heroi2.vida = 10;

    //Chama a função para fazer a batalha
    const resultado = await simularMostrarBatalha(heroi1, heroi2);

    const dialog = document.getElementById("dialog-content");
    const etapasBatalha = document.getElementById("etapas-batalha");

    dialog.showModal();
    etapasBatalha.innerHTML = resultado.logs.join('<br>');

    document.getElementById("fechar-dialog").addEventListener("click", async() => {
        dialog.close();

        window.location.href = "herois.html";
    });

});

//Faz uma batalha baseada em turnos e mostra os turnos num dialog
async function simularMostrarBatalha(heroi1, heroi2) {
    let turno = 0;
    let logs = [];
    
    let atacante;
    let defensor;

    if (document.getElementById("heroi1-energetico").checked) {
        atacante = heroi1;
        defensor = heroi2;
    } else if (document.getElementById("heroi2-energetico").checked) {
        atacante = heroi2;
        defensor = heroi1;
    } else {
        if (heroi1.nivel_forca >= heroi2.nivel_forca) {
            atacante = heroi1;
            defensor = heroi2;
        } else {
            atacante = heroi2;
            defensor = heroi1;
        }
    }

    if (document.getElementById("heroi1-machucado").checked) {
        heroi1.vida -= 2;
    }
    
    if (document.getElementById("heroi2-machucado").checked) {
        heroi2.vida -= 2;
    }

    const heroi1Vida = heroi1.vida;
    const heroi2Vida = heroi2.vida;

    const todosHerois = await fetch("http://localhost:3000/api/herois").then(res => res.json());
    await Promise.all(todosHerois.map(heroi => {
        return fetch(`http://localhost:3000/api/batalha/${heroi.id_heroi}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...heroi,
                ultimo_batalhar: false
            })
        });
    }));

    while (heroi1.vida > 0 && heroi2.vida > 0) {
        turno++;

        let dano = atacante.nivel_forca > defensor.nivel_forca
            ? (Math.random() > 0.5 ? 1 : 2)
            : (Math.random() > 0.5 ? 0.5 : 1);

        dano = atacante.nivel_forca === defensor.nivel_forca
            ? (Math.random() > 0.5 ? 1 : 2)
            : dano;

        const armaEspecialAtacante = document.getElementById(
            atacante === heroi1 ? "heroi1-arma" : "heroi2-arma"
        ).checked;

        if (armaEspecialAtacante) {
            dano += 1;
        }

        if (atacante === heroi1) {
            heroi2.vida -= dano;
        } else {
            heroi1.vida -= dano;
        }

        logs.push(`<div class="log">${atacante === heroi1 ? `<span class="nome-heroi-verde">${heroi1.nome_heroi}</span>` : `<span class="nome-heroi-vermelho">${heroi2.nome_heroi}</span>`} causou ${dano} de dano em ${defensor === heroi1 ? `<span class="nome-heroi-verde">${heroi1.nome_heroi}</span>` : `<span class="nome-heroi-vermelho">${heroi2.nome_heroi}</span>`}: <span class="${defensor === heroi1 ? 'nome-heroi-verde' : 'nome-heroi-vermelho'}">${defensor.nome_heroi}</span> agora tem ${defensor.vida}/${defensor === heroi1 ? heroi1Vida : heroi2Vida} de vida.</div>`);
        logs.push('<div class="log">-----------------------------------------------------------------------------------------------------</div>');

        if (turno % 2 === 0) {
            const chance = (Math.abs(heroi1.popularidade - heroi2.popularidade));
            if (Math.random() < chance / 100) {
                if (heroi1.popularidade > heroi2.popularidade) {
                    heroi2.vida -= 1;
                    logs.push(`<div class="log">${heroi1.popularidade > heroi2.popularidade ? `<span class="nome-heroi-verde">${heroi1.nome_heroi}</span>` : `<span class="nome-heroi-vermelho">${heroi2.nome_heroi}</span>`} recebe aplausos e causa 1 de dano em <span class="nome-heroi-vermelho">${heroi2.nome_heroi}</span>: <span class="nome-heroi-vermelho">${heroi2.nome_heroi}</span> agora tem ${heroi2.vida}/${heroi2Vida} de vida.</div>`);
                    logs.push('<div class="log">-----------------------------------------------------------------------------------------------------</div>');
                } else {
                    heroi1.vida -= 1;
                    logs.push(`<div class="log">${heroi2.popularidade > heroi1.popularidade ? `<span class="nome-heroi-vermelho">${heroi2.nome_heroi}</span>` : `<span class="nome-heroi-verde">${heroi1.nome_heroi}</span>`} recebe aplausos e causa 1 de dano em <span class="nome-heroi-verde">${heroi1.nome_heroi}</span>: <span class="nome-heroi-verde">${heroi1.nome_heroi}</span> agora tem ${heroi1.vida}/${heroi1Vida} de vida.</div>`);
                    logs.push('<div class="log">-----------------------------------------------------------------------------------------------------</div>');
                }
            }
        }

        console.log(atacante.nome_heroi, defensor.nome_heroi);

        if (heroi1.vida <= 0 || heroi2.vida <= 0) break;

        [atacante, defensor] = [defensor, atacante];
    }

    const vencedor = heroi1.vida > 0 ? heroi1 : heroi2;
    const perdedor = heroi1.vida <= 0 ? heroi1 : heroi2;

    logs.push(`<div class="centralizado">Batalha concluída. Vencedor: <span class="${vencedor === heroi1 ? 'nome-heroi-verde' : 'nome-heroi-vermelho'}">${vencedor.nome_heroi}</span>.</div>`);

    heroi1.nivel_forca = Math.max(0, heroi1.nivel_forca - 5);
    heroi2.nivel_forca = Math.max(0, heroi2.nivel_forca - 5);

    if (vencedor === heroi1) {
        heroi1.popularidade = Math.min(100, heroi1.popularidade + 5);
        heroi2.popularidade = Math.max(0, heroi2.popularidade - 5);
    } else {
        heroi1.popularidade = Math.max(0, heroi1.popularidade - 5);
        heroi2.popularidade = Math.min(100, heroi2.popularidade + 5);
    }

    logs.push('<div class="centralizado">---- Status Final dos Heróis ----</div>');
    logs.push(`<div class="centralizado ${vencedor === heroi1 ? 'nome-heroi-verde' : 'nome-heroi-vermelho'}">${heroi1.nome_heroi}: Força = ${heroi1.nivel_forca}/100, Popularidade = ${heroi1.popularidade}/100</div>`);
    logs.push(`<div class="centralizado ${vencedor === heroi2 ? 'nome-heroi-verde' : 'nome-heroi-vermelho'}">${heroi2.nome_heroi}: Força = ${heroi2.nivel_forca}/100, Popularidade = ${heroi2.popularidade}/100</div>`);
    
    
    await Promise.all([
        fetch(`http://localhost:3000/api/batalha/${vencedor.id_heroi}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                //Passar tudo de novo
                imagem_heroi: vencedor.imagem_heroi,
                nome_real: vencedor.nome_real,
                nome_heroi: vencedor.nome_heroi,
                altura: vencedor.altura,
                peso: vencedor.peso,
                nivel_forca: vencedor.nivel_forca,
                popularidade: vencedor.popularidade,
                status_heroi: vencedor.status_heroi,
                vitorias: vencedor.vitorias + 1,
                derrotas: vencedor.derrotas,
                ultimo_batalhar: true
            })
        }),
        fetch(`http://localhost:3000/api/batalha/${perdedor.id_heroi}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                imagem_heroi: perdedor.imagem_heroi,
                nome_real: perdedor.nome_real,
                nome_heroi: perdedor.nome_heroi,
                altura: perdedor.altura,
                peso: perdedor.peso,
                nivel_forca: perdedor.nivel_forca,
                popularidade: perdedor.popularidade,
                status_heroi: perdedor.status_heroi,
                vitorias: perdedor.vitorias,
                derrotas: perdedor.derrotas + 1,
                ultimo_batalhar: true
            })
        })
    ]);

    return { vencedor: vencedor.nome_heroi, logs };
}

const heroi1Energetico = document.getElementById("heroi1-energetico");
const heroi2Energetico = document.getElementById("heroi2-energetico");

heroi1Energetico.addEventListener("change", () => {
    if (heroi1Energetico.checked) {
        heroi2Energetico.checked = false;
    }
});

heroi2Energetico.addEventListener("change", () => {
    if (heroi2Energetico.checked) {
        heroi1Energetico.checked = false;
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    await carregarHerois();
});
