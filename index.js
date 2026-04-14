const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActivityType, 
    REST, 
    Routes,
    AttachmentBuilder // Tambahkan ini
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// --- KONFIGURASI ---
const CONFIG = {
    TOKEN: process.env.DISCORD_TOKEN,
    CLIENT_ID: '1486187371476029610', // Ambil di Developer Portal (General Information)
    GUILD_ID: '1112618217421148210',       // Klik kanan nama server > Copy ID
    ANNOUNCE_CHANNEL: '1493465308327837696',
    LOG_CHANNEL: '1486632361155362847',
    QRIS_FILE_NAME: 'qrisgopay.png'
};

const RANDOM_MESSAGES = [
    "Butuh bantuan? Admin kami siap melayani di jam operasional!",
    "Jika ingin mendapatkan special mods dari ottibonynyo mods silahkan ke channel <#1466660218686668894> jika no acces silahkan <#1486252838186127360> terlebih dahulu ya. 🔥",
    "Pembayaran aman dan cepat via QRIS & Bank Transfer.",
    "Jangan lupa untuk selalu sopan dalam berinteraksi ya!",
    "Terima kasih telah mendukung komunitas ini!"
];

// --- REGISTER SLASH COMMANDS ---
const commands = [
    {
        name: 'payment',
        description: 'Menampilkan informasi metode pembayaran resmi store',
    },
];

const rest = new REST({ version: '10' }).setToken(CONFIG.TOKEN);

async function registerCommands() {
    try {
        console.log('[SYSTEM] Mendaftarkan Slash Commands...');
        await rest.put(
            Routes.applicationGuildCommands(CONFIG.CLIENT_ID, CONFIG.GUILD_ID),
            { body: commands },
        );
        console.log('[SYSTEM] Slash Commands berhasil didaftarkan!');
    } catch (error) {
        console.error(error);
    }
}

// --- EVENT: READY ---
client.once('ready', async () => {
    console.log(`[LOG] Berhasil masuk sebagai ${client.user.tag}`);
    
    // Registrasi Command ke Server
    await registerCommands();

    // Status Professional
    client.user.setPresence({
        activities: [{ name: 'Community Store', type: ActivityType.Watching }],
        status: 'online',
    });

    // Notifikasi Online Professional
    const logChannel = client.channels.cache.get(CONFIG.LOG_CHANNEL);
    if (logChannel) {
        const onlineEmbed = new EmbedBuilder()
            .setColor(0x2ECC71)
            .setTitle('🚀 System Core Online')
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
            .addFields(
                { name: '📡 Status', value: '` Operational `', inline: true },
                { name: '⚡ Latency', value: `\` ${client.ws.ping}ms \``, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Automated Runner via GitHub Actions' });
        
        logChannel.send({ embeds: [onlineEmbed] });
    }

    // Auto Announcement 1 Jam Sekali
    setInterval(() => {
        const announceChannel = client.channels.cache.get(CONFIG.ANNOUNCE_CHANNEL);
        if (announceChannel) {
            const text = RANDOM_MESSAGES[Math.floor(Math.random() * RANDOM_MESSAGES.length)];
            announceChannel.send(`📢 **INFO STORE**\n\n${text}`);
        }
    }, 3600000);
});

// --- EVENT: INTERACTION (SLASH COMMANDS) ---
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'payment') {
        const paymentEmbed = new EmbedBuilder()
            .setTitle('💳 METODE PEMBAYARAN RESMI')
            .setColor(0x5865F2)
            .setDescription('Silakan gunakan salah satu metode pembayaran di bawah ini:')
            .setImage(CONFIG.QRIS_URL)
            .addFields(
                { name: '📱 E-Wallet', value: '• **GoPay:** 0812-xxxx-xxxx\n• **QRIS:** Scan Gambar Di Atas', inline: true },
                { name: '🏦 Bank Transfer', value: '• **Bank BRI:** 0021-01-xxxxxx\n• **Mandiri:** 124-00-xxxxxx', inline: true }
            )
            .setFooter({ text: 'Harap kirim bukti transfer ke Admin.' })
            .setTimestamp();

        await interaction.reply({ embeds: [paymentEmbed] });
    }
});

// --- EVENT: AUTO RESPONSE (PESAN PUBLIK) ---
client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    const autoResponses = [
        `Halo ${message.author.username}! Ada yang bisa dibantu?`,
        "Halo! Kalau mau order atau request lua atau hanya ingin bertnaya silahakan <#1144295586154151996> aja ya",
        "Admin akan segera merespon chat kamu, mohon ditunggu ya."
    ];

    // Peluang 30% merespon
    if (Math.random() < 0.3) {
        message.reply(autoResponses[Math.floor(Math.random() * autoResponses.length)]);
    }
});

client.login(CONFIG.TOKEN);
