// دوال مساعدة عامة تُستخدم في أكثر من مكان بالمشروع

// تقصير النص الطويل (مفيد لو الوصف طويل جداً في القوائم)
function truncate(text, maxLength = 100) {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
}

// التحقق أن الرابط صيغته صحيحة (فحص بسيط)
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

module.exports = { truncate, isValidUrl };
