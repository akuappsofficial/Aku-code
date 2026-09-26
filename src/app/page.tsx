"use client";
import {useState} from "react";

type ProjectFile={path:string;content:string};

export default function Home(){
 const [prompt,setPrompt]=useState(""); const [answer,setAnswer]=useState(""); const [loading,setLoading]=useState(false);
 const [files,setFiles]=useState<ProjectFile[]>([]); const [project,setProject]=useState(""); const [uploading,setUploading]=useState(false);

 async function upload(e:React.ChangeEvent<HTMLInputElement>){
  const file=e.target.files?.[0]; if(!file)return; setUploading(true); setAnswer("");
  try{const form=new FormData();form.append("file",file);const r=await fetch("/api/project",{method:"POST",body:form});const d=await r.json();if(!r.ok)throw new Error(d.error);setFiles(d.files);setProject(d.project);setAnswer("Indexed "+d.fileCount+" files from "+d.project+". Ask me about the project.");}
  catch(err){setAnswer(err instanceof Error?err.message:"Upload failed.");}finally{setUploading(false)}
 }
 async function ask(){if(!prompt.trim()||loading)return;setLoading(true);setAnswer("");
  try{const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt,files})});const d=await r.json();setAnswer(d.answer||d.error||"No response.");}
  catch{setAnswer("Request failed. Check the server configuration.");}finally{setLoading(false)}
 }
 return <main style={{minHeight:"100vh",display:"grid",gridTemplateColumns:"260px 1fr"}}>
 <aside style={{borderRight:"1px solid #202227",padding:20,background:"#0c0d10",overflow:"auto"}}>
  <h1 style={{margin:0,fontSize:24}}>Aku Code</h1><p style={{color:"#888",fontSize:13}}>AI coding workspace</p>
  <label style={{display:"block",marginTop:25,padding:"10px 12px",border:"1px solid #30333a",borderRadius:9,cursor:"pointer",textAlign:"center"}}>{uploading?"Indexing...":"＋ Upload project ZIP"}<input type="file" accept=".zip" onChange={upload} style={{display:"none"}}/></label>
  <div style={{marginTop:28,color:"#aaa",fontSize:12,letterSpacing:1}}>EXPLORER</div>
  {project&&<div style={{marginTop:12,padding:"9px 10px",borderRadius:8,background:"#17191e"}}>📁 {project}</div>}
  {files.slice(0,60).map(f=><div key={f.path} style={{padding:"7px 10px",color:"#999",fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>📄 {f.path}</div>)}
  {!files.length&&<p style={{color:"#666",fontSize:13}}>Upload a ZIP to see your project files.</p>}
 </aside>
 <section style={{display:"flex",flexDirection:"column",minWidth:0}}>
  <header style={{height:60,borderBottom:"1px solid #202227",display:"flex",alignItems:"center",padding:"0 24px",justifyContent:"space-between"}}><span style={{color:"#aaa"}}>Workspace</span><span style={{fontSize:13,color:"#777"}}>{files.length?files.length+" files indexed":"Aku Apps"}</span></header>
  <div style={{flex:1,maxWidth:950,width:"100%",margin:"0 auto",padding:"55px 24px"}}>
   <div style={{textAlign:"center"}}><div style={{fontSize:48}}>⌘</div><h2 style={{fontSize:32,margin:"12px 0"}}>{project?"Project ready":"Build with Aku Code"}</h2><p style={{color:"#8b8d94"}}>{project?"Aku Code can now reason about your uploaded codebase.":"Upload a project ZIP, then ask about code, bugs, architecture, or features."}</p></div>
   <div style={{marginTop:35,border:"1px solid #292c33",borderRadius:14,background:"#101216",overflow:"hidden"}}><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();ask()}}} placeholder={files.length?"Ask about your project...":"Ask Aku Code anything..."} rows={5} style={{width:"100%",resize:"vertical",background:"transparent",border:0,outline:0,color:"#fff",padding:16}}/><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:10}}><span style={{fontSize:12,color:"#666"}}>{files.length?"Project context attached":"No project uploaded"}</span><button onClick={ask} disabled={loading||!prompt.trim()} style={{border:0,borderRadius:8,padding:"9px 16px",background:"#fff",color:"#000"}}>{loading?"Thinking...":"Send ↵"}</button></div></div>
   {answer&&<pre style={{whiteSpace:"pre-wrap",marginTop:24,padding:18,border:"1px solid #292c33",borderRadius:12,background:"#0d0f12",lineHeight:1.6,color:"#ddd"}}>{answer}</pre>}
  </div>
 </section></main>
}