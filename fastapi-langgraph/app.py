# app.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.tools import tool
from pydantic import BaseModel, Field
import requests
from langchain_core.output_parsers import JsonOutputParser

'''
This is how you access your secrets in DEV

with open("../secrets/openai_api_key", "r") as f:
    openai_api_key = f.read().strip()

'''

'''Below is how you access your secrets in PROD'''

with open("/run/secrets/openai_api_key", "r") as f:
    openai_api_key = f.read().strip()

# Initialize FastAPI app
app = FastAPI(title="FastAPI Service", description="Boilerplate for FastAPI backend service")

# Configure CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow the frontend container to access this API
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

llm = ChatOpenAI(
    model="gpt-4o-mini", 
    api_key=openai_api_key, 
    temperature=0.2
)

decision_prompt_template = PromptTemplate(
    template="""
Determine if the user is asking for details about a specific item in a hardware store such as price, aisle, or discount.
If they are, respond back with "tool".
If they are not, respond back with "llm"

Here is the user's query:

{query}
"""
)

decision_node = decision_prompt_template | llm

project_prompt = PromptTemplate(
    template="""
  You are an expert in all things home improvement.
  For any question that the user asks, think about what type of project they would be working on. 
  Determine all the various tools and materials they would need to complete their project and list them out.
  
  Limit your response to no more than 4 sentences and under 100 words.
  
  Here is the user's query: 
  
  {query}
"""
)

advice_node = project_prompt | llm

classification_prompt = PromptTemplate(
    template="""
    You are an assistant in a hardware store. Based on the customer's request, extract two things:

    1. The item being referred to, in singular form unless it's a plural item by convention (e.g., "work gloves", "nails", "safety glasses").
    2. Whether the customer is asking about the "price" or "location" of the item. 

    Respond in the following JSON format exactly:
    {{"item": "<item>", "classification": "<classification>"}}

    Customer query: {query} 

    To help you with context, here are the customer's previous questions: {message_history}
    """
)

class HardwareQuery(BaseModel):
    item: str = Field(description="The hardware item being asked about")
    classification: str = Field(description="One of: 'price' or 'location'")

parser = JsonOutputParser(pydantic_object=HardwareQuery)

classification_node = classification_prompt | llm | parser

def get_hardware_location(queried_item):
    response = requests.get("http://theoysterisyourworld.info/hardware")
    inventory_data = response.json()
    for item in inventory_data:
        if item['name'].lower() == queried_item.lower():
            return item

def get_hardware_price(queried_item):
    response = requests.get("http://theoysterisyourworld.info/hardware")
    inventory_data = response.json()
    for item in inventory_data:
        if item['name'].lower() == queried_item.lower():
            return item


# That's the end of the LangGraph config. 
# Below are the FastAPI endpoints.
# Anything defined below this should be related to the API endpoints only.


class InputPayload(BaseModel):
    transcription: str
    message_history: list

# Sample endpoint
@app.get("/")
async def root():
    return {"message": "FastAPI is running!"}

@app.post("/graph")
async def langgraph_integration(payload: InputPayload):
    decision = decision_node.invoke({"query": payload.transcription })
    if decision.content == "tool":
        classification = classification_node.invoke({"query": payload.transcription, "message_history": payload.message_history})
        queried_item = classification['item']
        if classification['classification'] == 'location':
            inventory_item = get_hardware_location(queried_item)
            if inventory_item:
                return {"output": f'You can find a {inventory_item["name"]} in aisle {inventory_item["aisle"]}'}
            else:
                return {"output": f"I'm sorry this is just a demo and my knowledge base is limited. There is no {queried_item} in my database."}
        elif classification['classification'] == 'price':
            inventory_item = get_hardware_price(queried_item)
            if inventory_item:
                return {"output": f'The price of a {inventory_item["name"]} is ${str(inventory_item["price"])}'}
            else:
                return {"output": f"I'm sorry this just a demo and my knowledge base is limited. There is no {inventory_item['name']} in my database."}
    elif decision.content == "llm":
        advice = advice_node.invoke({"query": payload.transcription})
        return {"output": advice.content}
    return {"output": 'I went all the way through your logic and I did not find a match on anythihg.'}

# Run the app with uvicorn when the script is executed directly
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)