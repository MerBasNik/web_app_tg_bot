const TelegramBotApi = require("node-telegram-bot-api")
const token = "8336296662:AAFUwAc3QrmcZ5_sTWXDkETIzHROQIPVeog"
const bot = new TelegramBotApi(token, {polling: true})
const webAppUrl = "https://webapptgstore.netlify.app"
const express = require("express")
const app = express()
const cors = require("cors")

app.use(cors())
app.use(express.json())


const options = {
    reply_markup: {
        resize_keyboard: true,
        keyboard: [
            [{text: "Заполнить форму", web_app: {url: webAppUrl + '/form'}}]
        ]
    },
}
const inlineOptions = {
    reply_markup: {
        inline_keyboard: [
            [{text: "Сделать заказ", web_app: {url: webAppUrl}}],
        ]
    },
}

const start = async () => {
    bot.on("message", async message => {
        const chatId = message.chat.id
        const text = message.text
        if (text === "/start") {
            await bot.sendMessage(chatId, "Добро пожаловать. Ниже появиться кнопка, заполни форму", options)
            await bot.sendMessage(chatId, "Заходи в наш интернет магазин", inlineOptions)
        }
        if (message?.web_app_data?.data) {
            try {
                const data = JSON.parse(message.web_app_data.data)
                await bot.sendMessage(chatId, "Спасибо за обратную связь!!!")
                await bot.sendMessage(chatId, `Ваша страна: ${data?.country}`)
                await bot.sendMessage(chatId, `Ваш город: ${data?.city}`)
                setTimeout(async () => {
                    await bot.sendMessage(chatId, "Всю информацию вы получили здесь")
                }, 1500)
            } catch (e) {
                console.log("Ошибка: ", e)
            }
        }
    })
}
start()

app.post("/web-data", async (req, res) => {
    const {queryId, products, totalPrice} = req.body
    try {
        await bot.answerWebAppQuery(queryId, {
            type: "article",
            id: queryId,
            title: "Успешная покупка",
            input_message_content: {message_text: "Поздравляю с успешной покупкой, вы приобрели товар на сумму " + totalPrice +
            ". Товары: " + products.map(product => product.id).join(", ")}
        })
        return res.status(200).send()
    } catch (e) {
        await bot.answerWebAppQuery(queryId, {
            type: "article",
            id: queryId,
            title: "Не удалось приобрести товар",
            input_message_content: {message_text: "Не удалось приобрести товар"}
        })
        return res.status(500).send()
    }
})

const PORT = 8000
app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`)
})