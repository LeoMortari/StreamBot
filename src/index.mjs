// Discord lib imports
import {
  joinVoiceChannel,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
} from "@discordjs/voice";
import { Client } from "discord.js";

//Puppeteer imports
import { launch, getStream } from "puppeteer-stream";

//DotEnv imports
import * as dotEnv from "dotenv";

//Configurations
dotEnv.config();

//Instances
const client = new Client({
  intents: ["Guilds", "GuildMessages", "GuildVoiceStates", "MessageContent"],
});

//Listener
client.on("messageCreate", async (message) => {
  //Verify commads
  if (message.content !== ".play") return;
  if (!message.member)
    return message.reply("Este comando não pode ser executado no servidor");
  if (!message.member.voice || !message.member.voice.channel)
    return message.reply("Entre em um canal de voz");

  //Open a browser
  const browser = await launch({
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  });

  //Await join in voice channel
  const connection = await joinVoiceChannel({
    channelId: message.member.voice.channel.id,
    guildId: message.guild.id,
    adapterCreator: message.guild.voiceAdapterCreator,
  });
  const player = createAudioPlayer();
  connection.subscribe(player);

  const page = await browser.newPage();

  await connection.on(VoiceConnectionStatus.Ready, async () => {
    try {
      //Await load the page in browser
      await page.goto("https://www.yout-ube.com/watch?v=WPb6kIKgGt4");

      await page.evaluate(() => {
        return document
          .getElementsByClassName("html5-video-player")[0]
          ?.click();
      });
      //Here is the stream audio
      await player.play(
        createAudioResource(
          await getStream(page, { audio: true, video: false })
        )
      );
    } catch (err) {
      console.error("Error:", err);
    }
  });
});

client.login(process.env.TOKEN);
