import {NextResponse} from "next/server";
import JSZip from "jszip";

const ignored=new Set(["node_modules",".git",".next","dist","build","coverage"]);
const allowed=new Set([".ts",".tsx",".js",".jsx",".json",".md",".css",".html",".py",".java",".go",".rs",".php",".sql",".yaml",".yml",".toml",".env.example"]);

export async function POST(req:Request){
 try{
  const form=await req.formData();
  const file=form.get("file");
  if(!(file instanceof File)) return NextResponse.json({error:"Upload a ZIP project."},{status:400});
  if(!file.name.toLowerCase().endsWith(".zip")) return NextResponse.json({error:"Only ZIP files are supported."},{status:400});
  const zip=await JSZip.loadAsync(await file.arrayBuffer());
  const files=[];
  let total=0;
  for(const [path,entry] of Object.entries(zip.files)){
   if(entry.dir) continue;
   const parts=path.split("/");
   if(parts.some(p=>ignored.has(p))) continue;
   const ext=path.includes(".")?"."+path.split(".").pop()!.toLowerCase():"";
   if(!allowed.has(ext) && !["README","LICENSE"].some(x=>path.toUpperCase().endsWith(x))) continue;
   const text=await entry.async("string");
   total+=text.length;
   if(text.length>120000) continue;
   files.push({path,content:text});
   if(files.length>=200) break;
  }
  return NextResponse.json({project:file.name.replace(/\.zip$/i,""),files,totalCharacters:total,fileCount:files.length});
 }catch(e){console.error(e);return NextResponse.json({error:"Could not read this ZIP file."},{status:500})}
}