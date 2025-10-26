#!/usr/bin/env python3
"""
Simple test script to verify the upload endpoint works
Usage: python test_upload.py [pdf_file_path] [user_id]
"""

import sys
import requests
from pathlib import Path

def test_upload(file_path: str, user_id: str = "test-user-123"):
    """Test the /upload_document endpoint"""
    
    # Verify file exists
    if not Path(file_path).exists():
        print(f"❌ Error: File not found: {file_path}")
        return False
    
    # API endpoint
    url = "http://localhost:8080/upload_document"
    
    print(f"📤 Uploading document: {file_path}")
    print(f"👤 User ID: {user_id}")
    
    try:
        # Prepare multipart form data
        with open(file_path, 'rb') as f:
            files = {'file': f}
            data = {'user_id': user_id}
            
            # Make request
            response = requests.post(url, files=files, data=data)
        
        # Check response
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success!")
            print(f"   Document ID: {result['document_id']}")
            print(f"   Status: {result['status']}")
            
            # Test list documents
            print(f"\n📋 Listing documents for user...")
            list_response = requests.get(f"http://localhost:8080/documents?user_id={user_id}")
            if list_response.status_code == 200:
                docs = list_response.json()
                print(f"   Found {len(docs)} document(s)")
                for doc in docs:
                    print(f"   - {doc['file_name']} ({doc['status']})")
            
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"   {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to backend.")
        print("   Make sure the server is running: uvicorn app.main:app --reload --port 8080")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_explain(document_id: str, question: str = "What is this document about?"):
    """Test the /documents/{id}/explain endpoint"""
    
    url = f"http://localhost:8080/documents/{document_id}/explain"
    
    print(f"\n💬 Asking question: {question}")
    
    try:
        data = {'question_text': question}
        response = requests.post(url, data=data)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Answer:")
            print(f"   {result['answer_text']}")
            print(f"\n   Citations: {result['citations']}")
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"   {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    # Parse arguments
    if len(sys.argv) < 2:
        print("Usage: python test_upload.py <pdf_file_path> [user_id]")
        print("\nExample:")
        print("  python test_upload.py ~/Downloads/invoice.pdf")
        print("  python test_upload.py ~/Documents/lease.pdf my-user-uuid")
        sys.exit(1)
    
    file_path = sys.argv[1]
    user_id = sys.argv[2] if len(sys.argv) > 2 else "test-user-123"
    
    # Test upload
    success = test_upload(file_path, user_id)
    
    if success:
        print("\n✨ All tests passed!")
    else:
        print("\n❌ Tests failed")
        sys.exit(1)

