const yts = require('yt-search');

// يبحث في يوتيوب ويرجع أفضل نتيجة (أول نتيجة) ببيانات جاهزة للتخزين
// يرمي خطأ بنص عربي واضح لو صار فشل بالاتصال أو الحظر من يوتيوب
async function searchYouTube(query) {
  let result;

  try {
    result = await yts(query);
  } catch (err) {
    console.error('فشل الاتصال بيوتيوب للبحث:', err.message);
    throw new Error('تعذّر الوصول ليوتيوب حالياً (قد يكون محظور مؤقتاً من هذا السيرفر). جرّب تحط رابط الفيديو يدوياً بدل البحث.');
  }

  const video = result?.videos?.[0];
  if (!video) {
    return null; // ما لقى نتائج مطابقة (مو خطأ، بس مافيه نتيجة)
  }

  return {
    title: video.title,
    description: video.description ? video.description.slice(0, 200) : 'لا يوجد وصف',
    video_url: `https://www.youtube.com/watch?v=${video.videoId}`, // رابط نظيف بدون باراميترات زائدة
    thumbnail: video.thumbnail || null,
    duration: video.timestamp || 'غير محدد', // yt-search يرجعها جاهزة بصيغة mm:ss
  };
}

module.exports = { searchYouTube };
