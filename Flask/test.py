import openai

openai.api_key = "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"
  # Replace with your actual API key

full_prompt = "Generate JSON with fields [{{Test_Name: , Result: , Normal_Range: , Explanation: }}] for the following data: sample_data"

try:
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": full_prompt}]
    )
    generated_text = response.choices[0].message.content
    print(generated_text)
except Exception as e:
    print(f"Error: {str(e)}")
