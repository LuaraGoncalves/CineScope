# CineScope - Dashboard de Filmes e Séries

CineScope é uma aplicação web interativa e responsiva que permite aos usuários explorar, pesquisar e descobrir filmes e séries. O projeto foi desenvolvido com HTML, CSS e JavaScript puros, consumindo a API do [The Movie Database (TMDB)](https://www.themoviedb.org/).

## Funcionalidades

- **Dashboard Dinâmico:** Pesquise filmes por nome e filtre por gênero, ano de lançamento ou classificação.
- **Detalhes do Filme:** Clique em um card para ver informações detalhadas, como sinopse, elenco, gêneros e trailer.
- **Lista de Favoritos:** Salve seus filmes preferidos em uma "Minha Lista" que fica armazenada localmente no seu navegador.
- **Quiz Interativo:** Teste seus conhecimentos com um quiz divertido que pergunta o nome do filme a partir de sua sinopse.
- **Catálogo de Trailers:** Assista aos trailers dos filmes mais populares da semana em um carrossel interativo.

## Tecnologias Utilizadas

- **HTML5:** Para a estrutura da página.
- **CSS3:** Para a estilização, layout responsivo e animações.
- **JavaScript (ES6+):** Para a lógica da aplicação, manipulação do DOM e requisições à API (usando `fetch`).
- **API do TMDB:** Para obter todos os dados sobre filmes, séries, trailers e imagens.

## Como Executar o Projeto

Para executar o CineScope localmente, siga estes passos:

1.  **Clone o repositório (ou baixe os arquivos):**
    ```bash
    git clone https://github.com/LuaraGoncalves/CineScope.git
    ```

2.  **Obtenha uma chave de API do TMDB:**
    - Crie uma conta gratuita no [The Movie Database](https://www.themoviedb.org/signup).
    - Nas configurações da sua conta, vá para a seção "API" e solicite uma chave **v3 auth**.

3.  **Adicione a chave de API ao projeto:**
    - Abra o arquivo `script.js`.
    - Encontre a linha: const apiKey = 'SUA_CHAVE_AQUI';

`
    - Substitua o valor existente pela sua chave de API.

4.  **Abra o `index.html` no seu navegador:**
    - A maneira mais simples é abrir o arquivo `index.html` diretamente no seu navegador.
    - Para uma melhor experiência, você pode usar um servidor local. Se tiver o Node.js instalado, execute o seguinte comando no terminal dentro da pasta do projeto:
      ```bash
      npx serve
      ```
      E acesse o endereço fornecido (geralmente `http://localhost:3000`).

