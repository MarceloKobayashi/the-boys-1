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
        const ultimo_batalhar = false;
        const poderes = [];

        const poderInput = document.querySelectorAll("#poderes-lista span");
        poderInput.forEach(input => poderes.push(input.textContent.slice(0, -1)));

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
                    derrotas: derrotas,
                    ultimo_batalhar: ultimo_batalhar,
                    poderes: poderes
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
                poderes.length = 0;
                
            } else {
                alert("Erro ao cadastrar heroi");
            }
        } catch (error) {
            console.error("Erro ao cadastrar herói: ",error);
        }
    }
});

document.getElementById("btn-adicionar-poder").addEventListener("click", () => {
    const poderInput = document.getElementById("poderes");
    const poderValor = poderInput.value.trim();

    if (poderValor) {
        const poderesLista = document.getElementById("poderes-lista");
        const novoPoder = document.createElement("span");

        novoPoder.textContent = poderValor;

        const removerPoder = document.createElement("button");
        removerPoder.textContent = "X";
        removerPoder.addEventListener("click", () => {
            poderesLista.removeChild(novoPoder);
        });

        novoPoder.appendChild(removerPoder);
        poderesLista.appendChild(novoPoder);
        poderInput.value = "";
    }
});

document.getElementById("poderes").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("btn-adicionar-poder").click();
    }
});

async function listarHerois(nome = '', status = '', popularidade = '') {
    try {
        const url = new URL('http://localhost:3000/api/herois');
        
        if (nome) url.searchParams.append('nome', nome);
        if (status) url.searchParams.append('status', status);
        if (popularidade) url.searchParams.append('popularidade', popularidade);
        
        const response = await fetch(url);
        const herois = await response.json();

        herois.sort((a, b) => {
            if (a.ultimo_batalhar && !b.ultimo_batalhar) return -1;
            if (!a.ultimo_batalhar && b.ultimo_batalhar) return 1;
            return 0;
        });

        const tabela = document.getElementById("tabela-herois").getElementsByTagName("tbody")[0];

        tabela.innerHTML = "";

        herois.forEach(heroi => {
            const linha = tabela.insertRow();

            const dataNasc = formatarData(heroi.data_nasc);
            const sexo = heroi.sexo.toUpperCase();
            const status = heroi.status_heroi.charAt(0).toUpperCase() + heroi.status_heroi.slice(1).toLowerCase();

            const poderes = heroi.poderes && heroi.poderes.length > 0 ? `<ul>${heroi.poderes.map(poder => `<li>${poder.nome_poder}</strong></li>`).join('')}</ul>`:'Nenhum poder registrado';
           
            if (heroi.ultimo_batalhar) {
                linha.style.backgroundColor = '#1A237E';
                linha.style.color = 'white';
            }

            linha.innerHTML = `
            <td id="btns-lista">
                <button class="btn-excluir" data-id="${heroi.id_heroi}">Excluir</button>
                <button class="btn-editar" data-id="${heroi.id_heroi}">Editar</button>
            </td>
            <td><img src="${heroi.imagem_heroi}" alt="${heroi.nome_heroi}" style="width: 50px; height: auto; border-radius: 5px;"></td>
            <td>${heroi.nome_real}</td>
            <td>${heroi.nome_heroi}</td>
            <td>${sexo}</td>
            <td>${heroi.altura}m</td>
            <td>${heroi.peso}kg</td>
            <td>${dataNasc}</td>
            <td>${heroi.local_nasc}</td>
            <td>${heroi.nivel_forca}/100</td>
            <td>${heroi.popularidade}/100</td>
            <td>${status}</td>
            <td>${heroi.vitorias}</td>
            <td>${heroi.derrotas}</td>
            <td>${poderes}</td>
            `;

        });
    } catch (error) {
        console.error("Erro ao listar heróis: ", error);
    }
}

document.getElementById('btn-busca-nome-status').addEventListener("click", () => {
    const nomeBusca = document.getElementById("input-nome").value;
    const statusBusca = document.getElementById("input-status").value;
    const popularidadeBusca = document.getElementById("input-popularidade").value;

    listarHerois(nomeBusca, statusBusca, popularidadeBusca);
});

document.getElementById('btn-todos').addEventListener("click", () => {
    document.getElementById("input-nome").value = "";
    document.getElementById("input-status").value = "";
    document.getElementById("input-popularidade").value = "";

    listarHerois();
});

document.getElementById("input-nome").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("btn-busca-nome-status").click();
    }
});

document.getElementById("tabela-herois").addEventListener("click", async (event) => {
    if (event.target && event.target.classList.contains("btn-excluir")) {

        const idHeroi = event.target.getAttribute("data-id");
        const confirmar = confirm("Tem certeza que deseja excluir este herói?");

        if (confirmar) {
            try {
                const response = await fetch(`http://localhost:3000/api/herois/${idHeroi}`, {
                    
                    method: "DELETE",
                });
                
                if (response) {
                    alert("Herói deletado com sucesso.");

                    const nomeBusca = document.getElementById("input-nome").value;
                    const statusBusca = document.getElementById("input-status").value;
                    const popularidadeBusca = document.getElementById("input-popularidade").value;
                
                    listarHerois(nomeBusca, statusBusca, popularidadeBusca);
                } else {
                    alert("Erro ao excluir herói.");
                }
            } catch (error) {
                console.error("Erro ao excluir herói: ", error);
            }
        }
    }
});


document.getElementById("tabela-herois").addEventListener("click", async (event) => {
    if (event.target && event.target.classList.contains("btn-editar")) {
        const idHeroi = event.target.getAttribute("data-id");
        
        try {
            const response = await fetch(`http://localhost:3000/api/herois/${idHeroi}`);
            const heroi = await response.json();

            document.getElementById("editar-id").value = heroi.id_heroi;
            document.getElementById("editar-imagem-heroi").value = heroi.imagem_heroi;
            document.getElementById("editar-nome-real").value = heroi.nome_real;
            document.getElementById("editar-nome-heroi").value = heroi.nome_heroi;
            document.getElementById("editar-sexo").value = heroi.sexo;
            document.getElementById("editar-altura").value = heroi.altura;
            document.getElementById("editar-peso").value = heroi.peso;
            document.getElementById("editar-data-nasc").value = heroi.data_nasc.split("T")[0];
            document.getElementById("editar-local-nasc").value = heroi.local_nasc;
            document.getElementById("editar-nivel-forca").value = heroi.nivel_forca;
            document.getElementById("editar-popularidade").value = heroi.popularidade;
            document.getElementById("editar-status").value = heroi.status_heroi.toLowerCase();
            document.getElementById("editar-vitorias").value = heroi.vitorias;
            document.getElementById("editar-derrotas").value = heroi.derrotas;

            const poderesLista = document.getElementById("poderes-lista");
            poderesLista.innerHTML = "";

            if (heroi.poderes && Array.isArray(heroi.poderes)) {
                heroi.poderes.forEach((poder) => {
                    const novoPoder = document.createElement("span");
                    novoPoder.textContent = "-" + poder.nome_poder;

                    const removerPoder = document.createElement("button");
                    removerPoder.textContent = "X";
                    removerPoder.addEventListener("click", () => {
                        poderesLista.removeChild(novoPoder);
                    });

                    novoPoder.appendChild(removerPoder);
                    poderesLista.appendChild(novoPoder);
                });
            }

            document.getElementById("editar-heroi-dialog").showModal();

        } catch (error) {
            console.error("Erro ao buscar dados do herói para edição: ", error);
        }
    }
});

document.getElementById("btn-adicionar-poder").addEventListener("click", () => {
    const poderInput = document.getElementById("poderes");
    const poderValor = poderInput.value.trim();

    if (poderValor) {
        const poderesLista = document.getElementById("poderes-lista");
        const novoPoder = document.createElement("span");

        novoPoder.textContent = "-" + poderValor;

        const removerPoder = document.createElement("button");
        removerPoder.textContent = "X";
        removerPoder.addEventListener("click", () => {
            poderesLista.removeChild(novoPoder);
        });

        novoPoder.appendChild(removerPoder);
        poderesLista.appendChild(novoPoder);
        poderInput.value = "";
    }
});

document.getElementById("salvar-edicao").addEventListener("click", async () => {
    const idHeroi = document.getElementById("editar-id").value;

    const heroiAtualizado = {
        imagem_heroi: document.getElementById("editar-imagem-heroi").value,
        nome_real: document.getElementById("editar-nome-real").value,
        nome_heroi: document.getElementById("editar-nome-heroi").value,
        sexo: document.getElementById("editar-sexo").value,
        altura: parseFloat(document.getElementById("editar-altura").value),
        peso: parseFloat(document.getElementById("editar-peso").value),
        data_nasc: document.getElementById("editar-data-nasc").value,
        local_nasc: document.getElementById("editar-local-nasc").value,
        nivel_forca: parseInt(document.getElementById("editar-nivel-forca").value),
        popularidade: parseInt(document.getElementById("editar-popularidade").value),
        status_heroi: document.getElementById("editar-status").value,
        vitorias: parseInt(document.getElementById("editar-vitorias").value),
        derrotas: parseInt(document.getElementById("editar-derrotas").value)
    };

    const poderes = [];
    const poderElementos = document.querySelectorAll("#poderes-lista span");
    poderElementos.forEach(poderElemento => {
        let poder = poderElemento.textContent.slice(1)
        poderes.push(poder.slice(0, -1));
    });

    heroiAtualizado.poderes = poderes;

    try {
        const response = await fetch(`http://localhost:3000/api/herois/${idHeroi}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(heroiAtualizado)
        });

        if (response.ok) {
            alert("Herói atualizado com sucesso.");
            document.getElementById("editar-heroi-dialog").close();
            listarHerois();
        } else {
            alert("Erro ao atualizar herói");
        }
    } catch (error) {
        console.error("Erro ao atualizar herói: ", error);
    }
});

document.getElementById("btn-sair-edicao").addEventListener("click", () => {

    document.getElementById("editar-heroi-dialog").close();
});


function formatarData(data) {
    const dataObj = new Date(data);
    const dia = `${String(dataObj.getDate()).padStart(2, '0')}`;
    const mes = `${String(dataObj.getMonth() + 1).padStart(2, '0')}`;
    const ano = `${String(dataObj.getFullYear())}`;
    
    return `${dia}/${mes}/${ano}`;
}

document.addEventListener('DOMContentLoaded', () => {
    listarHerois();
});
