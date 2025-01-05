  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 //  $$                                                                   M I N D   W H A T S A P P   B O T                                                                                    $$  //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

try {

///////////////////////////////////////////////
//                MODULOS 
///////////////////////////////////////////////

  const { default: makeWASocket, prepareWAMessageMedia, makeCacheableSignalKeyStore, downloadContentFromMessage, useMultiFileAuthState, makeInMemoryStore, DisconnectReason, WAGroupMetadata, relayWAMessage, MediaPathMap, mentionedJid, processTime, MediaType, Browser, MessageType, Presence, Mimetype, Browsers, delay, fetchLatestBaileysVersion, MessageRetryMap, extractGroupMetadata, generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys');
  const mimetype = require("mime-types")
  const ffmpeg = require('./node_modules/fluent-ffmpeg');
  const fs = require('fs');
  const P = require('pino');
  const ytts = require("yt-search");
  const ytttts = require("yt-search");
  const { writeFile } = require('fs/promises')
  const { downloadMediaMessage } = require('@whiskeysockets/baileys')
  const puppeteer = require('puppeteer');
  const yttts = require("yt-search");
  const chalk = require('chalk')
  const logo = fs.readFileSync('./lib/images/logo.jpg')
  const moment = require('moment-timezone')
  const clc = require('cli-color')
  const hx = require("hxz-api")
  const NodeCache = require('node-cache');
  const uber = require('uberduck-api')
  const cheerio = require("cheerio");
  const readline = require("readline");
  const axios = require('axios');
  const thiccysapi = require('textmaker-thiccy');
  const infoBot = JSON.parse(fs.readFileSync('./config.json'));
  const infoApi = JSON.parse(fs.readFileSync('./lib/utils/apis.json'));
  const { fromBuffer } = require("file-type");
  const { Youtube } = require('ytdownloader.js')
  const { EmojiAPI } = require("emoji-api")
  const usedCommandRecently = new Set()
  const { exec, spawn, execSync } = require("child_process")
  const { count } = require('console');
  const { stringify } = require('querystring');
  const speed = require("performance-now");
  const sleep = async (ms) => { return new Promise(resolve => setTimeout(resolve, ms)) }
  const { Aki } = require('aki-api')

///////////////////////////////////////////////
//         CONST GERAL FORA MAIN
///////////////////////////////////////////////

  const time = moment.tz('America/Sao_Paulo').format('HH:mm:ss');

  const hora = moment.tz('America/Sao_Paulo').format('HH:mm:ss');

  const date = moment.tz('America/Sao_Paulo').format('DD/MM/YY');


  ////////////////  ÁREA DE DADOS DO BOT & DONO ///////////////////

  var prefix = infoBot.prefix

  var botName = infoBot.nomeBot 

  var botNumber = infoBot.numeroBot

  var ownerName = infoBot.nomeDono

  var ownerNumber = infoBot.numeroDono
  
  ////////////////  ÁREA DE APIS DO BOT ///////////////////

  var HUGGINGFACE_API_TOKEN = infoApi.HUGGINGFACE_API_TOKEN

  var VALIDA_RG_API = infoApi.VALIDA_RG_API

  var VALIDA_CPF_API = infoApi.VALIDA_CPF_API

  var GERAR_PESSOA_API = infoApi.GERAR_PESSOA_API

  var MIXTRAL_MODEL_API = infoApi.MIXTRAL_MODEL_API

  ////////////////  DEFINIÇÕES DE CORES CONSOLE ///////////////////
  
  const color = (text, color) => { return !color ? chalk.green(text) : chalk.keyword(color)(text) }
  const usePairingCode = process.argv.includes('--use-pairing-code')
  const msgRetryCounterCache = new NodeCache();
  const rl = readline.createInterface( { input: process.stdin, output: process.stdout, } );

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 //  $$                                                                    F U N Ç Ã O   M A I N                                                                                       $$  //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function starts() {
    const { state, saveCreds } = await useMultiFileAuthState('./WhatsApp-Conexao')
    const { version } = await fetchLatestBaileysVersion();
    const question = (text) => new Promise((resolve) => rl.question(text, resolve));
    const store = makeInMemoryStore( {
      logger: P().child( {
        level: 'debug',
        stream: 'store'
      }
    )
    } 
  )
  ////////////////  CRIAÇÃO DO CLIENT ///////////////////
    const client = makeWASocket({
      version,
      logger: P({ level: "silent" }),
      usePairingCode,
      mobile: false,
      browser: ["FireFox (linux)"],
      auth: state,
      msgRetryCounterCache,
      defaultQueryTimeoutMs: undefined,
      patchMessageBeforeSending: (message) => {
        const requiresPatch = !!(message.buttonsMessage || message.listMessage);
        if (requiresPatch) {
          message = {
            viewOnceMessage: {
              message: {
                messageContextInfo: {
                  deviceListMetadataVersion: 2,
                  deviceListMetadata: {},
                }, ...message
              }
            }
          }
        }
        return message;
      }
    });

    console.log(' $ [ MIND ATLAS BOT A.I ] $ ')

    ////////////////  LIMPEZA DO NÚMERO ///////////////////
    function limparNumero(entrada) {
      const numeros = entrada.replace(/\D/g, '');
      const numeroLimpo = numeros.replace(/^(\d{2})(9)?(\d{8,9})$/, '$1$3');
      return numeroLimpo;
    }

    ////////////////  CADASTRO DO CLIENT ///////////////////
    if (!client.authState.creds.registered) {
      const phoneNumber = await question(`\nDigite seu número do WhatsApp:\nEx: ${clc.bold("+55 75 9865-6060")}\n `);
      const numeroLimpo = limparNumero(phoneNumber);
      const code = await client.requestPairingCode(numeroLimpo);
      console.log(`Seu código de conexão é: \n\n ${clc.bold(code)}\n~>`);
      console.log(`Abra seu WhatsApp, vá em ${clc.bold("Aparelhos Conectados > Conectar um novo Aparelho > Conectar usando Número.")}`)
    }

    ////////////////  ATUALIZAÇÃO DE CONVERSAS, CONTATOS E STATUS  ///////////////////
    store.bind(client.ev)

    client.ev.on("creds.update", saveCreds)
    store.bind(client.ev)
    client.ev.on("chats.set", () => {
      console.log("Tem conversas", store.chats.all())
    })
    client.ev.on("contacts.set", () => {
      console.log("Tem contatos", Object.values(store.contacts))
    })

  //////////////////////////////////////////////////////////////////////////////////////////////
 //  $$                              ATUALIZAÇÃO DE CONEXÃO                              $$  //
//////////////////////////////////////////////////////////////////////////////////////////////

    client.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect } = update
      if (connection === "close") {
        const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut
        console.log("Conexão fechada devido a", lastDisconnect.error, "Tentando reconectar...", shouldReconnect);
        if (shouldReconnect) {
          starts()
        }
      } else if (connection === "open") {
        console.log(chalk.keyword("red")("Conectado com sucesso!"));
      }
    })



      
  //////////////////////////////////////////////////////////////////////////////////////////////
 //  $$               Atualização de Mensagens && Validações de Constantes               $$  //
//////////////////////////////////////////////////////////////////////////////////////////////

    client.ev.on('messages.upsert', async connection => {
      const info = connection.messages[0];
      if (connection.type != 'notify') return;
      if (info.key.remoteJid === 'status@broadcast') return;
      try {
    
        
        
        ///////////////////////////////////////////////
        //          CONST GERAL DENTRO MAIN
        ///////////////////////////////////////////////

        global.prefix
        if (!info.message) return
        if (info.key && info.key.remoteJid == 'status@broadcast') return
        const isGroup = info.key.remoteJid.endsWith('@g.us')
        const sender = isGroup ? info.key.participant : info.key.remoteJid
        const type = Object.keys(info.message)[0] == 'senderKeyDistributionMessage' ? Object.keys(info.message)[2] : (Object.keys(info.message)[0] == 'messageContextInfo') ? Object.keys(info.message)[1] : Object.keys(info.message)[0]
        const content = JSON.stringify(info.message);
        const altpdf = Object.keys(info.message)
        const from = info.key.remoteJid
        const escrevendo = async (j) => { for (i = 0; i < j || 2; i++) {  await client.sendPresenceUpdate('composing', from); break; } }
        const pushname = info.pushName ? info.pushName : ''
        const quoted = info.quoted ? info.quoted : info
        const budy = (type === 'conversation') ? info.message.conversation : (type === 'extendedTextMessage') ? info.message.extendedTextMessage.text : ''
        const reply = (text) => { client.sendMessage(from, { text: text }, { quoted: info }) }
        var body = info.message?.conversation || info.message?.viewOnceMessageV2?.message?.imageMessage?.caption || info.message?.viewOnceMessageV2?.message?.videoMessage?.caption || info.message?.imageMessage?.caption || info.message?.videoMessage?.caption || info.message?.extendedTextMessage?.text || info.message?.viewOnceMessage?.message?.videoMessage?.caption || info.message?.viewOnceMessage?.message?.imageMessage?.caption || info.message?.documentWithCaptionMessage?.message?.documentMessage?.caption || info.message?.buttonsMessage?.imageMessage?.caption || info.message?.buttonsResponseMessage?.selectedButtonId || info.message?.listResponseMessage?.singleSelectReply?.selectedRowId || info.message?.templateButtonReplyMessage?.selectedId || info?.text || ""

        ///////////////////////////////////////////////
        //            FUNÇÕES PARA GRUPOS
        ///////////////////////////////////////////////
  
          function getGroupAdmins(participants) {
            let admins = []
            for (let i of participants) {
              if (i.admin == 'admin') admins.push(i.id)
              if (i.admin == 'superadmin') admins.push(i.id)
            }
            return admins 
          };
  
        const groupMetadata = isGroup ? await client.groupMetadata(from) : ''
        const groupName = isGroup ? groupMetadata.subject : ''
        const groupDesc = isGroup ? groupMetadata.desc : ''
        const participants = isGroup ? await groupMetadata.participants : ''
        const groupMembers = isGroup ? groupMetadata.participants : ''
        const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : ''
        const botNumber = client.user.id.split(':')[0] + '@s.whatsapp.net'
        const args = body.trim().split(/ +/).slice(1)
        const q = args.join(" ")
        const menc_jid = args.join(" ").replace("@", "") + "@s.whatsapp.net"
        const isCmd = body.startsWith(prefix)
        const isMsg = body
        const command = isCmd ? body.slice(1).trim().split(/ +/).shift().toLocaleLowerCase() : null;
        const mentions = (teks, memberr, id) => { (id == null || id == undefined || id == false) ? client.sendMessage(from, { text: teks.trim(), mentions: memberr }) : client.sendMessage(from, { text: teks.trim(), mentions: memberr }) }

        ///////////////////////////////////////////////
        //                  FUNÇÕES
        ///////////////////////////////////////////////

        const anuncio = (text) => {
          client.sendMessage(from, {
            text: text,
            contextInfo: {
              "externalAdReply": {
                title: `${botName}`,
                mediaType: 1,
                renderLargerThumbnail: false,
                showAdAttribution: true,
                body: ` ${ownerName} `,
                thumbnail: logo,
                mediaUrl: text,
                sourceUrl: text,
                headerType: 4
              }
            }
          })
        };

        const chatWithModel = async (prompt) => {
          const url = MIXTRAL_MODEL_API;
        
          const body = {
            model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
            messages: [
              { role: "system", content: "You are an assistant and ever answer in Portuguese." },
              { role: "user", content: prompt }
            ],
            stream: false,
          };
        
          let pensando = true;
        
          const pensar = () => {
            const interval = setInterval(() => {
              if (!pensando) {
                clearInterval(interval);
              } else {
                escrevendo();
              }
            }, 100);
          };
        
          pensar();
        
          try {
            const response = await axios.post(url, body, {
              headers: {
                Authorization: `Bearer ${HUGGINGFACE_API_TOKEN}`,
                "Content-Type": "application/json",
              },
            });
        
            return response.data.choices[0].message.content;
        
          } catch (error) {
            console.error(`Erro:`, error);
            return `Erro: ${error.message}`;
          } finally {
            pensando = false;
          }
        };
        
        
        ///////////////////////////////////////////////
        //                 ISQUOTED
        ///////////////////////////////////////////////

        const isImage = type == 'imageMessage'
        const isVideo = type == 'videoMessage'
        const isAudio = type == 'audioMessage'
        const isSticker = type == 'stickerMessage'
        const isContact = type == 'contactMessage'
        const isLocation = type == 'locationMessage'
        const isProduct = type == 'productMessage'
        const isMedia = (type === 'imageMessage' || type === 'videoMessage' || type === 'audioMessage')
        if (isImage) typeMessage = "Image"
        else if (isVideo) typeMessage = "Video"
        else if (isAudio) typeMessage = "Audio"
        else if (isSticker) typeMessage = "Sticker"
        else if (isContact) typeMessage = "Contact"
        else if (isLocation) typeMessage = "Location"
        else if (isProduct) typeMessage = "Product"
        const isQuotedMsg = type === 'extendedTextMessage' && content.includes('textMessage')
        const isQuotedImage = type === 'extendedTextMessage' && content.includes('imageMessage')
        const isQuotedVideo = type === 'extendedTextMessage' && content.includes('videoMessage')
        const isQuotedDocument = type === 'extendedTextMessage' && content.includes('documentMessage')
        const isQuotedAudio = type === 'extendedTextMessage' && content.includes('audioMessage')
        const isQuotedSticker = type === 'extendedTextMessage' && content.includes('stickerMessage')
        const isQuotedContact = type === 'extendedTextMessage' && content.includes('contactMessage')
        const isQuotedLocation = type === 'extendedTextMessage' && content.includes('locationMessage')
        const isQuotedProduct = type === 'extendedTextMessage' && content.includes('productMessage')

        ///////////////////////////////////////////////
        //              VERIFICAÇÕES
        ///////////////////////////////////////////////

        const isOwner = sender.includes(`${infoBot.numeroDono}@s.whatsapp.net`)
        const isGroupAdmins = groupAdmins.includes(sender) || false
        const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
        const isBot = info.key.fromMe ? true : false;

        ///////////////////////////////////////////////
        //          RECOLOCAÇÕES DE GRAMÁTICA
        ///////////////////////////////////////////////

        enviar = reply
        comando = command
        selectedButton = (type == 'buttonsResponseMessage') ? info.message.buttonsResponseMessage.selectedButtonId : ''
        typeMessage = body.substr(0, 50).replace(/\n/g, '')
        username = pushname

          ///////////////////////////////////////////////
         //             CONSOLE RESPONSE
        ///////////////////////////////////////////////

        if (isGroup) {
          if (isCmd && !isBot) {
            console.log(
              color(`\n “ # comando em grupo # ”`, 'blue'),
              color(`\n--> COMANDO: ${comando}`, 'pink'),
              color(`\n--> NÚMERO: ${sender.split("@")[0]}`, 'red'),
              color(`\n--> GRUPO: ${groupName}`, 'red'),
              color(`\n--> NOME: ${pushname}`, 'red'),
              color(`\n--> HORA: ${hora}\n`, 'red'))
          } else if (!isBot) {
            console.log(
              color(`\n “ @ mensagem em grupo @ ”`, 'blue'),
              color(`\n--> NÚMERO: ${color('Não', 'red')}`, 'orange'),
              color(`\n--> NÚMERO: ${sender.split("@")[0]}`, 'red'),
              color(`\n--> GRUPO: ${groupName}`, 'red'),
              color(`\n--> NOME: ${pushname}`, 'red'),
              color(`\n--> HORA: ${hora}\n`, 'red'))
          }
        } else {
          if (isCmd && !isBot) {
            console.log(
              color(`\n “ # comando em privado # ”`, 'blue'),
              color(`\n--> COMANDO: ${comando}`, 'pink'),
              color(`\n--> NÚMERO: ${sender.split("@")[0]}`, 'red'),
              color(`\n--> NOME: ${pushname}`, 'red'),
              color(`\n--> HORA: ${hora}\n`, 'red'))
          } else if (!isBot) {
            console.log(
              color(`\n “ @ mensagem em privado @ ”`, 'blue'),
              color(`\n--> COMANDO: ${color('Não', 'red')}`, 'orange'),
              color(`\n--> NÚMERO: ${sender.split("@")[0]}`, 'red'),
              color(`\n--> NOME: ${pushname}`, 'red'),
              color(`\n--> HORA: ${hora}\n`, 'red'))
          }
        }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////                                                              < - - Á R E A   D E   C O N V E R S A   D O   R O B Ô - - >                                                                                                          ////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



if (!isCmd && isMsg) {
  const response = await chatWithModel(`${q}`);
  await client.sendMessage(from, { text: `${response.trimStart()}` }, { quoted });
};




        
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////                                                              < - - Á R E A   D E   C O M A N D O S   D O   R O B Ô - - >                                                                                                          ////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
        switch (command) {

          case 'jid':
            anuncio(`id: ${info.key.remoteJid}`);
            break;


          case 'pessoa':
            const valida_rg = async (rg) => {
              const url = VALIDA_RG_API;
              const body = `acao=validar_rg&txt_rg=${rg}`;
              try {
                const response = await fetch(url, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                  },
                  body: body,
                });
  
                const data = await response.text();
  
                const result = data.includes('Verdadeiro') ? "True" : "False"
  
                return result;
  
              } catch (error) {
                console.error(`Erro:`, error);
              }
            };
  
            const valida_cpf = async (cpf) => {
              const url = VALIDA_CPF_API;
              const body = `acao=validar_cpf&txt_cpf=${cpf}`;
              try {
                const response = await fetch(url, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                  },
                  body: body,
                });
  
                const data = await response.text();
  
                const result = data.includes('Verdadeiro') ? "True" : "False"
  
                return result;
  
              } catch (error) {
                console.error(`Erro:`, error);
              }
            };
  
            const gerar_pessoa = async () => {
              const url = GERAR_PESSOA_API;
              const body = `acao=gerar_pessoa&sexo=I&pontuacao=S&idade=0&cep_estado=&txt_qtde=1&cep_cidade=`;
              try {
                const response = await fetch(url, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                  },
                  body: body,
                });
  
                const result = await response.text();
  
                if (result) {
                  const data = JSON.parse(result);
  
                  const cpf_real = await valida_cpf(data[0].cpf)
                  const rg_real = await valida_rg(data[0].rg)
                  
                  const n = data[0].celular.replace('(', '').replace(')', '').replace('-', '').replace(/ /g, '')
                  const exist = await client.onWhatsApp(`55${n}@s.whatsapp.net`)
                  const number = JSON.stringify(exist).includes('exists') ? exist[0].exists : false
  
                  formated_text = `\nNome: ${data[0].nome}\nidade: ${data[0].idade}\n\nCPF: ${data[0].cpf}\nCPF real? *${cpf_real}* \n\nRG: ${data[0].rg}\nRG real? *${rg_real}*\n\nData nasc.: ${data[0].data_nasc}\nsexo: ${data[0].sexo}\nsigno: ${data[0].signo}\nmae: ${data[0].mae}\nPai: ${data[0].pai}\nEmail: ${data[0].email}\nSenha: ${data[0].senha}\nCEP: ${data[0].cep}\nEndereço: ${data[0].endereco}\nNumero: ${data[0].numero}\nBairro: ${data[0].bairro}\nCidade: ${data[0].cidade}\nEstado: ${data[0].estado}\nTell Fixo: ${data[0].telefone_fixo}\n\nCelular: ${data[0].celular}\nExist Wapp: ${number?"Existe":"Não existe"}\n\nAltura: ${data[0].altura}\nPeso: ${data[0].peso}\nTipo Sang.: ${data[0].tipo_sanguineo}\nCor: ${data[0].cor}\n`;
  
                  escrevendo(4)
                  await client.sendMessage(from, { text: "Pessoa:\n" + formated_text }, { quoted: info });
                }
              } catch (error) {
                console.error(`Erro:`, error);
              }
            };
  
            gerar_pessoa()
  
            break;



          ///////////////////////////////////////////////
         //  VERIFICAÇÃO SE O COMANDO EXISTE NO ROBÔ
        ///////////////////////////////////////////////
          default:
            if (isCmd && command) { client.sendMessage(from, { text: `comando inexistente...` }, { quoted: info }) };
            break;

        }

      } catch (e) {
        console.log(e)
      }
    });

  };

   ///////////////////////////////////////////////
  //        EXECULTA O COMANDO DO ROBÔ
 ///////////////////////////////////////////////

  starts();

} catch (error) { console.error("Ocorreu um erro:", error) };
