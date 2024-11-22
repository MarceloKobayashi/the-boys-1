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
                    nivel_dificuldade: nivelDificuldade
                }),
            });

            if (response.ok) {
                alert("Missão cadastrada com sucesso.");
                
                nomeMissao = "";
                descricaoMissao = "";
                resultado = "";
                recompensa = "";
                nivelDificuldade = "";
            } else {
                alert("Erro ao cadastrar missão");
            }
        } catch (error) {
            console.error("Erro ao cadastrar missão: ", error);
        }
    }
});

