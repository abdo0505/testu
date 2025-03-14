export default {
    // بيانات المجموعات
    chats: {
        // مثال: بيانات مجموعة معرّفة بـ "987654321"
        "987654321@g.us": {
            id: "987654321@g.us", // معرف المجموعة
            name: "My Group", // اسم المجموعة
            welcome: true, // هل الترحيب مفعل؟
            bye: true, // هل رسالة الوداع مفعلة؟
            detect: true, // هل الكشف عن الروابط مفعل؟
            sWelcome: "مرحبًا بك في المجموعة!", // رسالة الترحيب المخصصة
            sBye: "وداعًا، نتمنى لك يومًا سعيدًا!", // رسالة الوداع المخصصة
            delete: false, // هل يتم حذف الرسائل تلقائيًا؟
            antiedit: false, // هل يتم منع التعديل على الرسائل؟
            antiLink: true, // هل يتم منع الروابط؟
            antiCall: true, // هل يتم منع المكالمات؟
            antiSpam: true, // هل يتم منع السبام؟
            expired: 0, // تاريخ انتهاء صلاحية المجموعة (إذا كانت مدفوعة)
        },
        // يمكنك إضافة المزيد من المجموعات هنا
    },
};