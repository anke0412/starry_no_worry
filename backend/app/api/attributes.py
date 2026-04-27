from fastapi import APIRouter, HTTPException, status

from app.models.attribute_extraction import AttributeExtractionRequest, AttributeExtractionResponse
from app.services.attribute_extractor import AttributeExtractionService

router = APIRouter(prefix="/api/attributes", tags=["attributes"])


@router.post("/extract", response_model=AttributeExtractionResponse, response_model_by_alias=True)
def extract_attributes(request: AttributeExtractionRequest) -> AttributeExtractionResponse:
    try:
        extraction = AttributeExtractionService().extract(request.text)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "code": "attribute_extraction_unavailable",
                "message": str(error),
            },
        ) from error

    return AttributeExtractionResponse(
        text=request.text,
        result=extraction.result,
        rawResponse=extraction.raw_response,
    )
