document.addEventListener("DOMContentLoaded", function () {
  const toBookingBtn = document.querySelector(".to-booking-btn");
  const overlay = document.querySelector(".overlay");
  const signInBlock = document.querySelector(".sign-in-block");
  const signUpBlock = document.querySelector(".sign-up-block");
  const closeBtns = document.querySelectorAll(".close-btn");
  const toSignUpBtn = document.querySelector(".to-sign-up");
  const toSignInBtn = document.querySelector(".to-sign-in");
  const signInUpBtn = document.querySelector(".signinup-btn");
  // 沒有登入直接導回首頁避免直接輸入url過來
  async function AuthStatus() {
    const token = localStorage.getItem("token");
    if (!token) {
      // 用戶未登入,回首頁
      window.location.href = "/";
      return;
    }
  }
  AuthStatus();

  //   toBookingBtn.addEventListener("click", () => {
  //     // 檢查使用者是否已登入
  //     fetch("/api/user/auth")
  //       .then((response) => response.json())
  //       .then((data) => {
  //         console.log("Received data:", data); // 添加調試語句
  //         if (data.data) {
  //           // 使用者已登入，重定向到預定行程頁面
  //           window.location.href = "/booking";
  //           console.log("afg");
  //         } else {
  //           // 使用者未登入，開啟登入對話框
  //           showDialog(signInBlock);
  //         }
  //       })
  //       .catch((error) => {
  //         console.error("Error:", error);
  //       });
  //   });
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
  function showDialog(dialog) {
    overlay.style.display = "flex";
    dialog.style.display = "block";
    dialog.setAttribute("open", "");
  }

  //
  toBookingBtn.addEventListener("click", () => {
    BookingBtn();
  });
});

async function checkAuthStatus() {
  const token = localStorage.getItem("token");
  if (!token) {
    // 用戶未登入,顯示登入按鈕
    showDialog(signInBlock);
    return;
  }
}

//render
// customer-name
// first-picture
// journey-infor-name
// date
// time
// price
// location
// input id name插入屬性placeholder="name"
// input id email插入屬性placeholder="email"
// confirm-price-check
// to-booking-btn
// booking.js

// 檢查使用者登入狀態
async function checkUserLoginStatus() {
  const token = localStorage.getItem("token");
  if (!token) {
    // 用戶未登入,直接導回首頁
    window.location.href = "/";
    return;
  }

  //   try {
  //     const response = await fetch("/api/user/auth", {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     const data = await response.json();

  //     if (!data.data) {
  //       // 用戶身份驗證失敗,直接導回首頁
  //       window.location.href = "/";
  //     }
  //   } catch (error) {
  //     console.error("Error fetching user auth:", error);
  //     window.location.href = "/";
  //   }
}
//
// 從 localStorage 中獲取 JWT　然後放進聯絡資訊
const token = localStorage.getItem("token");

if (token) {
  // 解析 JWT
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  const userData = JSON.parse(jsonPayload);

  // 填入使用者資訊
  document.querySelector(".customer-name").textContent = userData.name;
  document.getElementById("name").value = userData.name;
  document.getElementById("email").value = userData.email;
}
// 獲取預訂資料並渲染頁面
async function fetchAndRenderBookingData() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch("/api/booking", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();

    if (data.data) {
      const bookingData = data.data;
      //   console.log(bookingData);
      renderBookingPage(bookingData);
    } else {
      renderNoBookingMessage();
    }
  } catch (error) {
    console.error("Error fetching booking data:", error);
    renderNoBookingMessage();
  }
}

// 渲染預訂頁面
function renderBookingPage(bookingData) {
  const attraction = bookingData.attraction;
  const date = bookingData.date;
  const time = bookingData.time;
  const price = bookingData.price;
  document.querySelector;
  // 將資料填入相應的元素中
  document.querySelector(".first-picture img").src = attraction.image;
  document.querySelector(".journey-infor-name").textContent = attraction.name;
  document.querySelector(".date").textContent = date;
  document.querySelector(".time").textContent =
    time === "afternoon" ? "下午2點到7點" : "上午9點到下午1點";
  document.querySelector(".price").textContent = price;
  document.querySelector(".location").textContent = attraction.address;
}
// 頁面載入時執行的函式
async function init() {
  await checkUserLoginStatus();
  await fetchAndRenderBookingData();
}

// 頁面載入完成後執行init函式
window.addEventListener("load", init);
// 渲染沒有預定行程的訊息
function renderNoBookingMessage() {
  const sectionElement = document.querySelector(".section");
  const emptyStateElement = document.querySelector(".empty-state");

  sectionElement.style.display = "none";
  emptyStateElement.style.display = "block";
}
//
// 刪除預訂
const deleteIcon = document.querySelector(".delete-icon");
// 為刪除按鈕添加點擊事件監聽器
deleteIcon.addEventListener("click", deleteBooking);
async function deleteBooking() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch("/api/booking", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.ok) {
        // 刪除成功，重新加載頁面
        window.location.reload();
      } else {
        console.error("Failed to delete booking");
      }
    } else {
      console.error("Error deleting booking:", response.status);
    }
  } catch (error) {
    console.error("Error deleting booking:", error);
  }
}
