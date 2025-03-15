import path, { join } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// قراءة ملف database.json
const databasePath = join(path.dirname(fileURLToPath(import.meta.url)), 'database.json');
const rawData = fs.readFileSync(databasePath);
const db = JSON.parse(rawData);

// تعيين البيانات في global.db
global.db = {
  data: db,
  write: async () => {
    fs.writeFileSync(databasePath, JSON.stringify(db, null, 2));
  },
};

// تعريف handler
let handler = (m) => m;

// تعريف handler.all
handler.all = async function (m) {
  try {
    const isOwner = global.owner.map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(m.sender) || m.fromMe;
    if (!isOwner && !global.db.data.users[m.sender]?.approved && !global.db.data.settings[m.conn.user.jid]?.approveList?.includes(m.sender)) {
      await conn.sendMessage(m.chat, {
        text: `*· · • ✤「  طلبك قيد المراجعة 」✤ • · ·*\n\n*╗╦══• •✠• ❀ •✠ • •══╦╔*\n\n*『❤️‍🩹』استخدامك لماريان يعني انك توافق على شروط الإستخدام*\n*『⛔️』يمنع استخدامي في المحتوى الاباحي*\n*『⛔️』يمنع السبام او ارسال رسائل متكررة بشكل تام*\n*『⛔️』يمنع الشتم داخل المحادثة بكل انواعه تذكر ان مطوري يمكنه مراقبة المحادثات*\n*『✨』سيتم ارسال رقمك للمراجعة عند سنباي في حالة قبولك ستتلقى اشعارا مني*\n*『📌』خرق احد القواعد سيؤدي بك الى الحظر الأبدي من ماريان تذكر ان سنباي لا يسمح بفرص ثانية*\n\n*╝╩══• •✠• ❀ •✠ • •══╩╚*\n\n*『💌』 انتظر بصبر فقد يكون مفتاح فرجك*\n*『♥️』كانت هنا MARIAN PROJECT (حلمك المتجدد)『♥️』*`,
      });
      global.db.data.settings[m.conn.user.jid].approveList.push(m.sender);
      await global.db.write();
      for (let jid of global.owner) {
        let data = (await conn.onWhatsApp(jid))[0] || {};
        const aptext = `*· · • ✤「 إشعار مصادقة 」✤ • · ·*\n\n*『🔰』المستخدم: ${m.sender.split("@")[0]}*\n*『⚜️』الاسم: ${conn.getName(m.sender)}*\n*『📬』الرسالة: ${m.text}*\n\n*『❤️‍🩹』في حالة موافقتك على المستخدم سنباي استخدم الزر اسفله*`;
        if (data.exists) await conn.sendMessage(data.jid, {
          text: aptext,
          buttons: [{ buttonId: `.مصادقة ${m.sender}`, buttonText: { displayText: "APPROVE ✅️" }, type: 1 }],
        });
      }
      return;
    }
    if (!isOwner && !global.db.data.users[m.sender]?.approved && global.db.data.settings[m.conn.user.jid]?.approveList?.includes(m.sender)) return;

    let chatUpdate = m;
    const groupMetadata = (m.isGroup ? (conn.chats[m.chat] || {}).metadata || (await m.conn.groupMetadata(m.chat).catch((_) => null)) : {}) || {};
    const participants = (m.isGroup ? groupMetadata.participants : []) || [];
    const user = (m.isGroup ? participants.find((u) => conn.decodeJid(u.id) === m.sender) : {}) || {};
    const bot = (m.isGroup ? participants.find((u) => conn.decodeJid(u.id) == m.conn.user.jid) : {}) || {};
    const isRAdmin = user?.admin == "superadmin" || false;
    const isAdmin = isRAdmin || user?.admin == "admin" || false;
    const isBotAdmin = bot?.admin || false;
    const ___dirname = join(path.dirname(fileURLToPath(import.meta.url)), './plugins');

    for (let [name, plugin] of global.plugins) {
      if (!plugin || plugin.disabled) continue;
      let usedPrefix;
      const str2Regex = (str) => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
      let _prefix = global.prefix;
      let match = (_prefix instanceof RegExp ? [[_prefix.exec(m.text), _prefix]] : Array.isArray(_prefix) ? _prefix.map((p) => {
        let re = p instanceof RegExp ? p : new RegExp(str2Regex(p));
        return [re.exec(m.text), re];
      }) : typeof _prefix === 'string' ? [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] : [[[], new RegExp()]]).find((p) => p[1]);

      if (typeof plugin.handleMessage == 'function') {
        if (await plugin.handleMessage.call(this, m, { conn, participants, groupMetadata, user, bot, isOwner, isRAdmin, isAdmin, isBotAdmin, chatUpdate, __dirname: ___dirname, __filename })) continue;
      }

      if ((usedPrefix = (match[0] || '')[0])) {
        let noPrefix = m.text.replace(usedPrefix, '');
        let [command, ...args] = noPrefix.trim().split` `.filter((v) => v);
        args = args || [];
        let _args = noPrefix.trim().split` `.slice(1);
        let text = _args.join` `;
        command = (command || '');
        let isAccept = false;

        if (plugin.command instanceof RegExp) {
          isAccept = plugin.command.test(command);
        } else if (Array.isArray(plugin.command)) {
          isAccept = plugin.command.some((cmd) => cmd instanceof RegExp ? cmd.test(command) : cmd === command);
        } else if (typeof plugin.command === 'string') {
          isAccept = plugin.command === command;
        }

        if (!isAccept) continue;
        m.plugin = name;
        m.isCommand = true;
        const botSettings = global.db.data.settings[m.conn.user.jid];

        if (botSettings.yamadaOnly && botSettings.yamadaOnlyNoti && !isOwner) return conn.sendMessage(m.chat, { text: "*『❤️‍🩹』ماريان في وضع المطور『❤️‍🩹』*\n*『🌺』يحصل هذا عندما اكون قيد الصيانة الرجاء الانتظار『🌺』*" });
        if (botSettings.yamadaOnly && !botSettings.yamadaOnlyNoti && !isOwner) return;
        if (global.db.data.users[m.sender]?.banned) return conn.sendMessage(m.chat, { text: "*『❌️』تم حظرك من استخدام ماريان『❌️』*\n*『❤️‍🩹』تواصل مع سنباي للاستفسار『❤️‍🩹』*" });
        if (m.isGroup && global.db.data.chats[m.chat]?.banned) return conn.sendMessage(m.chat, { text: "*『❌️』تم حظر هذه المجموعة من استخدام ماريان『❌️』*\n*『❤️‍🩹』تواصلو مع سنباي للاستفسار『❤️‍🩹』*" });
        if (plugin.owner && !isOwner) return conn.sendMessage(m.chat, { text: "*『❤️‍🩹』لا تمتلك صلاحية استخدام هذا الامر『❤️‍🩹』*\n*『☁️』هذا الامر خاص بسنباي『☁️』*" });

        let extra = { match, usedPrefix, noPrefix, _args, args, command, text, conn, participants, groupMetadata, user, bot, isOwner, isRAdmin, isAdmin, isBotAdmin, chatUpdate, __dirname: ___dirname, __filename };
        try {
          await plugin.call(this, m, extra);
        } catch (e) {
          console.error(e);
          for (let jid of global.owner) {
            let data = (await conn.onWhatsApp(jid))[0].jid || {};
            if (data) m.reply(`*『⛔️』حدث خطأ『⛔️』*\n\n*『🚨』الأمر* : *_${name}_*\n\n*『👤』المستخدم* : *_${m.sender}_*\n\n*『📩』الرسالة* : *_${m.text}_*\n\n*『🖲』الخطأ* : \`\`\`${format(e)}\`\`\`\n\n*『⚙️』من فضلك قم بابلاغ سنباي عن الخطأ مستخدما الامر "تقرير"『⚙️』*`, data);
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};

// تصدير الـ handler
export default handler;
