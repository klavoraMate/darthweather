'use strict';
const baseAPI = 'http://api.weatherapi.com/v1/current.json?key=8e68355629214e5699a104413222810&q=';
window.addEventListener('load', () => {
  if (getCookie('unit') === '') setCookie('unit', 'metric', '1');
  refreshUnitButton(getCookie('unit'));
  let long;
  let lat;
  console.log('Location', navigator.geolocation.getCurrentPosition);
  navigator.geolocation.getCurrentPosition((position) => {
    console.log(position, 'aaa');
    long = position.coords.longitude;
    lat = position.coords.latitude;
    const locationAPI = `${baseAPI}${lat},${long}&aqi=no`;
    fetchData(locationAPI);

  }, () => {
    const ipAPI = 'https://api.ipgeolocation.io/ipgeo?apiKey=9093ef76fe4845cfb8223775c9f56ea5';

    const fetchIP = async (IPurl) => {
      try {
        const response = await fetch(IPurl, {
        });
        const data = await response.json();
        fetchData(`${baseAPI}${data.city}&aqi=no`);
      } catch (error) {
        console.error(error);
      }
    };
    fetchIP(ipAPI);
  });
  fillCityDataList();
});

document.getElementById('unit').addEventListener('click', (e) => {

  if (e.target.id) {
    refreshUnitButton(e.target.id);
    setCookie('unit', e.target.id, '1');
    fetchData(getCookie('url'));
  }
});

const fetchData = async (url) => {
  setCookie('url', url, '1');
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
    console.log(data.location.localtime);
    displayDataParse(data);
  } catch (error) {
    console.error(error);
  }
};
function displayDataParse(data) {
  const { current, location } = data;
  const isMetric = getCookie('unit') === 'metric';  //document.getElementById('metric').checked;
  const units = {
    temp: isMetric ? `${current.temp_c} ℃` : `${current.temp_f} °F`,
    feelslike: isMetric ? `${current.feelslike_c} ℃` : `${current.feelslike_f} °F`,
    gust: isMetric ? `${current.gust_kph} km/h` : `${current.gust_mph} mi/h`,
  };
  const localDdate = location.localtime.split('-').join('.');
  const root = document.querySelector('#root');
  root.innerHTML = '';
  const imgElement = root.parentElement.getElementsByTagName('img');
  if (imgElement.length !== 0) root.parentElement.removeChild(imgElement[0]);

  displayData(root.parentElement, 'afterbegin', 'img', '', `src="https://${data.current.condition.icon}"`);
  displayData(root, 'beforeend', 'h2', `${localDdate}<br>${location.country}<br>${location.name}`);
  displayData(root, 'beforeend', 'p', `Temperature: ${units.temp}<br>Temperature feel: ${units.feelslike}`);
  displayData(root, 'beforeend', 'p', `Sky condition: ${current.condition.text}<br>Wind speed: ${units.gust}<br>Humidity: ${data.current.humidity} %`);
  displayData(root, 'beforeend', 'p', ``, `id="wind" class="bi bi-heart-arrow" style="width:16px "`);
  const wind = document.getElementById('wind');
  wind.style.transform = `rotate(${current.wind_degree}deg)`;
  displayCityImg(location.name);
}
function displayData(htmlPart, where = 'beforeend', tagType, content = '', attributes = '') {
  htmlPart.insertAdjacentHTML(where, `<${tagType} ${attributes}>${content}</${tagType}>`);
}

function refreshUnitButton(unit) {
  document.getElementById('metric').checked = false;
  document.getElementById('imperial').checked = false;

  document.getElementById(unit).checked = true;
}

function getCookie(cname) {
  const name = `${cname}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  const expires = `expires=${d.toUTCString()}`;
  document.cookie = `${cname}=${cvalue};${expires};path=/`;
}

function fillCityDataList() {
  const dataList = document.getElementById('cities');
  let numberOfCharacters = 0;

  myCities.addEventListener('input', (event) => {
    numberOfCharacters = myCities.value.length;

    if (numberOfCharacters === 3 && event.inputType === 'insertText') {
      dataList.innerHTML = '';
      citiesRaw.forEach((city) => {
        const cityOption = document.createElement('option');
        cityOption.value = city;
        dataList.appendChild(cityOption);
      });
    }

    if (numberOfCharacters === 2 && event.inputType === 'deleteContentBackward') dataList.innerHTML = '';
  });

  myCities.addEventListener('change', () => {
    if (numberOfCharacters > 2) {
      displayCityImg(myCities.value);
      fetchData(`${baseAPI}${myCities.value}&aqi=no`);
    }
  });
}
/**
 * Displaying an image of the selected city.
 * There are multiple photos and its choosing randomly
 * @param {string} cityName
 */
function displayCityImg(cityName) {
  fetch(`https://api.pexels.com/v1/search?query=${cityName}`, {
    headers: {
      Authorization: "563492ad6f91700001000001ffb25fc58d924f8495cae56a3a20cbe0"
    }
  })
    .then(resp => {
      return resp.json();
    })
    .then(data => {
      const image = document.getElementById('imageDiv');
      image.style.backgroundImage = 'url(' + data.photos[Math.floor(Math.random() * data.photos.length)].src.landscape + ')';
    });
}
