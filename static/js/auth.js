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
document.addEventListener("DOMContentLoaded", function () {
  // ...

  const signInBtn = document.querySelector(".sign-in-btn");
  const signInEmailInput = document.querySelector("#signin-email");
  const signInPasswordInput = document.querySelector("#signin-password");
  const signInErrorMsgContainer = document.querySelector("#signin-error-msg");

  signInBtn.addEventListener("click", async function () {
    const email = signInEmailInput.value;
    const password = signInPasswordInput.value;

    // 檢查email格式
    const emailRegex = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    if (!emailRegex.test(email)) {
      showErrorMessage("請輸入正確的電子郵件格式");
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
        showErrorMessage(errorData.message);
      } else {
        throw new Error("登入失敗，請稍後再試");
      }
    } catch (error) {
      console.error("登入時發生錯誤:", error);
      showErrorMessage("登入失敗，請稍後再試");
    }
  });

  function showErrorMessage(message) {
    signInErrorMsgContainer.textContent = message;
    signInErrorMsgContainer.style.display = "block";
  }

  // ...
});

// 註冊功能
document.addEventListener("DOMContentLoaded", function () {
  const signUpBtn = document.querySelector(".sign-up-btn");
  const signUpNameInput = document.querySelector("#signup-name");
  const signUpEmailInput = document.querySelector("#signup-email");
  const signUpPasswordInput = document.querySelector("#signup-password");
  const signUpErrorMsgContainer = document.querySelector("#signup-error-msg");
  const signUpSuccessMsgContainer = document.querySelector(
    "#signup-success-msg"
  );

  signUpBtn.addEventListener("click", async function () {
    const name = signUpNameInput.value;
    const email = signUpEmailInput.value;
    const password = signUpPasswordInput.value;

    // 檢查 email 和 password 是否為空
    if (!email || !password || !name) {
      showErrorMessage("請填寫所有欄位");
      return;
    }
    // Check email format
    const emailRegex = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    if (!emailRegex.test(email)) {
      showSignUpErrorMessage("請輸入正確的電子郵件格式");
      console.log("格式");
      return;
    }

    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        showSignUpSuccessMessage("註冊成功，請登入系統");
        // Clear input fields
        signUpNameInput.value = "";
        signUpEmailInput.value = "";
        signUpPasswordInput.value = "";
      } else if (response.status === 400) {
        const errorData = await response.json();
        showSignUpErrorMessage(errorData.message);
      } else if (response.status === 500) {
        const errorData = await response.json();
        showSignUpErrorMessage(errorData.message);
      } else {
        throw new Error("註冊失敗，請稍後再試");
      }
    } catch (error) {
      console.error("註冊時發生錯誤:", error);
      showSignUpErrorMessage("註冊失敗，請稍後再試");
    }
  });

  function showSignUpErrorMessage(message) {
    signUpErrorMsgContainer.textContent = message;
    signUpErrorMsgContainer.style.display = "block";
    signUpSuccessMsgContainer.style.display = "none";
  }

  function showSignUpSuccessMessage(message) {
    signUpSuccessMsgContainer.textContent = message;
    signUpSuccessMsgContainer.style.display = "block";
    signUpErrorMsgContainer.style.display = "none";
  }

  // ... (existing code)
});
