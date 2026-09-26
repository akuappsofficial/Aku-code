import {NextResponse} from "next/server";
import {GoogleGenAI} from "@google/genai";
import Groq from "groq-sdk";
export async function POST(req:Request){
 try{
  const {prompt}=await req.json();
  if(!prompt?.trim())return NextResponse.json({error:"Prompt is required."},{status:400});
  const system="You are Aku Code, an AI coding assistant. Give practical, accurate answers. When writing code, use clear complete snippets. Do not claim to have edited files unless tools actually did so.";
  if(process.env.GEMINI_API_KEY){
   const ai=new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});
   const r=await ai.models.generateContent({model:"gemini-2.5-flash",contents:system+"\n\nUser: "+prompt});
   return NextResponse.json({answer:r.text||"No response."});
  }
  if(process.env.GROQ_API_KEY){
   const groq=new Groq({apiKey:process.env.GROQ_API_KEY});
   const r=await groq.chat.completions.create({model:"openai/gpt-oss-20b",messages:[{role:"system",content:system},{role:"user",content:prompt}]});
   return NextResponse.json({answer:r.choices[0]?.message?.content||"No response."});
  }
  return NextResponse.json({error:"No AI provider configured. Add a key to .env.local."},{status:503});
 }catch(e){console.error(e);return NextResponse.json({error:"AI request failed."},{status:500})}
}