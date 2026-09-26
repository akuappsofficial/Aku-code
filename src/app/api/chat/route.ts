import {NextResponse} from "next/server";
import {GoogleGenAI} from "@google/genai";
import Groq from "groq-sdk";

export async function POST(req:Request){
 try{
  const {prompt,files=[]}=await req.json();
  if(!prompt?.trim()) return NextResponse.json({error:"Prompt is required."},{status:400});
  const context=Array.isArray(files)?files.slice(0,80).map((f:{path:string,content:string})=>"FILE: "+f.path+"\n"+f.content).join("\n\n---\n\n"):"";
  const system="You are Aku Code, an AI coding agent. Analyze the supplied project context before answering. Give practical, accurate coding help. If suggesting edits, identify the file and explain the change. Do not claim to have changed files unless a tool actually did so.";
  const user=prompt+(context?"\n\nPROJECT CONTEXT:\n"+context:"");
  if(process.env.GEMINI_API_KEY){
   const ai=new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});
   const r=await ai.models.generateContent({model:"gemini-2.5-flash",contents:system+"\n\nUser: "+user});
   return NextResponse.json({answer:r.text||"No response."});
  }
  if(process.env.GROQ_API_KEY){
   const groq=new Groq({apiKey:process.env.GROQ_API_KEY});
   const r=await groq.chat.completions.create({model:"openai/gpt-oss-20b",messages:[{role:"system",content:system},{role:"user",content:user}]});
   return NextResponse.json({answer:r.choices[0]?.message?.content||"No response."});
  }
  return NextResponse.json({error:"No AI provider configured."},{status:503});
 }catch(e){console.error(e);return NextResponse.json({error:"AI request failed."},{status:500})}
}