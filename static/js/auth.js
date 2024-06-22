document.addEventListener("DOMContentLoaded", function () {
  const overlay = document.querySelector(".overlay");
  const signInBlock = document.querySelector(".sign-in-block");
  const signUpBlock = document.querySelector(".sign-up-block");
  const closeBtns = document.querySelectorAll(".close-btn");
  const toSignUpBtn = document.querySelector(".to-sign-up");
  const toSignInBtn = document.querySelector(".to-sign-in");
  const signInUpBtn = document.querySelector(".signinup-btn");

  function showDialog(dialog) {
    overlay.style.display = "flex";
    dialog.style.display = "block";
    dialog.setAttribute("open", "");
  }

  function hideDialog(dialog) {
    dialog.style.display = "none";
    dialog.removeAttribute("open");
  }

  function hideAllDialogs() {
    overlay.style.display = "none";
    hideDialog(signInBlock);
    hideDialog(signUpBlock);
    clearMessages(); // 清空錯誤或成功訊息
    clearInputFields(); //清空輸入資訊
  }
  //清空訊息函數
  function clearMessages() {
    if (signInerrorMsg || signUperrorMsg) {
      signInerrorMsg.textContent = "";
      signInerrorMsg.style.display = "none";
      signUperrorMsg.textContent = "";
      signUperrorMsg.style.display = "none";
    }
    if (signUpsuccessMsg) {
      signUpsuccessMsg.textContent = "";
      signUpsuccessMsg.style.display = "none";
    }
  }
  //清空輸入框函數
  function clearInputFields() {
    // 清空所有輸入欄位
    const inputs = document.querySelectorAll(
      'input[type="text"], input[type="email"], input[type="password"]'
    );
    inputs.forEach((input) => {
      input.value = "";
    });
  }
  // 點擊登入/註冊按鈕顯示登入對話框
  signInUpBtn.addEventListener("click", function () {
    showDialog(signInBlock);
  });

  // 關閉按鈕事件
  closeBtns.forEach((btn) => {
    btn.addEventListener("click", hideAllDialogs);
  });

  // 切換到註冊表單
  toSignUpBtn.addEventListener("click", function () {
    hideDialog(signInBlock);
    showDialog(signUpBlock);
  });

  // 切換到登入表單
  toSignInBtn.addEventListener("click", function () {
    hideDialog(signUpBlock);
    showDialog(signInBlock);
  });

  // 點擊overlay背景關閉對話框
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) {
      hideAllDialogs();
      clearMessages();
    }
  });

  // 登出功能
  function signOut() {
    // 從 LocalStorage 中移除 TOKEN
    localStorage.removeItem("token");
    // 重新加載頁面以更新登入狀態
    window.location.reload();
  }

  // 顯示登入對話框
  function showSignInDialog() {
    showDialog(signInBlock);
  }

  // 檢查登入狀態
  async function checkAuthStatus() {
    const token = localStorage.getItem("token");
    if (!token) {
      // 用戶未登入,顯示登入按鈕
      signInUpBtn.textContent = "登入/註冊";
      signInUpBtn.removeEventListener("click", signOut);
      signInUpBtn.addEventListener("click", showSignInDialog);
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
        signInUpBtn.textContent = "登出系統";
        signInUpBtn.removeEventListener("click", showSignInDialog);
        signInUpBtn.addEventListener("click", signOut);
      } else {
        // 沒有token或token無效,顯示登入按鈕
        localStorage.removeItem("token");
        signInUpBtn.textContent = "登入/註冊";
        signInUpBtn.removeEventListener("click", signOut);
        signInUpBtn.addEventListener("click", showSignInDialog);
      }
    } catch (error) {
      console.error("Error fetching user auth:", error);
      // 發生錯誤,清除token並顯示登入按鈕
      localStorage.removeItem("token");
      signInUpBtn.textContent = "登入/註冊";
      signInUpBtn.removeEventListener("click", signOut);
      signInUpBtn.addEventListener("click", showSignInDialog);
    }
  }

  // 在頁面加載完成後檢查登入狀態
  checkAuthStatus();
});

//登入流程
// document.addEventListener("DOMContentLoaded", function () {
// ...

const signInBtn = document.querySelector(".sign-in-btn");
const signInEmailInput = document.querySelector("#signin-email");
const signInPasswordInput = document.querySelector("#signin-password");
const signInerrorMsg = document.querySelector("#signin-error-msg");

signInBtn.addEventListener("click", async function () {
  const email = signInEmailInput.value;
  const password = signInPasswordInput.value;
  // 檢查email格式
  const emailRegex = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
  if (!emailRegex.test(email)) {
    signInShowerrorMsg("請輸入正確的電子郵件格式");
    return;
  }

  try {
    const response = await fetch("/api/user/auth", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("token", data.token);

      // 在此處將token設置到請求的Authorization header中
      fetch("/api/user/auth", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Received data from backend:", data);
          // 處理從後端接收到的數據
          // ...
        })
        .catch((error) => {
          console.error("Error fetching user auth:", error);
        });

      window.location.reload();
    } else if (response.status === 400) {
      const errorData = await response.json();
      signInShowerrorMsg(errorData.message);
    } else {
      throw new Error("登入失敗，請稍後再試");
    }
  } catch (error) {
    console.error("登入時發生錯誤:", error);
    signInShowerrorMsg("登入失敗，請稍後再試");
  }
});

function signInShowerrorMsg(message) {
  signInerrorMsg.textContent = message;
  signInerrorMsg.style.display = "block";
  document.querySelector(".sign-in-form").style.height = "258px";
  document.querySelector(".sign-in-block").style.height = "298px";
}
// })
// 註冊功能
// 假設這是在一個更大的 DOMContentLoaded 事件監聽器內部

// 註冊功能
const signUpBtn = document.querySelector(".sign-up-btn");
const signUpNameInput = document.querySelector("#signup-name");
const signUpEmailInput = document.querySelector("#signup-email");
const signUpPasswordInput = document.querySelector("#signup-password");
const signUperrorMsg = document.querySelector("#signup-error-msg");
const signUpsuccessMsg = document.querySelector("#signup-success-msg");

signUpBtn.addEventListener("click", async function (event) {
  event.preventDefault();

  console.log("註冊按鈕被點擊");

  const name = signUpNameInput.value;
  const email = signUpEmailInput.value;
  const password = signUpPasswordInput.value;

  console.log("Name:", name, "Email:", email, "Password:", password);

  if (!name || !email || !password) {
    signupShowErrorMessage("請填寫所有欄位");
    return;
  }

  const emailRegex = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
  if (!emailRegex.test(email)) {
    signupShowErrorMessage("請輸入正確的電子郵件格式");
    return;
  }

  try {
    console.log("開始發送註冊請求");
    const response = await fetch("/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    console.log("收到伺服器響應", response.status);

    const data = await response.json();

    if (response.ok) {
      signupShowSuccessMessage("註冊成功，請登入系統");
      signUpNameInput.value = "";
      signUpEmailInput.value = "";
      signUpPasswordInput.value = "";
    } else {
      console.log("錯誤數據:", data);
      if (response.status === 400) {
        signupShowErrorMessage(data.message);
      } else if (response.status === 500) {
        signupShowErrorMessage(data.message);
      } else {
        signupShowErrorMessage("註冊失敗，請稍後再試");
      }
    }
  } catch (error) {
    console.error("註冊時發生錯誤:", error);
    signupShowErrorMessage("註冊失敗，請稍後再試");
  }
});

function signupShowErrorMessage(message) {
  console.log("顯示錯誤訊息:", message);
  if (signUperrorMsg) {
    signUperrorMsg.textContent = message;
    signUperrorMsg.style.display = "block";
    signUpsuccessMsg.style.display = "none";
  } else {
    console.error("錯誤container不存在");
  }
  document.querySelector(".sign-up-form").style.height = "315px";
  document.querySelector(".sign-up-block").style.height = "355px";
}

function signupShowSuccessMessage(message) {
  console.log("顯示成功訊息:", message);
  if (signUpsuccessMsg) {
    signUpsuccessMsg.textContent = message;
    signUpsuccessMsg.style.display = "block";
    signUperrorMsg.style.display = "none";
  } else {
    console.error("成功container不存在");
  }
  document.querySelector(".sign-up-form").style.height = "315px";
  document.querySelector(".sign-up-block").style.height = "355px";
}
