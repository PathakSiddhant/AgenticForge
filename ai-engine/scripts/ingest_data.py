import os
import sys
import glob
import time # 🌟 NAYA: Time import kiya rukne ke liye
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv()

import google.generativeai as genai
from pinecone import Pinecone
import PyPDF2

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

INDEX_NAME = "agenticforge-index"
index = pc.Index(INDEX_NAME)

def get_embedding(text):
    result = genai.embed_content(
        model="models/gemini-embedding-001",
        content=text,
        task_type="retrieval_document",
        title="AgenticForge Knowledge Base"
    )
    return result['embedding'][:768]

def extract_text_from_pdf(pdf_path):
    text = ""
    try:
        with open(pdf_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"❌ Error reading PDF {pdf_path}: {e}")
    return text

def ingest():
    knowledge_dir = "../knowledge"
    if not os.path.exists(knowledge_dir):
        print(f"❌ Error: Directory {knowledge_dir} not found!")
        return

    files = glob.glob(f"{knowledge_dir}/*.txt") + glob.glob(f"{knowledge_dir}/*.pdf")
    if not files:
        print("⚠️ No files found!")
        return

    all_chunks = []
    print(f"📚 Found {len(files)} documents. Extracting text...")
    
    for file_path in files:
        file_name = os.path.basename(file_path)
        text = extract_text_from_pdf(file_path) if file_path.endswith(".pdf") else open(file_path, "r", encoding="utf-8").read()
        raw_chunks = [c.strip() for c in text.split('\n\n') if len(c.strip()) > 20]
        
        for i, chunk in enumerate(raw_chunks):
            all_chunks.append({
                "text": chunk,
                "source": file_name,
                "chunk_id": f"{file_name}-chunk-{i}"
            })

    print(f"✂️ Total {len(all_chunks)} chunks extracted.")

    # 🌟 NAYA LOGIC: Check kitne already uploaded hain
    stats = index.describe_index_stats()
    uploaded_count = stats.get('total_vector_count', 0)
    
    if uploaded_count >= len(all_chunks):
         print("✅ All chunks are already uploaded! Vector DB is up to date.")
         return
    
    print(f"⏭️ Skipping {uploaded_count} chunks already uploaded. Processing the rest...")

    vectors = []
    # Sirf bache hue chunks se loop shuru karenge
    for i in range(uploaded_count, len(all_chunks)):
        item = all_chunks[i]
        print(f"   Processing chunk {i+1}/{len(all_chunks)}...")
        
        try:
            emb = get_embedding(item["text"])
            vectors.append({
                "id": item["chunk_id"],
                "values": emb,
                "metadata": {"text": item["text"], "source": item["source"]}
            })
            
            # 🌟 NAYA: Batch upload logic aur throttling
            if len(vectors) >= 20: # Chote batches mein upload
                index.upsert(vectors=vectors)
                vectors = [] # Upload ke baad reset
                print(f"   ⬆️ Batch uploaded.")
            
            # 🌟 NAYA: Free Tier ki izzat karna (1.5 seconds rukna har request ke baad)
            time.sleep(1.5) 

        except Exception as e:
            print(f"❌ Error on chunk {i+1}: {e}")
            break # Agar abhi bhi limit aaye toh ruk jayega

    # Upload remaining vectors
    if vectors:
        index.upsert(vectors=vectors)

    print("✅ Success! Remaining chunks uploaded to Vector DB!")

if __name__ == "__main__":
    ingest()