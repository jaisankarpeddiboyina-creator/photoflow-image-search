/// <reference types="../@types/jquery" />
$(function () {
  let searchInput = "";
  let page = 1;
  let data = [];

  const accessKey = "1Mj8M0z8EUCvpyERROc71qZ2s1YvtcFA6T_Ur5UHA4U";

  async function downloadImage(downloadLocation, filename) {
    try {
      const separator = downloadLocation.includes('?') ? '&' : '?';
      const trackResponse = await fetch(downloadLocation + separator + "client_id=" + accessKey);
      const trackData = await trackResponse.json();
      const imageUrl = trackData.url;
      try {
        const imageResponse = await fetch(imageUrl);
        const blob = await imageResponse.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename || 'photoflow-image.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 5000);
      } catch (e) {
        window.open(imageUrl, '_blank');
      }
    } catch (error) {
      alert('Download failed. Please try again.');
    }
  }

  async function searchImgs() {
    
    const url = `https://api.unsplash.com/search/photos?page=${page}&query=${searchInput}&client_id=${accessKey}`;
    const searchApi = await fetch(url);
    const apiResponse = await searchApi.json();

    if (!apiResponse.error) {
      if (page === 1) {
        data = apiResponse.results;
      } else {
        data = data.concat(apiResponse.results);
      }
      displayImgs();
    }
  }

  function displayImgs() {
    let searchResults = "";
    if (data.length === 0) {
      searchResults = "<p class='text-center fw-bold'>No results found.</p>";
    } else {
      for (let i = 0; i < data.length; i++) {
        searchResults += `
          <div class="col-md-6 col-lg-4">
            <div class="card searchImg">
            <div id="cardImg">
               <img
                src="${data[i].urls.small}"
                class="card-img-top"
                alt="${data[i].alt_description}"
                /></div>
               <div class="card-body">
  <a href="${data[i].links.html}" class="card-text" target="_blank" rel="noopener">${data[i].alt_description || 'Untitled Photo'}</a>
  <p class="credit">Photo by <a href="${data[i].user.links.html}?utm_source=photoflow&utm_medium=referral" target="_blank">${data[i].user.name}</a> on <a href="https://unsplash.com/?utm_source=photoflow&utm_medium=referral" target="_blank">Unsplash</a></p>
  <button onclick="downloadImage('${data[i].links.download_location}', '${(data[i].alt_description || 'photo').replace(/[^a-z0-9]/gi, '_')}.jpg')" class="btn btn-custom btn-sm download-btn">⬇ Download HD</button>
</div>
             </div>
          </div>`;
      }
    }
    $("#inputResults").html(searchResults);

    if (data.length > 0) {
      $("#showMoreBtn").removeClass("d-none");
    } else {
      $("#showMoreBtn").addClass("d-none");
    }
  }

  function performSearch() {
    searchInput = $("#searchInput").val();
    searchImgs();
  }

  $("#searchInput").on("keyup", function (event) {
    if (event.key === "Enter") {
      page = 1;
      performSearch();
    }
  });

  $("#searchBtn").on("click", function () {
    page = 1;
    performSearch();
  });

  $("#showMoreBtn").on("click", function () {
    page++;
    if (searchInput == $("#searchInput").val()) {
      performSearch();
    } else {
      searchImgs();
    }
  });

  $(".fixedCard").on("click", function () {
    const cardTitle = $(this).find(".cardTitle").text();
    searchInput = cardTitle;
    searchImgs();
  });

  $("#inputResults").on("click", ".searchImg", function () {
    const imgLink = $(this).find(".card-text").attr("href");
    window.open(imgLink, "_blank");
  });
});
