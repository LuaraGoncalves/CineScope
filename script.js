document.addEventListener('DOMContentLoaded', () => {
    const apiKey = 'c77102f0a300e64fe1c5fa9bcab0ff60'; //  TMDB (v3)
    const apiUrl = 'https://api.themoviedb.org/3';
    const imgUrl = 'https://image.tmdb.org/t/p/w500';

    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const movieContainer = document.getElementById('movie-container');
    const genreFilter = document.getElementById('genre-filter');
    const yearFilter = document.getElementById('year-filter');
    const ratingFilter = document.getElementById('rating-filter');
    const modal = document.getElementById('movie-modal');
    const modalBody = document.getElementById('modal-body');
    const closeButton = document.querySelector('.close-button');
    const watchlistContainer = document.getElementById('watchlist-container');
    const navLinks = document.querySelectorAll('nav a');
    const notificationBell = document.getElementById('notification-bell');
    const notificationDot = document.getElementById('notification-dot');
    const newsModal = document.getElementById('news-modal');
    const newsContainer = document.getElementById('news-container');
    const newsModalCloseButton = newsModal.querySelector('.close-button');
    const sections = document.querySelectorAll('main section');
    const newsApiKey = '085c6506062145b186cec2c03fb54954'; 
    const yearOptions = document.getElementById('year-options');
    
    const getWatchlist = () => JSON.parse(localStorage.getItem('watchlist')) || [];
    const addToWatchlist = (movie) => {
        const watchlist = getWatchlist();
        watchlist.push(movie);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        renderWatchlist();
    };
    const removeFromWatchlist = (movieId) => {
        let watchlist = getWatchlist();
        watchlist = watchlist.filter(movie => movie.id !== movieId);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        renderWatchlist();
    };
    const isInWatchlist = (movieId) => getWatchlist().some(movie => movie.id === movieId);

    const renderWatchlist = () => {
        const watchlist = getWatchlist();
        watchlistContainer.innerHTML = '';
        if (watchlist.length === 0) {
            watchlistContainer.innerHTML = `<p>Sua lista de favoritos está vazia.</p>`;
            return;
        }
        displayMovies(watchlist, watchlistContainer);
    };

    const fetchMovies = async (query = '', genre = '', year = '', rating = '') => {
        if (!apiKey || apiKey === 'YOUR_API_KEY') {
            movieContainer.innerHTML = `<p style="color: var(--text-color);">Por favor, adicione sua chave de API do TMDB em script.js</p>`;
            return;
        }

        let url = `${apiUrl}/discover/movie?api_key=${apiKey}&language=pt-BR&sort_by=popularity.desc`;
        if (query) {
            url = `${apiUrl}/search/movie?api_key=${apiKey}&language=pt-BR&query=${encodeURIComponent(query)}`;
        }

        if (genre) url += `&with_genres=${genre}`;
        if (year) url += `&primary_release_year=${year}`;
        if (rating) url += `&vote_average.gte=${rating}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro da API: ${errorData.status_message || response.statusText} (Status: ${response.status})`);
            }
            const data = await response.json();
            displayMovies(data.results);
        } catch (error) {
            console.error('Erro ao buscar filmes:', error);
            let errorMessage = 'Não foi possível carregar os filmes. Tente novamente mais tarde.';
            if (error.message.includes('API') || error.message.includes('401')) {
                errorMessage = `Ocorreu um erro com a API. Verifique se sua chave de API (v3) é válida e foi inserida corretamente.`;
            }
            movieContainer.innerHTML = `<p style="color: var(--text-color);">${errorMessage}</p>`;
        }
    };

    const displayMovies = (movies, container = movieContainer) => {
        container.innerHTML = '';
        if (movies.length === 0) {
            container.innerHTML = `<p>Nenhum filme encontrado.</p>`;
            return;
        }

        movies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');
            movieCard.innerHTML = `
                <img src="${movie.poster_path ? imgUrl + movie.poster_path : 'https://via.placeholder.com/500x750?text=No+Image'}" alt="${movie.title}">
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <p>Ano: ${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</p>
                </div>
                <div class="rating">${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</div>
            `;
            movieCard.addEventListener('click', () => showMovieDetails(movie.id));
            container.appendChild(movieCard);
        });
    };


    const fetchGenres = async () => {
        if (!apiKey || apiKey === 'YOUR_API_KEY') return;
        try {
            const response = await fetch(`${apiUrl}/genre/movie/list?api_key=${apiKey}&language=pt-BR`);
            const data = await response.json();
            data.genres.forEach(genre => {
                const option = document.createElement('option');
                option.value = genre.id;
                option.textContent = genre.name;
                genreFilter.appendChild(option.cloneNode(true));
                recommenderGenreFilter.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao buscar gêneros:', error);
        }
    };

    const showMovieDetails = async (movieId) => {
        if (!apiKey || apiKey === 'YOUR_API_KEY') return;
        try {
            const url = `${apiUrl}/movie/${movieId}?api_key=${apiKey}&language=pt-BR&append_to_response=credits,videos`;
            const response = await fetch(url);
            const movie = await response.json();

            const trailer = movie.videos.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
            const trailerKey = trailer ? trailer.key : null;
            const isFavorited = isInWatchlist(movie.id);

            modalBody.innerHTML = `
                <img src="${movie.poster_path ? imgUrl + movie.poster_path : 'https://via.placeholder.com/500x750?text=No+Image'}" alt="${movie.title}">
                <div class="modal-info">
                    <h3>${movie.title}</h3>
                    <p class="genres"><strong>Gêneros:</strong> ${movie.genres.map(g => g.name).join(', ')}</p>
                    <p>${movie.overview || 'Sinopse não disponível.'}</p>
                    <p class="cast"><strong>Elenco:</strong> ${movie.credits.cast.slice(0, 5).map(c => c.name).join(', ')}</p>
                    <div>
                        ${trailerKey ? `<a href="https://www.youtube.com/watch?v=${trailerKey}" target="_blank" class="trailer-btn">Ver Trailer</a>` : ''}
                        <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" data-movie-id="${movie.id}">${isFavorited ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}</button>
                    </div>
                </div>
            `;

            const favoriteBtn = modalBody.querySelector('.favorite-btn');
            favoriteBtn.addEventListener('click', () => {
                if (isInWatchlist(movie.id)) {
                    removeFromWatchlist(movie.id);
                } else {
                    addToWatchlist(movie);
                }
        
                showMovieDetails(movie.id);
            });

            modal.style.display = 'block';
            document.body.classList.add('modal-open');
        } catch (error) {
            console.error('Erro ao buscar detalhes do filme:', error);
        }
    };


    const closeModal = () => {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    };


    closeButton.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        fetchMovies(query, genreFilter.value, yearFilter.value, ratingFilter.value);
    });

    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            fetchMovies(query, genreFilter.value, yearFilter.value, ratingFilter.value);
        }
    });
    
    [genreFilter, yearFilter, ratingFilter].forEach(filter => {
        filter.addEventListener('change', () => {
             const query = searchInput.value.trim();
             fetchMovies(query, genreFilter.value, yearFilter.value, ratingFilter.value);
        });
    });


    const quizStartScreen = document.getElementById('quiz-start-screen');
    const quizGameScreen = document.getElementById('quiz-game-screen');
    const quizEndScreen = document.getElementById('quiz-end-screen');
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const restartQuizBtn = document.getElementById('restart-quiz-btn');
    const nextQuestionBtn = document.getElementById('next-question-btn');
    const quizQuestionEl = document.getElementById('quiz-question');
    const quizOptionsEl = document.getElementById('quiz-options');
    const quizFeedbackEl = document.getElementById('quiz-feedback');
    const finalScoreEl = document.getElementById('final-score');
    const highScoreEl = document.getElementById('high-score');

    let quizQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    const totalQuestions = 5;

    const generateQuizQuestions = async () => {
        if (!apiKey || apiKey === 'YOUR_API_KEY') return [];
        const url = `${apiUrl}/movie/popular?api_key=${apiKey}&language=pt-BR&page=1`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            const moviesWithSynopsis = data.results.filter(m => m.overview).sort(() => 0.5 - Math.random());

            if (moviesWithSynopsis.length < 4) {
                console.error('Não há filmes suficientes com sinopse para criar o quiz.');
                return [];
            }

            const questions = [];
            const allMovies = [...moviesWithSynopsis];

            for (let i = 0; i < totalQuestions && i < allMovies.length; i++) {
                const correctMovie = allMovies[i];
                const otherOptions = allMovies.filter(m => m.id !== correctMovie.id).sort(() => 0.5 - Math.random()).slice(0, 3);
                
                if (otherOptions.length < 3) continue;

                const options = [correctMovie, ...otherOptions].sort(() => 0.5 - Math.random());
                
                questions.push({
                    synopsis: correctMovie.overview,
                    options: options.map(m => m.title),
                    correctAnswer: correctMovie.title
                });
            }
            return questions;
        } catch (error) {
            console.error('Erro ao gerar perguntas do quiz:', error);
            return [];
        }
    };

    const startQuiz = async () => {
        quizQuestions = await generateQuizQuestions();
        if (quizQuestions.length === 0) {
            quizQuestionEl.innerHTML = 'Não foi possível carregar o quiz. Verifique a chave da API.';
            return;
        }
        currentQuestionIndex = 0;
        score = 0;
        quizStartScreen.style.display = 'none';
        quizEndScreen.style.display = 'none';
        quizGameScreen.style.display = 'block';
        displayQuestion();
    };

    const displayQuestion = () => {
        const question = quizQuestions[currentQuestionIndex];
        quizQuestionEl.innerHTML = `
            <p>Qual filme tem a seguinte sinopse?</p>
            <p class="quiz-synopsis"><em>"${question.synopsis}"</em></p>
        `;
        quizOptionsEl.innerHTML = '';
        question.options.forEach(option => {
            const optionEl = document.createElement('div');
            optionEl.classList.add('quiz-option');
            optionEl.textContent = option;
            optionEl.addEventListener('click', () => selectAnswer(option, optionEl));
            quizOptionsEl.appendChild(optionEl);
        });
        quizFeedbackEl.textContent = '';
        nextQuestionBtn.style.display = 'none';
    };

    const selectAnswer = (selectedOption, optionEl) => {
        const question = quizQuestions[currentQuestionIndex];
        const isCorrect = selectedOption === question.correctAnswer;

        Array.from(quizOptionsEl.children).forEach(child => {
            child.style.pointerEvents = 'none';
            if (child.textContent === question.correctAnswer) {
                child.classList.add('correct');
            } else {
                child.classList.add('incorrect');
            }
        });

        if (isCorrect) {
            score++;
            quizFeedbackEl.textContent = 'Resposta Correta!';
            quizFeedbackEl.style.color = '#28a745';
        } else {
            quizFeedbackEl.textContent = `Incorreto! A resposta era: ${question.correctAnswer}`;
            quizFeedbackEl.style.color = '#dc3545';
        }
        nextQuestionBtn.style.display = 'block';
    };

    const nextQuestion = () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < totalQuestions) {
            displayQuestion();
        } else {
            endQuiz();
        }
    };

    const endQuiz = () => {
        quizGameScreen.style.display = 'none';
        quizEndScreen.style.display = 'block';
        finalScoreEl.textContent = score;
        const highScore = localStorage.getItem('highScore') || 0;
        if (score > highScore) {
            localStorage.setItem('highScore', score);
            highScoreEl.textContent = score;
        } else {
            highScoreEl.textContent = highScore;
        }
    };

    startQuizBtn.addEventListener('click', startQuiz);
    nextQuestionBtn.addEventListener('click', nextQuestion);
    restartQuizBtn.addEventListener('click', startQuiz);

    const trailerCarousel = document.getElementById('trailer-carousel');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    const trailerSearchInput = document.getElementById('trailer-search-input');
    const trailerSearchButton = document.getElementById('trailer-search-button');
    let trailerIndex = 0;

    const fetchTrendingTrailers = async (query = '') => {
        if (!apiKey || apiKey === 'YOUR_API_KEY') return;
        let url = `${apiUrl}/trending/movie/week?api_key=${apiKey}&language=pt-BR`;
        if (query) {
            url = `${apiUrl}/search/movie?api_key=${apiKey}&language=pt-BR&query=${encodeURIComponent(query)}`;
        }
        try {
            const response = await fetch(url);
            const data = await response.json();
            const moviesWithTrailers = [];

            for (const movie of data.results) {
                const videoUrl = `${apiUrl}/movie/${movie.id}/videos?api_key=${apiKey}`;
                const videoResponse = await fetch(videoUrl);
                const videoData = await videoResponse.json();
                const trailer = videoData.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
                if (trailer) {
                    moviesWithTrailers.push(trailer);
                }
            }
            displayTrailers(moviesWithTrailers);
        } catch (error) {
            console.error('Erro ao buscar trailers:', error);
        }
    };

    const displayTrailers = (trailers) => {
        trailerCarousel.innerHTML = '';
        if (trailers.length === 0) {
            trailerCarousel.innerHTML = '<p>Nenhum trailer em destaque encontrado.</p>';
            return;
        }
        trailers.forEach(trailer => {
            const item = document.createElement('div');
            item.classList.add('trailer-item');
            item.innerHTML = `
                <iframe src="https://www.youtube.com/embed/${trailer.key}" 
                title="${trailer.name}" frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen></iframe>
            `;
            trailerCarousel.appendChild(item);
        });
    };

    const moveCarousel = (direction) => {
        const items = document.querySelectorAll('.trailer-item');
        const totalItems = items.length;
        trailerIndex += direction;
        if (trailerIndex < 0) {
            trailerIndex = totalItems - 1;
        } else if (trailerIndex >= totalItems) {
            trailerIndex = 0;
        }
        trailerCarousel.style.transform = `translateX(-${trailerIndex * 100}%)`;
    };

    prevBtn.addEventListener('click', () => moveCarousel(-1));
    nextBtn.addEventListener('click', () => moveCarousel(1));

    trailerSearchButton.addEventListener('click', () => {
        const query = trailerSearchInput.value.trim();
        fetchTrendingTrailers(query);
    });

    trailerSearchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            const query = trailerSearchInput.value.trim();
            fetchTrendingTrailers(query);
        }
    });

    const handleNavigation = (e) => {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href').substring(1);
        
        sections.forEach(section => {
            if (section.id === targetId) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${targetId}`) {
                link.classList.add('active');
            }
        });
    };

    navLinks.forEach(link => link.addEventListener('click', handleNavigation));

    const setupInitialView = () => {
        sections.forEach(section => {
            if (section.id !== 'dashboard') {
                section.style.display = 'none';
            } else {
                section.style.display = 'block';
            }
        });
        document.querySelector('nav a[href="#dashboard"]').classList.add('active');
    };


    const populateYearFilter = () => {
        const currentYear = new Date().getFullYear();
        let lastLoadedYear = currentYear;
        const yearsPerLoad = 20;

        const loadMoreYears = () => {
            const endYear = Math.max(1900, lastLoadedYear - yearsPerLoad);
            for (let year = lastLoadedYear; year > endYear; year--) {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearFilter.appendChild(option);
            }
            lastLoadedYear = endYear;
        };

        loadMoreYears();

        yearFilter.addEventListener('scroll', () => {
            if (yearFilter.scrollTop + yearFilter.clientHeight >= yearFilter.scrollHeight) {
                loadMoreYears();
            }
        });
    };

    const fetchNews = async () => {

        if (!newsApiKey || newsApiKey === 'YOUR_NEWS_API_KEY') {
            newsContainer.innerHTML = `
                <p>Por favor, adicione sua chave de API do NewsAPI no arquivo <strong>script.js</strong>.</p>
                <p>Você pode obter uma chave gratuita em <a href="https://newsapi.org/" target="_blank">newsapi.org</a>.</p>
            `;
            return;
        }

     
        const query = '(filme OR série OR movie OR series OR anime OR cinema)';
        
        const domains = 'omelete.com.br,adorocinema.com,jovemnerd.com.br,ign.com,collider.com,variety.com';

        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&domains=${domains}&sortBy=publishedAt&apiKey=${newsApiKey}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'error') {
                console.error('Erro da API de Notícias:', data.message);
                let detailedErrorMessage = 'Ocorreu um erro ao buscar as notícias. Verifique sua chave de API.';
                if (data.code === 'apiKeyInvalid' || data.code === 'apiKeyExhausted' || data.code === 'apiKeyDisabled') {
                    detailedErrorMessage = `Sua chave da NewsAPI parece estar inválida, expirada ou excedeu o limite de uso. Por favor, obtenha uma nova chave gratuita em <a href="https://newsapi.org/" target="_blank">newsapi.org</a> e atualize a variável 'newsApiKey' no arquivo script.js.`;
                }
                newsContainer.innerHTML = `<p>${detailedErrorMessage}</p>`;
                return;
            }

            const articles = data.articles.slice(0, 15);

            if (articles.length === 0) {
                newsContainer.innerHTML = '<p>Nenhuma notícia encontrada no momento.</p>';
                return;
            }

            const lastSeenDate = localStorage.getItem('lastSeenNewsDate');
            
            if (articles.length > 0 && (!lastSeenDate || new Date(articles[0].publishedAt) > new Date(lastSeenDate))) {
                notificationDot.style.display = 'block';
            }

            newsContainer.innerHTML = articles.map(article => `
                <div class="news-item">
                    <h3><a href="${article.url}" target="_blank">${article.title}</a></h3>
                    <p>${article.source.name} - ${new Date(article.publishedAt).toLocaleDateString()}</p>
                    <p>${article.description || 'Sem descrição disponível.'}</p>
                </div>
            `).join('');
        } catch (error) {
            console.error('Erro ao buscar notícias:', error);
            newsContainer.innerHTML = `<p>Não foi possível carregar as notícias. Tente novamente mais tarde.</p>`;
        }
    };

    notificationBell.addEventListener('click', () => {
        newsModal.style.display = 'block';
        notificationDot.style.display = 'none';
        
        const articles = newsContainer.querySelectorAll('.news-item');
        if (articles.length > 0) {
            
            const latestArticle = newsContainer.querySelector('.news-item');
            if (latestArticle) {
                
                 localStorage.setItem('lastSeenNewsDate', new Date().toISOString());
            }
        }
    });

    newsModalCloseButton.addEventListener('click', () => {
        newsModal.style.display = 'none';
    });
    
    setupInitialView();
    populateYearFilter();
    fetchGenres();
    fetchMovies();
    renderWatchlist();
    fetchTrendingTrailers();
    fetchNews();
});
