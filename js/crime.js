async function listarCrimes(nome_heroi = '', severidade = '') {
    try {
        const url = new URL('http://localhost:3000/api/crimes');
        
        if (nome_heroi) url.searchParams.append('nome_heroi', nome_heroi);
        if (severidade) url.searchParams.append('severidade', severidade);
        
        const response = await fetch(url);
        const crimes = await response.json();

        const tabela = document.getElementById("tabela-crimes").getElementsByTagName("tbody")[0];

        tabela.innerHTML = "";

        crimes.forEach(crime => {
            const linha = tabela.insertRow();

            const dataCrime = formatarData(crime.data_crime);

            const heroiNome = crime.herois.map(heroi => heroi.nome_heroi).join(", ") || 'Desconhecido';
            const heroiImagem = crime.herois.map(heroi => 
                heroi.imagem_heroi ? 
                `<img src="${heroi.imagem_heroi}" alt="${heroi.nome_heroi}" style="width: 50px; height: auto; border-radius: 5px;">` : 
                'Imagem não disponível'
            ).join(", ");

            linha.innerHTML = `
            <td id="btns-lista">
                <button class="btn-excluir" data-id="${crime.id_crime}">Excluir</button>
                <button class="btn-editar" data-id="${crime.id_crime}">Editar</button>
            </td>
            <td>${crime.nome_crime}</td>
            <td>${crime.descricao_crime}</td>
            <td>${dataCrime}</td>
            <td>${crime.severidade_crime}/10</td>
            <td>${heroiImagem}</td>
            <td>${heroiNome}</td>
            `;
        });
    } catch (error) {
        console.error("Erro ao listar heróis: ", error);
    }
}

document.getElementById("btn-busca-nome-status").addEventListener("click", () => {
    const nomeHeroi = document.getElementById("input-nome").value;
    const severidade = document.getElementById("input-severidade").value;

    listarCrimes(nomeHeroi, severidade);
});

document.getElementById("btn-todos").addEventListener("click", () => {
    document.getElementById("input-nome").value = "";
    document.getElementById("input-severidade").value = "";

    listarCrimes();
});

document.getElementById("input-nome").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("btn-busca-nome-status").click();
    }
});

document.getElementById("tabela-crimes").addEventListener("click", async (event) => {
    if (event.target && event.target.classList.contains("btn-excluir")) {
        
        const idCrime = event.target.getAttribute("data-id");
        const confirmar = confirm("Tem certeza que deseja excluir esse crime?");

        if (confirmar) {
            try {
                const response = await fetch(`http://localhost:3000/api/crimes/${idCrime}`, {
                    method: "DELETE",
                });
            
                if (response) {
                    alert("Crime deletado com sucesso.");

                    listarCrimes();
                } else {
                    alert("Erro ao excluir crime.");
                }
            } catch (error) {
                console.error("Erro ao excluir crime: ", error);
            }
        }
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
    listarCrimes();
});
