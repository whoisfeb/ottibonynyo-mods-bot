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
const LOG_CHANNEL_ID = '1357044655631499447'; // Pastikan ini ada di GitHub Secrets

client.once('ready', () => {
    console.log(`✅ Bot Tiket Online: ${client.user.tag}`);
});

// Panel Utama
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
    
    // --- MUNCULKAN FORM MODAL ---
    if (interaction.isButton() && interaction.customId === 'buka_modal') {
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

    // --- PROSES SUBMIT MODAL & BUAT CHANNEL ---
    if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'form_tiket') {
        const valUcp = interaction.fields.getTextInputValue('ucp');
        const valNama = interaction.fields.getTextInputValue('nama');
        const valItem = interaction.fields.getTextInputValue('item');
        
        // Penomoran unik menggunakan 4 angka terakhir timestamp (karena GitHub Actions reset file)
        const ticketID = Date.now().toString().slice(-3);
        const channelName = `tiket-${interaction.user.username}-${ticketID}`;

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
            .setTitle(`Detail Tiket #${ticketID}`)
            .addFields(
                { name: '👤 User', value: `${interaction.user}`, inline: true },
                { name: '🆔 UCP', value: valUcp, inline: true },
                { name: '🎮 Karakter', value: valNama, inline: true },
                { name: '📦 Item', value: valItem }
            )
            .setColor('#2ecc71')
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('claim_tiket').setLabel('Claim Tiket').setEmoji('🙋‍♂️').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('tutup_tiket').setLabel('Selesai / Done').setEmoji('✅').setStyle(ButtonStyle.Danger)
        );

        await ticketChannel.send({ embeds: [embedInfo], components: [row] });
        await interaction.reply({ content: `Tiket berhasil dibuat di ${ticketChannel}`, ephemeral: true });
    }

    // --- LOGIKA CLAIM ---
    if (interaction.isButton() && interaction.customId === 'claim_tiket') {
        const claimEmbed = new EmbedBuilder()
            .setDescription(`📢 Tiket ini telah di-claim oleh ${interaction.user}. Silakan tunggu proses selanjutnya.`)
            .setColor('#E67E22');
        
        await interaction.reply({ embeds: [claimEmbed] });
        
        // Disable tombol claim
        const disabledRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('claim_tiket').setLabel('Sudah di-Claim').setStyle(ButtonStyle.Success).setDisabled(true),
            new ButtonBuilder().setCustomId('tutup_tiket').setLabel('Selesai / Done').setStyle(ButtonStyle.Danger)
        );
        await interaction.message.edit({ components: [disabledRow] });
    }

    // --- LOGIKA TUTUP & TRANSKRIP ---
    if (interaction.isButton() && interaction.customId === 'tutup_tiket') {
        await interaction.reply('Mencatat transkrip dan menghapus tiket...');

        // Ambil 100 pesan terakhir untuk transkrip
        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        let logContent = `LOG TRANSKRIP TIKET: ${interaction.channel.name}\n\n`;
        messages.reverse().forEach(m => {
            logContent += `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}\n`;
        });

        // Kirim ke Channel Log
        const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
        if (logChannel) {
            const buffer = Buffer.from(logContent, 'utf-8');
            await logChannel.send({ 
                content: `Tiket **${interaction.channel.name}** ditutup oleh **${interaction.user.tag}**`,
                files: [{ attachment: buffer, name: `${interaction.channel.name}.txt` }] 
            });
        }

        setTimeout(() => interaction.channel.delete(), 3000);
    }
});

client.login(TOKEN);
