require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ChannelType, 
    PermissionsBitField, 
    EmbedBuilder 
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ]
});

const TOKEN = process.env.DISCORD_TOKEN;
const CATEGORY_ID = '1112618218146771009';

client.once('ready', () => {
    console.log(`✅ Bot Aktif! Terhubung sebagai ${client.user.tag}`);
});

// Perintah untuk memunculkan panel utama tiket
client.on('messageCreate', async (message) => {
    // Hanya Admin yang bisa setup, dan ketik !setup-tiket
    if (message.content === '!setup-tiket' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        const embed = new EmbedBuilder()
            .setTitle('Pusat Dukungan Server')
            .setDescription('Klik tombol di bawah ini jika Anda memerlukan bantuan atau ingin bertanya kepada staf.')
            .setColor('#5865F2')
            .setFooter({ text: 'Sistem Tiket Otomatis' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('buka_tiket')
                .setLabel('Buka Tiket')
                .setEmoji('🎫')
                .setStyle(ButtonStyle.Primary)
        );

        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete(); // Menghapus pesan perintah admin agar rapi
    }
});

// Menangani klik tombol
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    // LOGIKA BUKA TIKET
    if (interaction.customId === 'buka_tiket') {
        const channelName = `ticket-${interaction.user.username}`.toLowerCase();

        // Cek apakah user sudah punya tiket yang sedang terbuka
        const existingChannel = interaction.guild.channels.cache.find(c => c.name === channelName);
        if (existingChannel) {
            return interaction.reply({ 
                content: `❌ Anda sudah memiliki tiket yang terbuka di ${existingChannel}`, 
                ephemeral: true 
            });
        }

        try {
            // Membuat channel baru di bawah kategori yang ditentukan
            const ticketChannel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: CATEGORY_ID,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id, // Sembunyikan dari semua orang (@everyone)
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: interaction.user.id, // Izinkan pembuat tiket
                        allow: [
                            PermissionsBitField.Flags.ViewChannel, 
                            PermissionsBitField.Flags.SendMessages, 
                            PermissionsBitField.Flags.ReadMessageHistory,
                            PermissionsBitField.Flags.AttachFiles
                        ],
                    },
                ],
            });

            const embedTiket = new EmbedBuilder()
                .setTitle('Tiket Dukungan Terbuka')
                .setDescription(`Halo ${interaction.user},\n\nTerima kasih telah menghubungi kami. Silakan ketik kendala Anda di sini, tim staf akan segera membantu Anda.`)
                .setColor('#2ecc71')
                .setTimestamp();

            const closeRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('tutup_tiket')
                    .setLabel('Tutup Tiket')
                    .setEmoji('🔒')
                    .setStyle(ButtonStyle.Danger)
            );

            await ticketChannel.send({ embeds: [embedTiket], components: [closeRow] });
            await interaction.reply({ content: `✅ Tiket Anda berhasil dibuat: ${ticketChannel}`, ephemeral: true });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Terjadi kesalahan saat membuat tiket.', ephemeral: true });
        }
    }

    // LOGIKA TUTUP TIKET
    if (interaction.customId === 'tutup_tiket') {
        await interaction.reply('⚠️ Tiket akan segera ditutup dan dihapus dalam 5 detik...');
        
        setTimeout(async () => {
            try {
                await interaction.channel.delete();
            } catch (err) {
                console.log('Gagal menghapus channel: ', err);
            }
        }, 5000);
    }
});

client.login(TOKEN);
