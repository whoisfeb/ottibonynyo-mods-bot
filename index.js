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
    ANNOUNCE_CHANNEL: '1494269319654412328',
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
    "Selalu cek update terbaru di channel pengumuman agar tidak ketinggalan info mod!",
    "Ingat, dilarang melakukan spam di channel publik. Hargai kenyamanan sesama member.",
    "Gunakan fitur search sebelum bertanya, mungkin pertanyaanmu sudah pernah dijawab sebelumnya.",
    "Bantu komunitas ini tumbuh dengan mengundang teman-temanmu bergabung!",
    "Pastikan antivirus kamu sudah dikecualikan saat memasang mod agar tidak terjadi error.",
    "Jika menemukan bug pada mod, segera laporkan ke bagian support kami.",
    "Tips Modding: Selalu backup data original sebelum memasang mod baru.",
    "Info Store: Cek channel testimoni untuk melihat bukti transaksi pelanggan kami.",
    "Keamanan: Jangan tertipu link palsu, link resmi hanya ada di channel pengumuman.",
    "Reminder: Gunakan mod secara bijak dan tidak merugikan player lain.",
    "Update: Tim kami sedang mengerjakan project besar, tunggu tanggal mainnya!",
    "Support: Mengalami kendala instalasi? Silakan buka tiket bantuan.",
    "Komunitas: Yuk ajak temanmu gabung ke server ini dan dapatkan role khusus!",
    "Fun Fact: Modding meningkatkan kreativitas dan pemahaman struktur file game.",
    "Donasi: Dukungan kalian membantu kami menyewa server yang lebih stabil.",
    "Rules: Menghargai sesama anggota adalah kunci kenyamanan komunitas ini.",
    "Maintenance: Jika bot offline, berarti sedang ada pemeliharaan sistem rutin.",
    "Pro-Tip: Matikan antivirus sementara saat mengekstrak file mod jika terdeteksi false positive.",
    "Voucher: Pantau terus channel chat, terkadang admin bagi-bagi kode diskon!",
    "Laporan: Temukan user nakal? Segera lapor admin disertai bukti screenshot.",
    "Review: Puas dengan mod kami? Jangan lupa berikan bintang 5 di testimoni!",
    "Selalu patuhi aturan yang ada demi kenyamanan bersama.",
    "Happy Modding! Semoga hari kalian menyenangkan di server ini.",
    "Jangan lupa makan dan minum saat asyik bermain game.",
    "Kreativitas tanpa batas bersama Ottibonynyo Mods!",
    "Cek katalog kami secara berkala untuk promo menarik."
    
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

    // ========== SET STATUS BOT ==========
    client.user.setPresence({
        activities: [
            { 
                name: 'Ottibonynyo Mods', 
                type: ActivityType.Playing 
            }
        ],
        status: 'online',
    });
    console.log('[LOG] Status bot telah diubah menjadi ONLINE');
    // ====================================

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
            announceChannel.send(`${text}`);
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
                    flags: 64
                });
            }

            const paymentEmbed = new EmbedBuilder()
                .setTitle('💳 METODE PEMBAYARAN RESMI')
                .setColor(0x00FF00)
                .setDescription('Pilih metode pembayaran yang kamu inginkan:')
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
                        .setLabel('E-Wallet')
                        .setEmoji('📱')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('pay_qris_info')
                        .setLabel('QRIS')
                        .setEmoji('📲')
                        .setStyle(ButtonStyle.Success),
                );

            await interaction.reply({ 
                embeds: [paymentEmbed],
                components: [row],
                flags: 64
            });
        }
    }

    if (interaction.isButton()) {
        
        // ============= TOMBOL: TRANSFER BANK =============
        if (interaction.customId === 'pay_bank_info') {
            const bankEmbed = new EmbedBuilder()
                .setTitle('🏦 TRANSFER BANK')
                .setColor(0x3498db)
                .setDescription('Metode pembayaran melalui transfer bank ke rekening resmi kami.')
                .addFields(
                    {
                        name: '📋 LANGKAH-LANGKAH:',
                        value: `
1️⃣ Catat nomor rekening bank di bawah
2️⃣ Buka aplikasi perbankan (mobile/web)
3️⃣ Pilih menu "Transfer Antar Bank"
4️⃣ Masukkan nomor rekening tujuan
5️⃣ Masukkan nominal transfer sesuai pesanan
6️⃣ Konfirmasi dan selesaikan transaksi
7️⃣ Screenshot bukti transfer (nomor referensi harus terlihat jelas)
8️⃣ Kirim bukti ke admin di channel ini
                        `,
                        inline: false
                    },
                    {
                        name: '💰 BANK BRI:',
                        value: `
**Nomor Rekening:**
\`\`\`
COMING SOON
\`\`\`
**Atas Nama:**
\`\`\`
COMING SOON
\`\`\`
                        `,
                        inline: false
                    },
                    {
                        name: '💰 BANK MANDIRI:',
                        value: `
**Nomor Rekening:**
\`\`\`
COMING SOON
\`\`\`
**Atas Nama:**
\`\`\`
COMING SOON
\`\`\`
                        `,
                        inline: false
                    },
                    {
                        name: '✅ SYARAT & KETENTUAN:',
                        value: `
✓ Gunakan bank yang sama dengan rekening Anda
✓ Pastikan nominal transfer **TEPAT SESUAI** dengan yang diminta
✓ Jangan mengurangi atau menambah nominal tanpa izin
✓ Transfer harus dari rekening atas nama sendiri
✓ Bukti transfer harus mencakup nomor referensi & nominal
✓ Tunggu konfirmasi admin maksimal 1 jam
✓ Jika belum dikonfirmasi, hubungi admin
                        `,
                        inline: false
                    },
                    {
                        name: '❌ YANG TIDAK BOLEH DILAKUKAN:',
                        value: `
✗ JANGAN transfer dari rekening orang lain
✗ JANGAN menambah/mengurangi nominal tanpa izin
✗ JANGAN lupa screenshot bukti transfer
✗ JANGAN dikirim ke admin via DM, gunakan channel resmi
✗ JANGAN claim topup sebelum admin konfirmasi
✗ JANGAN buat tiket baru jika sudah ada transaksi pending
✗ JANGAN mencoba transfer berkali-kali dengan nominal berbeda
                        `,
                        inline: false
                    }
                )
                .setFooter({ text: 'Community Store - Jika ada kendala, hubungi admin!' })
                .setTimestamp();

            await interaction.reply({ 
                embeds: [bankEmbed],
                flags: 0
            });
        }

        // ============= TOMBOL: E-WALLET (GOPAY & DANA) =============
        if (interaction.customId === 'pay_gopay_info') {
            const ewalletEmbed = new EmbedBuilder()
                .setTitle('📱 E-WALLET (GoPay & Dana)')
                .setColor(0x1abc9c)
                .setDescription('Metode pembayaran cepat melalui aplikasi e-wallet.')
                .addFields(
                    {
                        name: '📋 LANGKAH-LANGKAH:',
                        value: `
1️⃣ Buka aplikasi GoPay atau Dana di HP Anda
2️⃣ Pilih menu "Kirim Uang" atau "Transfer"
3️⃣ Masukkan nomor telepon tujuan (lihat di bawah)
4️⃣ Masukkan nominal transfer sesuai pesanan
5️⃣ Masukkan PIN/password untuk konfirmasi
6️⃣ Transfer akan langsung terproses
7️⃣ Screenshot bukti transfer (tampilkan nomor pengirim & nominal)
8️⃣ Kirim bukti ke admin di channel ini
                        `,
                        inline: false
                    },
                    {
                        name: '💳 GOPAY:',
                        value: `
**Nomor GoPay:**
\`\`\`
Muhammad Febrian
\`\`\`
**Atas Nama:**
\`\`\`
082271097940
\`\`\`
                        `,
                        inline: false
                    },
                    {
                        name: '💳 DANA:',
                        value: `
**Nomor Dana:**
\`\`\`
COMING SOON
\`\`\`
**Atas Nama:**
\`\`\`
COMING SOON
\`\`\`
                        `,
                        inline: false
                    },
                    {
                        name: '⚡ KECEPATAN TRANSAKSI:',
                        value: `
✓ GoPay: Transfer instant (langsung terproses)
✓ Dana: Transfer instant (langsung terproses)
✓ Konfirmasi admin: 15-30 menit
✓ Tercepat dibanding bank transfer
                        `,
                        inline: false
                    },
                    {
                        name: '✅ SYARAT & KETENTUAN:',
                        value: `
✓ Pastikan saldo e-wallet cukup sebelum transfer
✓ Nominal transfer harus **TEPAT SESUAI** pesanan
✓ Jangan kirim ke nomor lain selain nomor resmi kami
✓ Gunakan fitur "Transfer ke GoPay/Dana"
✓ Bukti transfer harus jelas menampilkan nomor & nominal
✓ Konfirmasi dari admin akan dikirim via DM
✓ Tidak ada biaya admin untuk transfer e-wallet
                        `,
                        inline: false
                    },
                    {
                        name: '❌ YANG TIDAK BOLEH DILAKUKAN:',
                        value: `
✗ JANGAN transfer ke nomor lain (hanya ke nomor resmi)
✗ JANGAN mengurangi nominal transfer
✗ JANGAN kirim ke akun/nomor yang tidak terdaftar
✗ JANGAN lupa screenshot bukti sebelum menutup app
✗ JANGAN menggunakan akun yang bukan punya Anda
✗ JANGAN dikirim via DM, gunakan channel topup resmi
✗ JANGAN claim topup sebelum admin konfirmasi
✗ JANGAN transfer berkali-kali dengan nominal sama
                        `,
                        inline: false
                    }
                )
                .setFooter({ text: 'Ottibonynyo Mods • Instant & Aman!' })
                .setTimestamp();

            await interaction.reply({ 
                embeds: [ewalletEmbed],
                flags: 0
            });
        }

        // ============= TOMBOL: QRIS =============
        if (interaction.customId === 'pay_qris_info') {
            const qrisEmbed = new EmbedBuilder()
                .setTitle('📲 PEMBAYARAN QRIS')
                .setColor(0x9b59b6)
                .setDescription('Metode pembayaran paling cepat & aman menggunakan QRIS.')
                .addFields(
                    {
                        name: '📋 LANGKAH-LANGKAH:',
                        value: `
1️⃣ Lihat gambar QRIS di bawah (scroll ke bawah)
2️⃣ Buka aplikasi e-wallet (GoPay, Dana, OVO, dll)
3️⃣ Pilih menu "Scan QRIS" atau "Bayar dengan QRIS"
4️⃣ Arahkan kamera ke QR Code di bawah
5️⃣ Tunggu sampai nominal muncul otomatis
6️⃣ Verifikasi nominal sesuai pesanan Anda
7️⃣ Masukkan PIN/password untuk konfirmasi
8️⃣ Pembayaran akan langsung terproses
9️⃣ Screenshot bukti pembayaran
🔟 Kirim bukti ke admin di channel ini
                        `,
                        inline: false
                    },
                    {
                        name: '⚡ KEUNTUNGAN QRIS:',
                        value: `
✓ Paling cepat - instant pembayaran
✓ Bisa dari aplikasi e-wallet apapun
✓ Aman - gunakan kamera, tidak perlu nomor rekening
✓ Tidak ada biaya admin
✓ Cocok untuk semua jenis e-wallet (GoPay, Dana, OVO, LinkAja, dll)
                        `,
                        inline: false
                    },
                    {
                        name: '✅ SYARAT & KETENTUAN:',
                        value: `
✓ Pastikan smartphone Anda terhubung internet
✓ Aplikasi e-wallet harus terinstall & aktif
✓ Nominal akan muncul otomatis saat scan, sesuaikan dengan pesanan
✓ Jangan ubah nominal tanpa izin admin
✓ Screenshot bukti dengan jelas menampilkan waktu & nominal
✓ Pastikan kamera smartphone dalam kondisi baik
✓ Scan dari jarak 10-20cm untuk hasil optimal
✓ Tunggu notifikasi sukses sebelum menutup aplikasi
                        `,
                        inline: false
                    },
                    {
                        name: '❌ YANG TIDAK BOLEH DILAKUKAN:',
                        value: `
✗ JANGAN ubah nominal saat scan QRIS
✗ JANGAN screenshot QR code untuk dikirim ke orang lain
✗ JANGAN close aplikasi sebelum pembayaran selesai
✗ JANGAN scan dari screenshot/foto (harus langsung scan)
✗ JANGAN gunakan e-wallet orang lain
✗ JANGAN lupa screenshot bukti pembayaran
✗ JANGAN dikirim bukti via DM, gunakan channel resmi
✗ JANGAN claim topup sebelum admin konfirmasi
✗ JANGAN scan berkali-kali (hanya 1x pembayaran)
✗ JANGAN share QRIS ke orang yang tidak berhak
                        `,
                        inline: false
                    }
                )
                .setFooter({ text: 'Ottibonynyo Mods • Scan & Bayar dalam 30 detik!' })
                .setTimestamp();

            const qrisFile = new AttachmentBuilder(`./${CONFIG.QRIS_FILE_NAME}`);
            
            await interaction.reply({ 
                embeds: [qrisEmbed],
                files: [qrisFile],
                flags: 0
            });
        }
    }
});

// --- EVENT: MESSAGE MONITORING (ANTI-BADWORD & AUTO RESPONSE) ---
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const foundBadWord = BADWORDS.find(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
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

client.login(CONFIG.TOKEN);
