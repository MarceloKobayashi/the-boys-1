const dialogCadastrar = document.getElementById("dialog-cadastrar");

const btnCadastrar = document.getElementById("btn-cadastrar");
btnCadastrar.addEventListener("click", () => {
    dialogCadastrar.showModal();
});

const btnFechar = document.getElementById("btn-dialog-cancelar");
btnFechar.addEventListener("click", () => {
    dialogCadastrar.close();
});