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
    QRIS_FILE_NAME: 'qrisgopay.png' // Pastikan file ini ada di repository
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
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
            .addFields(
                { name: '📡 Status', value: '` Operational `', inline: true },
                { name: '⚡ Latency', value: `\` ${client.ws.ping}ms \``, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Automated Runner via GitHub Actions' });
        
        logChannel.send({ embeds: [onlineEmbed] });
    }

    setInterval(() => {
        const announceChannel = client.channels.cache.get(CONFIG.ANNOUNCE_CHANNEL);
        if (announceChannel) {
            const text = RANDOM_MESSAGES[Math.floor(Math.random() * RANDOM_MESSAGES.length)];
            announceChannel.send(`📢 **INFO STORE**\n\n${text}`);
        }
    }, 3600000);
});

// --- EVENT: INTERACTION (SLASH COMMANDS & BUTTONS) ---
client.on('interactionCreate', async (interaction) => {
    // Handling Slash Command /payment
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'payment') {
            const qrisFile = new AttachmentBuilder(`./${CONFIG.QRIS_FILE_NAME}`);

            const paymentEmbed = new EmbedBuilder()
                .setTitle('💳 METODE PEMBAYARAN RESMI')
                .setColor(0x5865F2)
                .setDescription('Silakan klik tombol di bawah ini untuk melihat detail pembayaran:')
                .setImage(`attachment://${CONFIG.QRIS_FILE_NAME}`)
                .setFooter({ text: 'Harap kirim bukti transfer ke Admin.' })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('pay_gopay')
                        .setLabel('GoPay / QRIS')
                        .setEmoji('📱')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('pay_bank')
                        .setLabel('Transfer Bank')
                        .setEmoji('🏦')
                        .setStyle(ButtonStyle.Primary),
                );

            await interaction.reply({ 
                embeds: [paymentEmbed], 
                files: [qrisFile],
                components: [row] 
            });
        }
    }

    // Handling Button Clicks
    if (interaction.isButton()) {
        if (interaction.customId === 'pay_gopay') {
            await interaction.reply({ 
                content: '📌 **Pembayaran via GoPay / QRIS:**\nNomor GoPay: `0822-7109-7940\nAtau silakan scan gambar QRIS yang tertera di atas.\n\n*Jangan lupa kirim bukti transfer ke admin!*', 
                ephemeral: true 
            });
        }

        if (interaction.customId === 'pay_bank') {
            await interaction.reply({ 
                content: '📌 **Pembayaran via Transfer Bank:**\n- **Bank BRI:** `Coming Soon`\n- **Bank Mandiri:** `Coming Soon`\n\n*Jangan lupa kirim bukti transfer ke admin!*', 
                ephemeral: true 
            });
        }
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

    if (Math.random() < 0.3) {
        message.reply(autoResponses[Math.floor(Math.random() * autoResponses.length)]);
    }
});

client.login(CONFIG.TOKEN);
