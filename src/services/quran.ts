// services/quran.ts

const EQURAN_API = "https://equran.id/api/v2";
const QURANCOM_API = "https://api.quran.com/api/v4";

export interface Surah {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  arti: string;
}

export interface Ayat {
  nomorAyat: number;
  teksArab: string;
  teksLatin?: string;
  teksIndonesia?: string;
  teksEnglish?: string;
}

export interface SurahDetail extends Surah {
  ayat: Ayat[];
}

export const getSurahList = async (): Promise<Surah[]> => {
  const response = await fetch(`${EQURAN_API}/surat`);
  const json = await response.json();
  return json.data;
};

const cleanHtml = (text?: string) => {
  if (!text) return text;
  return text.replace(/<[^>]+>/g, '');
};

export const getSurahDetailFull = async (id: number, translation: "id" | "en", script: "indonesia" | "madinah"): Promise<SurahDetail> => {
  if (script === "indonesia" && translation === "id") {
    const response = await fetch(`${EQURAN_API}/surat/${id}`);
    const json = await response.json();
    
    // Clean EQuran Data
    const data = json.data;
    if (data.ayat) {
      data.ayat = data.ayat.map((a: any) => ({
        ...a,
        teksIndonesia: cleanHtml(a.teksIndonesia),
        teksEnglish: cleanHtml(a.teksEnglish)
      }));
    }
    return data;
  } else {
    const translationId = translation === "id" ? 33 : 22; // 33 for Indonesian, 131/22/etc for English depending
    
    const infoRes = await fetch(`${QURANCOM_API}/chapters/${id}`);
    const infoJson = await infoRes.json();
    const chapter = infoJson.chapter;

    // Use correct translation resource ID for English if needed, but 22 is ok for now.
    // For Quran.com API, translations almost always contain footnotes.
    const versesRes = await fetch(`${QURANCOM_API}/verses/by_chapter/${id}?language=id&words=false&translations=${translationId}&fields=text_uthmani,text_indopak`);
    const versesJson = await versesRes.json();

    return {
      nomor: chapter.id,
      nama: chapter.name_arabic,
      namaLatin: chapter.name_simple,
      jumlahAyat: chapter.verses_count,
      arti: chapter.translated_name.name,
      ayat: versesJson.verses.map((v: any) => ({
        nomorAyat: v.verse_number,
        teksArab: script === "madinah" ? v.text_uthmani : v.text_indopak,
        teksIndonesia: translation === "id" ? cleanHtml(v.translations[0].text) : undefined,
        teksEnglish: translation === "en" ? cleanHtml(v.translations[0].text) : undefined,
        teksLatin: "", // Quran.com verses endpoint usually doesn't give Latin easily without extra calls
      }))
    };
  }
};
