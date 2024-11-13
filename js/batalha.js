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

function preencherSelect(selectId, herois, imagemId, nomeId, dadosId) {
    const select = document.getElementById(selectId);

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

function mostraHeroi(selectId, imagemId, nomeId, dadosId) {
    const select = document.getElementById(selectId);
    const opcaoEscolhida = select.options[select.selectedIndex];

    if (!opcaoEscolhida.value) {
        const imagemDiv = document.getElementById(imagemId);
        imagemDiv.innerHTML = `<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBxmWXqFg0zoygAHTrQYGI0KXgcdGm5g-Axg&s" class="imagem-heroi-padrao">`;

        const nomeDiv = document.getElementById(nomeId);
        nomeDiv.innerHTML = "<h3>Não selecionado</h3>";
        
        const dadosDiv = document.getElementById(dadosId);
        dadosDiv.innerHTML = `
            <div id="heroi1-dados">
            <div class="dados-linha">
                <p><strong>Força:</strong> ???</p>
                <p><strong>Popularidade:</strong> ???</p>
            </div>
            <div class="dados-linha">
                <p><strong>Vitórias:</strong> ???</p>
                <p><strong>Derrotas:</strong> ???</p>
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
    nomeDiv.innerHTML = `<h3>${nomeHeroi}</h3>`;
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

document.getElementById("btn-batalhar").addEventListener("click", async () => {

    const heroi1Id = document.getElementById("select-heroi1").value;
    const heroi2Id = document.getElementById("select-heroi2").value;

    if (!heroi1Id || !heroi2Id) {
        alert("Selecione dois heróis para a luta.");
        return;
    }

    const [heroi1, heroi2] = await Promise.all([
        fetch(`http://localhost:3000/api/herois/${heroi1Id}`).then(res => res.json()),
        fetch(`http://localhost:3000/api/herois/${heroi2Id}`).then(res => res.json())
    ]);

    heroi1.vida = 10;
    heroi2.vida = 10;

    const resultado = await simularMostrarBatalha(heroi1, heroi2);

    const dialog = document.getElementById("dialog-content");
    const etapasBatalha = document.getElementById("etapas-batalha");

    dialog.showModal();
    etapasBatalha.innerHTML = resultado.logs.join('<br>');

    document.getElementById("fechar-dialog").addEventListener("click", () => {
        dialog.close();
    });

});

async function simularMostrarBatalha(heroi1, heroi2) {
    let turno = 0;
    let logs = [];
    
    let atacante = heroi1.nivel_forca >= heroi2.nivel_forca ? heroi1 : heroi2;
    let defensor = atacante === heroi1 ? heroi2 : heroi1;

    while (heroi1.vida > 0 && heroi2.vida > 0) {
        turno++;

        const dano = atacante.nivel_forca > defensor.nivel_forca
            ? (Math.random() > 0.5 ? 1 : 2)
            : (Math.random() > 0.5 ? 0.5 : 1);

        if (atacante === heroi1) {
            heroi2.vida -= dano;
        } else {
            heroi1.vida -= dano;
        }

        logs.push(`${atacante.nome_heroi} causou ${dano} de dano em ${defensor.nome_heroi}: ${defensor.nome_heroi} agora tem ${defensor.vida}/10 de vida.`);

        if (turno % 2 === 0) {
            const chance = (Math.abs(heroi1.popularidade - heroi2.popularidade));
            if (Math.random() < chance / 100) {
                if (heroi1.popularidade > heroi2.popularidade) {
                    heroi2.vida -= 1;
                    logs.push(`${heroi1.nome_heroi} recebe aplausos e causa 1 de dano em ${heroi2.nome_heroi}: ${heroi2.nome_heroi} agora tem ${heroi2.vida}/10 de vida.`);
                } else {
                    heroi1.vida -= 1;
                    logs.push(`${heroi2.nome_heroi} recebe aplausos e causa 1 de dano em ${heroi1.nome_heroi}: ${heroi1.nome_heroi} agora tem ${heroi1.vida}/10 de vida.`);
                }
            }
        }

        console.log(atacante.nome_heroi, defensor.nome_heroi);

        if (heroi1.vida <= 0 || heroi2.vida <= 0) break;

        [atacante, defensor] = [defensor, atacante];
    }

    const vencedor = heroi1.vida > 0 ? heroi1 : heroi2;
    const perdedor = heroi1.vida <= 0 ? heroi1 : heroi2;

    logs.push(`Batalha concluída. Vencedor: ${vencedor.nome_heroi}.`);

    heroi1.nivel_forca = Math.max(0, heroi1.nivel_forca - 20);
    heroi2.nivel_forca = Math.max(0, heroi2.nivel_forca - 20);

    if (vencedor === heroi1) {
        heroi1.popularidade = Math.min(100, heroi1.popularidade + 10);
        heroi2.popularidade = Math.max(0, heroi2.popularidade - 10);
    } else {
        heroi1.popularidade = Math.max(0, heroi1.popularidade - 10);
        heroi2.popularidade = Math.min(100, heroi2.popularidade + 10);
    }

    await Promise.all([
        fetch(`http://localhost:3000/api/herois/${vencedor.id_heroi}`, {
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
                derrotas: vencedor.derrotas
            })
        }),
        fetch(`http://localhost:3000/api/herois/${perdedor.id_heroi}`, {
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
                derrotas: perdedor.derrotas + 1
            })
        })
    ]);

    return { vencedor: vencedor.nome_heroi, logs };
}

document.addEventListener("DOMContentLoaded", async () => {
    await carregarHerois();
});
