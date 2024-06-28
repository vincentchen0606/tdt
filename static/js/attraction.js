document.querySelectorAll(".radio_button").forEach(function (radio) {
  radio.addEventListener("change", function () {
    const cost = this.value === "2000" ? "新台幣2000元" : "新台幣2500元";
    document.querySelector(".price").textContent = cost;
    //獲得被點擊的按鈕的的id
    const bookingTime = this.id;
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
//處理點擊　預定行程　判斷登入狀態與跳登入框
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
      // 用戶已登入,導向booking
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

//　開始預定行程
const bookingFormBtn = document.querySelector(".booking_form_btn");

async function createBooking() {
  const attractionId = window.location.pathname.split("/").pop();
  const date = document.getElementById("myDate").value;
  const time = document.querySelector('input[name="radio_date"]:checked').id;
  const price = document
    .querySelector(".price")
    .textContent.replace(/[^0-9]/g, "");

  if (!date) {
    alert("請選擇日期");
    return;
  }

  const bookingData = {
    attractionId: parseInt(attractionId),
    date: date,
    time: time,
    price: parseInt(price),
  };

  try {
    const response = await fetch("/api/booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(bookingData),
    });

    if (response.ok) {
      window.location.href = "/booking";
      //   console.log(bookingData);
      //   setTimeout(() => {
      //     window.location.href = "/booking";
      //   }, 100); // 添加 100 毫秒的延遲去看結果
      // }
    } else {
      console.error("Failed to create booking");
    }
  } catch (error) {
    console.error("Error creating booking:", error);
  }
}
// 開始預定按鈕的登入驗證
async function BookingBtnClick() {
  const token = localStorage.getItem("token");
  if (!token) {
    // 用戶未登錄,顯示登錄按鈕
    showDialog(signInBlock);
    return;
  }

  try {
    const response = await fetch("/api/user/auth", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();

    if (data.data) {
      // 用戶已登錄,進行預約操作
      await createBooking();
    }
  } catch (error) {
    console.error("Error fetching user auth:", error);
  }
}

//
bookingFormBtn.addEventListener("click", () => {
  BookingBtnClick();
  createBooking();
});
