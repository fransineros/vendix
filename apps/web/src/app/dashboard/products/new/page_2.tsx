'use client';
import { useState } from 'react';
export default function NewProductPage() {
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState<File|null>(null);
  const [preview, setPreview] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = (f: File) => {
    if (!['image/jpeg','image/png','image/webp'].includes(f.type)) return alert('Formato no permitido');
    if (f.size > 10*1024*1024) return alert('Máx 10MB');
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const createWithAI = async () => {
    setLoading(true);
    const steps = ['VALIDACIÓN','STORAGE','ANÁLISIS IA','GENERACIÓN CONTENIDO','PROCESAMIENTO IMAGEN','RESULTADO'];
    for (let i=0;i<steps.length;i++) { setProgress((i+1)/steps.length*100); await new Promise(r=>setTimeout(r,600)); }
    setLoading(false);
    window.location.href = '/dashboard/products/demo-id';
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Crear producto</h1>
      <div onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false); const f=e.dataTransfer.files[0]; if(f) handleFile(f);}} className={`mt-6 rounded-[2rem] border-2 border-dashed p-12 text-center ${drag?'border-violet-500 bg-violet-500/10':'border-white/20 bg-zinc-900'}`}>
        {preview ? <img src={preview} className="mx-auto max-h-64 rounded-2xl" /> : <div className="text-zinc-400">Arrastra y suelta tu imagen aquí<br/>JPG, PNG, WEBP máx 10MB</div>}
        <input type="file" accept="image/*" className="hidden" id="file" onChange={e=>{const f=e.target.files?.[0]; if(f) handleFile(f);}} />
        <label htmlFor="file" className="mt-6 inline-flex rounded-full bg-white text-black px-6 py-2 text-sm font-medium cursor-pointer">Seleccionar archivo</label>
        {file && <div className="mt-4 flex justify-center gap-3"><button onClick={()=>{setFile(null);setPreview(null)}} className="text-sm text-zinc-400">Eliminar</button><button onClick={()=>document.getElementById('file')?.click()} className="text-sm text-violet-400">Sustituir</button></div>}
      </div>
      {file && <button onClick={createWithAI} disabled={loading} className="mt-6 w-full rounded-full bg-violet-600 py-4 font-medium disabled:opacity-50">{loading?`Procesando ${Math.round(progress)}% - ${['VALIDACIÓN','STORAGE','ANÁLISIS IA','GENERACIÓN','PROCESAMIENTO','RESULTADO'][Math.floor(progress/17)]}...`:'Crear con IA (5 créditos)'}</button>}
      {loading && <div className="mt-4 h-2 w-full rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-violet-600 transition-all" style={{width:`${progress}%`}} /></div>}
    </div>
  )
}