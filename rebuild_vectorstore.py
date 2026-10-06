"""
Rebuild vectorstore from scratch.
Usage: python rebuild_vectorstore.py
"""

import os, shutil
from dotenv import load_dotenv
load_dotenv()

from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceBgeEmbeddings
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import TokenTextSplitter

VECTOR_STORE = os.getenv("VECTOR_STORE", "./Vectorstore")
SOURCE_DATA  = os.getenv("SOURCE_DATA",  "./source_data")
EMBED_MODEL  = os.getenv("EMBED_MODEL",  "BAAI/bge-base-en-v1.5")

# 1. Delete old vectorstore BEFORE opening anything (avoids Windows file lock)
print("Clearing old vectorstore ...")
if os.path.exists(VECTOR_STORE):
    shutil.rmtree(VECTOR_STORE, ignore_errors=True)
    print("  Done.")
else:
    print("  Nothing to clear.")

# 2. Show PDFs
print("\nPDFs found in source_data:")
for f in os.listdir(SOURCE_DATA):
    if f.endswith(".pdf"):
        print(f"  - {f}")

# 3. Load embedding model
print("\nLoading embedding model ...")
emb = HuggingFaceBgeEmbeddings(
    model_name=EMBED_MODEL,
    model_kwargs={"device": "cpu"},
    encode_kwargs={"normalize_embeddings": True},
)
print("  Embedding model loaded.")

# 4. Load and split PDFs
print("\nLoading & splitting documents ...")
docs   = PyPDFDirectoryLoader(SOURCE_DATA).load()
print(f"  Pages loaded   : {len(docs)}")
chunks = TokenTextSplitter(chunk_size=500, chunk_overlap=50).split_documents(docs)
print(f"  Chunks created : {len(chunks)}")

# 5. Build vectorstore
print("\nBuilding vectorstore ...")
db = Chroma.from_documents(chunks, embedding=emb, persist_directory=VECTOR_STORE)
db.persist()
print(f"  Done! {db._collection.count()} chunks saved.")

# 6. Sanity test
print("\nSanity test - top 3 results for 'what is my name':")
results = db.similarity_search("what is my name", k=3)
for i, r in enumerate(results, 1):
    src  = os.path.basename(r.metadata.get("source", "?"))
    page = r.metadata.get("page", "?")
    print(f"\n  [{i}] {src} | page {page}")
    print(f"       {r.page_content[:250]}")

print("\nVectorstore rebuild complete. You can now start main.py.")
