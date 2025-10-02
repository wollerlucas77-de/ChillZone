require("dotenv").config();
const { 
    Client, 
    ActivityType, 
    GatewayIntentBits, 
    PermissionsBitField,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    EmbedBuilder,
    Partials
} = require("discord.js");
const fs = require('fs');

// #################### WICHTIGE KONSTANTEN ####################

// DEINE EIGENE SERVER-ID
const guildId = "709776395622154292";

// DEINE EIGENE BENUTZER-ID für den Neustart-Befehl
const ownerId = "404384577893826570";

// IDs deiner Kanäle und Rollen
const ticketCategoryId = "1408963916356255914"; // Kategorie für offene Tickets
const archiveCategoryId = "1417544964912582657"; // Kategorie für geschlossene Tickets
const warnsChannelId = "1417545628879290408"; // Kanal für Verwarnungs-Logs
const generalLogChannelId = "1376818744730456134"; // Allgemeiner Log-Kanal
const ticketLogChannelId = "1408963534590578728"; // Ticket-Log-Kanal
const bansChannelId = "1417579171768700978"; // Ban-Log-Kanal
const messageLogChannelId = "1417575097085988885"; // Nachrichten-Log-Kanal
const voiceLogChannelId = "1417547959519674520"; // Sprach-Log-Kanal
const abwesenheitRoleId = "1407847018654859414"; // ID der Abwesenheits-Rolle
const afkChannelId = "1376640924020506785"; // ID deines AFK-Kanals
const welcomeChannelId = "1376592935474434199"; // Willkommenskanal
const rulesChannelId = "DEINE_REGELN_KANAL_ID"; // WICHTIG: TRAG HIER DEINE ID EIN
const farewellChannelId = "1376616435337531532"; // Verabschiedungskanal
const birthdayChannelId = '1417604869056888832'; 
const birthdayRoleId = '1417605004612599828';
const goodnightChannelId = '1417596246624960665'; // Kanal-ID für Gute-Nacht-Nachrichten
const goodmorningChannelId = '1409127963764592650'; // NEU: Kanal-ID für Guten-Morgen-Nachrichten


// Dateipfade
const BIRTHDAY_FILE = './birthdays.json';

// Temporärer Speicher (geht bei Bot-Neustart verloren)
const warnings = {};
const bans = {};
const clearingMessagesIds = new Set();
const afkTimers = {};

// Listen für Spaß-Befehle
const roasts = [
    "Du hast die Intelligenz einer Zimmerpflanze.",
    "Ich würde dich beleidigen, aber die Natur war schon vor mir da.",
    "Dein Gesicht sieht aus, als hätte es einen Boxkampf mit einem Bienenstock verloren.",
    "Ich habe schon hässlichere Gesichter gesehen... aber nur auf dem Planeten der Affen.",
    "Du bist so langsam, dass die Schnecken dich als Beispiel benutzen.",
    "Deine Eltern sind Geschwister? Das erklärt viel.",
    "Wenn Dummheit wehtun würde, würdest du den ganzen Tag schreien.",
    "Du bist der lebende Beweis, dass Evolution auch rückwärts gehen kann.",
    "Dein Gehirn ist kleiner als die Hoffnungen deiner Eltern."
];

const komplimente = [
    "Du hast eine tolle Ausstrahlung!",
    "Deine Art zu lachen ist ansteckend.",
    "Deine Kreativität inspiriert mich.",
    "Du bist ein unglaublich guter Zuhörer.",
    "Ich schätze deine Ehrlichkeit sehr.",
    "Dein Stil ist wirklich einzigartig und cool.",
    "Du bringst mich immer zum Lächeln.",
    "Deine Leidenschaft für das, was du tust, ist bewundernswert.",
    "Du bist so ein freundlicher Mensch.",
    "Deine Meinung ist mir wichtig."
];

const kissGifs = [
    "https://media.tenor.com/W2oW61L-N6YAAAAC/anime-kiss.gif",
    "https://media.tenor.com/2s45x_D0o-4AAAAC/kiss-love.gif",
    "https://media.tenor.com/8Qv90p0jL_gAAAAC/love-you-cute-couple.gif",
    "https://media.tenor.com/h5TqQ2H02B0AAAAd/chuu-chuu-kiss.gif",
    "https://media.tenor.com/L-j7j2-s5lIAAAAC/hugs-anime.gif",
    "https://media.tenor.com/y1n05V0fE8cAAAAd/girl-and-boy-kissing-anime.gif"
];

const hugGifs = [
    "https://media.tenor.com/2xX22n66uUEAAAAC/bouncing-hug.gif",
    "https://media.tenor.com/WbBf9Lp3zT4AAAAC/anime-hug.gif",
    "https://media.tenor.com/0Fw-K2fB8rMAAAAC/anime-hug.gif",
    "https://media.tenor.com/f7jYy3T-3_MAAAAC/anime-hug.gif",
    "https://media.tenor.com/7gK5JvR54eUAAAAd/hugging-anime.gif",
    "https://media.tenor.com/2Yy_7Gz7xPMAAAAd/hug-gif.gif"
];

const slapGifs = [
    "https://media.tenor.com/C55F2y585wIAAAAd/anime-slap.gif",
    "https://media.tenor.com/T0b77G1Q7x4AAAAd/anime-slap.gif",
    "https://media.tenor.com/l_y380XvP7EAAAAC/slap-anime.gif",
    "https://media.tenor.com/9nF_B320-X8AAAAd/slap-anime.gif",
    "https://media.tenor.com/qL0l98r1vD4AAAAd/anime-slap.gif"
];

const banGifs = [
    "https://media.tenor.com/B94E5EaYqWwAAAAd/ban-banned.gif",
    "https://media.tenor.com/D_iN7fL4qf0AAAAd/banned-ban.gif",
    "https://media.tenor.com/tHqXW49zP7kAAAAd/thworp-banned.gif"
];

const pillowFightGifs = [
    "https://media.tenor.com/W1E6eLpL8cIAAAAC/pillow-fight-anime.gif",
    "https://media.tenor.com/yJ3j6_B4iNMAAAAC/anime-cute.gif",
    "https://media.tenor.com/jM39T-1_kEwAAAAC/pillow-fight.gif",
    "https://media.tenor.com/5E-Q897NlQoAAAAC/anime-fight.gif",
    "https://media.tenor.com/P4w8a5aV2fMAAAAC/anime-pillow-fight.gif"
];

const chillGifs = [
    "https://media.tenor.com/D8i7-dE4aJ8AAAAC/chill-relaxing.gif",
    "https://media.tenor.com/xT0g-Yl-mE0AAAAC/relax-laze.gif",
    "https://media.tenor.com/N6M3m_q6V3sAAAAd/relax-chilling.gif",
    "https://media.tenor.com/2U5t0lM8lJIAAAAC/relaxing-chill.gif",
    "https://media.tenor.com/z0H5zE9L2B0AAAAd/relax-chill.gif"
];

const bierlaSprüche = [
    "Aaf die Gmiadlichkeid! Prost! 🍺",
    "S'schönsdä am Bierla is, wenns'd an Schdimmele kriägsd! 🍻",
    "Amol gschwind a Seidla! Des gäiht immer! 🍺",
    "An guudn! 🍻",
    "Des schmeckt wie a Engela pinkelt hodd! 👼🍺"
];


// #################### CLIENT UND UTILITY-FUNKTIONEN ####################

const client = new Client({ intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildMembers
], partials: [Partials.Message, Partials.Channel] });

async function logToChannel(channelId, action, details) {
    try {
        const logChannel = client.channels.cache.get(channelId);
        if (logChannel) {
            const logEmbed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(`Bot-Aktion: ${action}`)
                .setDescription(details)
                .setTimestamp();
            await logChannel.send({ embeds: [logEmbed] });
        }
    } catch (error) {
        console.error("Fehler beim Senden der Log-Nachricht:", error);
    }
}

async function cleanChannel(channelId) {
    try {
        const channel = client.channels.cache.get(channelId);
        if (!channel) return console.error(`Kanal mit ID ${channelId} nicht gefunden.`);
        const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
        let messagesToDelete = [];
        const messages = await channel.messages.fetch({ limit: 100 });
        messages.forEach(msg => {
            if (msg.createdTimestamp < threeDaysAgo) {
                messagesToDelete.push(msg);
            }
        });
        if (messagesToDelete.length > 0) {
            await channel.bulkDelete(messagesToDelete, true);
            console.log(`Gelöscht: ${messagesToDelete.length} alte Nachrichten aus dem Kanal ${channel.name}`);
            await logToChannel(generalLogChannelId, 'Kanal gesäubert', `Gelöscht: ${messagesToDelete.length} alte Nachrichten aus dem Kanal **${channel.name}** (${channel.id}).`);
        } else {
            console.log(`Keine alten Nachrichten im Kanal ${channel.name} gefunden.`);
        }
    } catch (error) {
        console.error("Fehler bei der Kanalsäuberung:", error);
    }
}

const parseDuration = (str) => {
    const match = str.match(/^(\d+)([smhd])$/);
    if (!match) return null;
    const value = parseInt(match[1]);
    const unit = match[2];
    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 1000 * 60;
        case 'h': return value * 1000 * 60 * 60;
        case 'd': return value * 1000 * 60 * 60 * 24;
        default: return null;
    }
};

async function checkBirthdays() {
    console.log('Führe tägliche Geburtstagsprüfung aus...');
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();
    
    try {
        let birthdays = {};
        if (fs.existsSync(BIRTHDAY_FILE)) {
             birthdays = JSON.parse(fs.readFileSync(BIRTHDAY_FILE, 'utf8'));
        }
        
        const guild = client.guilds.cache.get(guildId);
        if (!guild) return console.error("Server nicht gefunden!");
        
        const birthdayChannel = guild.channels.cache.get(birthdayChannelId);
        const birthdayRole = guild.roles.cache.get(birthdayRoleId);

        if (!birthdayChannel) {
            console.error('Geburtstagskanal nicht gefunden. Bitte überprüfe die ID.');
        }

        const members = await guild.members.fetch();
        
        for (const [userId, birthdayInfo] of Object.entries(birthdays)) {
            const member = members.get(userId);
            if (member) {
                // Überprüfen, ob heute Geburtstag ist
                if (birthdayInfo.month === currentMonth && birthdayInfo.day === currentDay) {
                    if (birthdayChannel) {
                        const birthdayEmbed = new EmbedBuilder()
                            .setColor(0x00ff00)
                            .setTitle('🎉 Ein Mitglied hat heute Geburtstag! 🎉')
                            .setDescription(`Herzlichen Glückwunsch zum Geburtstag, **${member.user.tag}**! Wir wünschen dir alles Gute und einen wundervollen Tag voller Freude!`)
                            .setTimestamp();
                        await birthdayChannel.send({ content: `${member}`, embeds: [birthdayEmbed] });
                    }
                    if (birthdayRole) {
                        await member.roles.add(birthdayRole).catch(console.error);
                        console.log(`Rolle ${birthdayRole.name} an ${member.user.tag} vergeben.`);
                    }
                } else {
                    // Rolle vom Vortag entfernen
                    const yesterday = new Date(now);
                    yesterday.setDate(now.getDate() - 1);
                    const yesterdayMonth = yesterday.getMonth() + 1;
                    const yesterdayDay = yesterday.getDate();

                    if (birthdayInfo.month === yesterdayMonth && birthdayInfo.day === yesterdayDay) {
                         if (member.roles.cache.has(birthdayRoleId)) {
                            await member.roles.remove(birthdayRole).catch(console.error);
                            console.log(`Rolle ${birthdayRole.name} von ${member.user.tag} entfernt.`);
                         }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Fehler bei der täglichen Geburtstagsprüfung:', error);
    }
}

// #################### BOT START ####################

client.once("ready", async () => {
    console.log(`Ready! Logged in as ${client.user.tag}! I'm on ${client.guilds.cache.size} guilds!`);
    
    client.user.setActivity({
        name: "mit dem Code",
        type: ActivityType.Watching
    });

    try {
        const guild = client.guilds.cache.get(guildId);
        if (guild) {
            await guild.commands.set([
                { name: 'neustart', description: 'Startet den Bot neu (nur für den Bot-Besitzer).' },
                {
                    name: 'report',
                    description: 'Meldet einen Benutzer an die Moderation.',
                    options: [
                        { name: 'user', type: 6, description: 'Der Benutzer, der gemeldet werden soll.', required: true },
                        { name: 'grund', type: 3, description: 'Der Grund für die Meldung.', required: true },
                    ],
                },
                {
                    name: 'warn',
                    description: 'Warnt einen Benutzer',
                    options: [
                        { name: 'user', type: 6, description: 'Der Benutzer, der gewarnt werden soll', required: true },
                        { name: 'reason', type: 3, description: 'Der Grund für die Warnung', required: false },
                    ],
                },
                {
                    name: 'unwarn',
                    description: 'Löscht eine Verwarnung anhand der ID.',
                    options: [
                        { name: 'warn_id', type: 3, description: 'Die ID der Verwarnung, die gelöscht werden soll.', required: true },
                    ],
                },
                {
                    name: 'setup-tickets',
                    description: 'Richtet das Ticket-Panel mit anpassbaren Optionen ein.',
                    options: [
                        { name: 'panel-channel', type: 7, description: 'Der Kanal, in dem das Ticket-Panel erstellt werden soll.', required: true },
                        { name: 'options', type: 3, description: 'Eine kommaseparierte Liste von Ticket-Optionen (z.B. Support,Bewerbung,Feedback)', required: true },
                        { name: 'handler-role', type: 8, description: 'Die Rolle, die Tickets bearbeiten soll.', required: true },
                    ],
                },
                {
                    name: 'ticket-weiterleiten',
                    description: 'Leitet das aktuelle Ticket an eine andere Rolle weiter.',
                    options: [
                        { name: 'rolle', type: 8, description: 'Die Rolle, an die das Ticket weitergeleitet werden soll.', required: true },
                    ],
                },
                { name: 'clear', description: 'Löscht alle Nachrichten in diesem Kanal.' },
                {
                    name: 'roast',
                    description: 'Beleidigt einen Benutzer auf eine lustige Art.',
                    options: [
                        { name: 'user', type: 6, description: 'Der Benutzer, der geröstet werden soll.', required: true },
                    ],
                },
                {
                    name: 'kompliment',
                    description: 'Macht einem Benutzer ein Kompliment.',
                    options: [
                        { name: 'user', type: 6, description: 'Der Benutzer, dem ein Kompliment gemacht werden soll.', required: true },
                    ],
                },
                {
                    name: 'move',
                    description: 'Verschiebt einen Benutzer in einen anderen Sprachkanal.',
                    options: [
                        { name: 'user', type: 6, description: 'Der Benutzer, der verschoben werden soll.', required: true },
                        { name: 'channel', type: 7, description: 'Der Ziel-Sprachkanal.', required: true, channel_types: [ChannelType.GuildVoice] },
                    ],
                },
                {
                    name: 'kiss',
                    description: 'Küsse einen anderen Benutzer.',
                    options: [
                        { name: 'user', type: 6, description: 'Der Benutzer, der geküsst werden soll.', required: true },
                    ],
                },
                {
                    name: 'hug',
                    description: 'Umarme einen anderen Benutzer.',
                    options: [
                        { name: 'user', type: 6, description: 'Der Benutzer, der umarmt werden soll.', required: true },
                    ],
                },
                {
                    name: 'slap',
                    description: 'Verpasst einem anderen Benutzer eine Ohrfeige.',
                    options: [
                        { name: 'user', type: 6, description: 'Der Benutzer, dem eine Ohrfeige verpasst werden soll.', required: true },
                    ],
                },
                {
                    name: 'kissen-schlacht',
                    description: 'Wirf ein Kissen auf einen anderen Benutzer.',
                    options: [
                        { name: 'user', type: 6, description: 'Der Benutzer, der beworfen werden soll.', required: true },
                    ],
                },
                { name: 'chill', description: 'Entspanne dich und chill!' },
                {
                    name: 'ban',
                    description: 'Bannt einen Benutzer vom Server.',
                    options: [
                        { name: 'user', type: 6, description: 'Der Benutzer, der gebannt werden soll.', required: true },
                        { name: 'reason', type: 3, description: 'Der Grund für den Bann.', required: false },
                    ],
                },
                {
                    name: 'unban',
                    description: 'Hebt den Bann eines Benutzers anhand der Ban-ID auf.',
                    options: [
                        { name: 'ban_id', type: 3, description: 'Die ID des Bans, der aufgehoben werden soll.', required: true },
                    ],
                },
                {
                    name: 'kick',
                    description: 'Entfernt einen Benutzer vom Server.',
                    options: [
                        { name: 'user', type: 6, description: 'Der Benutzer, der gekickt werden soll.', required: true },
                        { name: 'reason', type: 3, description: 'Der Grund für den Kick.', required: false },
                    ],
                },
                {
                    name: 'setup-abwesenheit',
                    description: 'Richtet das Abwesenheits-Panel für Teammitglieder ein.',
                    options: [
                        { name: 'panel-channel', type: 7, description: 'Der Kanal, in dem das Abwesenheits-Panel erstellt werden soll.', required: true, channel_types: [ChannelType.GuildText] },
                        { name: 'abwesenheit-category', type: 7, description: 'Die Kategorie, in der die Abwesenheitstickets erstellt werden sollen.', required: true, channel_types: [ChannelType.GuildCategory] },
                        { name: 'handler-role', type: 8, description: 'Die Rolle, die die Abwesenheitstickets verwalten soll.', required: true },
                    ],
                },
                {
                    name: 'abwesenheit-eingetragen',
                    description: 'Vergibt die Abwesenheits-Rolle an einen Benutzer.',
                    options: [
                        { name: 'user', type: 6, description: 'Das Teammitglied, dessen Abwesenheit eingetragen wird.', required: true },
                    ],
                },
                { name: 'a_bierla', description: 'Holt ein kühles Bierla! 🍺' },
                {
                    name: 'timeout',
                    description: 'Versieht einen Benutzer mit einem Timeout.',
                    options: [
                        { name: 'user', type: 6, description: 'Der Benutzer, der den Timeout erhalten soll.', required: true },
                        { name: 'dauer', type: 3, description: 'Die Dauer des Timeouts (z.B. 10m, 1h, 2d).', required: true },
                        { name: 'grund', type: 3, description: 'Der Grund für den Timeout.', required: false },
                    ],
                },
                {
                    name: 'ship',
                    description: 'Berechnet die Kompatibilität zwischen zwei Benutzern.',
                    options: [
                        { name: 'user1', type: 6, description: 'Der erste Benutzer.', required: true },
                        { name: 'user2', type: 6, description: 'Der zweite Benutzer.', required: true },
                    ],
                },
                {
                    name: 'geburtstag-hinzufügen',
                    description: 'Legt deinen Geburtstag fest.',
                    options: [
                        { name: 'monat', type: 4, description: 'Der Monat deines Geburtstags (1-12).', required: true },
                        { name: 'tag', type: 4, description: 'Der Tag deines Geburtstags (1-31).', required: true },
                    ],
                },
                {
                    name: 'geburtstag-löschen',
                    description: 'Löscht deinen gespeicherten Geburtstag.',
                },
                {
                    name: 'gute-nacht',
                    description: 'Wünscht allen eine gute Nacht.',
                },
                // NEUER BEFEHL START
                {
                    name: 'guten-morgen',
                    description: 'Wünscht allen einen guten Morgen.',
                },
                // NEUER BEFEHL ENDE
            ]);
            console.log("Slash Commands erfolgreich registriert.");
        } else {
            console.error("Server-ID nicht gefunden.");
        }
    } catch (error) {
        console.error("Fehler bei der Befehlsregistrierung:", error);
    }
    
    await cleanChannel(generalLogChannelId);
    await cleanChannel(voiceLogChannelId);
    setInterval(() => {
        cleanChannel(generalLogChannelId);
        cleanChannel(voiceLogChannelId);
    }, 24 * 60 * 60 * 1000);

    // Tägliche Prüfung für Geburtstage einplanen
    const now = new Date();
    const millisTillMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime() + 24 * 60 * 60 * 1000 - now.getTime();
    setTimeout(() => {
        checkBirthdays();
        setInterval(checkBirthdays, 24 * 60 * 60 * 1000);
    }, millisTillMidnight);
});

// #################### INTERAKTIONEN UND EVENTS ####################

client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isCommand()) {
            if (interaction.commandName === 'neustart') {
                if (interaction.user.id !== ownerId) {
                    return interaction.reply({ content: 'Du hast keine Berechtigung, diesen Befehl auszuführen.', ephemeral: true });
                }
                await interaction.reply({ content: 'Starte neu... Der Bot wird in Kürze wieder verfügbar sein.', ephemeral: false });
                await logToChannel(generalLogChannelId, 'Bot-Neustart', `**Moderator:** ${interaction.user.tag} hat den Bot manuell neu gestartet.`);
                process.exit();
            }

            if (interaction.commandName === 'report') {
                const userToReport = interaction.options.getUser('user');
                const reason = interaction.options.getString('grund');
                if (userToReport.id === interaction.user.id) {
                    return interaction.reply({ content: 'Du kannst dich nicht selbst melden.', ephemeral: true });
                }
                await interaction.deferReply({ ephemeral: true });
                try {
                    const channelName = `report-${userToReport.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
                    const reportChannel = await interaction.guild.channels.create({
                        name: channelName,
                        type: ChannelType.GuildText,
                        parent: ticketCategoryId,
                        permissionOverwrites: [
                            { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                            { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                            { id: '1376493950394695741', allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                            { id: '1376497928662941696', deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                            { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                        ],
                    });
                    const reportEmbed = new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle('Neue Benutzermeldung')
                        .addFields(
                            { name: 'Gemeldeter Benutzer', value: `${userToReport.tag} (${userToReport.id})`, inline: true },
                            { name: 'Melder', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                            { name: 'Grund', value: reason, inline: false },
                        )
                        .setTimestamp();
                    const closeButton = new ButtonBuilder().setCustomId('close_ticket').setLabel('Ticket schließen').setStyle(ButtonStyle.Danger);
                    const row = new ActionRowBuilder().addComponents(closeButton);
                    await reportChannel.send({ content: `<@&1376493950394695741>`, embeds: [reportEmbed], components: [row] });
                    await interaction.followUp({ content: `Deine Meldung über **${userToReport.tag}** wurde erfolgreich in einem Ticket erstellt: ${reportChannel}.`, ephemeral: true });
                    await logToChannel(ticketLogChannelId, 'Benutzer gemeldet', `**Melder:** ${interaction.user.tag}\n**Gemeldeter Benutzer:** ${userToReport.tag}\n**Grund:** ${reason}\n**Ticket:** ${reportChannel}`);
                } catch (error) {
                    console.error('Fehler beim Erstellen des Report-Tickets:', error);
                    await interaction.followUp({ content: 'Ein Fehler ist beim Erstellen des Tickets aufgetreten. Bitte überprüfe die Bot-Berechtigungen.', ephemeral: true });
                }
            }

            if (interaction.commandName === 'timeout') {
                const memberToTimeout = interaction.options.getMember('user');
                const durationString = interaction.options.getString('dauer');
                const reason = interaction.options.getString('grund') || 'Kein Grund angegeben.';
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
                    return interaction.reply({ content: 'Du hast nicht die erforderlichen Berechtigungen für diesen Befehl.', ephemeral: true });
                }
                if (memberToTimeout.id === interaction.user.id) {
                    return interaction.reply({ content: 'Du kannst dich nicht selbst mit einem Timeout versehen.', ephemeral: true });
                }
                if (memberToTimeout.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
                    return interaction.reply({ content: 'Du kannst diesen Benutzer nicht mit einem Timeout versehen, da er eine gleichberechtigte oder höhere Rolle hat.', ephemeral: true });
                }
                const timeoutMilliseconds = parseDuration(durationString);
                const maxTimeout = 28 * 24 * 60 * 60 * 1000;
                if (!timeoutMilliseconds || timeoutMilliseconds <= 0 || timeoutMilliseconds > maxTimeout) {
                    return interaction.reply({ content: 'Ungültige Dauer. Bitte verwende ein Format wie `10s`, `5m`, `2h` oder `3d`. Die maximale Dauer beträgt 28 Tage.', ephemeral: true });
                }
                try {
                    await memberToTimeout.timeout(timeoutMilliseconds, reason);
                    const timeoutEmbed = new EmbedBuilder()
                        .setColor(0xFFA500)
                        .setTitle('Timeout verhängt')
                        .setDescription(`${memberToTimeout.user.tag} hat einen Timeout erhalten.`)
                        .addFields(
                            { name: 'Benutzer', value: `${memberToTimeout.user.tag} (${memberToTimeout.id})`, inline: false },
                            { name: 'Moderator', value: `${interaction.user.tag} (${interaction.user.id})`, inline: false },
                            { name: 'Dauer', value: durationString, inline: false },
                            { name: 'Grund', value: reason, inline: false },
                        )
                        .setTimestamp();
                    await interaction.reply({ embeds: [timeoutEmbed], ephemeral: false });
                    await logToChannel(generalLogChannelId, 'Timeout verhängt', `**Moderator:** ${interaction.user.tag}\n**Benutzer:** ${memberToTimeout.user.tag}\n**Dauer:** ${durationString}\n**Grund:** ${reason}`);
                } catch (error) {
                    console.error('Fehler beim Timeout:', error);
                    await interaction.reply({ content: 'Ein Fehler ist beim Verhängen des Timeouts aufgetreten. Bitte überprüfe die Bot-Berechtigungen.', ephemeral: true });
                }
            }

            if (interaction.commandName === 'warn') {
                const userToWarn = interaction.options.getUser('user');
                const reason = interaction.options.getString('reason') || 'Kein Grund angegeben.';
                const warnId = Math.random().toString(36).substring(2, 8).toUpperCase();
                warnings[warnId] = { user: userToWarn.id, reason, moderator: interaction.user.id, timestamp: Date.now() };
                const warnEmbed = new EmbedBuilder()
                    .setColor(0xF08080)
                    .setTitle(`Verwarnung #${warnId}`)
                    .addFields(
                        { name: 'Benutzer', value: `${userToWarn.tag} (${userToWarn.id})`, inline: false },
                        { name: 'Moderator', value: `${interaction.user.tag} (${interaction.user.id})`, inline: false },
                        { name: 'Grund', value: reason, inline: false },
                    )
                    .setTimestamp();
                const warnsChannel = client.channels.cache.get(warnsChannelId);
                if (warnsChannel) {
                    await warnsChannel.send({ embeds: [warnEmbed] });
                }
                try {
                    await userToWarn.send(`Hallo! Du wurdest von ${interaction.user.tag} wegen "${reason}" verwarnt. Deine Verwarnungs-ID lautet: #${warnId}`);
                } catch (dmError) {
                    console.log(`Konnte keine DM an ${userToWarn.tag} senden.`);
                }
                await interaction.reply({ content: `**${userToWarn.tag}** wurde erfolgreich verwarnt. Grund: **${reason}** (ID: #${warnId})`, ephemeral: false });
                await logToChannel(generalLogChannelId, 'Benutzer verwarnt', `**Moderator:** ${interaction.user.tag}\n**Verwarnter:** ${userToWarn.tag}\n**Grund:** ${reason}\n**Verwarnungs-ID:** #${warnId}`);
            }
            
            if (interaction.commandName === 'unwarn') {
                const warnId = interaction.options.getString('warn_id').toUpperCase();
                if (!warnings[warnId]) {
                    return interaction.reply({ content: `Verwarnung mit der ID **#${warnId}** wurde nicht gefunden.`, ephemeral: true });
                }
                const unwarnedUser = await client.users.fetch(warnings[warnId].user);
                delete warnings[warnId];
                await interaction.reply({ content: `Verwarnung **#${warnId}** von **${unwarnedUser.tag}** wurde erfolgreich gelöscht.`, ephemeral: false });
                const warnsChannel = client.channels.cache.get(warnsChannelId);
                if (warnsChannel) {
                    const unwarnEmbed = new EmbedBuilder()
                        .setColor(0x00FF00)
                        .setTitle(`Verwarnung aufgehoben`)
                        .addFields(
                            { name: 'Verwarnungs-ID', value: `#${warnId}`, inline: false },
                            { name: 'Benutzer', value: `${unwarnedUser.tag} (${unwarnedUser.id})`, inline: false },
                            { name: 'Moderator', value: `${interaction.user.tag} (${interaction.user.id})`, inline: false },
                        )
                        .setTimestamp();
                    await warnsChannel.send({ embeds: [unwarnEmbed] });
                }
                await logToChannel(generalLogChannelId, 'Verwarnung aufgehoben', `**Moderator:** ${interaction.user.tag}\n**Verwarnungs-ID:** #${warnId}\n**Betroffener Benutzer:** ${unwarnedUser.tag}`);
            }

            if (interaction.commandName === 'setup-tickets') {
                const panelChannel = interaction.options.getChannel('panel-channel');
                const optionsString = interaction.options.getString('options');
                const handlerRole = interaction.options.getRole('handler-role');
                const ticketOptions = optionsString.split(',').map(optionName => {
                    return new StringSelectMenuOptionBuilder()
                        .setLabel(optionName.trim())
                        .setDescription(`Öffne ein Ticket für ${optionName.trim()}`)
                        .setValue(`${optionName.trim().toLowerCase()}`);
                });
                const selectMenu = new StringSelectMenuBuilder().setCustomId(`ticket_select_${handlerRole.id}`).setPlaceholder('Wähle eine Ticket-Kategorie aus...').addOptions(ticketOptions);
                const row = new ActionRowBuilder().addComponents(selectMenu);
                await panelChannel.send({ content: 'Wähle eine Ticket-Kategorie:', components: [row] });
                await interaction.reply({ content: `Das Ticket-Panel wurde in ${panelChannel} erstellt.`, ephemeral: true });
                await logToChannel(ticketLogChannelId, 'Ticket-Panel eingerichtet', `**Moderator:** ${interaction.user.tag}\n**Panel-Kanal:** ${panelChannel.name}\n**Ticket-Kategorien:** ${optionsString}`);
            }

            if (interaction.commandName === 'ticket-weiterleiten') {
                await interaction.deferReply({ ephemeral: true });
                const currentChannel = interaction.channel;
                if (currentChannel.parentId !== ticketCategoryId && currentChannel.parentId !== archiveCategoryId) {
                    return interaction.followUp({ content: 'Dieser Befehl kann nur in einem Ticket-Kanal verwendet werden.', ephemeral: true });
                }
                const handlerRole = interaction.options.getRole('rolle');
                try {
                    await currentChannel.permissionOverwrites.edit(handlerRole, { ViewChannel: true, SendMessages: true });
                    await interaction.followUp({ content: `Ticket wurde erfolgreich an die Rolle **${handlerRole.name}** weitergeleitet.`, ephemeral: false });
                    await logToChannel(ticketLogChannelId, 'Ticket weitergeleitet', `**Moderator:** ${interaction.user.tag}\n**Ticket-Kanal:** ${currentChannel.name}\n**Weitergeleitet an:** ${handlerRole.name}`);
                } catch (error) {
                    console.error("Fehler beim Weiterleiten des Tickets:", error);
                    await interaction.followUp({ content: 'Es gab einen Fehler beim Weiterleiten des Tickets. Bitte überprüfe die Berechtigungen des Bots.', ephemeral: true });
                }
            }

            if (interaction.commandName === 'clear') {
                const channel = interaction.channel;
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                    return interaction.reply({ content: 'Du hast nicht die erforderlichen Berechtigungen, um diesen Befehl auszuführen.', ephemeral: true });
                }
                await interaction.deferReply({ ephemeral: true });
                let messagesDeletedCount = 0;
                let fetched;
                do {
                    fetched = await channel.messages.fetch({ limit: 100 });
                    const oldMessages = fetched.filter(msg => Date.now() - msg.createdTimestamp > 14 * 24 * 60 * 60 * 1000);
                    const recentMessages = fetched.filter(msg => Date.now() - msg.createdTimestamp <= 14 * 24 * 60 * 60 * 1000);
                    recentMessages.forEach(msg => clearingMessagesIds.add(msg.id));
                    oldMessages.forEach(msg => clearingMessagesIds.add(msg.id));
                    if (recentMessages.size > 0) {
                        const deleted = await channel.bulkDelete(recentMessages, true);
                        messagesDeletedCount += deleted.size;
                    }
                    if (oldMessages.size > 0) {
                        for (const msg of oldMessages.values()) {
                            await msg.delete().catch(console.error);
                            messagesDeletedCount++;
                        }
                    }
                } while (fetched.size >= 1);
                await interaction.followUp({ content: `Erfolgreich **${messagesDeletedCount}** Nachrichten aus diesem Kanal gelöscht.`, ephemeral: true });
                await logToChannel(generalLogChannelId, 'Kanal geleert', `**Moderator:** ${interaction.user.tag} hat alle Nachrichten im Kanal **${channel.name}** gelöscht.`);
            }

            if (interaction.commandName === 'roast') {
                const userToRoast = interaction.options.getUser('user');
                const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
                await interaction.reply({ content: `${userToRoast}, ${randomRoast}` });
                await logToChannel(generalLogChannelId, 'Benutzer geröstet', `**Moderator:** ${interaction.user.tag} hat **${userToRoast.tag}** geröstet.\n**Spruch:** ${randomRoast}`);
            }

            if (interaction.commandName === 'kompliment') {
                const userToCompliment = interaction.options.getUser('user');
                const randomKompliment = komplimente[Math.floor(Math.random() * komplimente.length)];
                await interaction.reply({ content: `${userToCompliment}, ${randomKompliment}` });
                await logToChannel(generalLogChannelId, 'Benutzer Kompliment', `**Moderator:** ${interaction.user.tag} hat **${userToCompliment.tag}** ein Kompliment gemacht.\n**Spruch:** ${randomKompliment}`);
            }

            if (interaction.commandName === 'move') {
                const memberToMove = interaction.options.getMember('user');
                const voiceChannel = interaction.options.getChannel('channel');
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
                    return interaction.reply({ content: 'Du hast nicht die erforderlichen Berechtigungen, um diesen Befehl auszuführen.', ephemeral: true });
                }
                if (!memberToMove.voice.channel) {
                    return interaction.reply({ content: `**${memberToMove.user.tag}** befindet sich nicht in einem Sprachkanal.`, ephemeral: true });
                }
                if (voiceChannel.type !== ChannelType.GuildVoice) {
                    return interaction.reply({ content: `Der Kanal **${voiceChannel.name}** ist kein Sprachkanal.`, ephemeral: true });
                }
                try {
                    const oldChannelName = memberToMove.voice.channel.name;
                    await memberToMove.voice.setChannel(voiceChannel);
                    await interaction.reply({ content: `**${memberToMove.user.tag}** wurde erfolgreich nach **${voiceChannel.name}** verschoben.`, ephemeral: false });
                    await logToChannel(voiceLogChannelId, 'Benutzer verschoben', `**Moderator:** ${interaction.user.tag} hat **${memberToMove.user.tag}** von **${oldChannelName}** nach **${voiceChannel.name}** verschoben.`);
                } catch (error) {
                    console.error("Fehler beim Verschieben des Benutzers:", error);
                    await interaction.reply({ content: 'Beim Verschieben des Benutzers ist ein Fehler aufgetreten. Bitte überprüfe die Berechtigungen des Bots.', ephemeral: true });
                }
            }

            if (interaction.commandName === 'kiss') {
                const kisser = interaction.user;
                const kissedUser = interaction.options.getUser('user');
                const randomGif = kissGifs[Math.floor(Math.random() * kissGifs.length)];
                if (kisser.id === kissedUser.id) {
                    const selfKissEmbed = new EmbedBuilder().setColor(0xffc0cb).setDescription(`Aww, ${kisser} küsst sich selbst! Du bist ja so süß!`).setImage(randomGif);
                    await interaction.reply({ embeds: [selfKissEmbed] });
                } else {
                    const kissEmbed = new EmbedBuilder().setColor(0xffc0cb).setDescription(`${kisser} küsst ${kissedUser}! 🥰`).setImage(randomGif);
                    await interaction.reply({ embeds: [kissEmbed] });
                }
            }

            if (interaction.commandName === 'hug') {
                const hugger = interaction.user;
                const huggedUser = interaction.options.getUser('user');
                const randomGif = hugGifs[Math.floor(Math.random() * hugGifs.length)];
                if (hugger.id === huggedUser.id) {
                    const selfHugEmbed = new EmbedBuilder().setColor(0xadd8e6).setDescription(`${hugger} umarmt sich selbst. So viel Selbstliebe! ❤️`).setImage(randomGif);
                    await interaction.reply({ embeds: [selfHugEmbed] });
                } else {
                    const hugEmbed = new EmbedBuilder().setColor(0xadd8e6).setDescription(`${hugger} umarmt ${huggedUser}! 🤗`).setImage(randomGif);
                    await interaction.reply({ embeds: [hugEmbed] });
                }
            }

            if (interaction.commandName === 'slap') {
                const slapper = interaction.user;
                const slappedUser = interaction.options.getUser('user');
                const randomGif = slapGifs[Math.floor(Math.random() * slapGifs.length)];
                if (slapper.id === slappedUser.id) {
                    const selfSlapEmbed = new EmbedBuilder().setColor(0x800080).setDescription(`${slapper} ist verrückt genug, sich selbst eine zu geben! Das muss wehtun...`).setImage(randomGif);
                    await interaction.reply({ embeds: [selfSlapEmbed] });
                } else {
                    const slapEmbed = new EmbedBuilder().setColor(0x800080).setDescription(`${slapper} verpasst ${slappedUser} eine ordentliche Ohrfeige! 💥`).setImage(randomGif);
                    await interaction.reply({ embeds: [slapEmbed] });
                }
            }
            
            if (interaction.commandName === 'kissen-schlacht') {
                const user1 = interaction.user;
                const user2 = interaction.options.getUser('user');
                const randomGif = pillowFightGifs[Math.floor(Math.random() * pillowFightGifs.length)];
                const kissenEmbed = new EmbedBuilder().setColor(0xffc0cb).setDescription(`${user1} hat ${user2} mit einem Kissen beworfen! FLUFF! ☁️`).setImage(randomGif);
                await interaction.reply({ embeds: [kissenEmbed] });
            }

            if (interaction.commandName === 'chill') {
                const randomGif = chillGifs[Math.floor(Math.random() * chillGifs.length)];
                const chillEmbed = new EmbedBuilder().setColor(0x6aa84f).setDescription(`Zeit zum Entspannen. Mach's dir gemütlich! 😌`).setImage(randomGif);
                await interaction.reply({ embeds: [chillEmbed] });
            }

            if (interaction.commandName === 'a_bierla') {
                const randomSpruch = bierlaSprüche[Math.floor(Math.random() * bierlaSprüche.length)];
                await interaction.reply(randomSpruch);
            }
            
            if (interaction.commandName === 'ban') {
                const userToBan = interaction.options.getMember('user');
                const reason = interaction.options.getString('reason') || 'Kein Grund angegeben.';
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
                    return interaction.reply({ content: 'Du hast nicht die Berechtigung, Benutzer zu bannen.', ephemeral: true });
                }
                if (userToBan.id === client.user.id) {
                    return interaction.reply({ content: 'Ich kann mich nicht selbst bannen.', ephemeral: true });
                }
                if (!userToBan.bannable) {
                    return interaction.reply({ content: 'Ich kann diesen Benutzer nicht bannen, da er eine höhere oder gleichberechtigte Rolle hat.', ephemeral: true });
                }
                const banId = Math.random().toString(36).substring(2, 8).toUpperCase();
                bans[banId] = { user: userToBan.id, reason, moderator: interaction.user.id, timestamp: Date.now() };
                const randomGif = banGifs[Math.floor(Math.random() * banGifs.length)];
                try {
                    const banEmbed = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle(`Benutzer gebannt (#${banId})`)
                        .addFields(
                            { name: 'Benutzer', value: `${userToBan.user.tag} (${userToBan.id})`, inline: false },
                            { name: 'Moderator', value: `${interaction.user.tag} (${interaction.user.id})`, inline: false },
                            { name: 'Grund', value: reason, inline: false },
                        )
                        .setImage(randomGif)
                        .setTimestamp();
                    await userToBan.send(`Du wurdest vom Server **${interaction.guild.name}** gebannt. Grund: **${reason}** (Ban-ID: #${banId})`).catch(() => console.log('Konnte keine DM senden.'));
                    await userToBan.ban({ reason });
                    await interaction.reply({ embeds: [banEmbed] });
                    await client.channels.cache.get(bansChannelId).send({ embeds: [banEmbed] });
                    await logToChannel(generalLogChannelId, 'Benutzer gebannt', `**Moderator:** ${interaction.user.tag}\n**Gebannter:** ${userToBan.user.tag}\n**Grund:** ${reason}\n**Ban-ID:** #${banId}`);
                } catch (error) {
                    console.error('Fehler beim Bannen des Benutzers:', error);
                    delete bans[banId];
                    await interaction.reply({ content: 'Beim Bannen des Benutzers ist ein Fehler aufgetreten.', ephemeral: true });
                }
            }

            if (interaction.commandName === 'unban') {
                const banId = interaction.options.getString('ban_id').toUpperCase();
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
                    return interaction.reply({ content: 'Du hast nicht die Berechtigung, Bans aufzuheben.', ephemeral: true });
                }
                if (!bans[banId]) {
                    return interaction.reply({ content: `Ban mit der ID **#${banId}** wurde nicht gefunden.`, ephemeral: true });
                }
                const bannedUserId = bans[banId].user;
                const reason = `Aufhebung des Bans durch ${interaction.user.tag} (ID: #${banId})`;
                try {
                    await interaction.guild.members.unban(bannedUserId, { reason });
                    const unbanEmbed = new EmbedBuilder()
                        .setColor(0x00FF00)
                        .setTitle('Bann aufgehoben')
                        .addFields(
                            { name: 'Ban-ID', value: `#${banId}`, inline: false },
                            { name: 'Benutzer', value: `<@${bannedUserId}> (${bannedUserId})`, inline: false },
                            { name: 'Moderator', value: `${interaction.user.tag} (${interaction.user.id})`, inline: false },
                        )
                        .setTimestamp();
                    await interaction.reply({ embeds: [unbanEmbed], ephemeral: false });
                    await client.channels.cache.get(bansChannelId).send({ embeds: [unbanEmbed] });
                    await logToChannel(generalLogChannelId, 'Bann aufgehoben', `**Moderator:** ${interaction.user.tag}\n**Ban-ID:** #${banId}\n**Betroffener Benutzer:** <@${bannedUserId}>`);
                    delete bans[banId];
                } catch (error) {
                    console.error('Fehler beim Aufheben des Bans:', error);
                    await interaction.reply({ content: 'Beim Aufheben des Bans ist ein Fehler aufgetreten. Der Benutzer ist möglicherweise bereits entbannt.', ephemeral: true });
                }
            }

            if (interaction.commandName === 'kick') {
                const memberToKick = interaction.options.getMember('user');
                const reason = interaction.options.getString('reason') || 'Kein Grund angegeben.';
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
                    return interaction.reply({ content: 'Du hast nicht die erforderlichen Berechtigungen, um diesen Befehl auszuführen.', ephemeral: true });
                }
                if (memberToKick.id === interaction.user.id) {
                    return interaction.reply({ content: 'Du kannst dich nicht selbst kicken.', ephemeral: true });
                }
                if (!memberToKick.kickable) {
                    return interaction.reply({ content: 'Ich kann diesen Benutzer nicht kicken, da er eine gleichberechtigte oder höhere Rolle hat.', ephemeral: true });
                }
                try {
                    await memberToKick.kick(reason);
                    const kickEmbed = new EmbedBuilder()
                        .setColor(0xFF4500)
                        .setTitle('Benutzer gekickt')
                        .setDescription(`${memberToKick.user.tag} wurde erfolgreich vom Server gekickt.`)
                        .addFields(
                            { name: 'Benutzer', value: `${memberToKick.user.tag} (${memberToKick.id})`, inline: false },
                            { name: 'Moderator', value: `${interaction.user.tag} (${interaction.user.id})`, inline: false },
                            { name: 'Grund', value: reason, inline: false },
                        )
                        .setTimestamp();
                    await interaction.reply({ embeds: [kickEmbed], ephemeral: false });
                    await logToChannel(generalLogChannelId, 'Benutzer gekickt', `**Moderator:** ${interaction.user.tag}\n**Gekickter Benutzer:** ${memberToKick.user.tag}\n**Grund:** ${reason}`);
                } catch (error) {
                    console.error('Fehler beim Kicken des Benutzers:', error);
                    await interaction.reply({ content: 'Beim Kicken des Benutzers ist ein Fehler aufgetreten. Bitte überprüfe die Bot-Berechtigungen.', ephemeral: true });
                }
            }

            if (interaction.commandName === 'setup-abwesenheit') {
                const panelChannel = interaction.options.getChannel('panel-channel');
                const absenceCategory = interaction.options.getChannel('abwesenheit-category');
                const handlerRole = interaction.options.getRole('handler-role');
                const absenceOptions = [
                    new StringSelectMenuOptionBuilder().setLabel('Urlaub').setDescription('Melde eine Urlaubsabwesenheit.').setValue('urlaub'),
                    new StringSelectMenuOptionBuilder().setLabel('Krankheit').setDescription('Melde eine krankheitsbedingte Abwesenheit.').setValue('krankheit'),
                    new StringSelectMenuOptionBuilder().setLabel('Sonstiges').setDescription('Melde eine Abwesenheit aus anderen Gründen.').setValue('sonstiges'),
                ];
                const selectMenu = new StringSelectMenuBuilder().setCustomId(`absence_select_${absenceCategory.id}_${handlerRole.id}`).setPlaceholder('Wähle einen Abwesenheitsgrund aus...').addOptions(absenceOptions);
                const row = new ActionRowBuilder().addComponents(selectMenu);
                await panelChannel.send({ content: 'Wähle einen Grund für deine Abwesenheit:', components: [row] });
                await interaction.reply({ content: `Das Abwesenheits-Panel wurde erfolgreich in ${panelChannel} erstellt.`, ephemeral: true });
                await logToChannel(generalLogChannelId, 'Abwesenheits-Panel eingerichtet', `**Moderator:** ${interaction.user.tag}\n**Panel-Kanal:** ${panelChannel.name}\n**Kategorie:** ${absenceCategory.name}\n**Verantwortliche Rolle:** ${handlerRole.name}`);
            }

            if (interaction.commandName === 'abwesenheit-eingetragen') {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                    return interaction.reply({ content: 'Du hast nicht die erforderlichen Berechtigungen, um diesen Befehl auszuführen.', ephemeral: true });
                }
                const member = interaction.options.getMember('user');
                const role = interaction.guild.roles.cache.get(abwesenheitRoleId);
                if (!member) {
                    return interaction.reply({ content: 'Der angegebene Benutzer konnte nicht gefunden werden.', ephemeral: true });
                }
                if (!role) {
                    return interaction.reply({ content: 'Die Abwesenheits-Rolle wurde nicht gefunden. Bitte überprüfe die ID im Code.', ephemeral: true });
                }
                try {
                    if (member.roles.cache.has(abwesenheitRoleId)) {
                         return interaction.reply({ content: `**${member.user.tag}** hat die Abwesenheits-Rolle bereits.`, ephemeral: true });
                    }
                    await member.roles.add(role, 'Abwesenheit eingetragen');
                    await interaction.reply({ content: `Die Abwesenheit von **${member.user.tag}** wurde eingetragen. Die Rolle **${role.name}** wurde hinzugefügt.`, ephemeral: false });
                    await logToChannel(generalLogChannelId, 'Abwesenheit eingetragen', `**Moderator:** ${interaction.user.tag}\n**Benutzer:** ${member.user.tag}\n**Rolle zugewiesen:** ${role.name}`);
                } catch (error) {
                    console.error('Fehler beim Zuweisen der Abwesenheits-Rolle:', error);
                    await interaction.reply({ content: 'Es gab einen Fehler beim Zuweisen der Rolle. Bitte überprüfe die Bot-Berechtigungen.', ephemeral: true });
                }
            }

            if (interaction.commandName === 'ship') {
                const user1 = interaction.options.getUser('user1');
                const user2 = interaction.options.getUser('user2');
                if (user1.id === user2.id) {
                    return interaction.reply({ content: 'Du kannst dich nicht mit dir selbst "shippen"! Such dir jemand anderen. 😉', ephemeral: true });
                }
                const seed = parseInt(user1.id) + parseInt(user2.id);
                const random = Math.sin(seed) * 10000;
                const compatibility = Math.abs(Math.floor((random - Math.floor(random)) * 101));
                let title, description, color, emoji;
                if (compatibility >= 80) {
                    title = 'Volltreffer! ❤️';
                    description = 'Es scheint, als wären diese beiden Seelenverwandte. Perfekter Match!';
                    color = 0xff69b4;
                    emoji = '❤️';
                } else if (compatibility >= 50) {
                    title = 'Könnte was werden! 💖';
                    description = 'Die Chemie stimmt! Es gibt viel Potenzial für eine schöne Verbindung.';
                    color = 0xffc0cb;
                    emoji = '💖';
                } else if (compatibility >= 20) {
                    title = 'Ausbaufähig... 😬';
                    description = 'Nun ja, die Funken fliegen nicht gerade. Aber wer weiß, vielleicht sind Gegensätze ja attraktiv?';
                    color = 0xffa500;
                    emoji = '😬';
                } else {
                    title = 'Besser nicht... 💔';
                    description = 'Hier stimmt leider gar nichts. Sucht euch lieber andere Partner für die Teamarbeit!';
                    color = 0x800080;
                    emoji = '💔';
                }
                const shipEmbed = new EmbedBuilder()
                    .setColor(color)
                    .setTitle(`Das Ergebnis für ${user1.username} und ${user2.username} ist...`)
                    .setDescription(`**${compatibility}%** Kompatibilität! ${emoji}`)
                    .addFields({ name: 'Fazit:', value: description })
                    .setFooter({ text: 'Powered by der Liebe des Bots.' });
                await interaction.reply({ embeds: [shipEmbed] });
            }
            
            if (interaction.commandName === 'geburtstag-hinzufügen') {
                const month = interaction.options.getInteger('monat');
                const day = interaction.options.getInteger('tag');
                if (month < 1 || month > 12 || day < 1 || day > 31) {
                    return interaction.reply({ content: 'Ungültiges Datum. Bitte gib einen gültigen Monat (1-12) und Tag (1-31) ein.', ephemeral: true });
                }
                try {
                    let birthdays = {};
                    if (fs.existsSync(BIRTHDAY_FILE)) {
                        birthdays = JSON.parse(fs.readFileSync(BIRTHDAY_FILE, 'utf8'));
                    }
                    birthdays[interaction.user.id] = { month, day };
                    fs.writeFileSync(BIRTHDAY_FILE, JSON.stringify(birthdays, null, 2));
                    await interaction.reply({ content: `Dein Geburtstag wurde erfolgreich als **${day}.${month}.** gespeichert.`, ephemeral: true });
                    await logToChannel(generalLogChannelId, 'Geburtstag festgelegt', `**Benutzer:** ${interaction.user.tag}\n**Geburtstag:** ${day}.${month}.`);
                } catch (error) {
                    console.error('Fehler beim Speichern des Geburtstags:', error);
                    await interaction.reply({ content: 'Ein Fehler ist beim Speichern deines Geburtstags aufgetreten. Bitte versuche es später erneut.', ephemeral: true });
                }
            }

            if (interaction.commandName === 'geburtstag-löschen') {
                try {
                    if (!fs.existsSync(BIRTHDAY_FILE)) {
                        return interaction.reply({ content: 'Es sind keine Geburtstage gespeichert.', ephemeral: true });
                    }
                    let birthdays = JSON.parse(fs.readFileSync(BIRTHDAY_FILE, 'utf8'));
                    if (!birthdays[interaction.user.id]) {
                        return interaction.reply({ content: 'Du hast keinen Geburtstag gespeichert, der gelöscht werden könnte.', ephemeral: true });
                    }
                    delete birthdays[interaction.user.id];
                    fs.writeFileSync(BIRTHDAY_FILE, JSON.stringify(birthdays, null, 2));
                    await interaction.reply({ content: 'Dein Geburtstag wurde erfolgreich gelöscht.', ephemeral: true });
                    await logToChannel(generalLogChannelId, 'Geburtstag gelöscht', `**Benutzer:** ${interaction.user.tag} hat seinen gespeicherten Geburtstag gelöscht.`);
                } catch (error) {
                    console.error('Fehler beim Löschen des Geburtstags:', error);
                    await interaction.reply({ content: 'Ein Fehler ist beim Löschen deines Geburtstags aufgetreten. Bitte versuche es später erneut.', ephemeral: true });
                }
            }

            if (interaction.commandName === 'gute-nacht') {
                await interaction.deferReply({ ephemeral: true });
                const channel = client.channels.cache.get(goodnightChannelId);
                if (!channel) {
                    await interaction.followUp({ content: 'Der angegebene Kanal für Gute-Nacht-Nachrichten wurde nicht gefunden. Bitte überprüfe die Kanal-ID im Code.', ephemeral: true });
                    return;
                }
                const goodnightEmbed = new EmbedBuilder()
                    .setColor(0x3498db)
                    .setTitle('Gute Nacht, Community! 🌙')
                    .setDescription(`Ein **gutes Teammitglied** hat soeben allen eine gute Nacht gewünscht. Schlaft gut und träumt süß! ✨`)
                    .setTimestamp();
                await channel.send({ embeds: [goodnightEmbed] });
                await interaction.followUp({ content: 'Deine Gute-Nacht-Nachricht wurde erfolgreich gesendet!', ephemeral: true });
                await logToChannel(generalLogChannelId, 'Gute-Nacht-Nachricht', `**Benutzer:** ${interaction.user.tag} hat eine Gute-Nacht-Nachricht in **${channel.name}** gesendet.`);
            }

            // NEUER BEFEHL START
            if (interaction.commandName === 'guten-morgen') {
                await interaction.deferReply({ ephemeral: true });
                const channel = client.channels.cache.get(goodmorningChannelId);
                if (!channel) {
                    await interaction.followUp({ content: 'Der angegebene Kanal für Guten-Morgen-Nachrichten wurde nicht gefunden. Bitte überprüfe die Kanal-ID im Code.', ephemeral: true });
                    return;
                }
                const goodmorningEmbed = new EmbedBuilder()
                    .setColor(0xf1c40f)
                    .setTitle('Guten Morgen, Community! ☀️')
                    .setDescription(`Ein **gutes Teammitglied** hat soeben allen einen guten Morgen gewünscht. Ich wünsche euch einen wundervollen Start in den Tag! Genießt das Wetter und habt Spaß! ☕`)
                    .setTimestamp();
                await channel.send({ embeds: [goodmorningEmbed] });
                await interaction.followUp({ content: 'Deine Guten-Morgen-Nachricht wurde erfolgreich gesendet!', ephemeral: true });
                await logToChannel(generalLogChannelId, 'Guten-Morgen-Nachricht', `**Benutzer:** ${interaction.user.tag} hat eine Guten-Morgen-Nachricht in **${channel.name}** gesendet.`);
            }
            // NEUER BEFEHL ENDE

        } else if (interaction.isStringSelectMenu()) {
            if (interaction.customId.startsWith('ticket_select_')) {
                await interaction.deferReply({ ephemeral: true });
                const [_, __, roleId] = interaction.customId.split('_');
                const user = interaction.user;
                const guild = interaction.guild;
                const selectedOptionLabel = interaction.component.options.find(opt => opt.value === interaction.values[0]).label;
                if (!roleId) {
                    return interaction.followUp({ content: 'Ein interner Fehler ist aufgetreten. Bitte versuche, ein neues Ticket-Panel zu erstellen.', ephemeral: true });
                }
                const existingChannel = guild.channels.cache.find(c => c.name.startsWith(`${selectedOptionLabel.toLowerCase()}-`) && c.parentId === ticketCategoryId);
                if (existingChannel) {
                    await interaction.followUp({ content: `Du hast bereits ein offenes ${selectedOptionLabel} Ticket: ${existingChannel}`, ephemeral: true });
                    return;
                }
                const channelName = `${selectedOptionLabel.toLowerCase()}-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
                const channel = await guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildText,
                    parent: ticketCategoryId,
                    permissionOverwrites: [
                        { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                        { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                        { id: roleId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                        { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                    ],
                });
                const closeButton = new ButtonBuilder().setCustomId('close_ticket').setLabel('Ticket schließen').setStyle(ButtonStyle.Danger);
                const row = new ActionRowBuilder().addComponents(closeButton);
                await channel.send({ content: `Willkommen im **${selectedOptionLabel}** Ticket, ${user}! Ein Moderator wird sich in Kürze um dein Anliegen kümmern.`, components: [row] });
                await interaction.followUp({ content: `Dein **${selectedOptionLabel}** Ticket wurde erstellt: ${channel}`, ephemeral: true });
                await logToChannel(ticketLogChannelId, 'Ticket erstellt', `**Benutzer:** ${user.tag}\n**Ticket-Typ:** ${selectedOptionLabel}\n**Ticket-Kanal:** ${channel.name}`);
                const resetSelectMenu = new StringSelectMenuBuilder().setCustomId(interaction.customId).setPlaceholder('Wähle eine Ticket-Kategorie aus...').addOptions(interaction.component.options.map(option => ({ label: option.label, description: option.description, value: option.value })));
                const resetRow = new ActionRowBuilder().addComponents(resetSelectMenu);
                await interaction.message.edit({ components: [resetRow] });
            } else if (interaction.customId.startsWith('absence_select_')) {
                await interaction.deferReply({ ephemeral: true });
                const [_, __, categoryId, roleId] = interaction.customId.split('_');
                const user = interaction.user;
                const guild = interaction.guild;
                const selectedOptionLabel = interaction.component.options.find(opt => opt.value === interaction.values[0]).label;
                const existingChannel = guild.channels.cache.find(c => c.name.startsWith(`abwesenheit-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}-`) && c.parentId === categoryId);
                if (existingChannel) {
                    await interaction.followUp({ content: `Du hast bereits ein offenes Abwesenheitsticket: ${existingChannel}`, ephemeral: true });
                    return;
                }
                const channelName = `abwesenheit-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
                try {
                    const channel = await guild.channels.create({
                        name: channelName,
                        type: ChannelType.GuildText,
                        parent: categoryId,
                        permissionOverwrites: [
                            { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                            { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                            { id: roleId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                            { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                        ],
                    });
                    const closeButton = new ButtonBuilder().setCustomId('close_absence_ticket').setLabel('Ticket schließen').setStyle(ButtonStyle.Danger);
                    const row = new ActionRowBuilder().addComponents(closeButton);
                    const absenceEmbed = new EmbedBuilder()
                        .setColor(0xffa500)
                        .setTitle('Abwesenheitsmeldung')
                        .setDescription(`Bitte gib in diesem Ticket die Details deiner Abwesenheit an (Zeitraum, Grund).`)
                        .addFields(
                            { name: 'Teammitglied', value: `${user.tag}`, inline: false },
                            { name: 'Grund', value: selectedOptionLabel, inline: false },
                        )
                        .setTimestamp();
                    await channel.send({ content: `<@&${roleId}>`, embeds: [absenceEmbed], components: [row] });
                    await interaction.followUp({ content: `Dein Abwesenheitsticket wurde erstellt: ${channel}`, ephemeral: true });
                    await logToChannel(generalLogChannelId, 'Abwesenheitsticket erstellt', `**Teammitglied:** ${user.tag}\n**Grund:** ${selectedOptionLabel}\n**Ticket-Kanal:** ${channel.name}`);
                    const resetSelectMenu = new StringSelectMenuBuilder().setCustomId(interaction.customId).setPlaceholder('Wähle einen Abwesenheitsgrund aus...').addOptions(interaction.component.options.map(option => ({ label: option.label, description: option.description, value: option.value })));
                    const resetRow = new ActionRowBuilder().addComponents(resetSelectMenu);
                    await interaction.message.edit({ components: [resetRow] });
                } catch (error) {
                    console.error('Fehler beim Erstellen des Abwesenheitsticket:', error);
                    await interaction.followUp({ content: 'Beim Erstellen des Abwesenheitsticket ist ein Fehler aufgetreten. Bitte überprüfe die Bot-Berechtigungen.', ephemeral: true });
                }
            }
        } else if (interaction.isButton()) {
            if (interaction.customId === 'close_ticket') {
                await interaction.deferReply({ ephemeral: true });
                const channelToClose = interaction.channel;
                try {
                    await channelToClose.setParent(archiveCategoryId);
                    await interaction.followUp({ content: 'Das Ticket wurde geschlossen und archiviert.', ephemeral: true });
                    await logToChannel(ticketLogChannelId, 'Ticket geschlossen', `**Ticket-Kanal:** ${channelToClose.name}\n**Aktion:** In das Archiv verschoben\n**Moderator:** ${interaction.user.tag}`);
                } catch (error) {
                    console.error("Fehler beim Schließen des Tickets:", error);
                    await interaction.followUp({ content: 'Ein Fehler ist beim Schließen des Tickets aufgetreten.', ephemeral: true });
                }
            }
            if (interaction.customId === 'close_absence_ticket') {
                await interaction.deferReply({ ephemeral: true });
                const channelToClose = interaction.channel;
                try {
                    await channelToClose.delete('Abwesenheitsticket geschlossen');
                    await interaction.followUp({ content: 'Das Abwesenheitsticket wurde erfolgreich geschlossen.', ephemeral: true });
                    await logToChannel(generalLogChannelId, 'Abwesenheitsticket geschlossen', `**Ticket-Kanal:** ${channelToClose.name}\n**Aktion:** Ticket gelöscht\n**Moderator:** ${interaction.user.tag}`);
                } catch (error) {
                    console.error('Fehler beim Schließen des Abwesenheitsticket:', error);
                    await interaction.followUp({ content: 'Ein Fehler ist beim Schließen des Abwesenheitsticket aufgetreten.', ephemeral: true });
                }
            }
        }
    } catch (error) {
        console.error("Ein unerwarteter Fehler ist während einer Interaktion aufgetreten:", error);
    }
});

// #################### EVENTS ####################

client.on('voiceStateUpdate', async (oldState, newState) => {
    const userId = newState.member.id;
    const isMuted = newState.selfMute || newState.serverMute;
    const isCurrentlyInAfkChannel = newState.channelId === afkChannelId;
    if (newState.channelId && isMuted && !isCurrentlyInAfkChannel) {
        if (!afkTimers[userId]) {
            afkTimers[userId] = setTimeout(async () => {
                const userAfterTimeout = newState.member.guild.voiceStates.cache.get(userId);
                if (userAfterTimeout && (userAfterTimeout.selfMute || userAfterTimeout.serverMute) && userAfterTimeout.channelId === newState.channelId) {
                    try {
                        await newState.member.voice.setChannel(afkChannelId);
                        await logToChannel(voiceLogChannelId, 'AFK-Aktion', `**${newState.member.user.tag}** wurde in den AFK-Kanal verschoben, da das Mikrofon länger als 1 Minute stummgeschaltet war.`);
                    } catch (error) {
                        console.error(`Fehler beim Verschieben von ${newState.member.user.tag}:`, error);
                    }
                }
                delete afkTimers[userId];
            }, 60000);
        }
    } else {
        if (afkTimers[userId]) {
            clearTimeout(afkTimers[userId]);
            delete afkTimers[userId];
        }
    }
    if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        const user = newState.member.user;
        await logToChannel(voiceLogChannelId, 'Sprach-Aktivität', `**Benutzer:** ${user.tag} ist von **${oldState.channel.name}** nach **${newState.channel.name}** gewechselt.`);
    } else if (!oldState.channelId && newState.channelId) {
        const user = newState.member.user;
        await logToChannel(voiceLogChannelId, 'Sprach-Aktivität', `**Benutzer:** ${user.tag} ist dem Sprachkanal **${newState.channel.name}** beigetreten.`);
    } else if (oldState.channelId && !newState.channelId) {
        const user = oldState.member.user;
        await logToChannel(voiceLogChannelId, 'Sprach-Aktivität', `**Benutzer:** ${user.tag} hat den Sprachkanal **${oldState.channel.name}** verlassen.`);
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot || message.guildId !== guildId) return;
    const logChannel = client.channels.cache.get(messageLogChannelId);
    if (!logChannel) return;
    const logEmbed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('Neue Nachricht gesendet')
        .addFields(
            { name: 'Autor', value: `${message.author.tag} (${message.author.id})`, inline: true },
            { name: 'Kanal', value: `${message.channel.name} (${message.channel.id})`, inline: true },
            { name: 'Inhalt', value: `\`\`\`\n${message.content.substring(0, 1024)}\n\`\`\``, inline: false },
        )
        .setTimestamp();
    logChannel.send({ embeds: [logEmbed] });
});

client.on('messageDelete', async message => {
    if (clearingMessagesIds.has(message.id)) {
        clearingMessagesIds.delete(message.id);
        return;
    }
    if (message.partial) {
        try {
            await message.fetch();
        } catch (error) {
            console.error('Fehler beim Abrufen der gelöschten Nachricht:', error);
            return;
        }
    }
    const logChannel = client.channels.cache.get(messageLogChannelId);
    if (!logChannel) return;
    const logEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('Nachricht gelöscht')
        .addFields(
            { name: 'Autor', value: `${message.author.tag} (${message.author.id})`, inline: true },
            { name: 'Kanal', value: `${message.channel.name} (${message.channel.id})`, inline: true },
            { name: 'Inhalt', value: `\`\`\`\n${message.content.substring(0, 1024)}\n\`\`\``, inline: false },
        )
        .setTimestamp();
    logChannel.send({ embeds: [logEmbed] });
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (oldMessage.partial) {
        try {
            await oldMessage.fetch();
        } catch (error) {
            console.error('Fehler beim Abrufen der alten Nachricht:', error);
            return;
        }
    }
    if (oldMessage.content === newMessage.content) return;
    const logChannel = client.channels.cache.get(messageLogChannelId);
    if (!logChannel) return;
    const logEmbed = new EmbedBuilder()
        .setColor(0xffa500)
        .setTitle('Nachricht bearbeitet')
        .addFields(
            { name: 'Autor', value: `${oldMessage.author.tag} (${oldMessage.author.id})`, inline: true },
            { name: 'Kanal', value: `${oldMessage.channel.name} (${oldMessage.channel.id})`, inline: true },
            { name: 'Vorher', value: `\`\`\`\n${oldMessage.content.substring(0, 1024)}\n\`\`\``, inline: false },
            { name: 'Nachher', value: `\`\`\`\n${newMessage.content.substring(0, 1024)}\n\`\`\``, inline: false },
        )
        .setTimestamp();
    logChannel.send({ embeds: [logEmbed] });
});

client.on('guildMemberAdd', async member => {
    if (member.guild.id !== guildId) return;
    const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
    if (!welcomeChannel) return;
    const welcomeMessage = `Herzlich willkommen auf dem Server, ${member}! Schön, dass du da bist. 🎉\nWirf doch als Erstes einen Blick in unsere <#${rulesChannelId}>, damit du weißt, wie der Hase läuft.`;
    welcomeChannel.send(welcomeMessage);
});

client.on('guildMemberRemove', async member => {
    if (member.guild.id !== guildId) return;
    const farewellChannel = member.guild.channels.cache.get(farewellChannelId);
    if (!farewellChannel) return;
    const farewellMessage = `Schade, ${member.user.tag} hat den Server verlassen. Wir hoffen, du kommst bald wieder! 😥`;
    farewellChannel.send(farewellMessage);
});

client.login(process.env.DISCORD_BOT_TOKEN);