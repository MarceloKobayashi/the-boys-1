async function listarCrimes(nome_heroi = '', severidade = '', data = '') {
    try {
        const url = new URL('http://localhost:3000/api/crimes');
        
        if (nome_heroi) url.searchParams.append('nome_heroi', nome_heroi);
        if (severidade) url.searchParams.append('severidade', severidade);
        if (data) url.searchParams.append('data', data);
        
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
    const data = document.getElementById("input-data").value;

    listarCrimes(nomeHeroi, severidade, data);
});

document.getElementById("btn-todos").addEventListener("click", () => {
    document.getElementById("input-nome").value = "";
    document.getElementById("input-severidade").value = "";
    document.getElementById("input-data").value = "";

    listarCrimes();
});

document.getElementById("input-nome").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("btn-busca-nome-status").click();
    }
});

async function carregarHeroisSelect() {
    try {
        const response = await fetch("http://localhost:3000/api/herois");
        const herois = await response.json();

        const selectHeroi = document.getElementById("nome-heroi");
        selectHeroi.innerHTML = '<option value="">Selecione um herói</option>';
        
        herois.forEach(heroi => {
            const option = document.createElement("option");

            option.value = heroi.id_heroi;
            option.textContent = heroi.nome_heroi;
            selectHeroi.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar heróis: ", error);
    }
}

document.getElementById("tabela-crimes").addEventListener("click", async (event) => {
    if (event.target && event.target.classList.contains("btn-excluir")) {
        
        const idCrime = event.target.getAttribute("data-id");

        try {
            const response = await fetch(`http://localhost:3000/api/crimes/${idCrime}`);
            const crime = await response.json();

            const dataCrime = new Date(crime.data_crime);
            const dataAtual = new Date();
            const diffAnos = dataAtual.getFullYear() - dataCrime.getFullYear();
        
            if (diffAnos >= 6) {
                const confirmar = confirm("Tem certeza que deseja excluir esse crime?");

                if (confirmar) {
                    const deleteResponse = await fetch(`http://localhost:3000/api/crimes/${idCrime}`, {
                        method: "DELETE",
                    });

                    if (deleteResponse.ok) {
                        alert("Crime deletado com sucesso.");
        
                        listarCrimes();
                    } else {
                        alert("Erro ao excluir crime.");
                    }
                }
            } else {
                alert("O crime não pode ser deletado, pois não se passaram 6 anos desde o ocorrido.");
            }

        } catch (error) {
            console.error("Erro ao excluir crime: ", error);
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

document.getElementById("btn-cadastrar-crime").addEventListener("click", async () => {
    await carregarHeroisSelect();
    document.getElementById("dialog-cadastrar").showModal();
});

document.getElementById("btn-dialog-cadastrar-fechar").addEventListener("click", () => {
    document.getElementById("dialog-cadastrar").close();
});

document.getElementById("form-cadastrar").addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const crimeData = {
        nome_crime: formData.get("nome-crime"),
        descricao_crime: formData.get("desc-crime"),
        data_crime: formData.get("data-crime"),
        severidade_crime: formData.get("severidade"),
        id_heroi: formData.get("nome-heroi")
    };

    console.log(crimeData);

    try {
        const response = await fetch("http://localhost:3000/api/crimes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(crimeData)
        });
        
        if (response.ok) {
            alert("Crime cadastrado com sucesso!");
            document.getElementById("dialog-cadastrar").close();
            listarCrimes();
        } else {
            alert("Erro ao cadastrar crime.");
        }
    } catch (error) {
        console.error("Erro ao cadastrar crime: ", error);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    listarCrimes();
});
