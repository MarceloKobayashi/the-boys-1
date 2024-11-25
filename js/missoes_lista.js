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
        const nivelDificuldade = document.getElementById("nivel-dificuldade").value;

        const heroisSelecionados = Array.from(document.getElementById("herois-lista").getElementsByClassName("heroi-item"))
                                        .map(item => item.getAttribute("data-id"));

        try {
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
                    nivel_dificuldade: nivelDificuldade,
                    herois_responsaveis: heroisSelecionados
                }),
            });

            if (response.ok) {
                alert("Missão cadastrada com sucesso.");
                
                nomeMissao = "";
                descricaoMissao = "";
                resultado = "";
                recompensa = "";
                nivelDificuldade = "";
                document.getElementById("herois-lista").innerHTML = "";
            } else {
                alert("Erro ao cadastrar missão");
            }
        } catch (error) {
            console.error("Erro ao cadastrar missão: ", error);
        }
    }
});

document.getElementById("btn-adicionar-heroi").addEventListener("click", () => {
    const selectHerois = document.getElementById("herois");
    const heroiSelecionadoId = selectHerois.value;
    const heroiSelecionadoNome = selectHerois.options[selectHerois.selectedIndex].textContent;

    if (heroiSelecionadoId) {
        const heroisLista = document.getElementById("herois-lista");

        const heroiRepetido = Array.from(heroisLista.getElementsByClassName("heroi-item"))
                                    .some(item => item.getAttribute("data-id") === heroiSelecionadoId);

        if (heroiRepetido) {
            alert("Este herói já foi adicionado à lista");
            return;
        }

        const listItem = document.createElement("div");
        listItem.classList.add("heroi-item");
        listItem.textContent = heroiSelecionadoNome;
        listItem.setAttribute("data-id", heroiSelecionadoId);

        const btnRemover = document.createElement("button");
        btnRemover.textContent = "X";
        btnRemover.classList.add("btn-remover-heroi");

        btnRemover.addEventListener("click", () => {
            heroisLista.removeChild(listItem);
        });
        
        listItem.appendChild(btnRemover);
    
        heroisLista.appendChild(listItem);
    } else {
        alert("Por favor, selecione um herói");
    }
});

//Preencher o select com os heróis
document.addEventListener("DOMContentLoaded", async () => {
    const response = await fetch(`http://localhost:3000/api/herois`);
    const herois = await response.json();

    const selectHerois = document.getElementById("herois");
    herois.forEach(heroi =>  {
        const option = document.createElement("option");
        option.value = heroi.id_heroi;
        option.textContent = heroi.nome_heroi;
        selectHerois.appendChild(option);
    });
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
            const heroisResponsaveis = missao.herois_responsaveis 
                ? `<ul>${missao.herois_responsaveis.split(', ').map(heroi => `<li>${heroi}</li>`).join('')}</ul>`
                : 'Nenhum herói registrado';

            const imagensHerois = missao.imagens_herois 
                ? missao.imagens_herois.split(',').map(img => `<img src="${img}" alt="Heroi" class="img-heroi-responsavel">`).join('')
                : 'Nenhuma imagem registrada';

            linha.innerHTML = `
            <td id="btns-lista">
                <button class="btn-excluir" data-id="${missao.id_missao}">Excluir</button>
                <button class="btn-editar" data-id="${missao.id_missao}">Editar</button>
            </td>
            <td>${missao.nome_missao}</td>
            <td>${missao.descricao_missao}</td>
            <td>${missao.recompensa}</td>
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

document.getElementById("tabela-missoes").addEventListener("click", async (event) => {
    if (event.target && event.target.classList.contains("btn-editar")) {
        const idMissao = event.target.getAttribute("data-id");
        try {
            const response = await fetch(`http://localhost:3000/api/missoes/${idMissao}`);
            const missao = await response.json();

            document.getElementById("editar-id-missao").value = missao.id_missao;
            document.getElementById("editar-nome-missao").value = missao.nome_missao;
            document.getElementById("editar-descricao-missao").value = missao.descricao_missao;
            document.getElementById("editar-recompensa").value = missao.recompensa;
            document.getElementById("editar-resultado").value = missao.resultado.toLowerCase();
            document.getElementById("editar-nivel-dificuldade").value = missao.nivel_dificuldade;

            document.getElementById("editar-missao-dialog").showModal();
        } catch (error) {
            console.error("Erro ao buscar dados da missão para edição: ", error);
        }
    }
});

document.getElementById("salvar-edicao-missao").addEventListener("click", async () => {
    const idMissao = document.getElementById("editar-id-missao").value;

    const missaoAtualizada = {
        nome_missao: document.getElementById("editar-nome-missao").value,
        descricao_missao: document.getElementById("editar-descricao-missao").value,
        recompensa: document.getElementById("editar-recompensa").value,
        resultado: document.getElementById("editar-resultado").value,
        nivel_dificuldade: document.getElementById("editar-nivel-dificuldade").value,
    };

    try {
        const response = await fetch(`http://localhost:3000/api/missoes/${idMissao}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(missaoAtualizada),
        });

        if (response.ok) {
            alert("Missão atualizada com sucesso.");
            document.getElementById("editar-missao-dialog").close();
            listarMissoes();
        } else {
            alert("Erro ao atualizar missão");
        }
    } catch (error) {
        console.error("Erro ao atualizar missão: ", error);
    }
});

document.getElementById("btn-sair-edicao-missao").addEventListener("click", () => {
    document.getElementById("editar-missao-dialog").close();
});

document.addEventListener("DOMContentLoaded", () => {
    listarMissoes();
});