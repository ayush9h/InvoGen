import os
import logging
import google.generativeai as genai
import pdfplumber
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)

# Configure the GenAI API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Initialize Flask app
app = Flask(__name__)
CORS(app)


def give_details(text, keywords):
    keyword_str = ", ".join(keywords)

    prompt = f"""
    You are an expert in extracting information from invoices.
    Here is the invoice text:

    {text}

    Please extract the following details only:
    - {keyword_str}
    """
    
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)

        logging.info(f"Response from GenAI: {response.text}")
        return response.text if response else "No response from the model."
    
    except Exception as e:
        logging.error(f"Error generating content: {str(e)}")
        return f"Error generating content: {str(e)}"


@app.route('/extract-details', methods=['POST'])
def extract_details():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    keywords = request.form.get('keywords', '').split(',')

    if file and file.filename.lower().endswith('.pdf'):
        try:
            with pdfplumber.open(file) as pdf:
                first_page = pdf.pages[0]
                invoice_text = first_page.extract_text()

            details = give_details(invoice_text, keywords)
            return jsonify({'details': details})
        except Exception as e:
            logging.error(f"Error processing the PDF: {str(e)}")
            return jsonify({'error': f"Error processing the PDF: {str(e)}"}), 500
    
    return jsonify({'error': 'Invalid file format. Please upload a PDF.'}), 400


if __name__ == "__main__":
    app.run(debug=False, host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))
