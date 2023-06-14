import data from '../json/gallery-data.json' assert {type: 'json'};

const gallery = document.getElementById('loader');

data.forEach(item => {
  const preview = document.createElement('div');
  preview.className = 'preview';
  preview.innerHTML = `
    <img src="${item['image']}" class="content">
    <a href="${item['link']}" class="overlay">
        <h2>${item['id']}</h2>
    </a>
  `;
  gallery.appendChild(preview);
});
