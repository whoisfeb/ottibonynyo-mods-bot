const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActivityType, 
    REST, 
    Routes,
    AttachmentBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
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
    CLIENT_ID: '1486187371476029610', 
    GUILD_ID: '1112618217421148210',  
    ANNOUNCE_CHANNEL: '1493465308327837696',
    LOG_CHANNEL: '1486632361155362847',
    ADMIN_ROLE_ID: '1112618217421148212', 
    QRIS_FILE_NAME: 'qrisgopay.png' ,
    ALLOWED_CHANNELS: [
        '1444172572144046144', 
        '1444172550266687558'// Tambahkan ID channel lain di sini, pisahkan dengan koma
    ]
};

// --- DAFTAR KATA KASAR ---
const BADWORDS = [
  'free', 'tolol', 'goblok', 'bego', 'pepek', 'dongo', 'tai', 'kontol', 
  'bio', 'sexcam', 'entot', 'ngentot', 'join', 'invite', 'anjing', 
  'babi', 'memek', 'ngewe', 'ewe', 'lonte', 'pler', 'bgst', 'bangsat'
];


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

client.once('ready', async () => {
    console.log(`[LOG] Berhasil masuk sebagai ${client.user.tag}`);
    await registerCommands();

    client.user.setPresence({
        activities: [{ name: 'Community Store', type: ActivityType.Watching }],
        status: 'online',
    });

    const logChannel = client.channels.cache.get(CONFIG.LOG_CHANNEL);
    if (logChannel) {
        const onlineEmbed = new EmbedBuilder()
            .setColor(0x2ECC71)
            .setTitle('🚀 System Core Online')
            .addFields(
                { name: '📡 Status', value: '` Online `', inline: true },
                { name: '⚡ Latency', value: `\` ${client.ws.ping}ms \``, inline: true }
            )
            .setTimestamp();
        logChannel.send({ embeds: [onlineEmbed] });
    }

    setInterval(() => {
        const announceChannel = client.channels.cache.get(CONFIG.ANNOUNCE_CHANNEL);
        if (announceChannel) {
            const text = RANDOM_MESSAGES[Math.floor(Math.random() * RANDOM_MESSAGES.length)];
            announceChannel.send(`📢 **Excellence Guard**\n\n${text}`);
        }
    }, 3600000);
});

// --- EVENT: INTERACTION (SLASH COMMANDS & BUTTONS) ---
client.on('interactionCreate', async (interaction) => {
    
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'payment') {
            
            // CEK ROLE ID ADMIN
            if (!interaction.member.roles.cache.has(CONFIG.ADMIN_ROLE_ID)) {
                return interaction.reply({ 
                    content: '❌ Kamu tidak memiliki izin (Role Admin) untuk menggunakan perintah ini!', 
                    ephemeral: true 
                });
            }

            const qrisFile = new AttachmentBuilder(`./${CONFIG.QRIS_FILE_NAME}`);

            const paymentEmbed = new EmbedBuilder()
                .setTitle('💳 METODE PEMBAYARAN RESMI')
                .setColor(0x00FF00)
                .setDescription('Scan QRIS di bawah ini atau klik tombol untuk metode pembayaran lainnya:')
                .setImage(`attachment://${CONFIG.QRIS_FILE_NAME}`)
                .setFooter({ text: 'Community Store • Harap lampirkan bukti transfer.' })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('pay_bank_info')
                        .setLabel('Transfer Bank')
                        .setEmoji('🏦')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('pay_gopay_info')
                        .setLabel('Nomor GoPay')
                        .setEmoji('📱')
                        .setStyle(ButtonStyle.Secondary),
                );

            await interaction.reply({ 
                embeds: [paymentEmbed], 
                files: [qrisFile],
                components: [row] 
            });
        }
    }

    if (interaction.isButton()) {
        if (interaction.customId === 'pay_bank_info') {
            await interaction.reply({ 
                content: '📌 **Detail Transfer Bank:**\n- **Bank BRI:** `0021-01-xxxxxx`\n- **Bank Mandiri:** `124-00-xxxxxx`\n\n*Kirim bukti transfer ke admin jika sudah membayar.*', 
                ephemeral: true 
            });
        }

        if (interaction.customId === 'pay_gopay_info') {
            await interaction.reply({ 
                content: '📌 **Detail GoPay:**\nNomor: `0812-xxxx-xxxx` (A/N Toko Kamu)\n\n*Kirim bukti transfer ke admin jika sudah membayar.*', 
                ephemeral: true 
            });
        }
    }
});

// --- EVENT: MESSAGE MONITORING (ANTI-BADWORD & AUTO RESPONSE) ---
// --- EVENT: MESSAGE MONITORING (ANTI-BADWORD & AUTO RESPONSE) ---
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // 1. LOGIKA ANTI-BADWORD (Berjalan di SEMUA channel)
    // 1. LOGIKA ANTI-BADWORD (Lebih Akurat)
    // Regex ini memastikan kata kasar harus berdiri sendiri (bukan bagian dari kata lain)
    const foundBadWord = BADWORDS.find(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'i'); // \b adalah boundary (batas kata)
        return regex.test(message.content);
    });
    
    if (foundBadWord) {
        try {
            await message.delete();
            return message.channel.send(`Hey ${message.author}, astagfirullah tidak boleh mengetik kata kata kasar yah sayang!`);
        } catch (error) {
            console.error('[ERROR] Gagal menghapus pesan kasar:', error);
        }
        return; 
    }


    // 2. AUTO RESPONSE (Hanya jalan di channel yang ada dalam daftar ALLOWED_CHANNELS)
    if (CONFIG.ALLOWED_CHANNELS.includes(message.channel.id)) {
        const autoResponses = [
            `Halo <@${message.author.id}>! Ada yang bisa dibantu?`,
            "Halo! Kalau mau order atau request lua atau hanya ingin bertanya silahkan <#1144295586154151996> aja ya",
            "Admin akan segera merespon chat kamu, mohon ditunggu ya."
        ];

        if (Math.random() < 0.3) {
            message.reply(autoResponses[Math.floor(Math.random() * autoResponses.length)]);
        }
    }
});


client.login(CONFIG.DISCORD_TOKEN);
