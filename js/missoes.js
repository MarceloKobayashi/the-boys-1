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

