const dialogCadastrar = document.getElementById("dialog-cadastrar");

const btnCadastrar = document.getElementById("btn-cadastrar");
btnCadastrar.addEventListener("click", () => {
    dialogCadastrar.showModal();
});

const btnCadastroFechar = document.getElementById("btn-dialog-cadastrar-fechar");
btnCadastroFechar.addEventListener("click", () => {
    dialogCadastrar.close();
});

const dialogExcluir = document.getElementById("dialog-excluir");

const btnExcluir = document.getElementById("btn-excluir");
btnExcluir.addEventListener("click", () => {
    dialogExcluir.showModal();
});

const btnExclusaoFechar = document.getElementById("btn-dialog-excluir-fechar");
btnExclusaoFechar.addEventListener("click", () => {
    dialogExcluir.close();
});