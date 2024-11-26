const dialogCadastrarMissao = document.getElementById("dialog-cadastrar-missao");
const btnCadastrarMissao = document.getElementById("btn-cadastrar-missao");

btnCadastrarMissao.addEventListener("click", () => {
    dialogCadastrarMissao.showModal();
});

const btnFecharCadastro = document.getElementById("btn-dialog-cadastrar-fechar");
btnFecharCadastro.addEventListener("click", () => {

    dialogCadastrarMissao.close();
});

const btnDialogCadastrarMissao = document.getElementById("btn-dialog-cadastrar");
btnDialogCadastrarMissao.addEventListener("click", async () => {
    const confirmar = confirm("Tem certeza que deseja cadastrar esta missão?");

    if (confirmar) {
        const nomeMissao = document.getElementById("nome-missao").value;
        const descricaoMissao = document.getElementById("descricao-missao").value;
        const resultado = document.getElementById("resultado-missao").value;
        const recompensa = document.getElementById("recompensa-missao").value;
        const tipoRecompensa = document.getElementById("tipo-recompensa").value;
        const nivelDificuldade = document.getElementById("nivel-dificuldade").value;

        try {
            const responseHerois = await fetch("http://localhost:3000/api/herois");
            const herois = await responseHerois.json();

            let heroisFiltrados;
            if (nivelDificuldade < 5) {
                heroisFiltrados = herois.filter(
                    heroi => heroi.nivel_forca >= 40 && heroi.nivel_forca <= 85
                );
            } else {
                heroisFiltrados = herois.filter(heroi => heroi.nivel_forca >= 85);
            }

            if (heroisFiltrados.length < 3) {
                alert("Não há heróis disponíveis para esta missão.");
                return;
            }

            const heroisSelecionados = [];
            while(heroisSelecionados.length < 3) {
                const indexAleatorio = Math.floor(Math.random() * heroisFiltrados.length);
                const heroi = heroisFiltrados[indexAleatorio];

                if (!heroisSelecionados.includes(heroi.id_heroi)) {
                    heroisSelecionados.push(heroi.id_heroi);
                }
            }

            const response = await fetch("http://localhost:3000/api/missoes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nome_missao: nomeMissao,
                    descricao_missao: descricaoMissao,
                    resultado: resultado,
                    recompensa: recompensa,
                    tipo_recompensa: tipoRecompensa,
                    nivel_dificuldade: nivelDificuldade,
                    herois_responsaveis: heroisSelecionados
                }),
            });

            console.log(response);

            if (response.ok) {
                alert("Missão cadastrada com sucesso.");
                
                document.getElementById("nome-missao").value = "";
                document.getElementById("descricao-missao").value = "";
                document.getElementById("resultado-missao").value = "";
                document.getElementById("recompensa-missao").value = "";
                document.getElementById("tipo-recompensa").value = "";
                document.getElementById("nivel-dificuldade").value = "";
                document.getElementById("herois-lista").innerHTML = "";
            } else {
                alert("Erro ao cadastrar missão");
            }
        } catch (error) {
            console.error("Erro ao cadastrar missão: ", error);
        }
    }
});

document.getElementById("nivel-dificuldade").addEventListener("change", async () => {
    const nivelDificuldade = parseInt(document.getElementById("nivel-dificuldade").value);
    
    try {
        const response = await fetch("http://localhost:3000/api/herois");
        const herois = await response.json();

        let heroisFiltrados;
        if (nivelDificuldade < 5) {
            heroisFiltrados = herois.filter(heroi => heroi.nivel_forca >= 40 && heroi.nivel_forca < 85);
        } else {
            heroisFiltrados = herois.filter(heroi => heroi.nivel_forca >= 85);
        }

        if (heroisFiltrados.length < 3) {
            alert("Não há heróis disponíveis para esta missão.");
            return;
        }

        const heroisSelecionados = [];
        while (heroisSelecionados.length < 3) {
            const indexAleatorio = Math.floor(Math.random() * heroisFiltrados.length);
            const heroi = heroisFiltrados[indexAleatorio];

            if (!heroisSelecionados.includes(heroi)) {
                heroisSelecionados.push(heroi);
            }
        }

        const heroisLista = document.getElementById("herois-lista");
        heroisLista.innerHTML = "";

        heroisSelecionados.forEach(heroi => {
            const listItem = document.createElement("div");
            listItem.classList.add("heroi-item");
            listItem.textContent = `-${heroi.nome_heroi} (Força: ${heroi.nivel_forca})`;
            listItem.setAttribute("data-id", heroi.id_heroi);

            heroisLista.appendChild(listItem);
        });
    
    } catch (error) {
        console.error("Erro ao buscar heróis: ", error);
        alert("Erro ao conectar com o servidor");
    }
});

async function listarMissoes(nome = '', nivelDificuldade = '') {
    try {
        const url = new URL('http://localhost:3000/api/missoes');
        
        if (nome) url.searchParams.append('nome', nome);
        if (nivelDificuldade) url.searchParams.append('nivel_dificuldade', nivelDificuldade);
        
        const response = await fetch(url);
        const missoes = await response.json();

        const tabela = document.getElementById("tabela-missoes").getElementsByTagName("tbody")[0];

        tabela.innerHTML = "";

        missoes.forEach(missao => {
            const linha = tabela.insertRow();

            const resultadoFormatado = missao.resultado.charAt(0).toUpperCase() + missao.resultado.slice(1).toLowerCase();
            const tipoFormatado = missao.tipo_recompensa.charAt(0).toUpperCase() + missao.tipo_recompensa.slice(1).toLowerCase();
            const heroisResponsaveis = missao.herois_responsaveis 
                ? `<ul>${missao.herois_responsaveis.split(', ').map(heroi => `<li>${heroi}</li>`).join('')}</ul>`
                : 'Nenhum herói registrado';

            const imagensHerois = missao.imagens_herois 
                ? missao.imagens_herois.split(',').map(img => `<img src="${img}" alt="Heroi" class="img-heroi-responsavel">`).join('')
                : 'Nenhuma imagem registrada';

            linha.innerHTML = `
            <td id="btns-lista">
                <button class="btn-excluir" data-id="${missao.id_missao}">Excluir</button>
            </td>
            <td>${missao.nome_missao}</td>
            <td>${missao.descricao_missao}</td>
            <td>${missao.recompensa}</td>
            <td>${tipoFormatado}</td>
            <td>${resultadoFormatado}</td>
            <td>${missao.nivel_dificuldade}</td>
            <td>${heroisResponsaveis}</td>
            <td>
                <div class="img-herois-responsaveis">
                    ${imagensHerois}
                </div>
            </td>
            `;
        });
    } catch (error) {
        console.error("Erro ao listar missões: ", error);
    }
}

document.getElementById('btn-busca-missoes').addEventListener("click", () => {
    const nomeBusca = document.getElementById("input-nome-missao").value;
    const dificuldadeBusca = document.getElementById("input-dificuldade").value;

    listarMissoes(nomeBusca, dificuldadeBusca);
});

document.getElementById('btn-todas-missoes').addEventListener("click", () => {
    document.getElementById("input-nome-missao").value = "";
    document.getElementById("input-dificuldade").value = "";

    listarMissoes();
});

document.getElementById("input-nome-missao").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("btn-busca-missoes").click();
    }
});


document.getElementById("tabela-missoes").addEventListener("click", async (event) => {
    if (event.target && event.target.classList.contains("btn-excluir")) {
        const idMissao = event.target.getAttribute("data-id");
        const confirmar = confirm("Tem certeza que deseja excluir esta missão?");
        if (confirmar) {
            try {
                const response = await fetch(`http://localhost:3000/api/missoes/${idMissao}`, { method: "DELETE" });
                if (response.ok) {
                    alert("Missão deletada com sucesso.");
                    listarMissoes();
                } else {
                    alert("Erro ao excluir missão.");
                }
            } catch (error) {
                console.error("Erro ao excluir missão: ", error);
            }
        }
    }
});


document.addEventListener("DOMContentLoaded", () => {
    listarMissoes();
});