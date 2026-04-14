const { Client, GatewayIntentBits, EmbedBuilder, ActivityType } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// --- KONFIGURASI ID (Ganti dengan ID channel kamu) ---
const CONFIG = {
    ANNOUNCE_CHANNEL_ID: '1493465308327837696',
    LOG_CHANNEL_ID: '1486632361155362847',
    AUTO_RESPONSE_CHANCE: 0.3 // Peluang respon 30%
};

const RANDOM_MESSAGES = [
    "Butuh bantuan? Admin kami siap melayani di jam operasional!",
    "Jika ingin mendapatkan special mods dari ottibonynyo mods silahkan ke channel <#1466660218686668894> jika no acces silahkan <#1486252838186127360> terlebih dahulu ya. 🔥",
    "Pembayaran aman dan cepat via QRIS & Bank Transfer.",
    "Jangan lupa untuk selalu sopan dalam berinteraksi ya!",
    "Terima kasih telah mendukung komunitas ini!"
];

// --- 1. STATUS SAAT BOT NYALA ---
client.once('ready', () => {
    console.log(`Bot Aktif sebagai ${client.user.tag}`);
    client.user.setActivity('Community Store', { type: ActivityType.Watching });

    const logChannel = client.channels.cache.get(CONFIG.LOG_CHANNEL_ID);
    if (logChannel) {
        logChannel.send("✅ **Bot System Online:** Siap melayani pesanan!");
    }

    // Announcement otomatis setiap 1 jam
    setInterval(() => {
        const announceChannel = client.channels.cache.get(CONFIG.ANNOUNCE_CHANNEL_ID);
        if (announceChannel) {
            const text = RANDOM_MESSAGES[Math.floor(Math.random() * RANDOM_MESSAGES.length)];
            announceChannel.send(`📢 **PENGUMUMAN** 📢\n\n${text}`);
        }
    }, 3600000); 
});

// --- 2. LOG SAAT BOT DIMATIKAN (Manual/Restart) ---
process.on('SIGINT', async () => {
    const logChannel = client.channels.cache.get(CONFIG.LOG_CHANNEL_ID);
    if (logChannel) await logChannel.send("⚠️ **Bot System Offline:** Sedang proses pemeliharaan/restart.");
    process.exit();
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // --- 3. FITUR PAYMENT (/payment) ---
    if (message.content === '/payment') {
        const paymentEmbed = new EmbedBuilder()
            .setTitle('💳 METODE PEMBAYARAN RESMI')
            .setColor(0x5865F2)
            .setDescription('Gunakan metode di bawah ini untuk transaksi yang aman:')
            .addFields(
                { name: '📱 E-Wallet', value: '• **GoPay:** 0822-7109-7940\n• **QRIS GoPay Merchant:** (Hubungi Admin)', inline: true },
                { name: '🏦 Bank Transfer', value: '• **Bank BRI:** COMING SOON\n• **Mandiri:** COMING SOON', inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Community Store System' });

        return message.channel.send({ embeds: [paymentEmbed] });
    }

    // --- 4. RESPON OTOMATIS (DI CHANNEL PUBLIK) ---
    if (!message.content.startsWith('/')) {
        const responses = [
            `Halo ${message.author.username}! Ada yang bisa dibantu soal pesanan?`,
            "Terima kasih sudah chat! Tunggu sebentar ya, admin akan segera merespon.",
            "Wah, hari ini ramai ya! Jangan lupa cek promo terbaru.",
            "Halo! Kalau mau order atau request lua atau hanya ingin bertnaya silahakan <#1144295586154151996> aja ya."
        ];

        if (Math.random() < CONFIG.AUTO_RESPONSE_CHANCE) {
            message.reply(responses[Math.floor(Math.random() * responses.length)]);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
