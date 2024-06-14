document.querySelectorAll(".radio_button").forEach(function (radio) {
  radio.addEventListener("change", function () {
    const cost = this.value === "2000" ? "新台幣2000元" : "新台幣2500元";
    document.querySelector(".price").textContent = cost;
  });
});
window.addEventListener("DOMContentLoaded", () => {
  const attractionId = window.location.pathname.split("/").pop();
  fetchAttractionDetails(attractionId);
});

async function fetchAttractionDetails(attractionId) {
  const response = await fetch(`/api/attraction/${attractionId}`);
  if (response.status === 400) {
    // if response 400 redirect to index.html directly
    window.location.href = "/";
    // return;
  }
  const result = await response.json();
  const attraction = result.data;
  renderAttractionDetails(attraction);
  setupArrowNavigation();
}
//renderAttractionDetails沒有async操作
function renderAttractionDetails(attraction) {
  const pictureCurrentElement = document.querySelector(
    ".section_picture_current"
  );
  const pointGroupElement = document.querySelector(".point-group");

  // 迭代 attraction.images 並為每張圖片創建 <img> 元素
  //imageUrl接收attraction.images的每個elements
  attraction.images.forEach((imageUrl, index) => {
    const imgElement = document.createElement("img");
    imgElement.src = imageUrl;
    imgElement.alt = "";
    if (index === 0) {
      imgElement.classList.add("active");
    }
    pictureCurrentElement.appendChild(imgElement);

    const liElement = document.createElement("li");
    if (index === 0) {
      liElement.classList.add("active");
    }
    pointGroupElement.appendChild(liElement);
  });

  document.querySelector(".section_profile_name").textContent = attraction.name;
  document.querySelector(".section_profile_category").textContent =
    attraction.category;
  document.querySelector(".section_profile_mrt").textContent = attraction.mrt;
  document.querySelector(".description").textContent = attraction.description;
  document.querySelector(".address-content").textContent = attraction.address;
  document.querySelector(".transport-content").textContent =
    attraction.transport;
}
//
function setupArrowNavigation() {
  const arrowContainer = document.querySelector(".picture_current_arrow");
  const leftArrow = document.querySelector(".picture_current_left_arrow");
  const rightArrow = document.querySelector(".picture_current_right_arrow");
  const images = document.querySelectorAll(".section_picture_current img");
  const points = document.querySelectorAll(".point-group li");

  let currentIndex = 0;

  function showImage(index) {
    images[currentIndex].classList.remove("active");
    points[currentIndex].classList.remove("active");
    currentIndex = index;
    images[currentIndex].classList.add("active");
    points[currentIndex].classList.add("active");
  }

  arrowContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("picture_current_left_arrow")) {
      const newIndex = (currentIndex - 1 + images.length) % images.length;
      showImage(newIndex);
    } else if (event.target.classList.contains("picture_current_right_arrow")) {
      const newIndex = (currentIndex + 1) % images.length;
      showImage(newIndex);
    }
  });

  points.forEach((point, index) => {
    point.addEventListener("click", () => {
      showImage(index);
    });
  });
}
