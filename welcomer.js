require('dotenv').config(); // Memuat variabel dari file .env
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

// 1. Inisialisasi Client dengan Intents yang diperlukan
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers, // WAJIB aktif di Developer Portal
        GatewayIntentBits.GuildMessages
    ]
});

// Ambil token dari environment
const TOKEN = process.env.DISCORD_TOKEN;

// 2. Event ketika member baru bergabung
client.on('guildMemberAdd', async (member) => {
    // ID Channel tujuan pengiriman pesan
    const channelId = '1112618217932853328';
    
    // Mengambil channel berdasarkan ID
    const channel = member.guild.channels.cache.get(channelId);

    // Jika channel tidak ditemukan atau bot tidak punya akses
    if (!channel) {
        return console.log(`⚠️ Channel dengan ID ${channelId} tidak ditemukan!`);
    }

    // 3. Membuat tampilan Embed (Kotak Pesan)
    const welcomeEmbed = new EmbedBuilder()
        .setColor(0x2b2d31) // Warna abu-abu gelap sesuai tema Discord
        .setTitle('Ottibonynyo Mods')
        .setThumbnail(member.guild.iconURL({ dynamic: true }) || member.user.displayAvatarURL())
        .setDescription(
            `Hey, Welcome <@${member.id}>\n\n` +
            `Silahkan ambil role anda terlebih dahulu di <#1273087446095102072>\n` +
            `Silahkan ke self role terlebih dahulu juga ya <#1112618217467289664>\n` +
            `Jika anda ingin mendapatkan spesial mods dari ottibonynyo mods maka anda harus req member di channel <#1486252838186127360>\n` +
            `Anda juga bisa melakukan order , membeli , bahkan request lua loh jika berminat bisa langsung <#1144295586154151996>\n` +
            `Jangan lupa baca rules store di channel <#1501123149587283989>`
        )
        .setFooter({ text: 'Sistem Informasi Ottibonynyo Mods' })
        .setTimestamp();

    // 4. Mengirim pesan ke channel
    try {
        await channel.send({ 
            content: `Selamat datang <@${member.id}>!`, // Pesan teks di luar kotak agar user dapat notifikasi
            embeds: [welcomeEmbed] 
        });
        console.log(`✅ Berhasil menyambut ${member.user.tag}`);
    } catch (err) {
        console.error("❌ Gagal mengirim pesan welcome:", err);
    }
});

// Indikator saat bot online
client.once('ready', () => {
    console.log('========================================');
    console.log(`✅ Welcomer Online: ${client.user.tag}`);
    console.log('Status: Menunggu member baru bergabung...');
    console.log('========================================');
});

// 5. Proses Login
if (TOKEN) {
    client.login(TOKEN).catch(err => {
        console.error("❌ Gagal Login: Token tidak valid atau masalah jaringan.");
    });
} else {
    console.error("❌ ERROR: DISCORD_BOT_TOKEN tidak ditemukan di file .env atau environment!");
}
