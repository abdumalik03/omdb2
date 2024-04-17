let themeBtn = document.querySelector('.themeChange')
themeBtn.addEventListener('click', changeTheme)

let loader = document.querySelector('.loader')

function changeTheme() {
    let body = document.querySelector('body')
    // let currentTheme = body.getAttribute('data-theme')
    let currentTheme = localStorage.getItem('theme')
    if(currentTheme == "dark") {
        body.setAttribute('data-theme', 'white')
        localStorage.setItem('theme', 'white');
    } else {
        body.setAttribute('data-theme', 'dark')
        localStorage.setItem('theme', 'dark');
    }
}

function startTheme() {
    let theme =  localStorage.getItem('theme')
    let body = document.querySelector('body')
    if(theme == "dark") {
        body.setAttribute('data-theme', 'dark')
    } else {
       body.setAttribute('data-theme', 'white')
    }
}

startTheme()

async function sendRequest(url, method, data) {

    if(method == "POST") {
        let response = await fetch(url, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
    
        response = await response.json()
        return response
    } else if(method == "GET") {
        url = url+"?"+ new URLSearchParams(data)
        let response = await fetch(url, {
            method: "GET",
            // headers: {
            //     'Accept': 'application/json',
            //     'Content-Type': 'application/json'
            // }
        })
        response = await response.json()
        return response
    }
}

let searchBtn = document.querySelector('.searchLine button')
if(searchBtn){
searchBtn.addEventListener('click', search)
}

async function search() {
    let searchQuery = document.getElementsByName('search')[0].value

    loader.classList.add('active')

    let movie = document.querySelector('.movie')
    movie.classList.remove('active')
    let similar = document.querySelector('.similar')
    similar.innerHTML = ""

    let response = await sendRequest('https://www.omdbapi.com/', "GET", {"apikey":"7c26d06e", "t": searchQuery})
    if(response.Response == "False") {
        let error = document.querySelector('.error')
        error.classList.add('active')
        error.innerHTML = "Фильм не найден"
        loader.classList.remove('active')
    } else {
        let error = document.querySelector('.error')
        error.classList.remove('active')

        showFilm(response)

        similarResult(searchQuery)
        loader.classList.remove('active')
    }
}

function showFilm(obj) {

    let movieTitle = document.querySelector('.movieTitle')
    movieTitle.innerHTML = obj.Title

    let poster = document.querySelector('.movieCover')
    poster.setAttribute('src', obj.Poster)

    let favBtn = document.querySelector('.movieData .favorite')
    favBtn.setAttribute('data-title', obj.Title)
    favBtn.setAttribute('data-poster', obj.Poster)
    favBtn.setAttribute('data-imdbId', obj.imdbId)

    let movieFullData = document.querySelector('.movieFullData')
    movieFullData.innerHTML = ""

    let arr = ['Genre', 'imdbRating', 'Year', 'Released', 'Type', 'Runtime', 'Writer', 'Plot', 'Language', 'Country', 'Actors']

    for(let elem of arr) {
        if(obj[elem]) {
            movieFullData.innerHTML = movieFullData.innerHTML + `
            <div class="movieLine">
                <div class="lineTitle">
                    ${elem}
                </div>
                <div class="lineData">
                    ${obj[elem]}
                </div>
            </div>` 
        }
    }

    let movie = document.querySelector('.movie')
    movie.classList.add('active')
}

async function similarResult(query) {
    let response = await sendRequest('https://www.omdbapi.com/', "GET", {"apikey":"7c26d06e", "s": query})
    if(response.Response == "False") {
        let similarLine = document.querySelector('.similarLine')
        similarLine.innerHTML = 'Похожих фильмов 0'
    } else {
        showSimilarFilms(response.Search)
        let similarLine = document.querySelector('.similarLine')
        similarLine.innerHTML = `Похожих фильмов ${response.totalResults}`
    }
}

function showSimilarFilms(arr) {
    let similar = document.querySelector('.similar')
    similar.innerHTML = ""

    for(let movie of arr) {
        similar.innerHTML = similar.innerHTML + `
        <div class="similarMovie">
            <div class="favorite"
            data-title="${movie.Title}"
            data-poster="${movie.Poster}"
            data-imdbId="${movie.imdbId}">
            </div>
            <img src="${movie.Poster}">
            <div class="title">${movie.Title}</div>
        </div>`
    }
    let favoriteBtns = document.querySelectorAll('.favorite')
    favoriteBtns.forEach((btn) =>{
        btn.addEventListener('click', addfav)
    })
}

function addfav() {
    let elem = event.target

    let title = elem.getAttribute('data-title')
    let poster = elem.getAttribute('data-poster')
    let imdbId = elem.getAttribute('data-imdbId')

    let obj = {
        "Title": title,
        "Poster": poster,
        "imdbId": imdbId // Добавлено имя свойства imdbId
    }

    let favs = localStorage.getItem('favs')

    if (!favs) {
        favs = []
    } else {
        favs = JSON.parse(favs)
    }

    // Проверяем, если фильм уже есть в избранном
    let existingIndex = favs.findIndex(item => item.imdbId === imdbId)
    if (existingIndex !== -1) {
        // Если фильм уже есть в избранном, удаляем его
        favs.splice(existingIndex, 1)
        elem.classList.remove('active') // Удаляем класс 'active' у элемента
    } else {
        // Если фильма нет в избранном, добавляем его
        favs.push(obj)
        elem.classList.add('active') // Добавляем класс 'active' элементу
    }

    localStorage.setItem('favs', JSON.stringify(favs))
}







function showFavorites () {
    let favorites = localStorage.getItem("favs")
    favorites = JSON.parse(favorites)

    showSimilarFilms(favorites)
}
