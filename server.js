const Discord = require("discord.js");
const client = new Discord.Client();
const db = require("mongosha");
db.connect();
const ayar = require("./settings.json");

client.on("ready", () => {
  client.user.setActivity(ayar.bot.botdurum, {
    type: "PLAYING",
  });
  client.channels.cache.get(ayar.bot.botses).join();
  console.log(client.user.tag);
});

client.on("message", async function (message) {
  const Role = ayar.roller.boosterRol;
  const Emoji = ayar.emojiler.boosterIsimEmoji;
  const id = ayar.emojiler.boostMesajEmojiID;
  const guild = ayar.bot.sunucuID;
  const Types = [
    "USER_PREMIUM_GUILD_SUBSCRIPTION",
    "USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1",
    "USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2",
    "USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3",
  ];
  if (message.guild.id !== guild) return;
  if (Types.includes(message.type)) {
    message.react((client.emojis.cache || client.emojis).get(id));
    (message.guild.members.cache || message.guild.members)
      .filter(
        member =>
          (member.roles.cache || member.roles).has(Role) &&
          !member.displayName.endsWith(Emoji)
      )
      .forEach(member => {
        member.setNickname(member.displayName + ` ${Emoji}`);
      });
  } else return;
});

client.on("message", async function (message) {
  if (!message.guild) return;

  if (message.guild.id !== ayar.bot.sunucuID) return;

  if (
    [ayar.giflog.LogSayilmayacakKanalID].some(id => id === message.channel.id)
  )
    return;

  if (message.author.bot) return;
  if (message.attachments.size < 1) return;
  let type;
  let u = message.attachments.url;
  let photo = 0;
  let gif = 0;
  message.attachments.forEach(c => {
    let url = c.url;

    if (String(url).includes("gif")) {
      gif++;
    } else {
      photo++;
    }
  });

  for (var i = 1; i <= photo; i++) {
    db.add(`Photo_${message.author.id}`, 1);
  }
  for (var i = 1; i <= gif; i++) {
    db.add(`GIF_${message.author.id}`, 1);
  }

  const dataofPhoto = (await db.fetch(`Photo_${message.author.id}`)) || 0;
  const dataofGIF = (await db.fetch(`GIF_${message.author.id}`)) || 0;

  const Embed4 = new Discord.MessageEmbed()
    .setColor(ayar.bot.embedColor)
    .setFooter(
      message.author.username,
      message.author.displayAvatarURL({ dynamic: true, format: "png" })
    )
    .setAuthor(`${ayar.bot.sunucuIsim} • Log`, message.guild.iconURL())
    .setDescription(
      `**${message.author}**, ${message.channel} kanalına ${
        photo > 0 && gif > 0
          ? `**${photo}** Fotoğraf, **${gif}** GIF`
          : `${
              photo > 0 && gif === 0
                ? `**${photo}** Fotoğraf`
                : `**${gif}** GIF`
            }`
      } gönderdi.`
    )
    .addField(
      `**Detaylı Bilgiler**`,
      `Şuana kadar **${dataofGIF}** tane GIF, **${dataofPhoto}** tane fotoğraf, toplamda **${
        dataofPhoto + dataofGIF
      }** dosya gönderdi.`
    );

  client.channels.cache.get(ayar.giflog.logKanal).send({ embed: Embed4 });
});

client.on("message", async message => {
  if (message.author.id === ayar.bot.sahip) return;
  if (message.author.bot) return;
  let kanallar = [ayar.GifKanal.gifKanalID];
  if (!kanallar.find(c => c === message.channel.id)) return;
  if (message.attachments.size < 1) {
    message.delete();
    message.channel.send(`
    Hey ${message.author}, bu kanallarda mesaj göndermek yasaktır. Sadece dosya gönderebilirsin :)
    `);
  }
});

async function random(options) {
  if (!options) return console.log("No options");
  const { MessageEmbed } = require("discord.js");
  const url = "String"(options.url);
  const GifChannel = client.channels.cache.get(options.gif);
  const PhotoChannel = client.channels.cache.get(options.photo);
  const embed = new MessageEmbed().setImage(url).setTimestamp();
  if (url.endsWith(".gif")) {
    GifChannel.send({ embed: embed });
    return true;
  } else {
    PhotoChannel.send({ embed: embed });
    return true;
  }
}

client.on("userUpdate", async function (oldUser, newUser) {
  if (
    oldUser.avatarURL({ dynamic: true }) ===
    newUser.avatarURL({ dynamic: true })
  )
    return;
  if (oldUser.bot) return;
  const GIF = ayar.randomPpGif.gif;
  const Photo = ayar.randomPpGif.pp;
  const nereye = newUser.avatarURL({ dynamic: true }).endsWith(".gif");
  const embed = new Discord.MessageEmbed()
    .setImage(newUser.avatarURL({ dynamic: true }))
    .setColor(ayar.bot.embedColor)
    .setTimestamp();
  if (nereye) {
    client.channels.cache.get(GIF).send({ embed: embed });
  } else {
    client.channels.cache.get(Photo).send({ embed: embed });
  }
});

client.on("message", async message => {
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];

  if (cmd === ayar.bot.prefix + "bilgi" || cmd === ayar.bot.prefix + "i") {
    let user = message.mentions.users.first() || message.author;
    let GIF_Data = (await db.fetch(`GIF_${user.id}`)) || 0;
    let Photo_Data = (await db.fetch(`Photo_${user.id}`)) || 0;
    let Embed = new Discord.MessageEmbed()
      .setAuthor(
        user.username + ` için bilgilendirme`,
        user.displayAvatarURL({ dynamic: true })
      )
      .setDescription(
        `Toplamda **${GIF_Data + Photo_Data}** dosya gönderdi ${
          message.author.id === user.id ? "n" : ""
        }. (**${GIF_Data}** GIF, **${Photo_Data}** Fotoğraf)`
      )
      .setTimestamp()
      .setColor(ayar.bot.embedColor)
      .setFooter(client.user.username, client.user.avatarURL());

    return message.channel.send({
      embed: Embed,
    });
  }
});

client.login(ayar.bot.token);
