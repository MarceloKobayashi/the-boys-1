const dialogCadastrar = document.getElementById("dialog-cadastrar");
const btnCadastrar = document.getElementById("btn-cadastrar");
btnCadastrar.addEventListener("click", () => {
    dialogCadastrar.showModal();
});
const btnCadastroFechar = document.getElementById("btn-dialog-cadastrar-fechar");
btnCadastroFechar.addEventListener("click", () => {
    dialogCadastrar.close();
});

const btnDialogCadastrar = document.getElementById("btn-dialog-cadastrar");
btnDialogCadastrar.addEventListener("click", async () => {
    const confirmar = confirm("Tem certeza que deseja cadastrar este herói?");

    if (confirmar) {
        const sexoInput = document.getElementById("sexo");
        let sexoValue = sexoInput.value;

        if (sexoValue.toLowerCase() === "masculino") {
            sexoValue = "m";
        } else {
            sexoValue = "f";
        }

        const imagemHeroi = document.getElementById("imagem-url").value;
        const nomeReal = document.getElementById("nome-real").value;
        const nomeHeroi = document.getElementById("nome-heroi").value;
        const sexo = sexoValue;
        const altura = document.getElementById("altura").value;
        const peso = document.getElementById("peso").value;
        const dataNasc = document.getElementById("data-nascimento").value;
        const localNasc = document.getElementById("local-nascimento").value;
        const nivelForca = document.getElementById("nivel-forca").value;
        const popularidade = document.getElementById("popularidade").value;
        const status = document.getElementById("status").value;
        const vitorias = 0;
        const derrotas = 0;

        try {
            const response = await fetch("http://localhost:3000/api/herois", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    imagem_heroi: imagemHeroi,
                    nome_real: nomeReal,
                    nome_heroi: nomeHeroi,
                    sexo: sexo,
                    altura: altura,
                    peso: peso,
                    data_nasc: dataNasc,
                    local_nasc: localNasc,
                    nivel_forca: nivelForca,
                    popularidade: popularidade,
                    status_heroi: status,
                    vitorias: vitorias,
                    derrotas: derrotas
                }),
            });

            if (response.ok) {
                alert("Herói cadastrado com sucesso.");

                imagemHeroi = "";
                nomeReal = "";
                nomeHeroi = "";
                sexo = "";
                altura = "";
                peso = "";
                dataNasc = "";
                localNasc = "";
                nivelForca = "";
                popularidade = "";
                status = "";
                
                listarHerois();
            } else {
                alert("Erro ao cadastrar heroi");
            }
        } catch (error) {
            console.error("Erro ao cadastrar herói: ",error);
        }
    }
});
