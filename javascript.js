// Custom Http Module
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}
// Init http module
const http = customHttp();
const newsService = (function() {
  const apiKey = '78733f4247c94245bddf77876ab4521d';
  const apiURL = 'https://news-api-v2.herokuapp.com';

  return {
    topHeadlines(country = 'ua', cb){
      http.get(`${apiURL}/top-headlines?country=${country}&apiKey=${apiKey}`, cb);
    },
    everything(querry, cb){
      http.get(`${apiURL}/everything?q=${querry}&apiKey=${apiKey}`, cb);
    }
  }
}) ();


// Elements
const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const searchInput = form.elements['search'];

form.addEventListener('submit', e => {
  e.preventDefault();
  loadNews()
})


//  init selects
document.addEventListener('DOMContentLoaded', function() {
  M.AutoInit();
  loadNews()
});


// Load news function
function loadNews() {
  showLoader();
  // const country = countrySelect.value;
  const searchText = searchInput.value;

  if(!searchText) {
  newsService.everything('ua', onGetResponse)
  } else{
    newsService.everything(searchText, onGetResponse)
  }
}

// function on get response from service
function onGetResponse(err, res) {
  removePreloader()

  console.log(res)

  if(err){
    showAlert(err, 'error-msg');
    return;
  }

  if(!res.articles.length){
    alert('No news on this topic');
    return

  }
  renderNews(res.articles);
  console.log(res.articles)
}


// function render news
function renderNews(news){
  const newsContainer = document.querySelector('.news-container .row');
  if(newsContainer.children.length){
    clearContainer(newsContainer)
  }
  let fragment = '';


  news.forEach(newsItem => {
    const el = newsTemplate(newsItem);
    fragment += el
  })

  newsContainer.insertAdjacentHTML('afterbegin', fragment)
}

// function clean container
function clearContainer(container){
  let child = container.lastElementChild;
  while(child){
    container.removeChild(child);
    child = container.lastElementChild;
  }
}

// news item template function
function newsTemplate({urlToImage, title, url, description}){
  return `
    <div class="col s12">
      <div class="card">
        <div class="card-image">
          <img src="${urlToImage}">
          <span class="card-title">${title || ''}</span>
        </div>
        <div class="card-content">
          <p>${description || ''}</p>
        </div>
        <div class="card-action">
          <a href="${url}">Read more</a>
        </div>
      </div>
    </div>
  `
}

function showAlert(msg, type = 'success'){
  M.toast({html: msg, classes: type})
}

//  Show loader function
function showLoader() {
  document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <div class="progress">
      <div class="indeterminate"></div>
    </div>
  `,
  );
}

// remove loader function
function removePreloader(){
  const loader = document.querySelector('.progress');
  if(loader){
    loader.remove()
  }
}