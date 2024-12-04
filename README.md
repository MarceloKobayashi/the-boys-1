# Sistema de Controle de Heróis
- Sistema para manipular dados, contidos num banco de dados MySQL, de heróis da série The Boys, podendo fazer um CRUD de heróis, associá-los a missões e crimes, além da possibilidade de realizar uma batalha entre eles.

## Header
- Cabeçalho de todas as páginas para navegar entre as telas do sistema a partir de botões que direcionam para a tela específica:
  - **Heróis**: Vai para a tela de Heróis.
  - **Crimes**: Vai para a tela de Crimes.
  - **Missões**: Vai para a tela de Missões.
  - **Lutar!**: Vai para a tela de Batalha.

## Tela de Heróis
- Exibe uma tela com todos os heróis cadastrados no banco de dados um embaixo do outro, com todas as suas características:
  - **Imagem**: Exibe uma imagem para reconhecer o herói.
  - **Nome Real**: Nome verdadeiro do herói.
  - **Nome de Herói**: Nome falso do herói.
  - **Sexo**: Masculino(M) ou Feminino(F)
  - **Altura**: Altura em metros(m).
  - **Peso**: Peso em kilogramas(kg).
  - **Data de nascimento**: Data de nascimento do herói.
  - **Local de nascimento**: Local onde o herói nasceu.
  - **Nível de Força**: De 0 a 100.
  - **Popularidade**: De 0 a 100.
  - **Status**: Ativo, Inativo ou Banido.
  - **N° de Vitórias e Derrotas**: Baseado em suas batalhas.
  - **Poderes**: Lista de poderes mais significantes do herói.

- **É possível**:
  - **Filtrar** os heróis exibidos em 3 aspectos, que podem ser combinados para montar uma query no banco de dados:
    - **Nome**: Pesquisa tanto no nome real quanto no nome de herói. 
    - **Status**: Pesquisa os heróis ativos, inativos ou banidos. 
    - **Popularidade**: Mostrando os heróis mais populares no topo ou os menos populares no topo.
    - **Todos**: Botão que remove todos os filtros e volta a exibir todos os heróis na ordem padrão.
   
  - **Cadastrar** um novo herói ao clicar no botão ao lado dos filtros, no qual está escrito 'Cadastrar Herói'. Para cadastrar um herói no banco de dados, um dialog é aberto pedindo as seguintes informações:
    - **Imagem**: Url - Não necessária
    - **Nome Real**: Text - Necessário
    - **Nome de Herói**: Text - Necessário
    - **Sexo**: Char(select) - Necessário
    - **Altura**: Number - Necessária 
    - **Peso**: Number - Necessário
    - **Data de nascimento**: Date - Necessário
    - **Local de nascimento**: Text - Necessário 
    - **Nível de Força**: Number - Necessário
    - **Popularidade**: Number - Necessário
    - **Status**: Select - Necessário
    - **Poderes**: Text - Não necessário

  - **Deletar** e **Editar** um herói a partir de dois botões que ficam ao lado da imagem de cada herói:
    - **Deletar**: Abre um alerta para confirmar a exclusão do herói do banco de dados.
    - **Editar**: Abre um dialog idêntico ao do cadastro + o número de vitórias e derrotas, mas com as informações desse herói escritas nos campos que podem ser alteradas no dialog, e consequentemente no banco de dados:
      - **Imagem**: Url
      - **Nome Real**: Text - ReadOnly
      - **Nome de Herói**: Text 
      - **Sexo**: Char(select) - ReadOnly
      - **Altura**: Number
      - **Peso**: Number
      - **Data de nascimento**: Date - ReadOnly
      - **Local de nascimento**: Text - ReadOnly 
      - **Nível de Força**: Number
      - **Popularidade**: Number
      - **Status**: Select
      - **N° de Vitórias e Derrotas**: Number
      - **Poderes**: Text - Não necessário
     
## Tela de Crimes
- Exibe uma tela com todos os crimes cadastrados no banco de dados um embaixo do outro com as seguintes características:
  - **Crime**: Nome do crime resumido.
  - **Descrição**: Descrição mais detalhada do crime.
  - **Data Crime**: Dia de quanto o crime foi feito.
  - **Severidade**: Nível de gravidade do crime.
  - **Imagem do Herói**: Imagem do herói responsável pelo crime.
  - **Nome do Herói**: Nome do herói responsável pelo crime.

- **É possível**:
  - **Filtrar** os crimes exibidos em 3 aspectos, que podem ser combinados para montar uma query no banco de dados:
    - **Nome**: Pesquisa o nome do herói e mostra os crimes que tal herói é responsável. 
    - **Severidade**: Mostra os crimes de forma decrescente ou crescente de acordo com a severidade.
    - **Data**: Mostra os crimes mais antigos no topo ou os mais recentes.
    - **Todos**: Botão que remove todos os filtros e volta a exibir todos os crimes na ordem padrão.
   
  - **Cadastrar** um novo crime ao clicar no botão ao lado dos filtros, no qual está escrito 'Cadastrar Crime'. Ao se cadastrar um crime, o herói responsável perde popularidade igual a 3 * Severidade. Para cadastrar um crime no banco de dados, um dialog é aberto pedindo as seguintes informações:
    - **Nome do Crime**: Text - Necessário
    - **Descrição do Crime**: TextArea - Necessária
    - **Data do Crime**: Date - Necessária
    - **Severidade**: Number - Necessária
    - **Herói Responsável**: Select(heróis) - Necessário

  - **Deletar** um crime a partir um botão que fica ao lado do nome do crime:
    - **Deletar**: Para deletar um crime, precisa ter passado no mínimo 6 anos desde o ocorrido. Se tal condição não for cumprida, abre um alerta avisando que o crime não pode ser deletado, caso contrário, abre um alerta para confirmar a exclusão do crime do banco de dados. Ao deletar, o herói recebe de volta a popularidade.

## Tela de Missões
- Exibe uma tela com todas as missões cadastradas no banco de dados uma embaixo da outra com as seguintes características:
  - **Nome**: Nome da missão resumida.
  - **Descrição**: Descrição detalhada da missão.
  - **Recompensa**: Valor que cada herói vai receber ou perder nessa missão.
  - **Tipo de Recompensa**: O que cada herói vai receber ou perder nessa missão(Nível de Força ou Popularidade).
  - **Resultado**: Resultado da missão.
  - **Nível de Dificuldade**: Nível para escolher quais heróis devem participar da missão.
  - **Heróis Responsáveis**: Heróis que participaram da missão.
  - **Imagens dos Heróis**: Imagem dos heróis que participaram.

- **É possível**:
  - **Filtrar** as missões exibidas em 2 aspectos, que podem ser combinados para montar uma query no banco de dados:
    - **Nome**: Pesquisa o nome do herói e mostra as missões que tal herói é responsável. 
    - **Dificuldade**: Mostra as missões de forma decrescente ou crescente de acordo com a dificuldade da missão.
    - **Todos**: Botão que remove todos os filtros e volta a exibir todas as missões na ordem padrão.
   
  - **Cadastrar** uma nova missão ao clicar no botão ao lado dos filtros, no qual está escrito 'Cadastrar Missão'. Ao se cadastrar uma missão, os heróis responsáveis perdem ou ganham popularidade ou nivel de força igual a dificuldade da missão. Para cadastrar uma missão no banco de dados, um dialog é aberto pedindo as seguintes informações:
    - **Nome da Missão**: Text - Necessário
    - **Descrição da Missão**: TextArea - Necessária
    - **Recompensa**: Number - Necessária
    - **Tipo de Recompensa**: Select(Popularidade ou Força) - Necessária
    - **Resultado**: Select(Sucesso ou Fracasso) - Necessário
    - **Dificuldade**: Number - Necessária
    - **Herói Responsável**: Seleciona 3 heróis de acordo com o nível de dificuldade da missão. Heróis mais fortes ficam com missões mais difíceis.

  - **Deletar** uma missão a partir de um botão que ficaa ao lado do nome da missão:
    - **Deletar**: Para deletar uma missão, abre um alerta para confirmar a exclusão da missão do banco de dados. Ao obter sucesso ao deletar uma missão, os heróis envolvidos perdem a recompensa obtida, ou seja:
      + Missão 1: Sucesso, 3 de Popularidade -- Ao apagar os heróis perdem 3 de popularidade.
      + Missão 2: Fracasso, 5 de Força -- Ao apagar, os heróis ganham 5 de força.











