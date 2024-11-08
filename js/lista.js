async function listarHerois(nome = '', status = '', popularidade = '') {
    try {
        const url = new URL('http://localhost:3000/api/herois');
        
        if (nome) url.searchParams.append('nome', nome);
        if (status) url.searchParams.append('status', status);
        if (popularidade) url.searchParams.append('popularidade', popularidade);
        
        const response = await fetch(url);
        const herois = await response.json();

        const tabela = document.getElementById("tabela-herois").getElementsByTagName("tbody")[0];

        tabela.innerHTML = "";

        herois.forEach(heroi => {
            const linha = tabela.insertRow();

            const dataNasc = formatarData(heroi.data_nasc);
            const sexo = heroi.sexo.toUpperCase();
            const status = heroi.status_heroi.charAt(0).toUpperCase() + heroi.status_heroi.slice(1).toLowerCase();
                
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

            document.getElementById("editar-heroi-dialog").showModal();

        } catch (error) {
            console.error("Erro ao buscar dados do herói para edição: ", error);
        }
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
