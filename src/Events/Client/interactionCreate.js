import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  PermissionsBitField,
  InteractionType,
  ButtonStyle,
} from "discord.js";
import ServerSchema from "../../Models/ServerData.js";

/**
 * @param {import("../../Struct/Client)}client
 * @param {import("discord.js").ButtonInteraction} interaction
 */

export default async (client, interaction) => {
  if (!interaction.inGuild) return;
  let ServerData = await ServerSchema.findOne({ serverID: interaction.guild.id }) || new ServerSchema({ serverID: interaction.guild.id }).save();
  let player = await client.kazagumo.players.get(interaction.guild.id);
  if (interaction.isButton()) {
    if (
      interaction.customId === "delete1" &&
      client.owner.includes(interaction.user.id)
    ) {
      interaction.message.delete();
    } else if (
      interaction.customId === "delete" &&
      client.owner.includes(interaction.user.id)
    ) {
      interaction.message.delete();
    } else {
      const player = await client.kazagumo.players.get(interaction.guild.id);
      let requester = player?.queue.previous ? player.queue.previous.requester : player.queue.current.requester || client.user;
      const notInvc = new EmbedBuilder().setColor(client.settings.COLOR).setDescription(`\`\`\`diff\n-Your Are Not In A Voice Channel\`\`\``);
      const samevc = new EmbedBuilder().setColor(client.settings.COLOR).setDescription(`\`\`\`fix\nYou are not in the same voice channel as mine to use me\`\`\``);
      const musicEmbd = new EmbedBuilder().setColor(client.settings.COLOR);
      const requesterEmebd = new EmbedBuilder().setColor(client.settings.COLOR).setDescription(`\`\`\`diff\n-Current Song Was Requested By ${requester.username}. So You Can't Use This Button!\`\`\``);
      if (interaction.customId === "skip") {
        if (!player) {
          interaction.message.delete();
        }
        else if (!interaction.member.voice.channelId ||
          (interaction.member.voice.channelId !== player.voiceId && interaction.user.id !== client.user.id && interaction.user.id !== client.settings.owner) ||
          interaction.user.id !== player.queue.current.requester.id && interaction.user.id !== client.settings.owner) {
          interaction.reply({ embeds: [notInvc], ephemeral: true });
        }
        else if (player.paused) {
          const embed = new EmbedBuilder().setColor(client.settings.COLOR).setDescription(`\`\`\`fix\nPlayer Is Paused! I can't Skip Tracks Right Now\`\`\``);
          interaction.reply({ embeds: [embed], ephemeral: true });
        } 
        else {
          player.skip();
          musicEmbd.setDescription(`Alright, Skipping The Current Song!`);
          interaction.reply({ embeds: [musicEmbd], ephemeral: true });
        }
      } 
      else if (interaction.customId === "stop") {
        if (!player) {
          interaction.message.delete();
        }
        else if (!interaction.member.voice.channelId ||
          (interaction.member.voice.channelId !== player.voiceId && interaction.user.id !== client.user.id && interaction.user.id !== client.settings.owner) ||
          interaction.user.id !== player.queue.current.requester.id && interaction.user.id !== client.settings.owner) {
          interaction.reply({ embeds: [notInvc], ephemeral: true });
        }
        else {
          player.destroy();
          musicEmbd.setDescription(`\`\`\`fix\nDestroyed The Music System!\`\`\``);
          interaction.reply({ embeds: [musicEmbd], ephemeral: true });
        }
      } 
      else if (interaction.customId === "prev") {
        if (!player) {
          interaction.message.delete();
        }
        else if (!interaction.member.voice.channelId ||
          (interaction.member.voice.channelId !== player.voiceId && interaction.user.id !== client.user.id && interaction.user.id !== client.settings.owner) ||
          interaction.user.id !== player.queue.current.requester.id && interaction.user.id !== client.settings.owner) {
          interaction.reply({ embeds: [notInvc], ephemeral: true });
        }
        else if (!player.queue.previous) {
          const embed = new EmbedBuilder().setColor(client.settings.COLOR).setDescription(`\`\`\`diff\n-No Previous Tracks Found!\`\`\``);
          interaction.reply({ embeds: [embed], ephemeral: true });
        } 
        else {
          player.queue.unshift(player.queue.previous);
          player.skip();
          musicEmbd.setDescription(`\`\`\`diff\n+Alright, Im Now Playing The Previous Song!\`\`\``);
          interaction.reply({ embeds: [musicEmbd], ephemeral: true });
        }
      } 
      else if (interaction.customId === "pauseandres") {
        if (!player) {
          interaction.message.delete();
        }
        else if (!interaction.member.voice.channelId ||
          (interaction.member.voice.channelId !== player.voiceId && interaction.user.id !== client.user.id && interaction.user.id !== client.settings.owner) ||
          interaction.user.id !== player.queue.current.requester.id && interaction.user.id !== client.settings.owner) {
          interaction.reply({ embeds: [notInvc], ephemeral: true });
        }
        else {
          player.pause(!player.paused);
          const set = new ButtonBuilder()
            .setStyle(client.Buttons.grey)
            .setCustomId("set")
            .setEmoji(`1177656041438183534`)
            .setLabel("Settings");
          const prev = new ButtonBuilder()
            .setStyle(client.Buttons.grey)
            .setCustomId("prev")
            .setLabel("Previous")
            .setDisabled(!player.queue.previous || false);
          const pauseandres = new ButtonBuilder()
            .setStyle(player.playing ? client.Buttons.grey : client.Buttons.green)
            .setCustomId("pauseandres")
            .setLabel(player.playing ? "Pause" : "Resume");
          const skip = new ButtonBuilder()
            .setStyle(client.Buttons.grey)
            .setCustomId("skip")
            .setLabel("Skip");
          const stop = new ButtonBuilder()
            .setStyle(client.Buttons.red)
            .setCustomId("stop")
            .setLabel("Stop");
          const loop = new ButtonBuilder()
            .setStyle(client.Buttons.grey)
            .setCustomId("loop")
            .setLabel(`Loop - ${
              player.loop == "none"
                ? "Off"
                : player.loop == "track"
                ? "Track"
                : "Queue"
            }`);
          const shuffle = new ButtonBuilder()
            .setStyle(client.Buttons.grey)
            .setCustomId("shuffle")
            .setLabel("Shuffle");
          const row = new ActionRowBuilder().addComponents(
            pauseandres,
            skip,
            loop,
            shuffle,
            stop
          );
          try {
            const msg = await client.channels.cache
              .get(player.textId)
              .messages.fetch(player.data.get("nowplaying"));
            msg.edit({ components: [row] });
          } catch (e) {
            console.log(e);
          }
          musicEmbd.setDescription(
            `Track Is Now ${player.paused ? "\`\`\`diff\n-Paused\`\`\`" : "\`\`\`diff\n+Resumed\`\`\``}`
          );
          interaction.reply({ embeds: [musicEmbd], ephemeral: true });
        }
      } 
      else if (interaction.customId === "set") {
        if (!player) {
          interaction.message.delete();
        }
        else if (!interaction.member.voice.channelId ||
          (interaction.member.voice.channelId !== player.voiceId && interaction.user.id !== client.user.id && interaction.user.id !== client.settings.owner) ||
          interaction.user.id !== player.queue.current.requester.id && interaction.user.id !== client.settings.owner) {
          interaction.reply({ embeds: [notInvc], ephemeral: true });
        }
        else {
          const set = new ButtonBuilder()
            .setStyle(client.Buttons.grey)
            .setCustomId("set")
            .setEmoji(`1177656041438183534`)
            .setLabel("Settings");
          const prev = new ButtonBuilder()
            .setStyle(client.Buttons.grey)
            .setCustomId("prev")
            .setLabel("Previous")
            .setDisabled(!player.queue.previous || false);
          const pauseandres = new ButtonBuilder()
            .setStyle(player.playing ? client.Buttons.grey : client.Buttons.green)
            .setCustomId("pauseandres")
            .setLabel(player.playing ? "Pause" : "Resume");
          const skip = new ButtonBuilder()
            .setStyle(client.Buttons.grey)
            .setCustomId("skip")
            .setLabel("Skip");
          const stop = new ButtonBuilder()
            .setStyle(client.Buttons.red)
            .setCustomId("stop")
            .setLabel("Stop");
          const loop = new ButtonBuilder()
            .setStyle(client.Buttons.grey)
            .setCustomId("loop")
            .setLabel(`Loop - ${
              player.loop == "none"
                ? "Off"
                : player.loop == "track"
                ? "Track"
                : "Queue"
            }`);
          const shuffle = new ButtonBuilder()
            .setStyle(client.Buttons.grey)
            .setCustomId("shuffle")
            .setLabel("Shuffle");
          const row = new ActionRowBuilder().addComponents(
            pauseandres,
            skip,
            loop,
            shuffle,
            stop
          );
          interaction.reply({ components: [row], ephemeral: true });
        }
      } 
      //inside settings
      else if (interaction.customId === "loop") {
        if (!player) {
          interaction.message.delete();
        }
        else if (!interaction.member.voice.channelId ||
          (interaction.member.voice.channelId !== player.voiceId && interaction.user.id !== client.user.id && interaction.user.id !== client.settings.owner) ||
          interaction.user.id !== player.queue.current.requester.id && interaction.user.id !== client.settings.owner) {
          interaction.reply({ embeds: [notInvc], ephemeral: true });
        }
        else {
          if (player.loop == "queue" && player.loop != "track") {
            player.setLoop("track");
          }
          if (player.loop == "none" && player.loop != "queue") {
            player.setLoop("queue");
          }
          if (player.loop == "track" && player.loop != "none") {
            player.setLoop("none");
          }
          const set = new ButtonBuilder()
            .setStyle(client.Buttons.grey)
            .setCustomId("set")
            .setEmoji(`1177656041438183534`)
            .setLabel("Settings");
          const prev = new ButtonBuilder()
            .setStyle(client.Buttons.grey)
            .setCustomId("prev")
            .setLabel("Previous")
            .setDisabled(!player.queue.previous || false);
          const pauseandres = new ButtonBuilder()
            .setStyle(player.playing ? client.Buttons.grey : client.Buttons.green)
            .setCustomId("pauseandres")
            .setLabel(player.playing ? "Pause" : "Resume");
          const skip = new ButtonBuilder()
            .setStyle(client.Buttons.grey)
            .setCustomId("skip")
            .setLabel("Skip");
          const stop = new ButtonBuilder()
            .setStyle(client.Buttons.red)
            .setCustomId("stop")
            .setLabel("Stop");
          const loop = new ButtonBuilder()
            .setStyle(client.Buttons.grey)
            .setCustomId("loop")
            .setLabel(`Loop - ${
              player.loop == "none"
                ? "Off"
                : player.loop == "track"
                ? "Track"
                : "Queue"
            }`);
          const shuffle = new ButtonBuilder()
            .setStyle(client.Buttons.grey)
            .setCustomId("shuffle")
            .setLabel("Shuffle");
          const row = new ActionRowBuilder().addComponents(
            pauseandres,
            skip,
            loop,
            shuffle,
            stop
          );
          interaction.update({ components: [row], ephemeral: true });
        }
      } 
      //autoplay
      else if (interaction.customId === "autoplay") {
        if (!player) {
          interaction.message.delete();
        }
        else if (!interaction.member.voice.channelId ||
          (interaction.member.voice.channelId !== player.voiceId && interaction.user.id !== client.user.id && interaction.user.id !== client.settings.owner) ||
          interaction.user.id !== player.queue.current.requester.id && interaction.user.id !== client.settings.owner) {
          interaction.reply({ embeds: [notInvc], ephemeral: true });
        }
        else if (player.data.get("autoplay", true)) {
          player.data.set("autoplay", false);
        } else {
          player.data.set("autoplay", true);
        }
        const settingRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("autoplay")
            .setEmoji(`1177656039227793468`)
            .setStyle(
              player.data.get("autoplay")
                ? ButtonStyle.Success
                : ButtonStyle.Secondary
            )
            .setLabel(
              "Autoplay - " +
                `${player.data.get("autoplay", true) ? "Enabled" : "Disabled"}`
            ),
          new ButtonBuilder()
            .setCustomId("loop")
            .setEmoji(`1177292642590142494`)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(`1177292642590142494`)
            .setLabel(
              `Loop - ${
              player.loop == "none"
                ? "Off"
                : player.loop == "track"
                ? "Track"
                : "Queue"
            }`
            ),
          new ButtonBuilder()
            .setCustomId("volume")
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Volume")
        );
        interaction.update({ components: [settingRow], ephemeral: true });
      } 
      else if (interaction.customId === "volume") {
        if (!player) {
          interaction.message.delete();
        }
        else if (!interaction.member.voice.channelId ||
          (interaction.member.voice.channelId !== player.voiceId && interaction.user.id !== client.user.id && interaction.user.id !== client.settings.owner) ||
          interaction.user.id !== player.queue.current.requester.id && interaction.user.id !== client.settings.owner) {
          interaction.reply({ embeds: [notInvc], ephemeral: true });
        }
        else {
          const volumeRw = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("inc")
              .setStyle(ButtonStyle.Success)
              .setLabel("Increase"),
            new ButtonBuilder()
              .setCustomId("dec")
              .setStyle(ButtonStyle.Success)
              .setLabel("Decrease")
          );
          interaction.reply({ components: [volumeRw], ephemeral: true });
        }
      } 
      else if (interaction.customId === "inc") {
        if (!player) {
          interaction.message.delete();
        }
        else if (!interaction.member.voice.channelId ||
          (interaction.member.voice.channelId !== player.voiceId && interaction.user.id !== client.user.id && interaction.user.id !== client.settings.owner) ||
          interaction.user.id !== player.queue.current.requester.id && interaction.user.id !== client.settings.owner) {
          interaction.reply({ embeds: [notInvc], ephemeral: true });
        }
        else {
          const currentVolume = player.volume * 100;
          if (player.volume === 150) {
            const emd = new EmbedBuilder().setDescription("You Cannot Increase Volume Above 150").setColor(client.settings.COLOR);
            interaction.reply({ embeds: [emd], ephemeral: true });
          }
          else {
            player.setVolume(currentVolume + 10);
            const emd = new EmbedBuilder().setDescription(`Volume Is Now At **${currentVolume*100 + 10}** `).setColor(client.settings.COLOR);
            interaction.reply({ embeds: [emd], ephemeral: true });
          }
        }
      } 
      else if (interaction.customId === "dec") {
        if (!player) {
          interaction.message.delete();
        }
        else if (!interaction.member.voice.channelId ||
          (interaction.member.voice.channelId !== player.voiceId && interaction.user.id !== client.user.id && interaction.user.id !== client.settings.owner) ||
          interaction.user.id !== player.queue.current.requester.id && interaction.user.id !== client.settings.owner) {
          interaction.reply({ embeds: [notInvc], ephemeral: true });
        }
        else {
          const currentVolume = player.volume * 100;
          if (player.volume === 0) {
            const emd = new EmbedBuilder().setDescription("You Cannot Decrease Volume Below 0").setColor(client.settings.COLOR);
            interaction.reply({ embeds: [emd], ephemeral: true });
          }
          else {
            player.setVolume(currentVolume - 10);
            const emd = new EmbedBuilder().setDescription(`Volume Is Now At **${currentVolume * 100 - 10}** `).setColor(client.settings.COLOR);
            interaction.reply({ embeds: [emd], ephemeral: true });
          }
        }
      } 
      else if (interaction.customId === "shuffle") {
        if (!player) {
          interaction.message.delete();
        }
        else if (!interaction.member.voice.channelId ||
          (interaction.member.voice.channelId !== player.voiceId && interaction.user.id !== client.user.id && interaction.user.id !== client.settings.owner) ||
          interaction.user.id !== player.queue.current.requester.id && interaction.user.id !== client.settings.owner) {
          interaction.reply({ embeds: [notInvc], ephemeral: true });
        }
        else if (player.queue.length < 3) {
          interaction.reply({
            embeds: [
              new EmbedBuilder().setColor(`#FF0000`).setDescription(`Not enough songs in the queue to shuffle.`),
            ], ephemeral: true
          });
        }
        else {
          player.queue.shuffle();
          interaction.reply({
            embeds: [
              new EmbedBuilder().setColor(client.settings.COLOR).setDescription("Shuffled the whole queue."),
            ], ephemeral: true
          });
        }
      }
    }
  }
};