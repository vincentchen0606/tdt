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
        console.log("test");
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
}
// 取得訂單編號從url參數
function updateOrderNumber() {
  let url = new URL(window.location.href);
  let orderNumber = url.searchParams.get("number");
  if (orderNumber) {
    let orderNumberDiv = document.querySelector(".orderNumber");
    if (orderNumberDiv) {
      orderNumberDiv.textContent = orderNumber;
    }
  }
}
window.onload = updateOrderNumber;
