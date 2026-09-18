
'use client';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
import { useState } from 'react';
import { removeBackground } from '@imgly/background-removal';
export default function NewProductPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const handleFile = (f: File) => {
    if (!['image/jpeg','image/png','image/webp'].includes(f.type)) { alert('Solo JPG, PNG, WEBP'); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResultUrl(null);
  };
  const createWithAI = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(10);
    try {
      const blob = await removeBackground(file, {
        publicPath: 'https://static.imgly.com/@imgly/background-removal-data/1.5.7/dist/',
        progress: (_k:string,c:number,t:number)=>setProgress(Math.round((c/t)*90)+10),
      } as any);
      setResultUrl(URL.createObjectURL(blob));
      setProgress(100);
    } catch(e:any){ alert('Error: '+e.message); }
    finally{ setLoading(false); }
  };
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Crear producto</h1>
      <div className="rounded- border-2 border-dashed border-white/20 bg-zinc-900 p-12 text-center">
        {preview? <img src={preview} className="mx-auto max-h-64 rounded-2xl" /> : <div className="text-zinc-400">Arrastra tu imagen aquí</div>}
        <input type="file" accept="image/jpeg,image/png,image/webp" id="f" className="hidden" onChange={e=>{const f=e.target.files?.[0]; if(f) handleFile(f)}} />
        <label htmlFor="f" className="mt-4 inline-block cursor-pointer rounded-xl bg-white px-6 py-2 text-sm font-bold text-black">Elegir archivo</label>
      </div>
      {preview && <button onClick={createWithAI} disabled={loading} className="mt-6 w-full rounded-2xl bg-violet-600 py-3 font-bold text-white">{loading? `Mejorando... ${progress}%` : 'Mejorar con IA (Quitar fondo)'}</button>}
      {resultUrl && <div className="mt-6"><img src={resultUrl} className="w-full rounded-2xl bg-white" /><a href={resultUrl} download="vendix-mejorada.png" className="mt-3 block w-full rounded-2xl bg-white py-3 text-center font-bold text-black">Descargar PNG sin fondo</a></div>}
    </div>
  );
}
