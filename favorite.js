const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
// const 代表我們希望 movies 維持不變, 但使用 const 代表你不能用 movies = response.data.results 這種簡單的等號賦值來把資料放進變數裡
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

function renderMovieList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    // title, image
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios
    .get(INDEX_URL + id)
    .then(response => {
      // response.data.results
      const data = response.data.results
      modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
      modalTitle.innerText = data.title
      modalDate.innerText = 'Release date: ' + data.release_date
      modalDescription.innerText = data.description
    })
}

function removeFromFavorite(id) {
  // 這段程式碼的目的是在檢查 movies 變數，如果它是空或者是一個空陣列，就立即返回，不再執行後續的程式碼。
  if (!movies || !movies.length) return

  // 用findIndex將電影一個一個丟進函式判斷, 如果movie.id = id, 就是我們要的(只會回傳第一個滿足的index), 若沒能找到符合的項目，則會回傳 -1
  const movieIndex = movies.findIndex((movie) => movie.id === id)

  // 如果movieIndex不存在，就立即返回，不再執行後續的程式碼。
  if (movieIndex === -1) return

  //刪除該筆電影
  movies.splice(movieIndex, 1)

  // 將用JSON.stringify轉換成字串的movies放入localStorage
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))

  //更新頁面
  renderMovieList(movies)
}

// function給個名字會比較好debug
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {

    // 在按鈕上加上data-id後,可以在event.target.dataset找到所按的id(是字串)
    // console.log(event.target.dataset)
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

renderMovieList(movies)