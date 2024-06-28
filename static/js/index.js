let keyword = "";
window.addEventListener("DOMContentLoaded", () => {
  fetchAttractions(); //執行景點loading
  setSearchButtonListener(); //搜尋功能
  fetchMrts(); //mrts list loading
  //點擊景點導向attraction.html
});
//載入景點
let isLoading = false; // 新增標誌變量
async function fetchAttractions(nextPage, keyword) {
  if (isLoading) return; // 如果正在加載數據,直接return不執行下面
  isLoading = true; // 設置加載標誌

  let url = `/api/attractions`;
  if (nextPage) {
    url += `?page=${nextPage}`; // Only append page parameter
  }
  if (keyword) {
    // Check if keyword exists before appending
    url += `&keyword=${keyword}`; // Append keyword parameter only if keyword is not empty
  }

  const response = await fetch(url);
  const data = await response.json();
  const attractions = data.data;
  const nextPageUrl = data.nextPage;

  renderAttractions(attractions);

  // 儲存下一頁的 URL
  window.nextPage = nextPageUrl;

  // 設置監聽滾動事件
  setScrollListener();
  isLoading = false; // 加載完成,重置加載標誌
}
//滾動監聽
function setScrollListener() {
  let timeoutId = null;

  window.addEventListener("scroll", () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      if (
        scrollTop + clientHeight >= scrollHeight &&
        window.nextPage !== null
      ) {
        fetchAttractions(window.nextPage, keyword);
      }
    }, 300);
  });
}
///
//attractions render
// function renderAttractions(attractions) {
//   const attractionsContainer = document.querySelector(".attractions");
//   const attractionTemplate = document.querySelector(".attractions-item");
//   // 只在第一次渲染時刪除模板
//   if (attractionsContainer.children.length === 1) {
//     attractionTemplate.remove();
//   }
//   attractions.forEach((attraction) => {
//     const attractionItem = attractionTemplate.cloneNode(true);

//     const img = attractionItem.querySelector(".attractions-img img");
//     img.src = attraction.images[0];

//     const name = attractionItem.querySelector(".name");
//     name.textContent = attraction.name;

//     const category = attractionItem.querySelector(".category");
//     category.textContent = attraction.category;

//     const mrt = attractionItem.querySelector(".mrt");
//     if (mrt) {
//       mrt.textContent = attraction.mrt === null ? "" : attraction.mrt;
//     }

//     attractionsContainer.appendChild(attractionItem);
//   });
// }

//Mrt載入　及左右按鈕功能
async function fetchMrts() {
  const stationInfo = document.querySelector(".station-info");
  const leftArrow = document.querySelector(".left_arrow");
  const rightArrow = document.querySelector(".right_arrow");
  // 獲取模板元素
  const stationListTemplate = document.querySelector(".station-list");
  try {
    const response = await fetch("/api/mrts");
    const data = await response.json();

    data.data.forEach((station) => {
      if (station !== null) {
        // create station-list　copy
        const stationElement = stationListTemplate.cloneNode(true);
        stationElement.textContent = station;
        // Add click event listener to each station element
        stationElement.addEventListener("click", () => {
          // Set the text input value to the clicked station name
          document.querySelector(".custom-input").value = station;
          keyword = station; // Set the keyword to the clicked station name
          nextPage = 0; // Reset to first page
          searchAttractions(); // Perform the search with the selected station name
        });

        stationInfo.appendChild(stationElement);
      }
    });
    // 在第一次渲染後刪除模板元素
    if (stationListTemplate) {
      stationListTemplate.remove();
    }

    leftArrow.addEventListener("click", () => {
      stationInfo.scrollBy({ left: -300, behavior: "smooth" });
    });

    rightArrow.addEventListener("click", () => {
      stationInfo.scrollBy({ left: 300, behavior: "smooth" });
    });

    if (stationInfo.children.length === 0) {
      document.querySelector(".station-info").remove();
    }
  } catch (error) {
    console.error("Error fetching MRT data:", error);
  }
}

//

async function searchAttractions() {
  if (isLoading) return; //if true表示在loading　return不執行　避免重複觸發loading
  isLoading = true;

  const url = `/api/attractions?keyword=${keyword}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const attractions = data.data;
    nextPage = data.nextPage;

    if (keyword || keyword === "") {
      // 如果有關鍵字,則清空現有的景點列表 ，同時如果空值也refresh//
      const attractionsContainer = document.querySelector(".attractions");
      const attractionTemplate = document.getElementById("attraction-template");

      // 將 <template> 元素移到容器外部
      attractionsContainer.parentNode.insertBefore(
        attractionTemplate,
        attractionsContainer
      );
      // 清空容器內容
      attractionsContainer.innerHTML = "";
      // 將 <template> 元素移回容器內部
      attractionsContainer.appendChild(attractionTemplate);
    }

    renderAttractions(attractions);

    isLoading = false;

    if (nextPage) {
      setScrollListener();
    }
  } catch (error) {
    console.error("搜尋景點時發生錯誤:", error);
    isLoading = false;
  }
}

function setSearchButtonListener() {
  document.querySelector(".search-bar-btn").addEventListener("click", () => {
    keyword = document.querySelector(".custom-input").value;
    nextPage = 0; //重置頁碼 原本是null
    searchAttractions();
  });
}

///
function renderAttractions(attractions) {
  const attractionsContainer = document.querySelector(".attractions");
  const attractionTemplate = document.getElementById("attraction-template");

  if (!attractionTemplate) {
    console.error("找不到 #attraction-template 模板元素");
    return;
  }

  // 清空容器中的所有子元素
  // attractionsContainer.innerHTML = "";

  attractions.forEach((attraction) => {
    const attractionItem = attractionTemplate.content.cloneNode(true);

    const link = attractionItem.querySelector(".attraction-link");
    link.href = `/attraction/${attraction.id}`;

    const img = attractionItem.querySelector(".attractions-img img");
    img.src = attraction.images[0];

    const name = attractionItem.querySelector(".name");
    name.textContent = attraction.name;

    const category = attractionItem.querySelector(".category");
    category.textContent = attraction.category;

    const mrt = attractionItem.querySelector(".mrt");
    if (mrt) {
      mrt.textContent = attraction.mrt === null ? "" : attraction.mrt;
    }

    attractionsContainer.appendChild(attractionItem);
  });
}

//點擊station-list該內容傳遞到searchAttractions以之為keyword

//處理點擊　預定行程　判斷登入狀態與跳登入框
document.addEventListener("DOMContentLoaded", () => {
  const toBookingBtn = document.querySelector(".to-booking-btn");
  const overlay = document.querySelector(".overlay");
  const signInBlock = document.querySelector(".sign-in-block");

  function showDialog(dialog) {
    overlay.style.display = "flex";
    dialog.style.display = "block";
    dialog.setAttribute("open", "");
  }
  async function BookingBtn() {
    const token = localStorage.getItem("token");
    if (!token) {
      // 用戶未登入,顯示登入按鈕
      showDialog(signInBlock);
      console.log("hel");
      return;
    }

    try {
      const response = await fetch("/api/user/auth", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log("Received data from backend:", data);

      if (data.data) {
        // 用戶已登入,顯示登出按鈕
        window.location.href = "/booking";
        console.log("hee");
      }
    } catch (error) {
      console.error("Error fetching user auth:", error);
    }
  }
  toBookingBtn.addEventListener("click", () => {
    BookingBtn();
  });
});
