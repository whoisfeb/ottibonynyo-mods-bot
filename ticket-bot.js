require('dotenv').config();
const { 
    Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, 
    ButtonStyle, ChannelType, PermissionsBitField, EmbedBuilder,
    ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType 
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
const LOG_CHANNEL_ID = '1357044655631499447'; 

client.once('ready', () => {
    console.log(`✅ Bot Tiket Online: ${client.user.tag}`);
});

// --- PANEL UTAMA ---
client.on('messageCreate', async (message) => {
    if (message.content === '!setup-tiket' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        const embed = new EmbedBuilder()
            .setTitle('🛒 Ottibonynyo Store - Tiket Layanan')
            .setDescription('Silakan klik tombol di bawah untuk memulai proses Top Up atau Bantuan.')
            .setColor('#5865F2');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('buka_modal')
                .setLabel('Buka Tiket')
                .setEmoji('🎫')
                .setStyle(ButtonStyle.Primary)
        );

        await message.channel.send({ embeds: [embed], components: [row] });
        if (message.deletable) await message.delete();
    }
});

client.on('interactionCreate', async (interaction) => {
    
    // --- 1. CEK BATASAN 1 USER 1 TIKET & MUNCULKAN FORM ---
    if (interaction.isButton() && interaction.customId === 'buka_modal') {
        const category = interaction.guild.channels.cache.get(CATEGORY_ID);
        
        // Cek apakah ada channel yang mengandung nama user
        const hasTicket = category.children.cache.some(channel => 
            channel.name.includes(interaction.user.username.toLowerCase())
        );

        if (hasTicket) {
            return interaction.reply({ 
                content: '❌ Anda sudah memiliki tiket yang masih terbuka. Selesaikan dulu tiket tersebut!', 
                ephemeral: true 
            });
        }

        const modal = new ModalBuilder()
            .setCustomId('form_tiket')
            .setTitle('Formulir Top Up');

        const ucp = new TextInputBuilder()
            .setCustomId('ucp')
            .setLabel("UCP / ID AKUN")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const nama = new TextInputBuilder()
            .setCustomId('nama')
            .setLabel("NAMA KARAKTER")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const item = new TextInputBuilder()
            .setCustomId('item')
            .setLabel("ITEM TOPUP")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(ucp),
            new ActionRowBuilder().addComponents(nama),
            new ActionRowBuilder().addComponents(item)
        );

        await interaction.showModal(modal);
    }

    // --- 2. PROSES SUBMIT & BUAT CHANNEL ---
    if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'form_tiket') {
        const valUcp = interaction.fields.getTextInputValue('ucp');
        const valNama = interaction.fields.getTextInputValue('nama');
        const valItem = interaction.fields.getTextInputValue('item');
        
        const category = interaction.guild.channels.cache.get(CATEGORY_ID);
        const ticketNum = (category.children.cache.size + 1).toString().padStart(3, '0');
        const channelName = `tiket-${interaction.user.username}-${ticketNum}`;

        const ticketChannel = await interaction.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: CATEGORY_ID,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
            ],
        });

        const embedInfo = new EmbedBuilder()
            .setTitle(`Detail Tiket #${ticketNum}`)
            .addFields(
                { name: '👤 User', value: `${interaction.user}`, inline: true },
                { name: '🆔 UCP', value: valUcp, inline: true },
                { name: '🎮 Karakter', value: valNama, inline: true },
                { name: '📦 Item', value: valItem }
            )
            .setColor('#2ecc71')
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('done_tiket').setLabel('Done / Selesai').setEmoji('✅').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('tutup_tiket').setLabel('Tutup Tiket').setEmoji('🔒').setStyle(ButtonStyle.Danger)
        );

        await ticketChannel.send({ embeds: [embedInfo], components: [row] });
        await interaction.reply({ content: `✅ Tiket berhasil dibuat: ${ticketChannel}`, ephemeral: true });
    }

    // --- 3. LOGIKA DONE / SELESAI (TRANSKRIP + HAPUS) ---
    if (interaction.isButton() && interaction.customId === 'done_tiket') {
        await interaction.reply('⌛ Memproses transkrip log dan menutup tiket...');

        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        let logContent = `LOG TRANSKRIP TIKET SELESAI: ${interaction.channel.name}\n\n`;
        messages.reverse().forEach(m => {
            logContent += `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}\n`;
        });

        const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
        if (logChannel) {
            const buffer = Buffer.from(logContent, 'utf-8');
            await logChannel.send({ 
                content: `✅ **TIKET SELESAI**: Channel **${interaction.channel.name}** telah diselesaikan oleh **${interaction.user.tag}**`,
                files: [{ attachment: buffer, name: `${interaction.channel.name}-done.txt` }] 
            });
        }

        setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
    }

    // --- 4. LOGIKA TUTUP (LANGSUNG HAPUS TANPA LOG) ---
    if (interaction.isButton() && interaction.customId === 'tutup_tiket') {
        await interaction.reply('⚠️ Menutup tiket tanpa log... menghapus dalam 3 detik.');
        setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
    }
});

client.login(TOKEN);
