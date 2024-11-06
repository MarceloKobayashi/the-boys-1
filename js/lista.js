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
