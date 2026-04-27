from pydantic import BaseModel, ConfigDict, Field


class AttributeExtractionRequest(BaseModel):
    text: str


class ExtractedAttributes(BaseModel):
    brand_name: str
    industry: str
    product_name: str
    attribute_and_attribute_value: str = Field(alias="attribute and attribute_value")

    model_config = ConfigDict(populate_by_name=True)


class AttributeExtractionResponse(BaseModel):
    text: str
    result: ExtractedAttributes
    raw_response: str = Field(alias="rawResponse")

    model_config = ConfigDict(populate_by_name=True)
