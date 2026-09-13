import os
import time
import secrets
import string
import threading

import requests
from flask import Flask, send_from_directory


# =========================
# تنظیمات
# =========================

BOT_TOKEN = os.getenv("BOT_TOKEN")
SITE_URL = "https://animeai-site-2026.onrender.com"

if not BOT_TOKEN:
    raise RuntimeError("BOT_TOKEN environment variable is missing")

TELEGRAM_API = f"https://api.telegram.org/bot{BOT_TOKEN}"

app = Flask(__name__)


# =========================
# نمایش فایل‌های سایت
# =========================

@app.route("/")
def home():
    return send_from_directory(".", "index.html")


@app.route("/<path:filename>")
def site_files(filename):
    return send_from_directory(".", filename)


@app.route("/health")
def health():
    return "AnimeAI is online"


# =========================
# ساخت لینک تصادفی
# =========================

def create_link():
    characters = string.ascii_letters + string.digits
    link_id = "".join(
        secrets.choice(characters)
        for _ in range(10)
    )

    return f"{SITE_URL}/?id={link_id}"


# =========================
# ارسال پیام به تلگرام
# =========================

def send_message(chat_id, text, keyboard=None):
    data = {
        "chat_id": chat_id,
        "text": text
    }

    if keyboard is not None:
        data["reply_markup"] = keyboard

    try:
        requests.post(
            f"{TELEGRAM_API}/sendMessage",
            json=data,
            timeout=30
        )
    except Exception as error:
        print("Send message error:", error)


# =========================
# پردازش پیام‌های ربات
# =========================

def handle_update(update):
    message = update.get("message")

    if not message:
        return

    chat_id = message["chat"]["id"]
    text = message.get("text", "").strip()

    if text == "/start":
        keyboard = {
            "keyboard": [
                [
                    {
                        "text": "🔗 ساخت لینک"
                    }
                ]
            ],
            "resize_keyboard": True,
            "is_persistent": True
        }

        send_message(
            chat_id,
            "سلام 👋\n"
            "به ربات AnimeAI خوش آمدی.\n\n"
            "برای ساخت لینک روی دکمه زیر بزن:",
            keyboard
        )

    elif text == "🔗 ساخت لینک":
        link = create_link()

        send_message(
            chat_id,
            f"🔗 لینک شما ساخته شد:\n\n{link}\n\n"
            "روی لینک بزن تا سایت AnimeAI باز شود."
        )

    else:
        send_message(
            chat_id,
            "برای ساخت لینک، روی دکمه «🔗 ساخت لینک» بزن."
        )


# =========================
# دریافت پیام‌های تلگرام
# =========================

def telegram_bot():
    offset = None

    print("Telegram bot started")

    while True:
        try:
            params = {
                "timeout": 25
            }

            if offset is not None:
                params["offset"] = offset

            response = requests.get(
                f"{TELEGRAM_API}/getUpdates",
                params=params,
                timeout=35
            )

            data = response.json()

            if not data.get("ok"):
                print("Telegram error:", data)
                time.sleep(5)
                continue

            for update in data.get("result", []):
                offset = update["update_id"] + 1
                handle_update(update)

        except Exception as error:
            print("Bot connection error:", error)
            time.sleep(5)


# =========================
# اجرای سایت و ربات
# =========================

if __name__ == "__main__":
    bot_thread = threading.Thread(
        target=telegram_bot,
        daemon=True
    )

    bot_thread.start()

    port = int(os.environ.get("PORT", 10000))

    app.run(
        host="0.0.0.0",
        port=port
                  )
