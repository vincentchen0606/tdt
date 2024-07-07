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
      //會印出訂購相關資料
      console.log(bookingData);
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

// confirm-payment-Btn
// 取得 TapPay Fields 狀態
let inputName = document.querySelector(".inputName");
let inputEmail = document.querySelector(".inputEmail");
let inputPhone = document.querySelector(".inputPhone");
let primeNum;
let orderMsg = document.querySelector(".orderMsg");
function onClick() {
  // event.preventDefault()
  // 取得 TapPay Fields 的 status
  const tappayStatus = TPDirect.card.getTappayFieldsStatus();

  // 確認是否可以 getPrime
  if (tappayStatus.canGetPrime === false) {
    // alert('can not get prime')
    orderMsg.innerText = "信用卡資訊有誤，請重新輸入";
    orderMsg.style.fontSize = "14px";
    return;
  }

  if (
    inputName.value == "" ||
    inputEmail.value == "" ||
    inputPhone.value == ""
  ) {
    orderMsg.innerText = "請填寫所有欄位";
    orderMsg.style.fontSize = "14px";
    return;
  }

  orderMsg.setAttribute("style", "color:#448899");
  orderMsg.innerText = "信用卡驗證中，請稍等";
  orderMsg.style.fontSize = "14px";

  // Get prime
  TPDirect.card.getPrime((result) => {
    if (result.status !== 0) {
      console.log("get prime error " + result.msg);
      return;
    }
    // 測試是否拿到prime
    // alert("get prime 成功，prime: " + result.card.prime);
    primeNum = result.card.prime;
    fetchBookingDataAndOrder(primeNum);
    // myOrder(primeNum);

    // send prime to your server, to pay with Pay by Prime API .
    // Pay By Prime Docs: https://docs.tappaysdk.com/tutorial/zh/back.html#pay-by-prime-api
  });
}

async function fetchBookingDataAndOrder(prime) {
  try {
    const response = await fetch("/api/booking", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const bookingData = await response.json();

    if (bookingData.data) {
      myOrder(prime, bookingData.data);
    } else {
      orderMsg.innerText = "無法獲取訂單訊息";
      orderMsg.style.fontSize = "14px";
    }
  } catch (error) {
    console.error("Error fetching booking data:", error);
    orderMsg.innerText = "獲取訂單訊息時出錯";
    orderMsg.style.fontSize = "14px";
  }
}

//TapPay

async function myOrder(prime, orderInfo) {
  // 確保 orderInfo 存在
  if (!orderInfo) {
    orderMsg.innerText = "訂單缺少";
    orderMsg.style.fontSize = "14px";
    return;
  }

  let orderData = {
    prime: prime,
    order: {
      price: orderInfo.price,
      trip: {
        attraction: {
          id: orderInfo.attraction.id,
          name: orderInfo.attraction.name,
          address: orderInfo.attraction.address,
          image: orderInfo.attraction.image,
        },
        date: orderInfo.date,
        time: orderInfo.time,
      },
      contact: {
        name: inputName.value,
        email: inputEmail.value,
        phone: inputPhone.value,
      },
    },
  };

  console.log(orderData);

  try {
    orderMsg.innerText = "正在處理訂單，請稍候...";
    orderMsg.style.fontSize = "14px";

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(orderData),
    });

    const responseData = await response.json();

    if (response.ok) {
      console.log("訂單建立成功，包含付款狀態");
      orderMsg.innerText = "訂單建立成功，系統將3秒後自動跳轉";
      orderMsg.style.color = "green";
      orderMsg.style.fontSize = "14px";
      setTimeout(() => {
        window.location.href = `/thankyou?number=${responseData.data.number}`;
      }, 3000);
    } else {
      console.log("訂單建立失敗");
      orderMsg.innerText = responseData.message || "訂單建立失敗，請稍後再試";
      orderMsg.style.color = "red";
      orderMsg.style.fontSize = "14px";
    }
  } catch (error) {
    console.error("Error creating order:", error);
    orderMsg.innerText = "發生錯誤，請稍後再試";
    orderMsg.style.color = "red";
    orderMsg.style.fontSize = "14px";
  }
}

function thankyou(number) {
  document.location.href = `/thankyou?number=${number}`;
}
