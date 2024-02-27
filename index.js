const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

// const 代表我們希望 movies 維持不變, 但使用 const 代表你不能用 movies = response.data.results 這種簡單的等號賦值來把資料放進變數裡
const movies = []
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

let currentPage = 1
let isCardView = true

function renderMovieList(data, isCardView) {
  let rawHTML = ''
  data.forEach((item) => {
    // title, image
    if (isCardView) {
      // 卡片視圖
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
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        </div>
      `
    } else {
      // 列表視圖
      rawHTML += `
        <div class="card">
          <div class="row g-0">
            <div class="col-md-1">
              <img src="${POSTER_URL + item.image}" class="card-img-top card-img-bottom" alt="Movie Poster">
            </div>
            <div class="col-md-9">
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
                <p>${item.description}</p>
              </div>
            </div>
            <div class="col-md-2">
              <div class="card-footer bg-transparent">
                <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        </div>
      ` 
    }
  })
  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page ++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {
  // 如果filteredMovies有東西, 給我filteredMovies, 沒東西的話給movies
  const data = filteredMovies.length ? filteredMovies : movies
  // 計算起始 index
  const starIndex = (page - 1) * MOVIES_PER_PAGE
  // 回傳切割後的新陣列
  return data.slice(starIndex, starIndex + MOVIES_PER_PAGE)
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

function addToFavorite(id) {
  // 從localStorage提取favoriteMovies列表(用JSON.parse將字串轉換成陣列), 如果沒有的話(or)就用空陣列
  // OR 的符號是 || (pipe ， 通常為於 enter 鍵上方) ，它會判斷左右兩邊的式子是 true 還是 false ，然後回傳是 true 的那個邊。如果兩邊都是 true ，以左邊為優先。null 值會被 OR 判斷為 false
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  
  // 用find將電影一個一個丟進函式判斷, 如果movie.id = id, 就是他要的(只會回傳第一個滿足的值)
  const movie = movies.find((movie) => movie.id === id)

  // 如果電影重複就跳出警告視窗以阻止加到清單中,some只判斷函式後回傳True或False
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中!')
  }

  list.push(movie)
  
  // 將用JSON.stringify轉換成字串的list放入localStorage
  localStorage.setItem('favoriteMovies', JSON.stringify(list))

  console.log(list)
}

// function給個名字會比較好debug

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {

    // 在按鈕上加上data-id後,可以在event.target.dataset找到所按的id(是字串)
    // console.log(event.target.dataset)
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  // 如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return
  // 透過 dataset 取得被點擊的頁數
  currentPage = Number(event.target.dataset.page)
  // 更新畫面
  renderMovieList(getMoviesByPage(currentPage), isCardView)
})

searchForm.addEventListener('click', function viewSwitch(event) {
  // 檢查被點擊的元素是否有指定的ID
  const clickedId = event.target.id;
  let isCardViewClicked = clickedId === 'card-view'
  let isListViewClicked = clickedId === 'list-view'
  // 如果點擊的是 #card-view 或 #list-view
  if (isCardViewClicked || isListViewClicked) {
    isCardView = isCardViewClicked
    // 根據點擊的按鈕 ID 來判斷要使用哪種方式渲染電影列表
    renderMovieList(getMoviesByPage(currentPage), isCardView);
  }
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  // 讓瀏覽器按下搜索鍵時不會刷新頁面
  event.preventDefault()
  
  // trim()能去掉頭尾空白, toLowerCase()全轉小寫, split(/\s+/)的作用是將字串分割成多個關鍵字，這些關鍵字以空白為分隔。
  // 括號內是正規表達式（regular expression）。正規表達式是一種用於搜索、匹配和處理文本的強大工具。在這裡，/\s+/ 是一個正規表達式，它的含義如下：
  // \s：表示匹配任何空白字符，包括空格、製表符（tab）、換行符等。
  // +：表示匹配前面的元素一次或多次，這裡是指一個或多個空白字符。
  // 因此，/\s+/ 整體上表示匹配一個或多個連續的空白字符。在 split 方法中，它被用來將字串分割成多個部分，每當遇到一個或多個空白字符時進行分割。/ / 是正規表達式中用來表示一個正規表達式的開始和結束的符號。
  const keywords = searchInput.value.trim().toLowerCase().split(/\s+/)

  // !代表反轉, false -> true
  // filter(function), 符合Function條件判斷的值才保留, 並形成新陣列, 如果function裡運算式只有一行return, 便可省略return成一行
  // 常用的還有map, filter, reduce
  // filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))
  filteredMovies = movies.filter(movie => {
    // 對每個電影的標題進行多個關鍵字的匹配, keywords.every 是一個陣列方法，它會對陣列中的每個元素應用一個測試函式，並在所有測試都返回 true 時結果為 true。
    return keywords.every(keyword => movie.title.toLowerCase().includes(keyword));
  })

  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }

  // 第二種方法用for-of迴圈, 把movies陣列裡每一個值代入movie運算
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
})

axios
  .get(INDEX_URL)
  .then((response) => {
    // Array(80) 所以我們需要用 movies.push() 的方式把資料放進去, 但丟進去後最外面會多一個陣列
    // 方法1 for of
    // for (let movie of response.data.results) {
    //   movies.push(movie)
    // }
    // 方法2 加上...就能去掉最外面包的陣列, ...三個點點就是展開運算子，他的主要功用是「展開陣列元素」。
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1), isCardView)
  })
  .catch((err) => console.log(err))

// 存取local資料的三種方式, 只能輸入字串, 陣列或物件得用JSON.stringify()轉換成字串,(用JSON.parse()將字串轉換成陣列)
// localStorage.setItem('default_language', 'english')  
// localStorage.getItem('default_language')
// localStorage.removeItem('default_language')
